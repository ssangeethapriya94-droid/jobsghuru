import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer } from "@/lib/employer/auth";
import { getCurrentCandidate } from "@/lib/candidate/auth";
import { UserRole } from "@prisma/client";
import { queueAndSendEmail } from "@/lib/email/outbox";

// Simple HTML escaping helper
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const applicationId = params.id;
    const employer = await getCurrentEmployer();
    const candidate = await getCurrentCandidate();

    if (!employer && !candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { companyId: true, title: true } } },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Role Matrix & Isolation Check:
    if (employer) {
      if (application.job.companyId !== employer.companyId) {
        return NextResponse.json({ error: "Application does not belong to your company." }, { status: 404 });
      }
      if (employer.role === UserRole.INTERVIEWER) {
        return NextResponse.json({ error: "Interviewers do not have access to messages." }, { status: 403 });
      }
    } else if (candidate) {
      if (application.candidateEmail.toLowerCase() !== candidate.email.toLowerCase() && application.candidateId !== candidate.id) {
        return NextResponse.json({ error: "Forbidden: Candidates can only view their own message thread." }, { status: 403 });
      }
    }

    const messages = await db.applicationMessage.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
    });

    // Output Escaped Messages
    const safeMessages = messages.map((m) => ({
      id: m.id,
      senderName: escapeHtml(m.senderName),
      senderRole: m.senderRole,
      senderEmail: m.senderEmail,
      content: escapeHtml(m.content),
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ success: true, messages: safeMessages });
  } catch (error: any) {
    console.error("Error fetching application messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const applicationId = params.id;
    const employer = await getCurrentEmployer();
    const candidate = await getCurrentCandidate();

    if (!employer && !candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { companyId: true, title: true, company: { select: { name: true } } } } },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Role check & Send Permission:
    let senderId: string;
    let senderName: string;
    let senderEmail: string;
    let senderRole: string;

    if (employer) {
      if (application.job.companyId !== employer.companyId) {
        return NextResponse.json({ error: "Application does not belong to your company." }, { status: 404 });
      }
      if (employer.role === UserRole.HIRING_MANAGER) {
        return NextResponse.json({ error: "Hiring Managers have view-only access to messages." }, { status: 403 });
      }
      if (employer.role === UserRole.INTERVIEWER) {
        return NextResponse.json({ error: "Interviewers cannot send messages." }, { status: 403 });
      }
      senderId = employer.id;
      senderName = employer.name;
      senderEmail = employer.email;
      senderRole = employer.role;
    } else if (candidate) {
      if (application.candidateEmail.toLowerCase() !== candidate.email.toLowerCase() && application.candidateId !== candidate.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      senderId = candidate.id;
      senderName = candidate.name;
      senderEmail = candidate.email;
      senderRole = "CANDIDATE";
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty." }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: "Message content exceeds maximum limit of 5000 characters." }, { status: 400 });
    }

    // Persistent Rate Limit Bucket Check (max 15 messages per 60s per user)
    const rateLimitKey = `msg_limit_${senderEmail}`;
    const windowStart = new Date(Date.now() - 60000);

    const bucket = await db.rateLimitBucket.findUnique({ where: { key: rateLimitKey } });
    if (bucket && bucket.updatedAt > windowStart && bucket.count >= 15) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a minute before sending another message." }, { status: 429 });
    }

    if (!bucket || bucket.updatedAt <= windowStart) {
      await db.rateLimitBucket.upsert({
        where: { key: rateLimitKey },
        update: { count: 1, resetAt: new Date(Date.now() + 60000) },
        create: { key: rateLimitKey, count: 1, resetAt: new Date(Date.now() + 60000) },
      });
    } else {
      await db.rateLimitBucket.update({
        where: { key: rateLimitKey },
        data: { count: bucket.count + 1 },
      });
    }

    // Save message
    const message = await db.applicationMessage.create({
      data: {
        applicationId,
        companyId: application.job.companyId,
        senderId,
        senderName,
        senderEmail,
        senderRole,
        content: content.trim(),
      },
    });

    // Notify recipient via Notification and Outbox Email
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    if (senderRole === "CANDIDATE") {
      // Recipient is recruiter / company
      await db.notification.create({
        data: {
          companyId: application.job.companyId,
          applicationId,
          title: "New Message from Candidate",
          message: `${senderName} sent a message regarding position ${application.job.title}`,
          type: "NEW_MESSAGE",
          link: `/employer/applications/${applicationId}`,
        },
      });
    } else {
      // Recipient is candidate
      await db.notification.create({
        data: {
          userId: application.candidateId || undefined,
          recipientEmail: application.candidateEmail,
          applicationId,
          title: `New Message from ${application.job.company.name}`,
          message: `${senderName} sent you a message regarding your application for ${application.job.title}`,
          type: "NEW_MESSAGE",
          link: `/candidate/applications/${applicationId}`,
        },
      });

      // Outbox email dispatch
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; color: #1e293b;">
          <div style="max-width: 520px; margin: 0 auto; background: #ffffff; padding: 28px; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h3 style="color: #2563eb; margin-top: 0;">New Message Received</h3>
            <p>Hi <strong>${application.candidateName}</strong>,</p>
            <p><strong>${senderName}</strong> from <strong>${application.job.company.name}</strong> sent a message regarding your application for <strong>${application.job.title}</strong>:</p>
            <div style="background: #f1f5f9; padding: 14px; border-radius: 8px; font-style: italic; margin: 16px 0; border-left: 3px solid #3b82f6;">
              "${escapeHtml(content.trim())}"
            </div>
            <p><a href="${appUrl}/candidate/applications/${applicationId}" style="background: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reply to Message</a></p>
          </div>
        </div>
      `;

      await queueAndSendEmail({
        to: application.candidateEmail,
        companyId: application.job.companyId,
        applicationId,
        subject: `New Message from ${application.job.company.name}: ${application.job.title}`,
        html: emailHtml,
        template: "APPLICATION_MESSAGE",
        payload: { applicationId, messageId: message.id },
      }).catch((err) => console.error("Outbox email dispatch error:", err));
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        senderName: escapeHtml(message.senderName),
        senderRole: message.senderRole,
        senderEmail: message.senderEmail,
        content: escapeHtml(message.content),
        createdAt: message.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error sending application message:", error);
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
