import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  console.log('\n=================== [PAYSTACK WEBHOOK TRIGGERED] ===================');
  try {
    const rawBody = await request.text();
    const paystackSignature = request.headers.get('x-paystack-signature');

    console.log('[Paystack Webhook] Raw Payload Length:', rawBody.length, 'bytes');
    console.log('[Paystack Webhook] Signature Received:', paystackSignature ? 'YES' : 'NO');

    // 1. Verify Paystack Signature
    if (PAYSTACK_SECRET_KEY && paystackSignature) {
      const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(rawBody)
        .digest('hex');

      if (hash !== paystackSignature) {
        console.warn('[Paystack Webhook] ❌ Invalid HMAC Signature Verification Failed!');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('[Paystack Webhook] ✅ HMAC Signature Verified Successfully.');
    } else {
      console.log('[Paystack Webhook] ℹ️ Skipping signature validation (SECRET_KEY or header omitted).');
    }

    const event = JSON.parse(rawBody);
    console.log('[Paystack Webhook] Event Type:', event.event);
    console.log('[Paystack Webhook] Transaction Reference:', event.data?.reference);

    // 2. Handle Successful Payment Event
    if (event.event === 'charge.success') {
      const { reference, amount, currency, customer, metadata, channel, paid_at } = event.data;
      const amountPaidGHS = amount / 100; // Paystack sends amount in pesewas (GHS * 100)
      const customerEmail = customer?.email || '';
      const customerPhone = customer?.phone || metadata?.phone_number || '';
      const customerName = metadata?.customer_name || `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || customerEmail;
      
      // Extract user_id if valid UUID format (36 chars)
      let userId: string | null = metadata?.user_id || metadata?.userId || null;
      if (typeof userId === 'string' && userId.trim().length !== 36) {
        userId = null; // Prevent UUID syntax errors if guest or invalid format
      }

      console.log('--- [CUSTOMER & PAYMENT SUMMARY] ---');
      console.log(`Reference:       ${reference}`);
      console.log(`Amount Paid:     GHS ${amountPaidGHS} (${amount} pesewas)`);
      console.log(`User ID (UUID):  ${userId || 'Guest / Null'}`);
      console.log(`Customer Name:   ${customerName}`);
      console.log(`Customer Email:  ${customerEmail}`);

      const isInstallment = metadata?.payment_type === 'installment_wallet' || String(reference || '').includes('installment');

      if (isInstallment) {
        // Handle Installment Wallet Payment
        console.log(`\n[Paystack Webhook] 💳 Processing Installment Wallet Payment for ${customerEmail}`);
        
        try {
          const { data: walletData, error: walletErr } = await supabase
            .from('installment_wallets')
            .upsert({
              reference: reference,
              customer_email: customerEmail,
              customer_phone: customerPhone,
              customer_name: customerName,
              amount: amountPaidGHS,
              currency: currency || 'GHS',
              payment_channel: channel || 'paystack',
              status: 'active',
              updated_at: new Date().toISOString()
            }, { onConflict: 'reference' });

          if (walletErr) {
            console.error('[Paystack Webhook] ❌ Supabase Error recording Installment Wallet:', walletErr);
          } else {
            console.log('[Paystack Webhook] ✅ Successfully recorded Installment Wallet in Supabase:', walletData);
          }
        } catch (dbErr) {
          console.error('[Paystack Webhook] ❌ DB Exception during Installment Wallet creation:', dbErr);
        }

      } else {
        // Standard Order Creation with DB Price Verification
        console.log(`\n[Paystack Webhook] 📦 Processing Order & Price Verification for Ref: ${reference}`);

        // Parse Cart Items from metadata
        let rawCart = metadata?.cart_items || metadata?.cart || metadata?.items || [];
        if (typeof rawCart === 'string') {
          try {
            rawCart = JSON.parse(rawCart);
          } catch (e) {
            console.warn('[Paystack Webhook] ⚠️ Could not parse cart_items JSON string:', e);
            rawCart = [];
          }
        }

        const cartItems: any[] = Array.isArray(rawCart) ? rawCart : [];
        console.log(`[Paystack Webhook] Cart Items Count: ${cartItems.length}`);

        // Collect product IDs (BIGINT) to fetch authoritative prices from DB
        const productIds = cartItems
          .map((item: any) => {
            const rawId = item.product?.id || item.id || item.product_id;
            const parsed = parseInt(String(rawId), 10);
            return isNaN(parsed) ? null : parsed;
          })
          .filter((id): id is number => id !== null);

        console.log('[Paystack Webhook] Product IDs (BIGINT) to query from DB:', productIds);

        let dbPriceMap: Record<number, number> = {};
        if (productIds.length > 0) {
          try {
            console.log('[Paystack Webhook] Querying Supabase `products` table for prices...');
            const { data: dbProducts, error: prodErr } = await supabase
              .from('products')
              .select('id, price')
              .in('id', productIds);

            if (!prodErr && dbProducts) {
              console.log('[Paystack Webhook] DB Products Found:', dbProducts);
              dbProducts.forEach((p: any) => {
                dbPriceMap[Number(p.id)] = Number(p.price || 0);
              });
              console.log('[Paystack Webhook] Constructed DB Price Map:', dbPriceMap);
            } else {
              console.error('[Paystack Webhook] ❌ Error fetching DB product prices:', prodErr);
            }
          } catch (pErr) {
            console.error('[Paystack Webhook] ❌ DB Product Fetch Exception:', pErr);
          }
        }

        // Calculate expected total from DB prices
        let dbCalculatedTotal = 0;
        console.log('\n--- [PER-ITEM DB PRICE CALCULATION] ---');
        const verifiedItems = cartItems.map((item: any, idx: number) => {
          const rawId = item.product?.id || item.id || item.product_id;
          const prodId = parseInt(String(rawId), 10);
          const dbPrice = !isNaN(prodId) && dbPriceMap[prodId] !== undefined 
            ? dbPriceMap[prodId] 
            : Number(item.product?.price || item.price || 0);
          const quantity = Number(item.quantity || item.qty || 1);
          const lineTotal = dbPrice * quantity;
          dbCalculatedTotal += lineTotal;

          console.log(`Item #${idx + 1}: ID=${prodId} | Name="${item.product?.name || item.name}" | DB Unit Price=GHS ${dbPrice} | Qty=${quantity} | Line Total=GHS ${lineTotal}`);

          return {
            product_id: prodId,
            name: item.product?.name || item.name || 'Product',
            unit_price: dbPrice,
            quantity: quantity,
            line_total: lineTotal
          };
        });

        // If no cart items were passed in metadata, default calculated total to paid amount
        if (cartItems.length === 0) {
          console.warn('[Paystack Webhook] ⚠️ No cart items found in metadata. Defaulting DB calculated total to paid amount GHS', amountPaidGHS);
          dbCalculatedTotal = amountPaidGHS;
        }

        // Compare paid amount with DB calculated total
        const priceDifference = Math.abs(amountPaidGHS - dbCalculatedTotal);
        const isPriceMatched = priceDifference < 0.50; // allow < 50 pesewas rounding buffer

        console.log('\n--- [PRICE COMPARISON RESULT] ---');
        console.log(`Amount Paid (Paystack): GHS ${amountPaidGHS}`);
        console.log(`DB Calculated Total:    GHS ${dbCalculatedTotal}`);
        console.log(`Price Difference:       GHS ${priceDifference.toFixed(2)}`);
        console.log(`Price Matched Flag:     ${isPriceMatched ? '✅ MATCHED' : '❌ MISMATCH FLAGGED'}`);

        // Status string
        const orderStatus = isPriceMatched ? 'paid' : 'flagged_mismatch';

        // STRICT SCHEMA PAYLOAD FOR `orders` TABLE: (user_id, total, status, updated_at)
        const orderPayload: Record<string, any> = {
          total: dbCalculatedTotal > 0 ? dbCalculatedTotal : amountPaidGHS,
          status: orderStatus,
          updated_at: new Date().toISOString()
        };

        if (userId) {
          orderPayload.user_id = userId;
        }

        console.log('\n[Paystack Webhook] Inserting record into `orders` with STRICT SCHEMA keys:', Object.keys(orderPayload));

        try {
          // 1. Insert into orders table
          const { data: orderData, error: orderErr } = await supabase
            .from('orders')
            .insert([orderPayload])
            .select('id')
            .single();

          if (orderErr) {
            console.error('[Paystack Webhook] ❌ Supabase `orders` Insert Error:', orderErr);
          } else if (orderData?.id) {
            const createdOrderId = orderData.id; // BIGINT
            console.log(`[Paystack Webhook] ✅ Successfully created Order in Supabase! Created Order ID (BIGINT): ${createdOrderId}`);

            // 2. Insert into order_items table STRICT SCHEMA: (order_id, product_id, quantity, price)
            if (verifiedItems.length > 0) {
              try {
                console.log(`[Paystack Webhook] Inserting ${verifiedItems.length} line items into \`order_items\` table for Order ID #${createdOrderId}...`);
                
                const orderItemsToInsert = verifiedItems
                  .filter(item => !isNaN(item.product_id))
                  .map((vItem: any) => ({
                    order_id: createdOrderId,   // BIGINT foreign key -> orders(id)
                    product_id: vItem.product_id, // BIGINT foreign key -> products(id)
                    quantity: vItem.quantity,     // BIGINT
                    price: vItem.unit_price       // NUMERIC
                  }));

                console.log('[Paystack Webhook] `order_items` insert payload sample:', orderItemsToInsert[0]);

                if (orderItemsToInsert.length > 0) {
                  const { error: itemsErr } = await supabase
                    .from('order_items')
                    .insert(orderItemsToInsert);

                  if (itemsErr) {
                    console.error('[Paystack Webhook] ❌ Supabase `order_items` Insert Error:', itemsErr);
                  } else {
                    console.log(`[Paystack Webhook] ✅ Successfully inserted ${orderItemsToInsert.length} order_items for Order ID #${createdOrderId}!`);
                  }
                }
              } catch (itemException) {
                console.error('[Paystack Webhook] ❌ Exception inserting order_items:', itemException);
              }
            }
          }
        } catch (dbErr) {
          console.error('[Paystack Webhook] ❌ DB Exception during Order & Line Items Creation:', dbErr);
        }
      }
    }

    console.log('=================== [PAYSTACK WEBHOOK COMPLETE] ===================\n');
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (err: any) {
    console.error('❌ Error in Paystack webhook route:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
