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

    const application = await db.application.findFirst({
      where: {
        id: params.id,
        job: { companyId: employer.companyId },
        deletedAt: null,
      },
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
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
            pipelineId: true,
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
        interviews: {
          include: {
            participants: true,
            feedbacks: true,
            rescheduleRequests: { orderBy: { createdAt: "desc" } },
          },
          orderBy: { scheduledAt: "desc" },
        },
        candidateAssessments: {
          include: { assessment: true },
          orderBy: { createdAt: "desc" },
        },
        events: {
          orderBy: { createdAt: "desc" },
        },
        notes: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Role-based restrictions & projections
    if (employer.role === "INTERVIEWER") {
      const hasInterview = await db.interview.findFirst({
        where: {
          applicationId: params.id,
          companyId: employer.companyId,
          OR: [
            { interviewerId: employer.id },
            { participants: { some: { userId: employer.id } } },
            { participants: { some: { email: employer.email } } },
          ],
        },
      });
      if (!hasInterview) {
        return NextResponse.json(
          { error: "Forbidden: You are only permitted to view candidates you are scheduled to interview." },
          { status: 403 }
        );
      }

      // Redact salary/compensation & confidential recruiter notes for interviewers
      application.currentCtc = null;
      application.expectedCtc = null;
      application.notes = [];
      
      // Only show interviews where interviewer is a participant
      application.interviews = application.interviews.filter((inv) =>
        inv.interviewerId === employer.id ||
        inv.participants.some((p) => p.userId === employer.id || p.email === employer.email)
      );

      // Only show interviewer's own feedbacks
      application.interviews.forEach((inv) => {
        inv.feedbacks = inv.feedbacks.filter(
          (f) => f.interviewerEmail === employer.email
        );
      });
    }

    return NextResponse.json({
      success: true,
      application,
      userRole: employer.role,
      userPermissions: {
        canShortlist: employer.role === "COMPANY_ADMIN" || employer.role === "RECRUITER",
        canReject: employer.role === "COMPANY_ADMIN" || employer.role === "RECRUITER",
        canMoveStage: employer.role === "COMPANY_ADMIN" || employer.role === "RECRUITER",
        canScheduleInterview: employer.role === "COMPANY_ADMIN" || employer.role === "RECRUITER",
        canAssignAssessment: employer.role === "COMPANY_ADMIN" || employer.role === "RECRUITER",
        canAddNote: employer.role !== "INTERVIEWER",
        canDeleteNote: employer.role === "COMPANY_ADMIN" || employer.role === "RECRUITER" || employer.role === "HIRING_MANAGER",
        canViewSalary: employer.role !== "INTERVIEWER",
      },
    });
  } catch (err: any) {
    console.error("Error fetching application detail:", err);
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

    const application = await db.application.findFirst({
      where: {
        id: params.id,
        job: { companyId: employer.companyId },
        deletedAt: null,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status, currentStageId } = body;

    const updated = await db.application.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(currentStageId && { currentStageId }),
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (err: any) {
    console.error("Error updating application:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
    ]);
    if (!authorized) return response!;

    const application = await db.application.findFirst({
      where: {
        id: params.id,
        job: { companyId: employer.companyId },
        deletedAt: null,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Soft delete application
    await db.application.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        statusNotes: "Deleted/Archived by Company Admin",
      },
    });

    await db.applicationEvent.create({
      data: {
        applicationId: application.id,
        actorId: employer.id,
        actorName: employer.name,
        actorRole: employer.role,
        action: "APPLICATION_ARCHIVED",
        metadata: { reason: "Soft-deleted by Company Admin" },
      },
    });

    return NextResponse.json({ success: true, message: "Application archived successfully." });
  } catch (err: any) {
    console.error("Error archiving application:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
