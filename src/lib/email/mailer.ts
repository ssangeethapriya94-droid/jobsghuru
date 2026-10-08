import nodemailer from "nodemailer";

interface SendApprovalEmailParams {
  toEmail: string;
  recipientName: string;
  companyName: string;
  password: string;
  loginUrl: string;
}

interface SendRegistrationReceivedParams {
  toEmail: string;
  recipientName: string;
  companyName: string;
}

// In-memory outbox log for inspection in development/admin console
export interface OutboxEmail {
  id: string;
  to: string;
  subject: string;
  preview: string;
  credentials?: { email: string; password?: string; loginUrl: string };
  sentAt: string;
  html: string;
}

// Global outbox storage (persists across hot reloads in globalThis)
const globalForOutbox = globalThis as unknown as { __careerbridge_outbox: OutboxEmail[] };
if (!globalForOutbox.__careerbridge_outbox) {
  globalForOutbox.__careerbridge_outbox = [];
}
export const emailOutbox = globalForOutbox.__careerbridge_outbox;

export function createTransporter() {
  const service = process.env.SMTP_SERVICE?.toLowerCase(); // "gmail"
  const host = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.SMTP_PORT || (host === "smtp.gmail.com" ? "465" : "587"), 10);
  const user = (process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || "").trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD || "").replace(/\s+/g, "");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (user && pass) {
    if (service === "gmail" || (host && host.includes("gmail"))) {
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
 * Sends official approval email with login credentials to registered company staff
 */
export async function sendEmployerApprovalEmail({
  toEmail,
  recipientName,
  companyName,
  password,
  loginUrl,
}: SendApprovalEmailParams) {
  const subject = `🎉 Approved: Your JobsGuru Employer Account is Active - Login Credentials`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px); padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .title { margin: 0; font-size: 24px; font-weight: 800; line-height: 1.25; }
    .content { padding: 36px 32px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .creds-box { background: #f8fafc; border: 2px dashed #93c5fd; border-radius: 16px; padding: 24px; margin-bottom: 28px; }
    .creds-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1d4ed8; margin-bottom: 16px; display: flex; align-items: center; gap: 6px; }
    .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .cred-row:last-child { border-bottom: none; }
    .cred-label { color: #64748b; font-weight: 600; }
    .cred-val { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; color: #0f172a; background: #ffffff; padding: 4px 10px; border-radius: 6px; border: 1px solid #cbd5e1; }
    .btn-container { text-align: center; margin: 32px 0 24px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
    .notice { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 0 10px 10px 0; font-size: 12px; color: #1e40af; line-height: 1.5; margin-bottom: 24px; }
    .footer { border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; background: #fafafa; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">✓ Verified Employer Account</div>
      <h1 class="title">Welcome to JobsGuru</h1>
      <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Your company registration has been officially approved!</p>
    </div>
    <div class="content">
      <div class="greeting">Hello ${recipientName},</div>
      <p class="text">
        Great news! The JobsGuru Governance & Admin Team has reviewed and approved your company registration for <strong>${companyName}</strong>. 
        Your enterprise account has been approved and granted the <strong>Verified Employer Badge</strong>.
      </p>

      <div class="creds-box">
        <div class="creds-title">🔐 Your Official Login Credentials</div>
        <div class="cred-row">
          <span class="cred-label">Login Portal URL:</span>
          <span class="cred-val">${loginUrl}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Registered Email ID:</span>
          <span class="cred-val">${toEmail}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Temporary Password:</span>
          <span class="cred-val" style="color: #2563eb;">${password}</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="${loginUrl}" class="btn" target="_blank">Sign In to Employer Dashboard →</a>
      </div>

      <div class="notice">
        <strong>Security Tip:</strong> We recommend changing your password after your first login under <em>Company Profile &gt; Team &amp; Security</em>. Do not share these credentials with unauthorized staff.
      </div>

      <p class="text" style="font-size: 13px;">
        If you have any questions or require assistance setting up your candidate filters and job postings, reply directly to this email or contact support at <a href="mailto:support@jobsguru.com" style="color: #2563eb;">support@jobsguru.com</a>.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} JobsGuru Hiring Ecosystem. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  // Record to in-memory outbox
  const outboxEntry: OutboxEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: toEmail,
    subject,
    preview: `Welcome ${recipientName}! Your company ${companyName} has been approved. Credentials: ${toEmail} / ${password}`,
    credentials: {
      email: toEmail,
      password,
      loginUrl,
    },
    sentAt: new Date().toISOString(),
    html: htmlContent,
  };
  emailOutbox.unshift(outboxEntry);
  if (emailOutbox.length > 50) emailOutbox.pop();

  console.log("==================================================================");
  console.log(`[EMAIL DISPATCH] Sent to: ${toEmail}`);
  console.log(`[EMAIL DISPATCH] Subject: ${subject}`);
  console.log(`[EMAIL DISPATCH] Login URL: ${loginUrl}`);
  console.log(`[EMAIL DISPATCH] Email: ${toEmail}`);
  console.log(`[EMAIL DISPATCH] Password: ${password}`);
  console.log("==================================================================");

  // Attempt real SMTP dispatch if configured
  try {
    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"JobsGuru Admin" <noreply@jobsguru.com>',
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[EMAIL DISPATCH] SMTP delivery confirmed to ${toEmail}`);
    }
  } catch (err) {
    console.error("[EMAIL DISPATCH] SMTP failed, but logged to outbox:", err);
  }

  return { success: true, outboxId: outboxEntry.id };
}

/**
 * Sends confirmation email when employer registration is initially submitted
 */
export async function sendEmployerRegistrationReceivedEmail({
  toEmail,
  recipientName,
  companyName,
}: SendRegistrationReceivedParams) {
  const subject = `Registration & Payment Received: ${companyName} on JobsGuru`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px; color: #334155; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;">
    <h2 style="color: #0f172a; margin-top: 0;">Company Registration Submitted</h2>
    <p>Dear ${recipientName},</p>
    <p>Thank you for registering <strong>${companyName}</strong> on the JobsGuru Employer Platform.</p>
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #92400e; margin: 20px 0;">
      <strong>Status: Pending JobsGuru Admin Approval</strong><br/>
      Our governance and verification team reviews company registrations within 2 to 4 business hours to ensure platform security.
    </div>
    <p>Once your company details are approved by the JobsGuru Admin, you will receive an official approval email containing your login credentials (Email &amp; Password) and direct dashboard access link.</p>
    <p style="font-size: 13px; color: #64748b;">Warm regards,<br/>JobsGuru Onboarding Team</p>
  </div>
</body>
</html>
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

  try {
    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CareerBridge Admin" <noreply@careerbridge.com>',
        to: toEmail,
        subject,
        html: htmlContent,
      });
    }
  } catch (err) {
    console.error("[EMAIL DISPATCH] Registration email error:", err);
  }

  return { success: true };
}

/**
 * Sends official rejection / request-info email to registered company staff
 */
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
  const subject = `Update Regarding Your CareerBridge Employer Verification - ${companyName}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #e11d48; padding: 28px; text-align: center; color: #ffffff; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #334155; }
    .reason-box { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px; margin: 20px 0; color: #9f1239; }
    .footer { border-top: 1px solid #e2e8f0; padding: 18px 32px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin: 0; font-size: 20px;">Verification Status Update</h2>
    </div>
    <div class="content">
      <p>Dear ${recipientName},</p>
      <p>Thank you for submitting your employer registration for <strong>${companyName}</strong> on CareerBridge.</p>
      <p>Following our compliance and Ministry of Corporate Affairs audit, our governance team was unable to approve your application at this time.</p>
      <div class="reason-box">
        <strong>Audit Reason / Note:</strong><br/>
        ${reason}
      </div>
      <p>If you believe this was an error or would like to submit updated tax / incorporation documents, please contact our support team at <a href="mailto:support@careerbridge.com" style="color: #2563eb;">support@careerbridge.com</a>.</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} CareerBridge Compliance Team</div>
  </div>
</body>
</html>
  `;

  const outboxEntry: OutboxEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: toEmail,
    subject,
    preview: `Verification rejected for ${companyName}. Reason: ${reason}`,
    sentAt: new Date().toISOString(),
    html: htmlContent,
  };
  emailOutbox.unshift(outboxEntry);

  try {
    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CareerBridge Admin" <noreply@careerbridge.com>',
        to: toEmail,
        subject,
        html: htmlContent,
      });
    }
  } catch (err) {
    console.error("[EMAIL DISPATCH] Rejection email error:", err);
  }

  return { success: true };
}

/**
 * Sends confirmation email to candidate when they submit a job application on Jobsghuru
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
  const subject = `Application Received: ${jobTitle} at ${companyName} - Jobsghuru`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
    .content { padding: 32px 28px; font-size: 14px; line-height: 1.6; color: #334155; }
    .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #dcfce7; font-size: 13px; }
    .info-row:last-child { border-bottom: none; }
    .footer { border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; background: #fafafa; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">✓ Application Submitted</div>
      <h2 style="margin: 0; font-size: 22px;">Jobsghuru Job Application</h2>
      <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Your application has been received by ${companyName}</p>
    </div>
    <div class="content">
      <p>Hello <strong>${candidateName}</strong>,</p>
      <p>Your application for the role of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully transmitted through the Jobsghuru recruitment portal.</p>
      
      <div class="info-box">
        <div style="font-weight: 800; color: #166534; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">📋 Application Summary</div>
        <div class="info-row">
          <span style="color: #64748b;">Target Role:</span>
          <strong style="color: #0f172a;">${jobTitle}</strong>
        </div>
        <div class="info-row">
          <span style="color: #64748b;">Hiring Employer:</span>
          <strong style="color: #0f172a;">${companyName}</strong>
        </div>
        <div class="info-row">
          <span style="color: #64748b;">Application Ref ID:</span>
          <strong style="font-family: monospace; color: #2563eb;">${applicationId}</strong>
        </div>
        <div class="info-row">
          <span style="color: #64748b;">Current Status:</span>
          <strong style="color: #16a34a;">Submitted &amp; Delivered to Recruiter</strong>
        </div>
      </div>

      <p><strong>What happens next?</strong><br/>
      The hiring team at ${companyName} will review your resume, experience, and skills. If shortlisted, you will receive an interview scheduling invitation directly to this email address with meeting and video call details.</p>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Best of luck with your application!<br/><strong>Jobsghuru Candidate Support Team</strong></p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Jobsghuru (CareerBridge) Talent Ecosystem</div>
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
    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Jobsghuru Careers" <noreply@jobsghuru.com>',
        to: toEmail,
        subject,
        html: htmlContent,
      });
    }
  } catch (err) {
    console.error("[EMAIL DISPATCH] Candidate app received email error:", err);
  }

  return { success: true };
}

/**
 * Sends official interview details email to candidate / job seeker when scheduled by employer
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
  const formattedDate = new Date(scheduledAt).toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const subject = `📅 Interview Invitation: ${interviewTitle || "Interview Round"} - ${companyName}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 5px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; }
    .content { padding: 36px 30px; font-size: 14px; line-height: 1.6; color: #334155; }
    .highlight-card { background: #eef2ff; border: 2px solid #c7d2fe; border-radius: 16px; padding: 22px; margin: 24px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e7ff; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.25); }
    .notes-box { background: #fefce8; border-left: 4px solid #eab308; padding: 14px 16px; border-radius: 0 10px 10px 0; font-size: 13px; color: #854d0e; margin: 20px 0; }
    .footer { border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center; font-size: 12px; color: #94a3b8; background: #fafafa; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">🎯 Interview Invitation</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Interview Scheduled</h1>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">${companyName} wants to interview you for ${jobTitle}</p>
    </div>
    <div class="content">
      <p>Dear <strong>${candidateName}</strong>,</p>
      <p>Congratulations! The recruitment team at <strong>${companyName}</strong> was impressed by your profile and has scheduled an interview for the <strong>${jobTitle}</strong> position on Jobsghuru.</p>

      <div class="highlight-card">
        <div style="font-weight: 800; color: #3730a3; font-size: 12px; text-transform: uppercase; margin-bottom: 12px;">📅 Interview Schedule Details</div>
        <div class="row">
          <span style="color: #64748b;">Round Title:</span>
          <strong style="color: #0f172a;">${interviewTitle}</strong>
        </div>
        <div class="row">
          <span style="color: #64748b;">Interview Type:</span>
          <strong style="color: #0f172a;">${interviewType} Round</strong>
        </div>
        <div class="row">
          <span style="color: #64748b;">Date &amp; Time:</span>
          <strong style="color: #4f46e5;">${formattedDate}</strong>
        </div>
        <div class="row">
          <span style="color: #64748b;">Expected Duration:</span>
          <strong style="color: #0f172a;">${durationMinutes} Minutes</strong>
        </div>
        ${
          meetingLink
            ? `
        <div class="row">
          <span style="color: #64748b;">Meeting URL:</span>
          <a href="${meetingLink}" target="_blank" style="color: #4f46e5; font-weight: 700; word-break: break-all;">${meetingLink}</a>
        </div>
        `
            : ""
        }
      </div>

      ${
        notes
          ? `
      <div class="notes-box">
        <strong>Recruiter Instructions &amp; Topics:</strong><br/>
        ${notes}
      </div>
      `
          : ""
      }

      ${
        meetingLink
          ? `
      <div class="btn-container">
        <a href="${meetingLink}" class="btn" target="_blank">Join Video Interview Call →</a>
      </div>
      `
          : ""
      }

      <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
        <strong>Interview Tips:</strong><br/>
        • Please test your camera and microphone 5 minutes prior to the scheduled time.<br/>
        • Have a copy of your resume and any relevant project portfolios handy.<br/>
        • For any rescheduling requests, please reply directly to this email.
      </p>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Warm regards,<br/><strong>${companyName} Talent Acquisition Team</strong><br/>Via Jobsghuru Recruitment Platform</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Jobsghuru (CareerBridge) Hiring Network</div>
  </div>
</body>
</html>
  `;

  const outboxEntry: OutboxEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: toEmail,
    subject,
    preview: `Interview scheduled with ${companyName} for ${jobTitle} on ${formattedDate}. Link: ${meetingLink || "In-person/TBD"}`,
    sentAt: new Date().toISOString(),
    html: htmlContent,
  };
  emailOutbox.unshift(outboxEntry);

  console.log("==================================================================");
  console.log(`[INTERVIEW EMAIL DISPATCH] Sent to candidate: ${toEmail}`);
  console.log(`[INTERVIEW EMAIL DISPATCH] Company: ${companyName}, Job: ${jobTitle}`);
  console.log(`[INTERVIEW EMAIL DISPATCH] Scheduled: ${formattedDate}`);
  console.log(`[INTERVIEW EMAIL DISPATCH] Meeting Link: ${meetingLink}`);
  console.log("==================================================================");

  try {
    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"${companyName} Careers" <interviews@jobsghuru.com>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
    }
  } catch (err) {
    console.error("[EMAIL DISPATCH] Interview email dispatch error:", err);
  }

  return { success: true, outboxId: outboxEntry.id };
}

interface SendTeamInviteEmailParams {
  toEmail: string;
  recipientName: string;
  companyName: string;
  role: string;
  temporaryPassword?: string;
  loginUrl: string;
}

export async function sendTeamInviteEmail({
  toEmail,
  recipientName,
  companyName,
  role,
  temporaryPassword = "CareerBridgeInvite2026!",
  loginUrl,
}: SendTeamInviteEmailParams) {
  const subject = `👋 You've been invited to join ${companyName} on Jobsghuru (CareerBridge)`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: rgba(255, 255, 255, 0.25); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .title { margin: 0; font-size: 22px; font-weight: 800; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
    .box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .btn-container { text-align: center; margin: 28px 0 20px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 12px; }
    .footer { border-top: 1px solid #e2e8f0; padding: 18px 28px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">Team Invitation</div>
      <h1 class="title">Join ${companyName} on Jobsghuru</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${recipientName || "Team Member"},</div>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        You have been invited to join the hiring team at <strong>${companyName}</strong> on the Jobsghuru Recruitment Platform.
      </p>

      <div class="box">
        <div class="row">
          <span style="color: #64748b;">Assigned Role:</span>
          <strong style="color: #2563eb;">${role}</strong>
        </div>
        <div class="row">
          <span style="color: #64748b;">Login Email:</span>
          <strong>${toEmail}</strong>
        </div>
        <div class="row">
          <span style="color: #64748b;">Temporary Password:</span>
          <code style="background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #cbd5e1;">${temporaryPassword}</code>
        </div>
      </div>

      <div class="btn-container">
        <a href="${loginUrl}" class="btn">Sign In to Employer Dashboard →</a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
        For security, please change your password after your first login via Account &gt; Settings.
      </p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Jobsghuru (CareerBridge) Hiring Network</div>
  </div>
</body>
</html>
  `;

  const outboxEntry: OutboxEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: toEmail,
    subject,
    preview: `Team invite from ${companyName}. Role: ${role}. Login with ${toEmail}`,
    sentAt: new Date().toISOString(),
    html: htmlContent,
  };
  emailOutbox.unshift(outboxEntry);

  console.log("==================================================================");
  console.log(`[TEAM INVITE DISPATCH] Sent to: ${toEmail}`);
  console.log(`[TEAM INVITE DISPATCH] Company: ${companyName}, Role: ${role}`);
  console.log(`[TEAM INVITE DISPATCH] Login URL: ${loginUrl}`);
  console.log("==================================================================");

  try {
    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"${companyName}" <invites@jobsghuru.com>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
    }
  } catch (err) {
    console.error("[EMAIL DISPATCH] Team invite email dispatch error:", err);
  }

  return { success: true, outboxId: outboxEntry.id };
}

interface SendAssessmentInviteParams {
  toEmail: string;
  candidateName: string;
  companyName: string;
  assessmentTitle: string;
  durationMinutes: number;
  passingScore: number;
  testUrl: string;
}

export async function sendAssessmentInviteEmail({
  toEmail,
  candidateName,
  companyName,
  assessmentTitle,
  durationMinutes,
  passingScore,
  testUrl,
}: SendAssessmentInviteParams) {
  const subject = `📝 Skills Assessment Invitation from ${companyName}: ${assessmentTitle}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: rgba(255, 255, 255, 0.25); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
    .title { margin: 0; font-size: 22px; font-weight: 800; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
    .box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .btn-container { text-align: center; margin: 28px 0 20px; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 12px; }
    .footer { border-top: 1px solid #e2e8f0; padding: 18px 28px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">Online Evaluation</div>
      <h1 class="title">${assessmentTitle}</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${candidateName},</div>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        The recruitment team at <strong>${companyName}</strong> has invited you to complete an online technical evaluation.
      </p>

      <div class="box">
        <div class="row">
          <span style="color: #64748b;">Assessment Name:</span>
          <strong style="color: #4f46e5;">${assessmentTitle}</strong>
        </div>
        <div class="row">
          <span style="color: #64748b;">Time Limit:</span>
          <strong>${durationMinutes} Minutes</strong>
        </div>
        <div class="row">
          <span style="color: #64748b;">Passing Threshold:</span>
          <strong>${passingScore}%</strong>
        </div>
      </div>

      <div class="btn-container">
        <a href="${testUrl}" class="btn">Start Assessment Now →</a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 20px; line-height: 1.5;">
        • Ensure you have a quiet environment and a stable internet connection.<br/>
        • Once started, the timer will countdown continuously.<br/>
        • Link: <a href="${testUrl}" style="color: #4f46e5;">${testUrl}</a>
      </p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Jobsghuru (CareerBridge) Hiring Network</div>
  </div>
</body>
</html>
  `;

  const outboxEntry: OutboxEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: toEmail,
    subject,
    preview: `Assessment invite from ${companyName}: ${assessmentTitle}. Time: ${durationMinutes} mins.`,
    sentAt: new Date().toISOString(),
    html: htmlContent,
  };
  emailOutbox.unshift(outboxEntry);

  try {
    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"${companyName} Assessments" <assessments@jobsghuru.com>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
    }
  } catch (err) {
    console.error("[EMAIL DISPATCH] Assessment email dispatch error:", err);
  }

  return { success: true, outboxId: outboxEntry.id };
}

interface SendOfferLetterParams {
  toEmail: string;
  candidateName: string;
  companyName: string;
  roleTitle: string;
  baseSalaryLpa: number;
  variableLpa?: number;
  startDate: string;
  expiryDate: string;
  terms?: string;
}

export async function sendOfferLetterEmail({
  toEmail,
  candidateName,
  companyName,
  roleTitle,
  baseSalaryLpa,
  variableLpa = 0,
  startDate,
  expiryDate,
  terms,
}: SendOfferLetterParams) {
  const subject = `🎉 Formal Job Offer: ${roleTitle} at ${companyName}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .badge { display: inline-block; background: rgba(255, 255, 255, 0.25); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
    .title { margin: 0; font-size: 22px; font-weight: 800; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
    .box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dcfce7; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .footer { border-top: 1px solid #e2e8f0; padding: 18px 28px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">Official Offer Letter</div>
      <h1 class="title">Congratulations ${candidateName}!</h1>
    </div>
    <div class="content">
      <div class="greeting">Dear ${candidateName},</div>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        We are thrilled to offer you the position of <strong>${roleTitle}</strong> at <strong>${companyName}</strong>.
      </p>

      <div class="box">
        <div class="row">
          <span style="color: #166534;">Role Title:</span>
          <strong>${roleTitle}</strong>
        </div>
        <div class="row">
          <span style="color: #166534;">Fixed Compensation:</span>
          <strong style="color: #059669; font-size: 15px;">₹${baseSalaryLpa} LPA</strong>
        </div>
        ${variableLpa ? `
        <div class="row">
          <span style="color: #166534;">Variable Bonus:</span>
          <strong>₹${variableLpa} LPA</strong>
        </div>` : ""}
        <div class="row">
          <span style="color: #166534;">Proposed Start Date:</span>
          <strong>${startDate}</strong>
        </div>
        <div class="row">
          <span style="color: #166534;">Offer Valid Until:</span>
          <strong style="color: #b91c1c;">${expiryDate}</strong>
        </div>
      </div>

      ${terms ? `
      <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 12px; color: #334155; margin: 16px 0;">
        <strong>Terms & Benefits:</strong><br/>
        ${terms}
      </div>` : ""}

      <p style="font-size: 13px; color: #475569; line-height: 1.5;">
        Please review this offer and respond by replying directly to this email or contacting the hiring team before the expiry deadline.
      </p>

      <p style="font-size: 13px; color: #475569; margin-top: 24px;">
        Warm regards,<br/><strong>${companyName} Talent Acquisition Team</strong>
      </p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Jobsghuru (CareerBridge) Hiring Network</div>
  </div>
</body>
</html>
  `;

  const outboxEntry: OutboxEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    to: toEmail,
    subject,
    preview: `Offer letter from ${companyName} for ${roleTitle} at ₹${baseSalaryLpa} LPA.`,
    sentAt: new Date().toISOString(),
    html: htmlContent,
  };
  emailOutbox.unshift(outboxEntry);

  try {
    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"${companyName} Careers" <offers@jobsghuru.com>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
    }
  } catch (err) {
    console.error("[EMAIL DISPATCH] Offer letter email dispatch error:", err);
  }

  return { success: true, outboxId: outboxEntry.id };
}

export async function verifySmtpConnection(): Promise<{ success: boolean; message: string; config?: any }> {
  const user = (process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || "").trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD || "").replace(/\s+/g, "");

  if (!user || !pass) {
    return {
      success: false,
      message: "SMTP credentials missing. Please set SMTP_USER and SMTP_PASS in your .env file.",
    };
  }

  try {
    const transporter = createTransporter();
    if (!transporter) {
      return {
        success: false,
        message: "Failed to initialize SMTP transporter. Please check SMTP_HOST or SMTP_USER configuration.",
      };
    }

    await transporter.verify();
    return {
      success: true,
      message: `SMTP Connected successfully to ${process.env.SMTP_HOST || "Gmail Service"} as ${user}`,
      config: {
        host: process.env.SMTP_HOST || "Gmail",
        user,
        port: process.env.SMTP_PORT || "587/465",
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `SMTP Connection error: ${err.message || String(err)}`,
    };
  }
}




