import { NextResponse } from 'next/server';

const MOOLRE_ENV = process.env.NEXT_PUBLIC_MOOLRE_ENVIRONMENT || 'sandbox';
const MOOLRE_BASE_URL = MOOLRE_ENV === 'live' ? 'https://api.moolre.com' : 'https://sandbox.moolre.com';
const MOOLRE_USER = process.env.NEXT_PUBLIC_MOOLRE_USER || 'demo';
const MOOLRE_ACCOUNT = process.env.NEXT_PUBLIC_MOOLRE_ACCOUNT_NUMBER || '100000100002'; // default sandbox acct
const MOOLRE_KEY = process.env.MOOLRE_PRIVATE_KEY || '';

export async function POST(request: Request) {
  try {
    const { action, channel, payer, amount, externalref, otpcode } = await request.json();

    if (action === 'initiate') {

      if (!channel || !payer || !amount || !externalref) {
        return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-USER': MOOLRE_USER,
      };

      if (MOOLRE_ENV === 'live') {
        headers['X-API-KEY'] = MOOLRE_KEY;
      }

      const body: Record<string, any> = {
        type: 1,
        channel: String(channel), // MTN = '13', Telecel = '6', AT = '7'
        currency: 'GHS',
        payer: String(payer).replace(/\s+/g, ''),
        amount: String(amount),
        externalref: String(externalref),
        accountnumber: MOOLRE_ACCOUNT,
      };

      if (otpcode) {
        body.otpcode = String(otpcode);
      }

      console.log('Initiating Moolre Payment:', { url: `${MOOLRE_BASE_URL}/open/transact/payment`, body });

      const response = await fetch(`${MOOLRE_BASE_URL}/open/transact/payment`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const responseData = await response.json();
      console.log('Moolre Response:', responseData);

      if (response.ok && responseData.status == 1) {
        return NextResponse.json({ 
          success: true, 
          code: responseData.code,
          message: responseData.message,
          data: responseData 
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          code: responseData.code,
          error: responseData.message || 'Payment initiation failed' 
        }, { status: 400 });
      }
    }

    if (action === 'status') {
      if (!externalref) {
        return NextResponse.json({ success: false, error: 'Missing externalref' }, { status: 400 });
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-USER': MOOLRE_USER,
      };

      if (MOOLRE_ENV === 'live') {
        headers['X-API-KEY'] = MOOLRE_KEY;
      }

      const body = {
        type: 1,
        idtype: '1', // 1 = externalref
        id: String(externalref),
        accountnumber: MOOLRE_ACCOUNT,
      };

      const response = await fetch(`${MOOLRE_BASE_URL}/open/transact/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const responseData = await response.json();

      if (response.ok && responseData.status == 1) {
        // txstatus: 1 = Success, 0 = Pending, 2 = Failed
        const txstatus = responseData.data?.txstatus;
        return NextResponse.json({ 
          success: true, 
          status: txstatus === 1 ? 'success' : txstatus === 2 ? 'failed' : 'pending',
          data: responseData.data 
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: responseData.message || 'Status check failed' 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Moolre API Route Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
