import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer, requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interview = await db.interview.findFirst({
      where: {
        id: params.id,
        companyId: employer.companyId,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
            pipelineId: true,
          },
        },
        application: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
            currentStage: true,
            pipelineVersion: {
              include: {
                stages: {
                  orderBy: { orderIndex: "asc" },
                },
              },
            },
            events: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        stage: true,
        participants: {
          orderBy: { createdAt: "asc" },
        },
        feedbacks: {
          orderBy: { submittedAt: "desc" },
        },
        rescheduleRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Role check: Interviewer can only view interviews they are assigned to
    if (employer.role === "INTERVIEWER") {
      const isParticipant =
        interview.interviewerId === employer.id ||
        interview.participants.some(
          (p) => p.userId === employer.id || (p.email && p.email.toLowerCase() === employer.email.toLowerCase())
        );
      if (!isParticipant) {
        return NextResponse.json(
          { error: "Forbidden: You are only permitted to view interviews you are assigned to." },
          { status: 403 }
        );
      }

      // Interviewer can only see their own submitted feedback
      interview.feedbacks = interview.feedbacks.filter(
        (f) =>
          f.interviewerId === employer.id ||
          (f.interviewerEmail && f.interviewerEmail.toLowerCase() === employer.email.toLowerCase())
      );
    }

    // Fetch company team members
    const teamMembers = await db.user.findMany({
      where: {
        companyId: employer.companyId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Fetch pipeline stages for this application's pipeline version
    let pipelineStages: any[] = [];
    if (interview.applicationId) {
      const app = await db.application.findUnique({
        where: { id: interview.applicationId },
        select: { pipelineVersionId: true },
      });
      if (app?.pipelineVersionId) {
        pipelineStages = await db.pipelineStage.findMany({
          where: { versionId: app.pipelineVersionId },
          orderBy: { orderIndex: "asc" },
        });
      } else if (interview.jobId) {
        const activeVersion = await db.pipelineVersion.findFirst({
          where: { pipelineId: interview.jobId, isPublished: true },
          include: { stages: { orderBy: { orderIndex: "asc" } } },
        });
        if (activeVersion) {
          pipelineStages = activeVersion.stages;
        }
      }
    } else if (interview.jobId) {
      const job = await db.job.findUnique({
        where: { id: interview.jobId },
        select: { pipelineId: true },
      });
      if (job?.pipelineId) {
        const activeVersion = await db.pipelineVersion.findFirst({
          where: { pipelineId: job.pipelineId, isPublished: true },
          include: { stages: { orderBy: { orderIndex: "asc" } } },
        });
        if (activeVersion) {
          pipelineStages = activeVersion.stages;
        }
      }
    }

    return NextResponse.json({
      success: true,
      interview,
      teamMembers,
      pipelineStages,
    });
  } catch (err: any) {
    console.error("Error fetching interview detail:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const interview = await db.interview.findFirst({
      where: {
        id: params.id,
        companyId: employer.companyId,
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      scheduledAt,
      durationMinutes,
      meetingLink,
      location,
      phoneDetails,
      mode,
      notes,
      status,
    } = body;

    const updated = await db.interview.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(durationMinutes && { durationMinutes: parseInt(durationMinutes, 10) }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(location !== undefined && { location }),
        ...(phoneDetails !== undefined && { phoneDetails }),
        ...(mode && { mode }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, interview: updated });
  } catch (err: any) {
    console.error("Error updating interview:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
