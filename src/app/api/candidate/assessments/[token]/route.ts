import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCandidate } from "@/lib/candidate/auth";
import crypto from "crypto";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rawToken = params.token;
    const tokenHash = hashToken(rawToken);

    // Look up by tokenHash OR fallback to raw token for transition compatibility
    const candidateAssessment = await db.candidateAssessment.findFirst({
      where: {
        OR: [
          { tokenHash },
          { token: rawToken },
        ],
      },
      include: {
        assessment: {
          include: {
            questions: { orderBy: { orderIndex: "asc" } },
            company: { select: { id: true, name: true, logo: true } },
          },
        },
        application: {
          select: {
            id: true,
            candidateId: true,
            candidateEmail: true,
            candidateName: true,
            job: { select: { title: true, department: true } },
          },
        },
      },
    });

    if (!candidateAssessment) {
      return NextResponse.json({ error: "Invalid or expired assessment link." }, { status: 404 });
    }

    if (new Date() > candidateAssessment.expiresAt) {
      return NextResponse.json({ error: "This assessment link has expired." }, { status: 410 });
    }

    // Candidate session binding validation: if a candidate is logged in, ensure they own this assessment
    const currentCandidate = await getCurrentCandidate();
    if (currentCandidate) {
      const isOwner =
        currentCandidate.email.toLowerCase() === candidateAssessment.candidateEmail.toLowerCase() ||
        (candidateAssessment.application?.candidateId && currentCandidate.id === candidateAssessment.application.candidateId);
      if (!isOwner) {
        return NextResponse.json(
          { error: "Forbidden: This assessment is assigned to a different candidate." },
          { status: 403 }
        );
      }
    }

    // Candidate view for completed or pending review: show only high-level status, NEVER answer keys or explanations
    if (["COMPLETED", "PENDING_REVIEW"].includes(candidateAssessment.status)) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        status: candidateAssessment.status,
        score: candidateAssessment.score,
        passed: candidateAssessment.passed,
        submittedAt: candidateAssessment.submittedAt,
        companyName: candidateAssessment.assessment.company.name,
      });
    }

    // Determine questions from snapshot or fallback to assessment questions
    const rawQuestions: any[] =
      (candidateAssessment.questionsSnapshot as any[]) ||
      candidateAssessment.assessment.questions ||
      [];

    // Strict Security Sanitization: strip correctAnswer and explanation before sending to candidate browser
    const sanitizedQuestions = rawQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      questionType: q.questionType,
      options: q.options || [],
      points: q.points,
      negativePoints: q.negativePoints || 0,
      orderIndex: q.orderIndex,
    }));

    const isStarted = candidateAssessment.status === "IN_PROGRESS";
    const statusFormatted = isStarted ? "IN_PROGRESS" : "NOT_STARTED";

    return NextResponse.json({
      success: true,
      status: statusFormatted,
      assessment: {
        id: candidateAssessment.assessmentId,
        title: candidateAssessment.assessment.title,
        description: candidateAssessment.assessment.description,
        durationMinutes: candidateAssessment.assessment.durationMinutes,
        passingScore: candidateAssessment.assessment.passingScore,
        companyName: candidateAssessment.assessment.company.name,
        companyLogo: candidateAssessment.assessment.company.logo,
        candidateName: candidateAssessment.application.candidateName,
        jobTitle: candidateAssessment.application.job.title,
        status: statusFormatted,
        startedAt: candidateAssessment.startedAt,
        deadlineAt: candidateAssessment.deadlineAt,
        questionsCount: sanitizedQuestions.length,
        questions: isStarted ? sanitizedQuestions : [],
        savedAnswers: isStarted ? candidateAssessment.answers : null,
      },
    });
  } catch (error: any) {
    console.error("Error fetching candidate assessment:", error);
    return NextResponse.json({ error: "Failed to load assessment" }, { status: 500 });
  }
}
