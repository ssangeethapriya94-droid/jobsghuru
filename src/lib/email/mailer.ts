import nodemailer from "nodemailer";
import { db } from "@/lib/db";

export interface OutboxEmail {
  id: string;
  to: string;
  subject: string;
  preview: string;
  credentials?: { email: string; password?: string; loginUrl: string };
  sentAt: string;
  html: string;
}

// Global outbox storage (persists across hot reloads)
const globalForOutbox = globalThis as unknown as { __careerbridge_outbox: OutboxEmail[] };
if (!globalForOutbox.__careerbridge_outbox) {
  globalForOutbox.__careerbridge_outbox = [];
}
export const emailOutbox = globalForOutbox.__careerbridge_outbox;

export interface SmtpConfig {
  smtpHost: string;
  smtpPort: string;
  useSslTls: boolean;
  smtpUsername: string;
  smtpPassword?: string;
  fromDisplayName: string;
  fromEmailAddress: string;
  adminNotificationEmail: string;
  triggerJobApplications: boolean;
  triggerEmployerPostings: boolean;
  triggerSubscriptions: boolean;
  triggerCampaigns: boolean;
}

/**
 * Fetches SMTP configuration from database setting, falling back to process.env
 */
export async function getSmtpConfig(): Promise<SmtpConfig> {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "SMTP_GATEWAY_CONFIG" },
    });
    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      return {
        smtpHost: parsed.smtpHost || process.env.SMTP_HOST || "smtp.hostinger.com",
        smtpPort: parsed.smtpPort || process.env.SMTP_PORT || "465",
        useSslTls: parsed.useSslTls !== undefined ? parsed.useSslTls : true,
        smtpUsername: parsed.smtpUsername || process.env.SMTP_USER || "",
        smtpPassword: parsed.smtpPassword || process.env.SMTP_PASS || "",
        fromDisplayName: parsed.fromDisplayName || "JobsGhuru",
        fromEmailAddress: parsed.fromEmailAddress || parsed.smtpUsername || "info@jobshuru.com",
        adminNotificationEmail: parsed.adminNotificationEmail || "info@jobshuru.com",
        triggerJobApplications: parsed.triggerJobApplications !== undefined ? parsed.triggerJobApplications : true,
        triggerEmployerPostings: parsed.triggerEmployerPostings !== undefined ? parsed.triggerEmployerPostings : true,
        triggerSubscriptions: parsed.triggerSubscriptions !== undefined ? parsed.triggerSubscriptions : true,
        triggerCampaigns: parsed.triggerCampaigns !== undefined ? parsed.triggerCampaigns : true,
      };
    }
  } catch (e) {
    console.error("[SMTP CONFIG] Failed to load from database, falling back to ENV", e);
  }

  return {
    smtpHost: process.env.SMTP_HOST || "smtp.hostinger.com",
    smtpPort: process.env.SMTP_PORT || "465",
    useSslTls: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
    smtpUsername: process.env.SMTP_USER || "",
    smtpPassword: process.env.SMTP_PASS || "",
    fromDisplayName: "JobsGhuru",
    fromEmailAddress: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "info@jobshuru.com",
    adminNotificationEmail: process.env.ADMIN_NOTIFY_EMAIL || "info@jobshuru.com",
    triggerJobApplications: true,
    triggerEmployerPostings: true,
    triggerSubscriptions: true,
    triggerCampaigns: true,
  };
}

/**
 * Creates Nodemailer Transporter using dynamic DB or ENV configuration
 */
export async function createTransporterAsync(overrideConfig?: Partial<SmtpConfig>) {
  const config = overrideConfig ? { ...(await getSmtpConfig()), ...overrideConfig } : await getSmtpConfig();
  const host = (config.smtpHost || "").trim();
  const port = parseInt(config.smtpPort || "465", 10);
  const user = (config.smtpUsername || "").trim();
  const pass = (config.smtpPassword || "").replace(/\s+/g, "");
  const secure = config.useSslTls;

  if (user && pass) {
    if (host.includes("gmail")) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
    }

    if (host) {
      return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
    }
  }

  return null;
}

/**
 * Synchronous fallback transporter builder
 */
export function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (user && pass) {
    if (host.includes("gmail")) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  return null;
}

