import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";
import { queueAndSendEmail } from "@/lib/email/outbox";
import { recordAuditLog } from "@/lib/admin/audit";

export async function POST(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const body = await req.json();
    const { candidateEmail, candidateName, jobId, customMessage } = body;

    if (!candidateEmail || !jobId) {
      return NextResponse.json({ error: "Candidate email and target jobId are required." }, { status: 400 });
    }

    // Rate Limit Check (e.g. max 20 invites per day per recruiter)
    const rateKey = `invite_limit_${employer.email}_${new Date().toISOString().slice(0, 10)}`;
    const bucket = await db.rateLimitBucket.findUnique({ where: { key: rateKey } });
    if (bucket && bucket.count >= 20) {
      return NextResponse.json({ error: "Daily candidate invite limit reached (20 invites/day)." }, { status: 429 });
    }

    // Verify candidate consent
    const profile = await db.candidateProfile.findFirst({
      where: {
        user: { email: { equals: candidateEmail, mode: "insensitive" } },
      },
    });

    if (profile && !profile.contactableByEmployers) {
      return NextResponse.json({ error: "This candidate has opted out of direct employer outreach." }, { status: 403 });
    }

    const job = await db.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job || job.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Job requisition not found" }, { status: 404 });
    }

    // Update Rate limit bucket
    await db.rateLimitBucket.upsert({
      where: { key: rateKey },
      update: { count: (bucket?.count || 0) + 1 },
      create: { key: rateKey, count: 1, resetAt: new Date(Date.now() + 86400000) },
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const jobLink = `${appUrl}/jobs/${job.id}`;

    const emailHtml = `
      <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; color: #1e293b;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h3 style="color: #2563eb; margin-top: 0;">You're Invited to Apply!</h3>
          <p>Dear <strong>${candidateName || "Candidate"}</strong>,</p>
          <p><strong>${employer.name}</strong> from <strong>${job.company.name}</strong> came across your profile and believes you would be a great fit for the <strong>${job.title}</strong> role in ${job.location}.</p>
          
          ${customMessage ? `<div style="background: #eff6ff; padding: 14px; border-left: 4px solid #2563eb; border-radius: 8px; font-style: italic; margin: 18px 0;">"${customMessage}"</div>` : ""}

          <p style="text-align: center; margin: 28px 0;">
            <a href="${jobLink}" style="background: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">View Position & Apply</a>
          </p>
        </div>
      </div>
    `;

    await queueAndSendEmail({
      to: candidateEmail,
      companyId: employer.companyId,
      subject: `Invitation to Apply: ${job.title} at ${job.company.name}`,
      html: emailHtml,
      template: "JOB_INVITATION",
      payload: { jobId: job.id, companyId: employer.companyId },
    });

    // Record Immutable Audit Log
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role,
      action: "CANDIDATE_INVITED",
      entityType: "JOB",
      entityId: job.id,
      reason: `Invited candidate ${candidateEmail} to apply for ${job.title}`,
      ipAddress: ip,
    }).catch(() => {});

    return NextResponse.json({ success: true, message: `Invitation dispatched to ${candidateEmail}.` });
  } catch (error: any) {
    console.error("Error sending candidate invite:", error);
    return NextResponse.json({ error: error.message || "Failed to send invitation" }, { status: 500 });
  }
}
