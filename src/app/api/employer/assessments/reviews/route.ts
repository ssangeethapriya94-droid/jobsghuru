import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING_REVIEW";

    const reviews = await db.candidateAssessment.findMany({
      where: {
        assessment: { companyId: employer.companyId },
        ...(status !== "ALL" && { status }),
      },
      include: {
        assessment: { select: { id: true, title: true, durationMinutes: true, passingScore: true } },
        application: {
          select: {
            id: true,
            candidateName: true,
            candidateEmail: true,
            job: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error("Error fetching assessment reviews:", error);
    return NextResponse.json({ error: "Failed to fetch assessment reviews" }, { status: 500 });
  }
}
