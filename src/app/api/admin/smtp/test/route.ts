import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin/auth";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const body = await req.json();
    const { toEmail, smtpHost, smtpPort, useSslTls, smtpUsername, smtpPassword, fromDisplayName, fromEmailAddress } = body;

    const targetEmail = toEmail || smtpUsername || admin.email;
    if (!targetEmail) {
      return NextResponse.json(
        { error: "Target email address is required for sending test message." },
        { status: 400 }
      );
    }

    const host = smtpHost || process.env.SMTP_HOST || "smtp.hostinger.com";
    const port = parseInt(smtpPort || process.env.SMTP_PORT || "465", 10);
    const secure = useSslTls !== undefined ? useSslTls : port === 465;
    const user = smtpUsername || process.env.SMTP_USER || "";
    const pass = smtpPassword || process.env.SMTP_PASS || "";
    const fromName = fromDisplayName || "JobsGhuru";
    const fromEmail = fromEmailAddress || user || "info@jobshuru.com";

    // Build Nodemailer transporter
    let transporter: any = null;

    if (user && pass) {
      if (host.includes("gmail")) {
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user, pass },
        });
      } else {
        transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
        });
      }
    }

    if (!transporter) {
      // In development or if credentials aren't live, simulate successful dispatch
      console.log(`[SMTP DIAGNOSTIC TEST] Simulated email sent to ${targetEmail} via ${host}:${port}`);
      return NextResponse.json({
        success: true,
        simulated: true,
        sentTo: targetEmail,
        messageId: `test-${Date.now()}-jobsghuru`,
        message: `Diagnostic test message logged for ${targetEmail}! (SMTP Host: ${host}:${port})`,
      });
    }

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: targetEmail,
      subject: `⚡ JobsGhuru SMTP Diagnostic Test - Connection Successful!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .card { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
            .content { padding: 32px 28px; font-size: 14px; line-height: 1.6; color: #334155; }
            .box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px; margin: 20px 0; font-size: 13px; }
            .footer { border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; background: #fafafa; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2 style="margin: 0; font-size: 22px;">✅ SMTP Connection Verified</h2>
              <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.95;">JobsGhuru Mailer Ready</p>
            </div>
            <div class="content">
              <p>Hello <strong>Admin</strong>,</p>
              <p>Your <strong>JobsGhuru Email & SMTP Gateway</strong> is successfully authenticated and delivering messages without errors.</p>
              
              <div class="box">
                <div style="font-weight: 800; color: #166534; margin-bottom: 8px;">⚙️ Configuration Telemetry</div>
                <div><strong>SMTP Server Host:</strong> ${host}:${port}</div>
                <div><strong>Sender Username:</strong> ${user}</div>
                <div><strong>Encryption Mode:</strong> ${secure ? "SSL / TLS (Port 465)" : "STARTTLS / Standard"}</div>
                <div><strong>Dispatched At:</strong> ${new Date().toLocaleString("en-IN")}</div>
              </div>

              <p style="font-size: 13px; color: #64748b;">Automated notification triggers for Job Applications, Employer Requisitions, Subscriptions, and Campaigns are now active.</p>
            </div>
            <div class="footer">&copy; ${new Date().getFullYear()} JobsGhuru Enterprise Mailer</div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      sentTo: targetEmail,
      message: `Live test email successfully delivered to ${targetEmail}! Message ID: ${info.messageId}`,
    });
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to deliver test email. Check your SMTP host, port, and credentials." },
      { status: 500 }
    );
  }
}
