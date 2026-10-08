import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { confirmInterview, requestInterviewReschedule } from "@/lib/interview/service";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const interview = await db.interview.findUnique({
      where: { secureToken: token },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
          },
        },
        stage: {
          select: {
            id: true,
            name: true,
            stageType: true,
            interviewSubtype: true,
          },
        },
        interviewer: {
          select: {
            name: true,
            email: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            roleTitle: true,
          },
        },
        rescheduleRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            reason: true,
            preferredDate: true,
            preferredTime: true,
            createdAt: true,
          },
        },
      },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found or invitation has expired" },
        { status: 404 }
      );
    }

    // Candidate view: strictly protect internal notes, ratings, recommendations, and employer internal data
    const candidateView = {
      id: interview.id,
      title: interview.title,
      interviewType: interview.interviewType,
      subtype: interview.subtype,
      mode: interview.mode,
      status: interview.status,
      candidateAttendance: interview.candidateAttendance,
      candidateConfirmation: interview.candidateConfirmation,
      candidateRescheduling: interview.candidateRescheduling,
      candidateConfirmedAt: interview.candidateConfirmedAt,
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      meetingLink: interview.meetingLink,
      location: interview.location,
      phoneDetails: interview.phoneDetails,
      candidateName: interview.candidateName,
      candidateEmail: interview.candidateEmail,
      company: interview.company,
      job: interview.job,
      stage: interview.stage,
      interviewer: interview.interviewer,
      participants: interview.participants,
      latestRescheduleRequest: interview.rescheduleRequests[0] || null,
    };

    return NextResponse.json({ success: true, interview: candidateView });
  } catch (err: any) {
    console.error("Error fetching candidate interview:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await req.json();
    const { action, reason, preferredDate, preferredTime } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    if (action === "CONFIRM") {
      const result = await confirmInterview({ token });
      return NextResponse.json({
        success: true,
        message: "Interview confirmed successfully! A calendar invite has been acknowledged.",
        interview: {
          status: result.interview.status,
          candidateConfirmation: result.interview.candidateConfirmation,
          candidateConfirmedAt: result.interview.candidateConfirmedAt,
        },
      });
    }

    if (action === "RESCHEDULE") {
      if (!reason) {
        return NextResponse.json(
          { error: "Please provide a reason for requesting to reschedule" },
          { status: 400 }
        );
      }

      const result = await requestInterviewReschedule({
        token,
        reason,
        preferredDate,
        preferredTime,
      });

      return NextResponse.json({
        success: true,
        message: "Reschedule request submitted to the recruitment team.",
        request: result.rescheduleRequest,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: CONFIRM, RESCHEDULE" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Error processing candidate interview action:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
