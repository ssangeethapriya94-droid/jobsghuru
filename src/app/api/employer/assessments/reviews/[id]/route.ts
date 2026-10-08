import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";
import { recordAuditLog } from "@/lib/admin/audit";
import { queueAndSendEmail } from "@/lib/email/outbox";

interface RouteParams {
  params: {
    id: string; // CandidateAssessment ID
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    const candidateAssessment = await db.candidateAssessment.findFirst({
      where: {
        id: params.id,
        assessment: { companyId: employer.companyId },
      },
      include: {
        assessment: {
          include: { questions: { orderBy: { orderIndex: "asc" } } },
        },
        application: {
          select: {
            id: true,
            candidateName: true,
            candidateEmail: true,
            job: { select: { id: true, title: true, companyId: true } },
          },
        },
      },
    });

    if (!candidateAssessment) {
      return NextResponse.json({ error: "Assessment submission not found" }, { status: 404 });
    }

    const questions: any[] =
      (candidateAssessment.questionsSnapshot as any[]) ||
      candidateAssessment.assessment.questions ||
      [];

    return NextResponse.json({
      success: true,
      submission: {
        id: candidateAssessment.id,
        status: candidateAssessment.status,
        score: candidateAssessment.score,
        totalPoints: candidateAssessment.totalPoints,
        passed: candidateAssessment.passed,
        startedAt: candidateAssessment.startedAt,
        submittedAt: candidateAssessment.submittedAt,
        reviewedAt: candidateAssessment.reviewedAt,
        reviewerId: candidateAssessment.reviewerId,
        recruiterNotes: candidateAssessment.recruiterNotes,
        candidateName: candidateAssessment.application.candidateName,
        candidateEmail: candidateAssessment.candidateEmail,
        jobTitle: candidateAssessment.application.job.title,
        assessmentTitle: candidateAssessment.assessment.title,
        passingScore: candidateAssessment.assessment.passingScore,
        questions,
        answers: candidateAssessment.answers,
      },
    });
  } catch (error: any) {
    console.error("Error fetching review detail:", error);
    return NextResponse.json({ error: "Failed to fetch review detail" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const candidateAssessment = await db.candidateAssessment.findFirst({
      where: {
        id: params.id,
        assessment: { companyId: employer.companyId },
      },
      include: {
        assessment: {
          include: { questions: true },
        },
        application: {
          include: { job: { include: { company: true } } },
        },
      },
    });

    if (!candidateAssessment) {
      return NextResponse.json({ error: "Assessment submission not found" }, { status: 404 });
    }

    const body = await req.json();
    const { grades, questionGrades, recruiterNotes } = body;

    let normalizedGrades: Record<string, { pointsAwarded: number; feedback?: string }> = {};
    if (Array.isArray(questionGrades)) {
      for (const item of questionGrades) {
        normalizedGrades[item.questionId] = {
          pointsAwarded: Number(item.marksAwarded ?? item.pointsAwarded ?? 0),
          feedback: item.feedback,
        };
      }
    } else if (grades && typeof grades === "object") {
      normalizedGrades = grades;
    }

    const questions: any[] =
      (candidateAssessment.questionsSnapshot as any[]) ||
      candidateAssessment.assessment.questions ||
      [];

    const currentAnswers: Record<string, any> = (candidateAssessment.answers as Record<string, any>) || {};
    let totalPoints = 0;
    let totalEarned = 0;

    for (const q of questions) {
      const qId = q.id;
      const maxPts = Number(q.points) > 0 ? Number(q.points) : 10;
      totalPoints += maxPts;

      if (normalizedGrades && normalizedGrades[qId] !== undefined) {
        const manualAwarded = Math.max(0, Math.min(maxPts, Number(normalizedGrades[qId].pointsAwarded) || 0));
        currentAnswers[qId] = {
          ...currentAnswers[qId],
          pointsAwarded: manualAwarded,
          reviewerFeedback: normalizedGrades[qId].feedback || null,
          isManuallyGraded: true,
        };
        totalEarned += manualAwarded;
      } else if (currentAnswers[qId]?.pointsAwarded !== null && currentAnswers[qId]?.pointsAwarded !== undefined) {
        totalEarned += Number(currentAnswers[qId].pointsAwarded) || 0;
      }
    }

    const scorePct = totalPoints > 0 ? Math.round((totalEarned / totalPoints) * 100) : 0;
    const passingThreshold = candidateAssessment.assessment.passingScore || 70;
    const passed = scorePct >= passingThreshold;

    const company = candidateAssessment.application.job.company;
    const companyId = employer.companyId;
    const applicationId = candidateAssessment.applicationId;

    const updated = await db.candidateAssessment.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        score: scorePct,
        totalPoints,
        passed,
        answers: currentAnswers,
        recruiterNotes: recruiterNotes || candidateAssessment.recruiterNotes,
        reviewerId: employer.id,
        reviewedAt: new Date(),
        resultHistory: {
          reviewedBy: employer.name,
          reviewerEmail: employer.email,
          scorePct,
          passed,
          gradedAt: new Date().toISOString(),
        },
      },
    });

