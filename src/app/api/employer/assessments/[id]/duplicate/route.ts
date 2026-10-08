import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const source = await db.assessment.findFirst({
      where: { id: params.id, companyId: employer.companyId },
      include: { questions: { orderBy: { orderIndex: "asc" } } },
    });

    if (!source) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const duplicated = await db.assessment.create({
      data: {
        companyId: employer.companyId,
        title: `${source.title} (Copy)`,
        description: source.description,
        skills: source.skills,
        durationMinutes: source.durationMinutes,
        passingScore: source.passingScore,
        maxAttempts: source.maxAttempts,
        status: "DRAFT",
        isRandomized: source.isRandomized,
        questions: {
          create: source.questions.map((q) => ({
            question: q.question,
            questionType: q.questionType,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points,
            negativePoints: q.negativePoints,
            orderIndex: q.orderIndex,
            explanation: q.explanation,
          })),
        },
      },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
      },
    });

    return NextResponse.json({ success: true, assessment: duplicated }, { status: 201 });
  } catch (error: any) {
    console.error("Error duplicating assessment:", error);
    return NextResponse.json({ error: "Failed to duplicate assessment" }, { status: 500 });
  }
}