export async function verifySmtpConnection(): Promise<{ success: boolean; message: string; config?: any }> {
  const config = await getSmtpConfig();

  if (!config.smtpUsername || !config.smtpPassword) {
    return {
      success: false,
      message: "SMTP credentials missing. Please set Username and Password in Email & SMTP Gateway.",
    };
  }

  try {
    const transporter = await createTransporterAsync();
    if (!transporter) {
      return {
        success: false,
        message: "Failed to initialize SMTP transporter. Please check host, port, or user settings.",
      };
    }

    await transporter.verify();
    return {
      success: true,
      message: `SMTP Connected successfully to ${config.smtpHost}:${config.smtpPort} as ${config.smtpUsername}`,
      config: {
        host: config.smtpHost,
        user: config.smtpUsername,
        port: config.smtpPort,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `SMTP Connection error: ${err.message || String(err)}`,
    };
  }
}

/**
 * Sends official approval email to employer
 */
export async function sendEmployerApprovalEmail({
  toEmail,
  recipientName,
  companyName,
  password,
  loginUrl,
}: {
  toEmail: string;
  recipientName: string;
  companyName: string;
  password: string;
  loginUrl: string;
}) {
  const config = await getSmtpConfig();
  if (!config.triggerEmployerPostings) {
    console.log("[SMTP GATEWAY] Employer posting triggers disabled in Admin controls.");
  }

  const subject = `🎉 Approved: Your JobsGhuru Employer Account is Active - Login Credentials`;
  const fromAddress = `"${config.fromDisplayName}" <${config.fromEmailAddress}>`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
    .title { margin: 0; font-size: 24px; font-weight: 800; }
    .content { padding: 36px 32px; }
    .creds-box { background: #f8fafc; border: 2px dashed #93c5fd; border-radius: 16px; padding: 24px; margin-bottom: 28px; }
    .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .cred-val { font-family: monospace; font-weight: 700; color: #0f172a; background: #ffffff; padding: 4px 10px; border-radius: 6px; border: 1px solid #cbd5e1; }
    .btn-container { text-align: center; margin: 32px 0 24px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; }
    .footer { border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; background: #fafafa; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">Welcome to JobsGhuru</h1>
      <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Your company registration has been officially approved!</p>
    </div>
    <div class="content">
      <div style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Hello ${recipientName},</div>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Great news! The JobsGhuru Governance Team has reviewed and approved your company registration for <strong>${companyName}</strong>.
      </p>
      <div class="creds-box">
        <div className="cred-row"><span style="color: #64748b;">Login Portal:</span><span className="cred-val">${loginUrl}</span></div>
        <div className="cred-row"><span style="color: #64748b;">Registered Email:</span><span className="cred-val">${toEmail}</span></div>
        <div className="cred-row"><span style="color: #64748b;">Temporary Password:</span><span className="cred-val" style="color: #2563eb;">${password}</span></div>
      </div>
      <div className="btn-container">
        <a href="${loginUrl}" className="btn" target="_blank">Sign In to Employer Dashboard →</a>
      </div>
    </div>
    <div className="footer">&copy; ${new Date().getFullYear()} JobsGhuru Network</div>
  </div>
</body>
</html>
  `;

  const outboxEntry: OutboxEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: toEmail,
    subject,
    preview: `Welcome ${recipientName}! ${companyName} approved. Credentials: ${toEmail} / ${password}`,
    credentials: { email: toEmail, password, loginUrl },
    sentAt: new Date().toISOString(),
    html: htmlContent,
  };
  emailOutbox.unshift(outboxEntry);

  try {
    const transporter = await createTransporterAsync();
    if (transporter) {
      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlContent,
      });
    }
  } catch (err) {
    console.error("[SMTP DISPATCH] Live delivery error, stored in outbox:", err);
  }

  return { success: true, outboxId: outboxEntry.id };
}

export async function sendEmployerRegistrationReceivedEmail({
  toEmail,
  recipientName,
  companyName,
}: {
  toEmail: string;
  recipientName: string;
  companyName: string;
}) {
  const config = await getSmtpConfig();
  const transporter = await createTransporterAsync();
  const subject = `Registration Received: ${companyName} on JobsGhuru`;
  const fromAddress = `"${config.fromDisplayName}" <${config.fromEmailAddress}>`;

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 24px;">
      <h2>Company Registration Received</h2>
      <p>Dear ${recipientName},</p>
      <p>Thank you for registering <strong>${companyName}</strong> on JobsGhuru.</p>
      <p>Our governance team reviews company registrations within 2 to 4 hours.</p>
    </div>
  `;

  const outboxEntry: OutboxEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: toEmail,
    subject,
    preview: `Registration received for ${companyName}. Pending review.`,
    sentAt: new Date().toISOString(),
    html: htmlContent,
  };
  emailOutbox.unshift(outboxEntry);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlContent,
      });
    } catch (e) {
      console.error("Registration email error:", e);
    }
  }
  return { success: true };
}

