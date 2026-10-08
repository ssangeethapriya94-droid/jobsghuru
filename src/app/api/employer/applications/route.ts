import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer, requireEmployer } from "@/lib/employer/auth";
import { ApplicationStatus, UserRole } from "@prisma/client";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");

    const where: any = {
      job: { companyId: employer.companyId },
      deletedAt: null,
    };

    if (employer.role === "INTERVIEWER") {
      where.interviews = {
        some: {
          OR: [
            { interviewerId: employer.id },
            { participants: { some: { userId: employer.id } } },
            { participants: { some: { email: employer.email } } },
          ],
        },
      };
    }

    if (jobId) where.jobId = jobId;
    if (status && status !== "ALL") {
      where.status = status as ApplicationStatus;
    }

    const applications = await db.application.findMany({
      where,
      include: {
        job: {
          select: { id: true, title: true, department: true, skills: true },
        },
        interviews: {
          orderBy: { scheduledAt: "desc" },
          take: 1,
        },
        offers: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        notes: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      applications: applications.map((a) => ({
        id: a.id,
        candidateName: a.candidateName,
        candidateEmail: a.candidateEmail,
        candidatePhone: a.candidatePhone,
        currentCompany: a.currentCompany,
        currentRole: a.currentRole,
        experienceYears: a.experienceYears,
        expectedCtc: a.expectedCtc,
        noticePeriod: a.noticePeriod,
        resumeUrl: a.resumeUrl,
        resumeFileName: a.resumeFileName,
        coverNote: a.coverNote,
        matchScore: a.matchScore,
        status: a.status,
        statusNotes: a.statusNotes,
        appliedAt: a.appliedAt,
        job: a.job,
        interviews: a.interviews,
        offers: a.offers,
        notes: a.notes,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching employer applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const body = await req.json();
    const { applicationId, status, notes } = body;

    if (!applicationId || !status) {
      return NextResponse.json({ error: "applicationId and status are required." }, { status: 400 });
    }

    // Verify application belongs to this company
    const app = await db.application.findFirst({
      where: {
        id: applicationId,
        job: { companyId: employer.companyId },
      },
    });

    if (!app) {
      return NextResponse.json({ error: "Application not found or unauthorized" }, { status: 404 });
    }

    const updated = await db.application.update({
      where: { id: applicationId },
      data: {
        status: status as ApplicationStatus,
        statusNotes: notes || undefined,
      },
    });

    // Add recruiter note if notes provided
    if (notes) {
      await db.recruiterNote.create({
        data: {
          applicationId,
          companyId: employer.companyId,
          authorId: employer.id,
          authorName: employer.name,
          authorRole: employer.role,
          content: `Moved status to ${status}: ${notes}`,
        },
      });
    }

    // Record Immutable Audit Log
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role,
      action: "APPLICATION_STAGE_CHANGED",
      entityType: "APPLICATION",
      entityId: applicationId,
      reason: `Moved stage to ${status}`,
      afterJson: JSON.stringify({ applicationId, oldStatus: app.status, newStatus: status }),
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || undefined,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      application: updated,
      message: "Application stage updated successfully.",
    });
  } catch (error: any) {
    console.error("Error updating application:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
