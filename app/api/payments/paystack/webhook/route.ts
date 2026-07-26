import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const paystackSignature = request.headers.get('x-paystack-signature');

    // 1. Verify Paystack Signature
    if (PAYSTACK_SECRET_KEY && paystackSignature) {
      const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(rawBody)
        .digest('hex');

      if (hash !== paystackSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    console.log('[Paystack Webhook Event]', event.event, event.data?.reference);

    // 2. Handle Successful Payment Event
    if (event.event === 'charge.success') {
      const { reference, amount, currency, customer, metadata, channel, paid_at } = event.data;
      const amountPaidGHS = amount / 100;
      const customerEmail = customer?.email || '';
      const customerPhone = customer?.phone || '';
      const customerName = `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || customerEmail;

      const isInstallment = metadata?.payment_type === 'installment_wallet' || String(reference || '').includes('installment');

      if (isInstallment) {
        // Create or Top-up Installment Wallet
        console.log(`[Paystack Webhook] Recording Installment Wallet Payment for ${customerEmail}, Amount: GHS ${amountPaidGHS}`);
        
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
            console.error('[Paystack Webhook] Supabase Error recording Installment Wallet:', walletErr);
          } else {
            console.log('[Paystack Webhook] Successfully recorded Installment Wallet:', walletData);
          }
        } catch (dbErr) {
          console.error('[Paystack Webhook DB Exception - Installment Wallet]:', dbErr);
        }

      } else {
        // Create Standard Order Record
        console.log(`[Paystack Webhook] Creating Order for ${customerEmail}, Amount: GHS ${amountPaidGHS}`);

        try {
          const { data: orderData, error: orderErr } = await supabase
            .from('orders')
            .upsert({
              reference: reference,
              customer_email: customerEmail,
              customer_name: customerName,
              customer_phone: customerPhone,
              total_amount: amountPaidGHS,
              currency: currency || 'GHS',
              payment_status: 'paid',
              order_status: 'processing',
              payment_method: 'paystack',
              paid_at: paid_at || new Date().toISOString(),
              metadata: metadata || {}
            }, { onConflict: 'reference' });

          if (orderErr) {
            console.error('[Paystack Webhook] Supabase Error creating Order:', orderErr);
          } else {
            console.log('[Paystack Webhook] Successfully created Order in Supabase:', orderData);
          }
        } catch (dbErr) {
          console.error('[Paystack Webhook DB Exception - Order Creation]:', dbErr);
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (err: any) {
    console.error('Error in Paystack webhook route:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
