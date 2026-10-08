import { NextRequest, NextResponse } from "next/server";
import { getCurrentEmployer } from "@/lib/employer/auth";
import { shortlistCandidate } from "@/lib/interview/service";

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
        { error: "Forbidden: Interviewers are not authorized to make shortlist decisions." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { nextStageId, sendEmail, sendNotification, notes } = body;

    const result = await shortlistCandidate({
      interviewId: params.id,
      companyId: employer.companyId,
      nextStageId,
      sendEmail: sendEmail !== false,
      sendNotification: sendNotification !== false,
      notes,
      actorId: employer.id,
      actorName: employer.name || "Recruiter",
      actorEmail: employer.email || "recruiter@careerbridge.com",
      actorRole: employer.role || "EMPLOYER",
    });

    return NextResponse.json({
      success: true,
      message: "Candidate shortlisted successfully",
      application: result.application,
    });
  } catch (err: any) {
    console.error("Error shortlisting candidate:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
