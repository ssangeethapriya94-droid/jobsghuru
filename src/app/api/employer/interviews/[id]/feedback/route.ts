import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer } from "@/lib/employer/auth";
import { submitInterviewFeedback } from "@/lib/interview/service";

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
          { error: "Forbidden: You may only submit feedback for interviews you participate in." },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const {
      technicalRating,
      problemSolvingRating,
      communicationRating,
      roleKnowledgeRating,
      overallRating,
      recommendation,
      strengths,
      concerns,
      comments,
    } = body;

    if (!overallRating || !recommendation) {
      return NextResponse.json(
        { error: "Overall rating and recommendation are required" },
        { status: 400 }
      );
    }

    const result = await submitInterviewFeedback({
      interviewId: params.id,
      companyId: employer.companyId,
      interviewerId: employer.id,
      interviewerName: employer.name || "Interviewer",
      interviewerEmail: employer.email || "interviewer@careerbridge.com",
      technicalScore: technicalRating ? Number(technicalRating) : undefined,
      problemSolvingScore: problemSolvingRating ? Number(problemSolvingRating) : undefined,
      communicationScore: communicationRating ? Number(communicationRating) : undefined,
      roleKnowledgeScore: roleKnowledgeRating ? Number(roleKnowledgeRating) : undefined,
      overallRating: Number(overallRating),
      recommendation,
      strengths,
      concerns,
      comments,
    });

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: result.feedback,
    });
  } catch (err: any) {
    console.error("Error submitting interview feedback:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
