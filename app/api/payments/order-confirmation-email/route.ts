import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, customerName, orderReference, totalAmount, items, deliveryAddress } = body;

    if (!to) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    const result = await sendOrderConfirmationEmail({
      to,
      customerName,
      orderReference,
      totalAmount: Number(totalAmount || 0),
      items: Array.isArray(items) ? items : [],
      deliveryAddress,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err: any) {
    console.error('[Order Confirmation Email API Error]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
