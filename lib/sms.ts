export interface SMSMessageItem {
  recipient: string;
  message: string;
  ref?: string;
}

export interface SendSMSOptions {
  senderId?: string;
  messages: SMSMessageItem[];
}

export interface SMSResponse {
  success: boolean;
  code?: string | number;
  message?: string;
  data?: any;
  error?: string;
}


 // Reusable SMS Sender for Moolre API

export async function sendSMS({
  senderId = process.env.MOOLRE_DEFAULT_SENDER_ID || 'GadgetCiti',
  messages
}: SendSMSOptions): Promise<SMSResponse> {
  const env = process.env.NEXT_PUBLIC_MOOLRE_ENVIRONMENT || 'live';
  const baseUrl = env === 'live' ? 'https://api.moolre.com' : 'https://sandbox.moolre.com';
  const vasKey = process.env.MOOLRE_SMS_KEY!;

  if (!vasKey) {
    console.error('Moolre SMS key missing in environment variables.');
    return { success: false, error: 'SMS API key missing' };
  }

  // Ensure Sender ID doesn't exceed 11 chars (GSM limit)
  const sanitizedSenderId = String(senderId).trim().substring(0, 11);

  const formattedMessages = messages.map(msg => ({
    recipient: String(msg.recipient).replace(/\s+/g, ''),
    message: String(msg.message),
    ...(msg.ref ? { ref: String(msg.ref) } : {})
  }));

  const payload = {
    type: 1,
    senderid: sanitizedSenderId,
    messages: formattedMessages
  };

  console.log('[SMS OUTBOUND REQUEST]', {
    url: `${baseUrl}/open/sms/send`,
    senderId: sanitizedSenderId,
    recipientCount: formattedMessages.length,
    payload
  });

  try {
    const res = await fetch(`${baseUrl}/open/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-VASKEY': vasKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('[SMS MOOLRE RESPONSE]', {
      httpStatus: res.status,
      moolreStatus: data.status,
      code: data.code,
      message: data.message,
      fullResponse: data
    });

    if (res.ok && data.status === 1) {
      return {
        success: true,
        code: data.code,
        message: data.message,
        data: data.data
      };
    }

    console.warn('[SMS SEND FAILED]', data);

    return {
      success: false,
      code: data.code || 'SMS_ERROR',
      message: data.message || 'Failed to send SMS',
      error: data.message
    };
  } catch (err: any) {
    console.error('[SMS ERROR EXCEPTION]', err);
    return {
      success: false,
      error: err.message || 'Internal network error'
    };
  }
}


//  Send a single SMS helper
 
export async function sendSingleSMS(
  recipient: string,
  message: string,
  ref?: string,
  senderId = 'GadgetCiti'
): Promise<SMSResponse> {
  return sendSMS({
    senderId,
    messages: [{ recipient, message, ref }]
  });
}

//Send bulk SMS notifications helper

export async function sendBulkSMS<T extends { phone: string; name?: string }>(
  users: T[],
  messageGenerator: (user: T) => string,
  senderId = 'GadgetCiti'
): Promise<SMSResponse> {
  const messages: SMSMessageItem[] = users.map(user => ({
    recipient: user.phone,
    message: messageGenerator(user),
    ref: `BULK_${Date.now()}_${user.phone}`
  }));

  return sendSMS({
    senderId,
    messages
  });
}
