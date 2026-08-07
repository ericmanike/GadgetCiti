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

      console.log('--- [CUSTOMER & PAYMENT SUMMARY] ---');
      console.log(`Reference:       ${reference}`);
      console.log(`Amount Paid:     GHS ${amountPaidGHS} (${amount} pesewas)`);
      console.log(`Customer Name:   ${customerName}`);
      console.log(`Customer Email:  ${customerEmail}`);
      console.log(`Customer Phone:  ${customerPhone}`);
      console.log(`Channel/Currency:${channel} / ${currency}`);
      console.log(`Paid At:         ${paid_at}`);

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
            console.log('[Paystack Webhook] Parsed cart_items string successfully.');
          } catch (e) {
            console.warn('[Paystack Webhook] ⚠️ Could not parse cart_items JSON string:', e);
            rawCart = [];
          }
        }

        const cartItems: any[] = Array.isArray(rawCart) ? rawCart : [];
        console.log(`[Paystack Webhook] Cart Items Count: ${cartItems.length}`);
        console.log('[Paystack Webhook] Raw Cart Items:', JSON.stringify(cartItems, null, 2));

        // Collect product IDs to fetch authoritative prices from DB
        const productIds = cartItems
          .map((item: any) => item.product?.id || item.id || item.product_id)
          .filter(Boolean)
          .map(String);

        console.log('[Paystack Webhook] Product IDs to query from DB:', productIds);

        let dbPriceMap: Record<string, number> = {};
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
                dbPriceMap[String(p.id)] = Number(p.price || 0);
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
          const prodId = String(item.product?.id || item.id || item.product_id || '');
          const dbPrice = dbPriceMap[prodId] !== undefined 
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
            line_total: lineTotal,
            image: item.product?.images?.[0] || item.image || ''
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

        try {
          console.log('\n[Paystack Webhook] Upserting order into Supabase `orders` table...');
          // Insert / Upsert Order into Supabase
          const { data: orderData, error: orderErr } = await supabase
            .from('orders')
            .upsert({
              reference: reference,
              customer_email: customerEmail,
              customer_name: customerName,
              customer_phone: customerPhone,
              total_amount: amountPaidGHS,
              total: dbCalculatedTotal, // DB verified total
              calculated_total: dbCalculatedTotal,
              price_matched: isPriceMatched,
              currency: currency || 'GHS',
              payment_status: isPriceMatched ? 'paid' : 'paid_price_mismatch',
              order_status: isPriceMatched ? 'processing' : 'flagged_mismatch',
              status: isPriceMatched ? 'Processing' : 'Flagged (Price Mismatch)',
              payment_method: 'paystack',
              paid_at: paid_at || new Date().toISOString(),
              metadata: {
                ...(metadata || {}),
                paid_amount: amountPaidGHS,
                db_calculated_total: dbCalculatedTotal,
                price_matched: isPriceMatched,
                verified_items: verifiedItems
              }
            }, { onConflict: 'reference' })
            .select()
            .maybeSingle();

          if (orderErr) {
            console.error('[Paystack Webhook] ❌ Supabase Order Upsert Error:', orderErr);
          } else {
            console.log('[Paystack Webhook] ✅ Successfully created/updated Order in Supabase! Order ID/Ref:', orderData?.id || reference);

            // Attempt to insert order line items into order_items table if present
            if (orderData?.id && verifiedItems.length > 0) {
              try {
                console.log(`[Paystack Webhook] Inserting ${verifiedItems.length} line items into order_items table...`);
                const orderItemsToInsert = verifiedItems.map((vItem: any) => ({
                  order_id: orderData.id,
                  product_id: vItem.product_id,
                  quantity: vItem.quantity,
                  price: vItem.unit_price
                }));

                const { error: itemsErr } = await supabase
                  .from('order_items')
                  .insert(orderItemsToInsert);

                if (itemsErr) {
                  console.warn('[Paystack Webhook] ℹ️ order_items insert note:', itemsErr.message);
                } else {
                  console.log('[Paystack Webhook] ✅ Successfully inserted order_items.');
                }
              } catch (itemException) {
                console.warn('[Paystack Webhook] ℹ️ Exception inserting order_items:', itemException);
              }
            }
          }
        } catch (dbErr) {
          console.error('[Paystack Webhook] ❌ DB Exception - Order Creation:', dbErr);
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
