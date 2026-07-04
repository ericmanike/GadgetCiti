import { NextResponse } from 'next/server';

const MOOLRE_ENV = process.env.NEXT_PUBLIC_MOOLRE_ENVIRONMENT || 'sandbox';
const MOOLRE_BASE_URL = MOOLRE_ENV === 'live' ? 'https://api.moolre.com' : 'https://sandbox.moolre.com';
const MOOLRE_VAS_KEY = process.env.MOOLRE_VAS_KEY || '';
const DEFAULT_SENDER_ID = process.env.MOOLRE_DEFAULT_SENDER_ID || 'Letronix';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipient, message, ref, senderid, messages } = body;

    // Build the messages payload
    let messagesArray = [];

    if (messages && Array.isArray(messages)) {
      messagesArray = messages;
    } else if (recipient && message) {
      messagesArray = [
        {
          recipient: String(recipient).replace(/\s+/g, ''),
          message: String(message),
          ...(ref ? { ref: String(ref) } : {})
        }
      ];
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing parameters. Provide either "recipient" and "message", or a "messages" array.' 
      }, { status: 400 });
    }

    // Build header options
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-VASKEY': MOOLRE_VAS_KEY
    };

    // Build body payload
    const moolrePayload = {
      type: 1,
      senderid: String(senderid || DEFAULT_SENDER_ID).substring(0, 11),
      messages: messagesArray
    };

    console.log('Sending SMS via Moolre:', {
      url: `${MOOLRE_BASE_URL}/open/sms/send`,
      payload: moolrePayload
    });

    const response = await fetch(`${MOOLRE_BASE_URL}/open/sms/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify(moolrePayload)
    });

    const responseData = await response.json();
    console.log('Moolre SMS Response:', responseData);

    if (response.ok && responseData.status === 1) {
      return NextResponse.json({
        success: true,
        code: responseData.code,
        message: responseData.message,
        data: responseData.data
      });
    } else {
      return NextResponse.json({
        success: false,
        code: responseData.code || 'SMS_ERROR',
        message: responseData.message || 'Failed to send SMS message.'
      }, { status: response.status === 200 ? 400 : response.status });
    }

  } catch (err: any) {
    console.error('Error in Send SMS API route:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
