import { NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipient, message, ref, senderid, senderId, messages } = body;

    let messagesArray = [];

    if (messages && Array.isArray(messages)) {
      messagesArray = messages;
    } else if (recipient && message) {
      messagesArray = [
        {
          recipient,
          message,
          ...(ref ? { ref } : {})
        }
      ];
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing parameters. Provide either "recipient" and "message", or a "messages" array.' 
      }, { status: 400 });
    }

    console.log('[SMS API ROUTE RECEIVED]', { recipient, senderid: senderid || senderId || 'GadgetCiti', messagesCount: messagesArray.length });

    const result = await sendSMS({
      senderId: senderid || senderId || 'GadgetCiti', 
      messages: messagesArray
    });

    console.log('[SMS API ROUTE RESULT]', result);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }

  } catch (err: any) {
    console.error('[SMS API ROUTE ERROR]', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
