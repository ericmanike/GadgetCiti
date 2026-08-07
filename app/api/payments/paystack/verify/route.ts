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
      const { amount, currency, customer, metadata, paid_at } = txData;
      const amountPaidGHS = amount / 100;
      const customerEmail = customer?.email || '';
      const customerPhone = customer?.phone || metadata?.phone_number || '';
      const customerName = metadata?.customer_name || `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || customerEmail;

      console.log('--- [VERIFY API CUSTOMER SUMMARY] ---');
      console.log(`Amount Paid:  GHS ${amountPaidGHS}`);
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

        // Fetch DB Prices
        const productIds = cartItems
          .map((item: any) => item.product?.id || item.id || item.product_id)
          .filter(Boolean)
          .map(String);

        let dbPriceMap: Record<string, number> = {};
        if (productIds.length > 0) {
          try {
            console.log('[Paystack Verify API] Querying Supabase `products` table for IDs:', productIds);
            const { data: dbProducts } = await supabase
              .from('products')
              .select('id, price')
              .in('id', productIds);

            if (dbProducts) {
              dbProducts.forEach((p: any) => {
                dbPriceMap[String(p.id)] = Number(p.price || 0);
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
          const prodId = String(item.product?.id || item.id || item.product_id || '');
          const dbPrice = dbPriceMap[prodId] !== undefined 
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

        // Create / Update Order Record in DB
        try {
          console.log('[Paystack Verify API] Upserting order into Supabase...');
          const { data: orderData } = await supabase
            .from('orders')
            .upsert({
              reference: reference,
              customer_email: customerEmail,
              customer_name: customerName,
              customer_phone: customerPhone,
              total_amount: amountPaidGHS,
              total: dbCalculatedTotal,
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

          if (orderData?.id) {
            console.log('[Paystack Verify API] ✅ Successfully created/updated Order in Supabase ID:', orderData.id);
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
