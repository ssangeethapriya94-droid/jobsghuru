import { NextRequest, NextResponse } from "next/server";
import { requireEmployer } from "@/lib/employer/auth";
import { cancelInterview } from "@/lib/interview/service";
import { UserRole } from "@prisma/client";

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

    const body = await req.json();
    const { reason, notifyCandidate } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Cancellation reason is required" },
        { status: 400 }
      );
    }

    const result = await cancelInterview({
      interviewId: params.id,
      companyId: employer.companyId,
      cancelledById: employer.id,
      reason,
      notifyCandidate: notifyCandidate !== false,
      actorId: employer.id,
      actorName: employer.name || "Recruiter",
      actorRole: employer.role || "EMPLOYER",
    });

    return NextResponse.json({
      success: true,
      message: "Interview cancelled successfully",
      interview: result.interview,
    });
  } catch (err: any) {
    console.error("Error cancelling interview:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
