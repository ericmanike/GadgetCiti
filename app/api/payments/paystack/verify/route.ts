import { NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {

  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Transaction reference is required.' },
        { status: 400 }
      );
    }

    const secretKey = PAYSTACK_SECRET_KEY || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    console.log('[Paystack Verify Response]' , data) ;

    if (data.status && data.data?.status === 'success') {
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully.',
        data: data.data,
      });
    } else {
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
    console.error('Error in Paystack verify API route:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