export async function sendEmployerRejectionEmail({
  toEmail,
  recipientName,
  companyName,
  reason,
}: {
  toEmail: string;
  recipientName: string;
  companyName: string;
  reason: string;
}) {
  const config = await getSmtpConfig();
  const transporter = await createTransporterAsync();
  const subject = `Update Regarding Your JobsGhuru Verification - ${companyName}`;
  const fromAddress = `"${config.fromDisplayName}" <${config.fromEmailAddress}>`;

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 24px;">
      <h2>Verification Status Update</h2>
      <p>Dear ${recipientName}, application for ${companyName} could not be approved at this time.</p>
      <p>Reason: ${reason}</p>
    </div>
  `;

  const outboxEntry: OutboxEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: toEmail,
    subject,
    preview: `Verification update for ${companyName}`,
    sentAt: new Date().toISOString(),
    html: htmlContent,
  };
  emailOutbox.unshift(outboxEntry);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlContent,
      });
    } catch (e) {
      console.error("Rejection email error:", e);
    }
  }
  return { success: true };
}

/**
 * Sends candidate application received email
 */
export async function sendCandidateApplicationReceivedEmail({
  toEmail,
  candidateName,
  jobTitle,
  companyName,
  applicationId,
}: {
  toEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  applicationId: string;
}) {
  const config = await getSmtpConfig();
  if (!config.triggerJobApplications) {
    console.log("[SMTP GATEWAY] Job application triggers disabled in Admin controls.");
    return { success: true, disabled: true };
  }

  const subject = `Application Received: ${jobTitle} at ${companyName} - JobsGhuru`;
  const fromAddress = `"${config.fromDisplayName}" <${config.fromEmailAddress}>`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .content { padding: 32px 28px; font-size: 14px; line-height: 1.6; color: #334155; }
    .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #dcfce7; font-size: 13px; }
    .footer { border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; background: #fafafa; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin: 0; font-size: 22px;">JobsGhuru Job Application</h2>
      <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Delivered to ${companyName}</p>
    </div>
    <div class="content">
      <p>Hello <strong>${candidateName}</strong>,</p>
      <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been transmitted through JobsGhuru.</p>
      
      <div class="info-box">
        <div style="font-weight: 800; color: #166534; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">📋 Application Details</div>
        <div class="info-row"><span style="color: #64748b;">Target Role:</span><strong>${jobTitle}</strong></div>
        <div class="info-row"><span style="color: #64748b;">Hiring Employer:</span><strong>${companyName}</strong></div>
        <div class="info-row"><span style="color: #64748b;">Ref ID:</span><strong style="font-family: monospace; color: #2563eb;">${applicationId}</strong></div>
      </div>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} JobsGhuru Recruitment Network</div>
  </div>
</body>
</html>
  `;

  const outboxEntry: OutboxEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: toEmail,
    subject,
    preview: `Application received for ${jobTitle} at ${companyName}. ID: ${applicationId}`,
    sentAt: new Date().toISOString(),
    html: htmlContent,
  };
  emailOutbox.unshift(outboxEntry);

  try {
    const transporter = await createTransporterAsync();
    if (transporter) {
      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlContent,
      });
    }
  } catch (err) {
    console.error("[SMTP DISPATCH] Application email error:", err);
  }

  return { success: true };
}

/**
 * Sends interview scheduled email
 */
