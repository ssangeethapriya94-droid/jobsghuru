import { db } from "@/lib/db";
import { createTransporter, emailOutbox as memoryOutbox } from "./mailer";

export interface EnqueueEmailParams {
  to: string;
  subject: string;
  html: string;
  template?: string;
  payload?: any;
  companyId?: string;
  applicationId?: string;
}

/**
 * Dispatches an email using the Outbox Pattern:
 * 1. Creates an EmailOutbox record with status = "PENDING".
 * 2. Attempts actual transmission via SMTP transporter.
 * 3. Records real status as "SENT" or "FAILED" with explicit error messages.
 */
export async function queueAndSendEmail({
  to,
  subject,
  html,
  template,
  payload,
  companyId,
  applicationId,
}: EnqueueEmailParams): Promise<{ id: string; status: "SENT" | "FAILED"; error?: string }> {
  // 1. Create database outbox record
  const resolvedCompanyId = companyId || payload?.companyId || null;
  const resolvedApplicationId = applicationId || payload?.applicationId || null;

  const outboxRecord = await db.emailOutbox.create({
    data: {
      to,
      subject,
      template: template || "GENERAL",
      payload: payload ? JSON.parse(JSON.stringify(payload)) : null,
      companyId: resolvedCompanyId,
      applicationId: resolvedApplicationId,
      status: "PENDING",
    },
  });

  // 2. Add to in-memory log for instant dev/admin visibility
  memoryOutbox.unshift({
    id: outboxRecord.id,
    to,
    subject,
    preview: subject,
    sentAt: new Date().toISOString(),
    html,
  });

  // 3. Attempt transmission
  try {
    const transporter = createTransporter();
    if (!transporter) {
      // In development or test without live SMTP credentials, mark appropriately
      const errorMsg = "SMTP transporter not configured (missing SMTP_USER/SMTP_PASS)";
      await db.emailOutbox.update({
        where: { id: outboxRecord.id },
        data: {
          status: "FAILED",
          errorMessage: errorMsg,
        },
      });
      return { id: outboxRecord.id, status: "FAILED", error: errorMsg };
    }

    const fromAddress = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"JobsGuru Career Portal" <noreply@jobsguru.in>';
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    // Mark SENT
    await db.emailOutbox.update({
      where: { id: outboxRecord.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return { id: outboxRecord.id, status: "SENT" };
  } catch (err: any) {
    console.error(`Failed to dispatch email to ${to}:`, err);
    const errorMessage = err?.message || "Unknown SMTP transmission error";

    await db.emailOutbox.update({
      where: { id: outboxRecord.id },
      data: {
        status: "FAILED",
        errorMessage,
      },
    });

    return { id: outboxRecord.id, status: "FAILED", error: errorMessage };
  }
}

export async function processEmailOutbox(): Promise<{ processed: number; sent: number; failed: number }> {
  const pending = await db.emailOutbox.findMany({
    where: { status: "PENDING" },
    take: 50,
  });
  let sent = 0;
  let failed = 0;
  for (const item of pending) {
    const res = await queueAndSendEmail({
      to: item.to,
      subject: item.subject,
      html: (item.payload as any)?.html || item.subject,
      template: item.template || undefined,
      payload: item.payload,
      companyId: item.companyId || undefined,
      applicationId: item.applicationId || undefined,
    });
    if (res.status === "SENT") sent++;
    else failed++;
  }
  return { processed: pending.length, sent, failed };
}
