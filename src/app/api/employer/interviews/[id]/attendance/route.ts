import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer } from "@/lib/employer/auth";
import { recordInterviewAttendance } from "@/lib/interview/service";

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
      const interview = await db.interview.findFirst({
        where: {
          id: params.id,
          companyId: employer.companyId,
          OR: [
            { interviewerId: employer.id },
            { participants: { some: { userId: employer.id } } },
            { participants: { some: { email: employer.email } } },
          ],
        },
      });
      if (!interview) {
        return NextResponse.json(
          { error: "Forbidden: You may only record attendance for interviews you participate in." },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const {
      candidateAttendance,
      actualStart,
      actualEnd,
      actualDuration,
      notes,
      interviewerAttendances,
    } = body;

    if (!candidateAttendance) {
      return NextResponse.json(
        { error: "Candidate attendance status is required" },
        { status: 400 }
      );
    }

    const result = await recordInterviewAttendance({
      interviewId: params.id,
      companyId: employer.companyId,
      actorId: employer.id,
      actorName: employer.name || "Recruiter",
      actorRole: employer.role || "EMPLOYER",
      recordedById: employer.id,
      candidateAttendance,
      actualStart,
      actualEnd,
      actualDuration: actualDuration ? parseInt(actualDuration, 10) : undefined,
      notes,
      attendanceNotes: notes,
      interviewerAttendances,
    });

    return NextResponse.json({
      success: true,
      message: "Attendance recorded successfully",
      interview: result.interview,
    });
  } catch (err: any) {
    console.error("Error recording attendance:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
