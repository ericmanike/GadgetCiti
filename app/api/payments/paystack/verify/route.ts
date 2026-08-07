import { NextResponse } from 'next/server';

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

    // 1. Verify transaction status with Paystack API
    console.log('[Paystack Verify API] Querying Paystack API for reference verification...');
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
      console.log(`[Paystack Verify API] ✅ Payment confirmed for reference ${reference}. (Order creation is handled by webhook)`);
      console.log('=================== [PAYSTACK VERIFY COMPLETE] ===================\n');

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully.',
        data: data.data,
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
