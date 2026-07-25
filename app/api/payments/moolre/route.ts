import { NextResponse } from 'next/server';
const MOOLRE_ENV = process.env.NEXT_PUBLIC_MOOLRE_ENVIRONMENT!;
const MOOLRE_BASE_URL = MOOLRE_ENV === 'live' ? 'https://api.moolre.com' : 'https://sandbox.moolre.com';

const MOOLRE_USER = process.env.MOOLRE_USER!
const MOOLRE_PUBKEY = process.env.MOOLRE_PUBKEY!
const MOOLRE_ACCOUNT_NUMBER = process.env.MOOLRE_ACCOUNT_NUMBER!

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action = 'initiate', channel, payer, amount, externalref, otpcode, reference, sessionid } = body;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-USER': MOOLRE_USER,
      'X-API-PUBKEY': MOOLRE_PUBKEY,
    };

    if (action === 'status') {
      // Check Payment Status
      const statusPayload = {
        type: 1,
        idtype: "2",
        id: String(externalref || ''),
        accountnumber: MOOLRE_ACCOUNT_NUMBER
      };

      const res = await fetch(`${MOOLRE_BASE_URL}/open/transact/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify(statusPayload)
      });

      const data = await res.json();
      console.log('Moolre Status Response:', data);

      if (res.ok && data.status === 1) {
        // Status mapping: Check if status indicates success, pending, or failed
        const txnStatus = data.data?.status || data.code;
        const isSuccess = data.code === 'TP10' || data.code === 'SUCCESS' || txnStatus === 'SUCCESS' || txnStatus === 1 || txnStatus === '1';
        const isFailed = data.code === 'FAILED' || txnStatus === 'FAILED';

        return NextResponse.json({
          success: true,
          status: isSuccess ? 'success' : isFailed ? 'failed' : 'pending',
          code: data.code,
          message: data.message,
          data: data.data
        });
      } else {
        return NextResponse.json({
          success: false,
          status: 'failed',
          code: data.code || 'STATUS_ERROR',
          error: data.message || 'Could not verify payment status.'
        });
      }
    }

    // Format payer to start with '0' as required by Moolre payment API (no country code)
    let formattedPayer = String(payer || '').replace(/[\s\-\+]/g, '');
    if (formattedPayer.startsWith('233') && formattedPayer.length === 12) {
      formattedPayer = '0' + formattedPayer.slice(3);
    }

    const paymentPayload = {
      type: 1,
      channel: String(channel), // 13 = MTN, 6 = Telecel, 7 = AT
      currency: 'GHS',
      payer: formattedPayer,
      amount: String(amount || ''),
      externalref: String(externalref || `gadgetciti-${Date.now()}`),
      otpcode: String(otpcode || ''),
      reference: String(reference || 'Order Payment'),
      sessionid: String(sessionid || ''),
      accountnumber: MOOLRE_ACCOUNT_NUMBER
    };

    console.log('Initiating Moolre Payment:', {
      url: `${MOOLRE_BASE_URL}/open/transact/payment`,
      payload: paymentPayload
    });

    const res = await fetch(`${MOOLRE_BASE_URL}/open/transact/payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentPayload)
    });

    const data = await res.json();
    console.log('Moolre Final Payment Response:', data);

    if (res.ok && (data.status === 1 || data.code === 'TP10' || data.code === 'TP14')) {
      return NextResponse.json({
        success: true,
        code: data.code,
        message: data.message,
        data: data.data,
        sessionid: data.sessionid || data.data?.sessionid || data.data?.session_id,
        externalref: paymentPayload.externalref
      });
    } else {
      return NextResponse.json({
        success: false,
        code: data.code || 'PAYMENT_ERROR',
        error: data.message || 'Payment initiation failed.',
        data: data.data
      });
    }

  } catch (err: any) {
    console.error('Error in Moolre Payment API route:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
