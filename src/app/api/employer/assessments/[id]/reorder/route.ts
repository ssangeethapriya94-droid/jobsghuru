import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

interface RouteParams {
  params: {
    id: string;
  };
}

async function handleReorder(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const assessment = await db.assessment.findFirst({
      where: { id: params.id, companyId: employer.companyId },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const body = await req.json();
    const order = body.order || body.questionOrders; // Support either format

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: "Invalid order format. Expected array." }, { status: 400 });
    }

    await db.$transaction(
      order.map((item: { id: string; orderIndex: number }) =>
        db.assessmentQuestion.updateMany({
          where: { id: item.id, assessmentId: params.id },
          data: { orderIndex: Number(item.orderIndex) },
        })
      )
    );

    const questions = await db.assessmentQuestion.findMany({
      where: { assessmentId: params.id },
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error("Error reordering questions:", error);
    return NextResponse.json({ error: "Failed to reorder questions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: RouteParams) {
  return handleReorder(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: RouteParams) {
  return handleReorder(req, ctx);
}