export async function sendInterviewScheduledEmail({
  toEmail,
  candidateName,
  companyName,
  jobTitle,
  interviewTitle,
  interviewType,
  scheduledAt,
  durationMinutes,
  meetingLink,
  notes,
}: {
  toEmail: string;
  candidateName: string;
  companyName: string;
  jobTitle: string;
  interviewTitle: string;
  interviewType: string;
  scheduledAt: string | Date;
  durationMinutes: number;
  meetingLink?: string | null;
  notes?: string | null;
}) {
  const config = await getSmtpConfig();
  const formattedDate = new Date(scheduledAt).toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subject = `📅 Interview Invitation: ${interviewTitle || "Interview Round"} - ${companyName}`;
  const fromAddress = `"${companyName} (via ${config.fromDisplayName})"` + ` <${config.fromEmailAddress}>`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
    .content { padding: 36px 30px; font-size: 14px; line-height: 1.6; color: #334155; }
    .highlight-card { background: #eef2ff; border: 2px solid #c7d2fe; border-radius: 16px; padding: 22px; margin: 24px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e7ff; font-size: 13px; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; }
    .footer { border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center; font-size: 12px; color: #94a3b8; background: #fafafa; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Interview Scheduled</h1>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">${companyName} wants to interview you for ${jobTitle}</p>
    </div>
    <div class="content">
      <p>Dear <strong>${candidateName}</strong>,</p>
      <p>The recruitment team at <strong>${companyName}</strong> has scheduled an interview for the <strong>${jobTitle}</strong> position on JobsGhuru.</p>

      <div class="highlight-card">
        <div class="row"><span>Round Title:</span><strong>${interviewTitle}</strong></div>
        <div class="row"><span>Type:</span><strong>${interviewType} Round</strong></div>
        <div class="row"><span>Date &amp; Time:</span><strong style="color: #4f46e5;">${formattedDate}</strong></div>
        <div class="row"><span>Duration:</span><strong>${durationMinutes} Minutes</strong></div>
        ${meetingLink ? `<div class="row"><span>Meeting URL:</span><a href="${meetingLink}" target="_blank" style="color: #4f46e5;">${meetingLink}</a></div>` : ""}
      </div>

      ${notes ? `<div style="background: #fefce8; border-left: 4px solid #eab308; padding: 14px; border-radius: 8px; font-size: 13px; color: #854d0e; margin: 20px 0;"><strong>Instructions:</strong><br/>${notes}</div>` : ""}

      ${meetingLink ? `<div style="text-align: center; margin: 28px 0;"><a href="${meetingLink}" class="btn" target="_blank">Join Video Interview Call →</a></div>` : ""}
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} JobsGhuru Hiring Network</div>
  </div>
</body>
</html>
  `;

  const outboxEntry: OutboxEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: toEmail,
    subject,
    preview: `Interview scheduled with ${companyName} for ${jobTitle} on ${formattedDate}.`,
    sentAt: new Date().toISOString(),
    html: htmlContent,
  };
  emailOutbox.unshift(outboxEntry);

  try {
    const transporter = await createTransporterAsync();
    if (transporter) {
      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlContent,
      });
    }
  } catch (err) {
    console.error("[SMTP DISPATCH] Interview email error:", err);
  }

  return { success: true, outboxId: outboxEntry.id };
}

export async function sendTeamInviteEmail(params: any) {
  const config = await getSmtpConfig();
  const transporter = await createTransporterAsync();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${params.companyName || config.fromDisplayName}" <${config.fromEmailAddress}>`,
        to: params.toEmail,
        subject: `👋 You've been invited to join ${params.companyName} on JobsGhuru`,
        html: `<p>Hello ${params.recipientName}, you have been invited to join ${params.companyName} on JobsGhuru.</p><p>Login: ${params.loginUrl}</p>`,
      });
    } catch (e) {
      console.error("Team invite error:", e);
    }
  }
  return { success: true };
}

export async function sendAssessmentInviteEmail(params: any) {
  const config = await getSmtpConfig();
  const transporter = await createTransporterAsync();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${config.fromDisplayName} Assessments" <${config.fromEmailAddress}>`,
        to: params.toEmail,
        subject: `📝 Skills Assessment Invitation from ${params.companyName}: ${params.assessmentTitle}`,
        html: `<p>Hello ${params.candidateName}, you are invited to take assessment ${params.assessmentTitle}.</p><p>URL: ${params.testUrl}</p>`,
      });
    } catch (e) {
      console.error("Assessment invite error:", e);
    }
  }
  return { success: true };
}

export async function sendOfferLetterEmail(params: any) {
  const config = await getSmtpConfig();
  const transporter = await createTransporterAsync();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${params.companyName} Careers" <${config.fromEmailAddress}>`,
        to: params.toEmail,
        subject: `🎉 Formal Job Offer: ${params.roleTitle} at ${params.companyName}`,
        html: `<p>Dear ${params.candidateName}, Congratulations! You have received a job offer from ${params.companyName}.</p>`,
      });
    } catch (e) {
      console.error("Offer letter error:", e);
    }
  }
  return { success: true };
}

export async function sendPasswordResetEmail(params: any) {
  const config = await getSmtpConfig();
  const transporter = await createTransporterAsync();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${config.fromDisplayName} Security" <${config.fromEmailAddress}>`,
        to: params.toEmail,
        subject: `🔐 Password Reset Request - JobsGhuru`,
        html: `<p>Hello ${params.recipientName}, reset your password here: <a href="${params.resetUrl}">${params.resetUrl}</a></p>`,
      });
    } catch (e) {
      console.error("Password reset error:", e);
    }
  }
  return { success: true };
}
