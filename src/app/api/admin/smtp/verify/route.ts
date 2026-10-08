import { NextRequest, NextResponse } from "next/server";
import { verifySmtpConnection, createTransporter } from "@/lib/email/mailer";
import { getCurrentAdmin } from "@/lib/admin/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
    }
    const user = (process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || "").trim();
    const pass = (process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD || "").trim();
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = process.env.SMTP_PORT || "587";
    const service = process.env.SMTP_SERVICE || (host.includes("gmail") ? "gmail" : "custom");

    const isConfigured = Boolean(user && pass);

    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        service,
        host,
        port,
        user: user ? `${user.slice(0, 3)}***@${user.split("@")[1] || ""}` : null,
        message: "SMTP is currently running in development outbox mode. Set SMTP_USER and SMTP_PASS in .env to activate live email delivery.",
      });
    }

    const verification = await verifySmtpConnection();

    return NextResponse.json({
      configured: true,
      service,
      host,
      port,
      user: `${user.slice(0, 3)}***@${user.split("@")[1] || ""}`,
      connection: verification,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to check SMTP status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const testToEmail = body.toEmail || process.env.SMTP_USER;

    if (!testToEmail) {
      return NextResponse.json(
        { error: "Recipient email is required to send a test message." },
        { status: 400 }
      );
    }

    const transporter = createTransporter();
    if (!transporter) {
      return NextResponse.json(
        { error: "SMTP transporter is not configured. Please add SMTP_USER and SMTP_PASS in .env" },
        { status: 400 }
      );
    }

    const senderEmail = process.env.SMTP_FROM || `"JobsGuru Portal" <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
      from: senderEmail,
      to: testToEmail,
      subject: `🧪 JobsGuru SMTP Live Test - Connection Verified!`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; color: #1e293b;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h2 style="color: #2563eb; margin-top: 0;">✅ SMTP Integration Verified!</h2>
            <p>Your JobsGuru / CareerBridge recruitment portal is successfully connected to your email server.</p>
            <p style="font-size: 13px; color: #64748b;">
              <strong>Sent from:</strong> ${process.env.SMTP_USER}<br/>
              <strong>Delivered to:</strong> ${testToEmail}<br/>
              <strong>Timestamp:</strong> ${new Date().toISOString()}<br/>
              <strong>Server:</strong> ${process.env.SMTP_HOST || "Gmail SMTP"}
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      sentTo: testToEmail,
      message: `Test email successfully dispatched to ${testToEmail}! Check your inbox.`,
    });
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send test email. Check your SMTP credentials." },
      { status: 500 }
    );
  }
}
