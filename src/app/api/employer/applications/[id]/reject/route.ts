import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";
import { queueAndSendEmail } from "@/lib/email/outbox";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const application = await db.application.findFirst({
      where: {
        id: params.id,
        job: { companyId: employer.companyId },
      },
      include: {
        job: { include: { company: true } },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Invalid transition check: cannot reject a hired or soft-deleted candidate
    if (application.status === "HIRED" || application.deletedAt !== null) {
      return NextResponse.json(
        { error: `Cannot reject candidate from status ${application.status}.` },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { reason, internalNote, candidateMessage, sendEmail = true } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "Rejection reason is required." },
        { status: 400 }
      );
    }

    // Idempotency: if already rejected, return without duplicate events/emails
    if (application.status === "REJECTED") {
      return NextResponse.json({
        success: true,
        message: "Candidate has already been marked as rejected.",
        application,
      });
    }

    const updated = await db.application.update({
      where: { id: application.id },
      data: {
        status: "REJECTED",
        statusNotes: `Reason: ${reason.trim()}.${internalNote ? ` Note: ${internalNote.trim()}` : ""}`,
      },
    });

    await db.applicationEvent.create({
      data: {
        applicationId: application.id,
        actorId: employer.id,
        actorName: employer.name,
        actorRole: employer.role,
        action: "CANDIDATE_REJECTED",
        metadata: {
          reason: reason.trim(),
          internalNote: internalNote?.trim() || null,
        },
      },
    });

    // In-app notification
    await db.notification
      .create({
        data: {
          companyId: employer.companyId,
          recipientEmail: application.candidateEmail,
          title: `Update on your application for ${application.job.title}`,
          message: `Thank you for your interest in ${application.job.company.name}. The hiring team has updated your application status.`,
          type: "REJECTED",
          link: `/candidate/applications/${application.id}`,
        },
      })
      .catch(() => {});

    // Privacy-safe candidate email via Outbox
    if (sendEmail && application.candidateEmail.includes("@")) {
      const html = `
        <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; color: #1e293b;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; padding: 28px; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h3 style="color: #0f172a; margin-top: 0;">Application Status Update</h3>
            <p style="font-size: 15px; line-height: 1.6;">Hi ${application.candidateName},</p>
            <p style="font-size: 15px; line-height: 1.6;">Thank you for taking the time to apply and interview for the <strong>${application.job.title}</strong> position at <strong>${application.job.company.name}</strong>.</p>
            <p style="font-size: 15px; line-height: 1.6;">${candidateMessage ? candidateMessage.trim() : "After thorough consideration with our hiring committee, we have chosen to proceed with other applicants whose experience more closely matches our present technical requirements."}</p>
            <p style="font-size: 15px; line-height: 1.6;">We greatly appreciate the opportunity to learn about your background and wish you the best in your career pursuits.</p>
            <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Sincerely,<br/><strong>${application.job.company.name} Hiring Team</strong></p>
          </div>
        </div>
      `;

      await queueAndSendEmail({
        to: application.candidateEmail,
        companyId: employer.companyId,
        applicationId: application.id,
        subject: `Update on Your Application – ${application.job.title}`,
        html,
        template: "CANDIDATE_REJECTED",
        payload: { applicationId: application.id, jobId: application.jobId, companyId: employer.companyId },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Candidate application rejected.",
      application: updated,
    });
  } catch (err: any) {
    console.error("Error rejecting candidate:", err);
    return NextResponse.json(
      { error: err.message || "Failed to reject candidate." },
      { status: 500 }
    );
  }
}
