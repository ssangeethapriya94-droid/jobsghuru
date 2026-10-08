import { NextRequest, NextResponse } from "next/server";
import { getCurrentEmployer } from "@/lib/employer/auth";
import { rejectCandidate } from "@/lib/interview/service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (employer.role === "INTERVIEWER") {
      return NextResponse.json(
        { error: "Forbidden: Interviewers are not authorized to make rejection decisions." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { reason, internalNote, sendEmail, sendNotification } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    const result = await rejectCandidate({
      interviewId: params.id,
      companyId: employer.companyId,
      reason,
      internalNote,
      sendEmail: sendEmail !== false,
      sendNotification: sendNotification !== false,
      actorId: employer.id,
      actorName: employer.name || "Recruiter",
      actorRole: employer.role || "EMPLOYER",
    });

    return NextResponse.json({
      success: true,
      message: "Candidate rejected successfully",
      application: result.application,
    });
  } catch (err: any) {
    console.error("Error rejecting candidate:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