    // Auto-reject check on review finalization
    if (passed === false && company.autoRejectOnFail === true) {
      await db.application.update({
        where: { id: applicationId },
        data: { status: "REJECTED" },
      });

      await db.applicationEvent.create({
        data: {
          applicationId,
          actorId: employer.id,
          actorName: employer.name,
          actorRole: employer.role,
          action: "APPLICATION_REJECTED",
          metadata: {
            reason: `Assessment failed review with score ${scorePct}% (Passing: ${passingThreshold}%) - autoRejectOnFail enabled`,
          },
        },
      });
    }

    // Timeline event for review completed
    await db.applicationEvent.create({
      data: {
        applicationId,
        actorId: employer.id,
        actorName: employer.name,
        actorRole: employer.role,
        action: "ASSESSMENT_REVIEWED",
        metadata: {
          assessmentTitle: candidateAssessment.assessment.title,
          finalScore: scorePct,
          passed,
          reviewerName: employer.name,
        },
      },
    });

    // Immutable audit log
    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role as any,
      action: "ASSESSMENT_REVIEWED",
      entityType: "ASSESSMENT",
      entityId: params.id,
      reason: `Graded assessment for candidate ${candidateAssessment.application.candidateName} (Final Score: ${scorePct}%)`,
    });

    // In-app notification for candidate
    await db.notification.create({
      data: {
        companyId,
        applicationId,
        recipientEmail: candidateAssessment.candidateEmail,
        title: "Assessment Review Completed",
        message: `Your technical assessment for ${candidateAssessment.application.job.title} has been reviewed.`,
        type: "APPLICATION_STATUS",
        link: `/candidate/applications/${applicationId}`,
      },
    });

    // Email Outbox for candidate
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #2563eb;">Assessment Review Complete</h2>
        <p style="color: #475569;">Hi ${candidateAssessment.application.candidateName},</p>
        <p style="color: #475569;">The hiring team at <strong>${company.name}</strong> has completed the review of your <strong>${candidateAssessment.assessment.title}</strong> assessment.</p>
        <p style="color: #64748b; font-size: 14px;">Log in to your candidate portal to see next steps.</p>
      </div>
    `;

    await queueAndSendEmail({
      to: candidateAssessment.candidateEmail,
      companyId,
      applicationId,
      subject: `Assessment Graded: ${candidateAssessment.assessment.title} - ${company.name}`,
      template: "ASSESSMENT_RESULT_READY",
      html,
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: updated.id,
        status: updated.status,
        score: updated.score,
        passed: updated.passed,
        reviewedAt: updated.reviewedAt,
      },
    });
  } catch (error: any) {
    console.error("Error grading review:", error);
    return NextResponse.json({ error: "Failed to submit assessment review" }, { status: 500 });
  }
}
