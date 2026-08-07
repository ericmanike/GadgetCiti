import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  console.log('\n=================== [PAYSTACK VERIFY ROUTE TRIGGERED] ===================');
  try {
    const body = await request.json();
    const { reference } = body;

    console.log('[Paystack Verify API] Reference:', reference);

    if (!reference) {
      console.warn('[Paystack Verify API] ⚠️ Transaction reference is missing.');
      return NextResponse.json(
        { success: false, error: 'Transaction reference is required.' },
        { status: 400 }
      );
    }

    const secretKey = PAYSTACK_SECRET_KEY || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    // 1. Verify transaction with Paystack API
    console.log('[Paystack Verify API] Fetching verification from Paystack API...');
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    console.log('[Paystack Verify API] Paystack API Response Status:', data?.status, '| TX Status:', data?.data?.status);

    if (data.status && data.data?.status === 'success') {
      const txData = data.data;
      const { amount, customer, metadata } = txData;
      const amountPaidGHS = amount / 100;
      const customerEmail = customer?.email || '';
      const customerPhone = customer?.phone || metadata?.phone_number || '';
      const customerName = metadata?.customer_name || `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || customerEmail;
      
      let userId: string | null = metadata?.user_id || metadata?.userId || null;
      if (typeof userId === 'string' && userId.trim().length !== 36) {
        userId = null;
      }

      console.log('--- [VERIFY API CUSTOMER SUMMARY] ---');
      console.log(`Amount Paid:  GHS ${amountPaidGHS}`);
      console.log(`User ID:      ${userId || 'Guest / Null'}`);
      console.log(`Customer:     ${customerName} (${customerEmail}, ${customerPhone})`);

      const isInstallment = metadata?.payment_type === 'installment_wallet' || String(reference || '').includes('installment');

      if (!isInstallment) {
        // Parse Cart Items
        let rawCart = metadata?.cart_items || metadata?.cart || metadata?.items || [];
        if (typeof rawCart === 'string') {
          try {
            rawCart = JSON.parse(rawCart);
          } catch (e) {
            rawCart = [];
          }
        }

        const cartItems: any[] = Array.isArray(rawCart) ? rawCart : [];
        console.log(`[Paystack Verify API] Cart Items Count: ${cartItems.length}`);

        // Collect product IDs (BIGINT) to fetch authoritative prices from DB
        const productIds = cartItems
          .map((item: any) => {
            const rawId = item.product?.id || item.id || item.product_id;
            const parsed = parseInt(String(rawId), 10);
            return isNaN(parsed) ? null : parsed;
          })
          .filter((id): id is number => id !== null);

        let dbPriceMap: Record<number, number> = {};
        if (productIds.length > 0) {
          try {
            console.log('[Paystack Verify API] Querying Supabase `products` table for IDs:', productIds);
            const { data: dbProducts } = await supabase
              .from('products')
              .select('id, price')
              .in('id', productIds);

            if (dbProducts) {
              dbProducts.forEach((p: any) => {
                dbPriceMap[Number(p.id)] = Number(p.price || 0);
              });
              console.log('[Paystack Verify API] DB Price Map:', dbPriceMap);
            }
          } catch (e) {
            console.error('[Paystack Verify API] ❌ Error fetching DB product prices:', e);
          }
        }

        // Calculate expected total from DB
        let dbCalculatedTotal = 0;
        const verifiedItems = cartItems.map((item: any) => {
          const rawId = item.product?.id || item.id || item.product_id;
          const prodId = parseInt(String(rawId), 10);
          const dbPrice = !isNaN(prodId) && dbPriceMap[prodId] !== undefined 
            ? dbPriceMap[prodId] 
            : Number(item.product?.price || item.price || 0);
          const quantity = Number(item.quantity || item.qty || 1);
          const lineTotal = dbPrice * quantity;
          dbCalculatedTotal += lineTotal;

          return {
            product_id: prodId,
            name: item.product?.name || item.name || 'Product',
            unit_price: dbPrice,
            quantity: quantity,
            line_total: lineTotal
          };
        });

        if (cartItems.length === 0) {
          dbCalculatedTotal = amountPaidGHS;
        }

        const priceDifference = Math.abs(amountPaidGHS - dbCalculatedTotal);
        const isPriceMatched = priceDifference < 0.50;

        console.log(`[Paystack Verify API Price Check] Paid: GHS ${amountPaidGHS} | DB Total: GHS ${dbCalculatedTotal} | Matched: ${isPriceMatched}`);

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

        try {
          console.log('[Paystack Verify API] Inserting into `orders` table (user_id, total, status)...');
          
          const { data: orderData, error: orderErr } = await supabase
            .from('orders')
            .insert([orderPayload])
            .select('id')
            .single();

          if (orderErr) {
            console.error('[Paystack Verify API] ❌ Supabase `orders` Insert Error:', orderErr);
          } else if (orderData?.id) {
            const createdOrderId = orderData.id;
            console.log(`[Paystack Verify API] ✅ Created Order ID (BIGINT): ${createdOrderId}`);

            if (verifiedItems.length > 0) {
              const orderItemsToInsert = verifiedItems
                .filter(item => !isNaN(item.product_id))
                .map((vItem: any) => ({
                  order_id: createdOrderId,   // BIGINT foreign key -> orders(id)
                  product_id: vItem.product_id, // BIGINT foreign key -> products(id)
                  quantity: vItem.quantity,     // BIGINT
                  price: vItem.unit_price       // NUMERIC
                }));

              if (orderItemsToInsert.length > 0) {
                const { error: itemsErr } = await supabase
                  .from('order_items')
                  .insert(orderItemsToInsert);

                if (itemsErr) {
                  console.error('[Paystack Verify API] ❌ `order_items` Insert Error:', itemsErr);
                } else {
                  console.log(`[Paystack Verify API] ✅ Inserted ${orderItemsToInsert.length} line items into \`order_items\`!`);
                }
              }
            }
          }
        } catch (dbErr) {
          console.error('[Paystack Verify API DB Exception]:', dbErr);
        }
      }

      console.log('=================== [PAYSTACK VERIFY COMPLETE] ===================\n');
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully.',
        data: txData,
      });
    } else {
      console.warn('[Paystack Verify API] ⚠️ Verification failed from Paystack API.');
      return NextResponse.json(
        {
          success: false,
          error: data.message || 'Payment verification failed.',
          data: data.data,
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error('❌ Error in Paystack verify API route:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
