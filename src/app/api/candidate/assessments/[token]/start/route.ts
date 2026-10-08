import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCandidate } from "@/lib/candidate/auth";
import crypto from "crypto";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rawToken = params.token;
    const tokenHash = hashToken(rawToken);

    const candidateAssessment = await db.candidateAssessment.findFirst({
      where: {
        OR: [{ tokenHash }, { token: rawToken }],
      },
      include: {
        assessment: {
          include: { questions: { orderBy: { orderIndex: "asc" } } },
        },
        application: true,
      },
    });

    if (!candidateAssessment) {
      return NextResponse.json({ error: "Invalid assessment token." }, { status: 404 });
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

    const durationMinutes = candidateAssessment.assessment.durationMinutes || 30;

    // 1. Resuming active in-progress attempt after refresh
    if (candidateAssessment.status === "IN_PROGRESS" && candidateAssessment.startedAt && candidateAssessment.deadlineAt) {
      const isExpired = new Date() > candidateAssessment.deadlineAt;
      if (isExpired) {
        return NextResponse.json({ error: "The assessment time limit has expired." }, { status: 403 });
      }

      const rawQuestions: any[] =
        (candidateAssessment.questionsSnapshot as any[]) ||
        candidateAssessment.assessment.questions ||
        [];

      const sanitizedQuestions = rawQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        questionType: q.questionType,
        options: q.options || [],
        points: q.points,
        negativePoints: q.negativePoints || 0,
        orderIndex: q.orderIndex,
      }));

      return NextResponse.json({
        success: true,
        resumed: true,
        startedAt: candidateAssessment.startedAt,
        deadlineAt: candidateAssessment.deadlineAt,
        durationMinutes,
        questions: sanitizedQuestions,
        savedAnswers: candidateAssessment.answers,
      });
    }

    // 2. Check if already completed or reached maxAttempts for starting a new attempt
    const maxAllowed = candidateAssessment.assessment.maxAttempts || 1;
    if (
      ["COMPLETED", "PENDING_REVIEW"].includes(candidateAssessment.status) ||
      (candidateAssessment.attemptCount && candidateAssessment.attemptCount >= maxAllowed)
    ) {
      return NextResponse.json(
        { error: `Maximum attempts (${maxAllowed}) reached for this assessment.` },
        { status: 400 }
      );
    }

    // Explicit Start
    const startedAt = new Date();
    // 30 seconds network latency grace period
    const deadlineAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000 + 30 * 1000);

    const updated = await db.candidateAssessment.update({
      where: { id: candidateAssessment.id },
      data: {
        status: "IN_PROGRESS",
        startedAt,
        deadlineAt,
        attemptCount: (candidateAssessment.attemptCount || 0) + 1,
      },
    });

    const rawQuestions: any[] =
      (candidateAssessment.questionsSnapshot as any[]) ||
      candidateAssessment.assessment.questions ||
      [];

    const sanitizedQuestions = rawQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      questionType: q.questionType,
      options: q.options || [],
      points: q.points,
      negativePoints: q.negativePoints || 0,
      orderIndex: q.orderIndex,
    }));

    return NextResponse.json({
      success: true,
      started: true,
      startedAt: updated.startedAt,
      deadlineAt: updated.deadlineAt,
      durationMinutes,
      questions: sanitizedQuestions,
    });
  } catch (error: any) {
    console.error("Error starting candidate assessment:", error);
    return NextResponse.json({ error: "Failed to start assessment" }, { status: 500 });
  }
}
