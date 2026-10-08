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
        currentStage: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Invalid transition check
    if (application.status === "HIRED" || application.deletedAt !== null) {
      return NextResponse.json(
        { error: `Cannot shortlist candidate from status ${application.status}.` },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { nextStageId, notes, sendEmail = true } = body;

    // Idempotency: if already shortlisted, return without duplicate events or emails
    if (application.status === "SHORTLISTED") {
      return NextResponse.json({
        success: true,
        message: "Candidate is already shortlisted.",
        application,
      });
    }

    let nextStage = null;
    if (nextStageId) {
      nextStage = await db.pipelineStage.findUnique({
        where: { id: nextStageId },
      });
    }

    const updated = await db.application.update({
      where: { id: application.id },
      data: {
        status: "SHORTLISTED",
        ...(nextStageId && { currentStageId: nextStageId }),
        statusNotes: notes || "Candidate shortlisted by hiring team.",
      },
    });

    await db.applicationEvent.create({
      data: {
        applicationId: application.id,
        actorId: employer.id,
        actorName: employer.name,
        actorRole: employer.role,
        action: "CANDIDATE_SHORTLISTED",
        metadata: {
          previousStage: application.currentStage?.name || "Initial Review",
          newStage: nextStage?.name || "Shortlisted",
          notes: notes || null,
        },
      },
    });

    // In-app notification
    await db.notification
      .create({
        data: {
          companyId: employer.companyId,
          recipientEmail: application.candidateEmail,
          title: `Congratulations! You're Shortlisted for ${application.job.title}`,
          message: `You have advanced to ${nextStage?.name || "the next round"} at ${application.job.company.name}.`,
          type: "SHORTLISTED",
          link: `/candidate/applications/${application.id}`,
        },
      })
      .catch(() => {});

    // Privacy-safe candidate email via Outbox
    if (sendEmail && application.candidateEmail.includes("@")) {
      const html = `
        <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; color: #1e293b;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; padding: 28px; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h2 style="color: #059669; margin-top: 0;">Congratulations ${application.candidateName}!</h2>
            <p style="font-size: 15px; line-height: 1.6;">We are pleased to inform you that you have been <strong>shortlisted</strong> for the <strong>${application.job.title}</strong> role at <strong>${application.job.company.name}</strong>.</p>
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 18px 0;">
              <strong>Next Stage:</strong> ${nextStage?.name || "Next Recruitment Stage"}<br/>
              Our hiring team will be in touch shortly regarding the upcoming schedule.
            </div>
            <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Warm regards,<br/><strong>${application.job.company.name} Talent Acquisition</strong></p>
          </div>
        </div>
      `;

      await queueAndSendEmail({
        to: application.candidateEmail,
        companyId: employer.companyId,
        applicationId: application.id,
        subject: `🎉 You're Shortlisted – ${application.job.title} at ${application.job.company.name}`,
        html,
        template: "CANDIDATE_SHORTLISTED",
        payload: { applicationId: application.id, jobId: application.jobId, companyId: employer.companyId },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Candidate shortlisted successfully.",
      application: updated,
    });
  } catch (err: any) {
    console.error("Error shortlisting candidate:", err);
    return NextResponse.json(
      { error: err.message || "Failed to shortlist candidate." },
      { status: 500 }
    );
  }
}
