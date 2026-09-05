import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItemInfo {
  name: string;
  quantity: number;
  unit_price: number;
  line_total?: number;
}

interface OrderEmailProps {
  to: string;
  customerName: string;
  orderReference: string;
  totalAmount: number;
  items: OrderItemInfo[];
  deliveryAddress?: string;
}

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderReference,
  totalAmount,
  items,
  deliveryAddress,
}: OrderEmailProps) {
  if (!to) {
    console.warn('[EMAIL] No recipient email provided for order confirmation.');
    return { success: false, error: 'No recipient email' };
  }

  try {
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; text-align: left; font-size: 14px; color: #1e293b;">
          <strong>${item.name}</strong>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 14px; color: #64748b;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; color: #0f172a; font-weight: bold;">
          GH₵ ${(item.unit_price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f8fafc;">
          <h1 style="color: #FF6900; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Letronix</h1>
          <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Order Confirmation & Receipt</p>
        </div>

        <div style="padding: 24px 0;">
          <p style="font-size: 16px; color: #0f172a; margin-top: 0;">Hi <strong>${customerName || 'Valued Customer'}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">Thank you for your purchase! Your payment has been successfully processed, and we are preparing your order.</p>

          <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 13px; color: #64748b;">Order Reference: <strong style="color: #0f172a;">${orderReference}</strong></p>
            ${deliveryAddress ? `<p style="margin: 4px 0; font-size: 13px; color: #64748b;">Delivery Address: <strong style="color: #0f172a;">${deliveryAddress}</strong></p>` : ''}
          </div>

          <h3 style="font-size: 15px; color: #0f172a; margin-bottom: 12px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase;">Item</th>
                <th style="padding: 8px; text-align: center; font-size: 12px; color: #64748b; text-transform: uppercase;">Qty</th>
                <th style="padding: 8px; text-align: right; font-size: 12px; color: #64748b; text-transform: uppercase;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml.length > 0 ? itemsHtml : '<tr><td colspan="3" style="padding: 12px; text-align: center; color: #94a3b8;">Order items summary</td></tr>'}
            </tbody>
          </table>

          <div style="border-top: 2px dashed #e2e8f0; padding-top: 16px; text-align: right;">
            <p style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0;">
              Total Paid: <span style="color: #FF6900;">GH₵ ${totalAmount.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 4px 0;">Need help with your order? Reply directly to this email or visit our support center.</p>
          <p style="margin: 0;">© ${new Date().getFullYear()} Letronix. All rights reserved.</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: `Letronix Orders <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: [to],
      subject: `Order Confirmation #${orderReference} - Letronix`,
      html,
    });

    if (error) {
      console.error('[EMAIL ERROR] Resend error:', error);
      return { success: false, error };
    }

    console.log('[EMAIL SUCCESS] Sent order confirmation email to:', to, 'Resend ID:', data?.id);
    return { success: true, data };
  } catch (err: any) {
    console.error('[EMAIL EXCEPTION] Failed to send order confirmation email:', err);
    return { success: false, error: err.message };
  }
}
