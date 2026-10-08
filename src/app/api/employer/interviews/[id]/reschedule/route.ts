import { NextRequest, NextResponse } from "next/server";
import { requireEmployer } from "@/lib/employer/auth";
import { approveInterviewReschedule } from "@/lib/interview/service";
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
    const {
      requestId,
      action,
      newDate,
      newTime,
      newDuration,
      meetingLink,
      rejectionReason,
    } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action (APPROVE/REJECT) is required" },
        { status: 400 }
      );
    }

    const result = await approveInterviewReschedule({
      interviewId: params.id,
      requestId,
      companyId: employer.companyId,
      action,
      newDate,
      newTime,
      durationMinutes: newDuration ? parseInt(newDuration, 10) : undefined,
      meetingLink,
      rejectionReason,
      actorId: employer.id,
      actorName: employer.name || "Recruiter",
      actorEmail: employer.email || "recruiter@careerbridge.com",
      actorRole: employer.role || "EMPLOYER",
    });

    return NextResponse.json({
      success: true,
      message:
        action === "APPROVE"
          ? "Reschedule approved and candidate notified"
          : "Reschedule request rejected",
      interview: result.interview,
    });
  } catch (err: any) {
    console.error("Error managing interview reschedule:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
