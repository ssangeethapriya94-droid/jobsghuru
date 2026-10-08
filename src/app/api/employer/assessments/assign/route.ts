import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";
import { recordAuditLog } from "@/lib/admin/audit";
import { queueAndSendEmail } from "@/lib/email/outbox";
import crypto from "crypto";

function hashAssessmentToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const body = await req.json();
    const { assessmentId, applicationId, candidateEmail, daysValid } = body;

    if (!assessmentId || !applicationId) {
      return NextResponse.json(
        { error: "assessmentId and applicationId are required." },
        { status: 400 }
      );
    }

    // 1. Verify assessment belongs to this company
    const assessment = await db.assessment.findFirst({
      where: { id: assessmentId, companyId: employer.companyId },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
      },
    });
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found or does not belong to your company." }, { status: 404 });
    }

    // 2. Verify application belongs to this company
    const application = await db.application.findFirst({
      where: { id: applicationId, job: { companyId: employer.companyId } },
      include: { job: { include: { company: true } }, candidate: true },
    });
    if (!application) {
      return NextResponse.json({ error: "Application not found or does not belong to your company." }, { status: 404 });
    }

    // 3. Enforce maxAttempts server-side
    const pastAttemptsCount = await db.candidateAssessment.count({
      where: {
        assessmentId,
        applicationId,
        status: "COMPLETED",
      },
    });

    if (pastAttemptsCount >= assessment.maxAttempts) {
      return NextResponse.json(
        { error: `Candidate has already reached the maximum allowed attempts (${assessment.maxAttempts}) for this assessment.` },
        { status: 400 }
      );
    }

    // Check for active pending/in-progress assignment
    const activeExisting = await db.candidateAssessment.findFirst({
      where: {
        assessmentId,
        applicationId,
        status: { in: ["PENDING", "IN_PROGRESS"] },
        expiresAt: { gt: new Date() },
      },
    });

    if (activeExisting) {
      return NextResponse.json(
        { error: "This assessment is already actively assigned and pending completion for this candidate." },
        { status: 400 }
      );
    }

    // 4. Generate high-entropy raw token & SHA-256 hash
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashAssessmentToken(rawToken);

    const validityDays = parseInt(daysValid, 10) || 7;
    const expiresAt = new Date(Date.now() + validityDays * 86400000);

    // 5. Build immutable question snapshot
    const questionsSnapshot = assessment.questions.map((q) => ({
      id: q.id,
      question: q.question,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: q.points,
      negativePoints: q.negativePoints,
      orderIndex: q.orderIndex,
      explanation: q.explanation,
    }));

    const assignment = await db.candidateAssessment.create({
      data: {
        assessmentId,
        applicationId,
        candidateEmail: candidateEmail || application.candidateEmail,
        token: rawToken, // Kept for transition compatibility
        tokenHash, // SHA-256 hashed storage
        status: "PENDING",
        attemptCount: 0,
        questionsSnapshot,
        expiresAt,
      },
      include: {
        assessment: { select: { title: true, durationMinutes: true, passingScore: true } },
      },
    });

    // 6. Record Application Timeline Event
    await db.applicationEvent.create({
      data: {
        applicationId,
        actorId: employer.id,
        actorName: employer.name,
        actorRole: employer.role,
        action: "ASSESSMENT_ASSIGNED",
        metadata: {
          assessmentTitle: assessment.title,
          tokenHash,
          expiresAt: expiresAt.toISOString(),
          durationMinutes: assessment.durationMinutes,
        },
      },
    });

    // 7. Record Immutable AuditLog
    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role as any,
      action: "ASSESSMENT_ASSIGNED",
      entityType: "ASSESSMENT",
      entityId: assessment.id,
      reason: `Assigned ${assessment.title} to candidate ${application.candidateName}`,
    });

    const appBaseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const secureUrl = `${appBaseUrl}/assessments/${rawToken}`;

    // 8. Dispatch assessment invite email through Outbox with companyId and applicationId
    const toCandidateEmail = candidateEmail || application.candidateEmail;
    if (toCandidateEmail && toCandidateEmail.includes("@")) {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #2563eb; margin-bottom: 12px;">Technical Assessment: ${assessment.title}</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hi ${application.candidateName},</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">You have been invited to complete a technical assessment for the <strong>${application.job.title}</strong> role at <strong>${application.job.company.name}</strong>.</p>
          <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0; color: #1e293b;"><strong>Assessment:</strong> ${assessment.title}</p>
            <p style="margin: 4px 0; color: #1e293b;"><strong>Duration:</strong> ${assessment.durationMinutes} minutes</p>
            <p style="margin: 4px 0; color: #1e293b;"><strong>Passing Score:</strong> ${assessment.passingScore}%</p>
            <p style="margin: 4px 0; color: #1e293b;"><strong>Expires On:</strong> ${expiresAt.toLocaleDateString()}</p>
          </div>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${secureUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Start Assessment</a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Please start only when you are ready. The timer will begin only when you click "Start Assessment".</p>
        </div>
      `;

      await queueAndSendEmail({
        to: toCandidateEmail,
        companyId: employer.companyId,
        applicationId: application.id,
        subject: `Technical Assessment Assigned – ${assessment.title}`,
        html,
        template: "CANDIDATE_ASSESSMENT_ASSIGNED",
        payload: { assessmentId: assessment.id, applicationId: application.id, companyId: employer.companyId },
      });

      // 9. Dispatch Candidate In-App Notification with companyId and applicationId
      if (application.candidateId) {
        await db.notification.create({
          data: {
            userId: application.candidateId,
            companyId: employer.companyId,
            applicationId: application.id,
            recipientEmail: toCandidateEmail,
            title: `Assessment Assigned: ${assessment.title}`,
            message: `You have been assigned a technical assessment for ${application.job.title}.`,
            type: "ASSESSMENT_ASSIGNED",
            link: `/assessments/${rawToken}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment.id,
        assessmentId: assignment.assessmentId,
        applicationId: assignment.applicationId,
        status: assignment.status,
        expiresAt: assignment.expiresAt,
        tokenHash: assignment.tokenHash,
      },
      rawToken, // Sent to caller for link generation/testing
      secureUrl,
    });
  } catch (error: any) {
    console.error("Error assigning assessment:", error);
    return NextResponse.json({ error: "Failed to assign assessment" }, { status: 500 });
  }
}
