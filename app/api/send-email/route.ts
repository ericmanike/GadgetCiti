import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('[Resend] RESEND_API_KEY environment variable is not configured.');
            return NextResponse.json({ error: "Email service is not configured (missing RESEND_API_KEY)" }, { status: 500 });
        }
        const resend = new Resend(apiKey);

        const body = await req.json();
        const { name, email, message, phone, subject } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
        const sender = fromAddress.includes("<") ? fromAddress : `Letronix Contact <${fromAddress}>`;

        const { data, error } = await resend.emails.send({
            from: sender,
            to: ["manikeeric@gmail.com"],
            subject: subject ? `[Letronix Contact] ${subject} - ${name}` : `New Contact Form Submission from ${name}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #FF6900; margin-top: 0;">New Contact Message</h2>
                    <p style="margin-bottom: 20px; color: #666;">You have received a new message from your website contact form.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                        ${phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
                        ${subject ? `<p style="margin: 5px 0;"><strong>Topic:</strong> ${subject}</p>` : ''}
                    </div>

                    <div style="padding: 15px; border-left: 4px solid #FF6900; background-color: #f4f4f4;">
                        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                    </div>

                    <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
                        This email was sent from the Letronix contact form.
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend error response:", error);
            return NextResponse.json({ error: (error as any).message || error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Resend error:", error);
        return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}
