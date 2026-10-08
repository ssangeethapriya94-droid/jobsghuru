import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    const job = await db.job.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        pipeline: { include: { versions: { include: { stages: { orderBy: { orderIndex: "asc" } } } } } },
        _count: { select: { applications: true } },
      },
    });

    if (!job || job.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Job requisition not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error("Error fetching job details:", error);
    return NextResponse.json({ error: "Failed to fetch job details" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const job = await db.job.findUnique({ where: { id: params.id } });
    if (!job || job.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Job requisition not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description,
      responsibilities,
      requirements,
      skills,
      location,
      workMode,
      jobType,
      minExp,
      maxExp,
      salaryMinLpa,
      salaryMaxLpa,
      department,
      status,
      pipelineId,
    } = body;

    // Plan check if publishing
    if (status === "PUBLISHED" && job.status !== "PUBLISHED") {
      const activeJobCount = await db.job.count({
        where: { companyId: employer.companyId, status: "PUBLISHED" },
      });
      // Basic plan check limit
      if (activeJobCount >= 10) {
        return NextResponse.json({ error: "Active job limit reached for your current plan." }, { status: 400 });
      }
    }

    const updated = await db.job.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(responsibilities && { responsibilities }),
        ...(requirements && { requirements }),
        ...(skills && { skills }),
        ...(location && { location }),
        ...(workMode && { workMode }),
        ...(jobType && { jobType }),
        ...(minExp !== undefined && { minExp: parseInt(minExp) }),
        ...(maxExp !== undefined && { maxExp: parseInt(maxExp) }),
        ...(salaryMinLpa !== undefined && { salaryMinLpa: parseInt(salaryMinLpa) }),
        ...(salaryMaxLpa !== undefined && { salaryMaxLpa: parseInt(salaryMaxLpa) }),
        ...(department && { department }),
        ...(status && { status }),
        ...(pipelineId !== undefined && { pipelineId }),
        lastActivityAt: new Date(),
      },
    });

    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role,
      action: "JOB_UPDATED",
      entityType: "JOB",
      entityId: job.id,
      reason: `Updated job requisition ${job.title} status to ${status || job.status}`,
    }).catch(() => {});

    return NextResponse.json({ success: true, job: updated, message: "Job updated successfully." });
  } catch (error: any) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: error.message || "Failed to update job" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // DUPLICATE JOB
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const job = await db.job.findUnique({ where: { id: params.id } });
    if (!job || job.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Job requisition not found" }, { status: 404 });
    }

    const duplicated = await db.job.create({
      data: {
        companyId: employer.companyId,
        title: `${job.title} (Copy)`,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        skills: job.skills,
        preferredSkills: job.preferredSkills,
        location: job.location,
        workMode: job.workMode,
        jobType: job.jobType,
        minExp: job.minExp,
        maxExp: job.maxExp,
        salaryMinLpa: job.salaryMinLpa,
        salaryMaxLpa: job.salaryMaxLpa,
        department: job.department,
        status: "DRAFT",
        pipelineId: job.pipelineId,
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });

    return NextResponse.json({ success: true, job: duplicated, message: "Job duplicated as DRAFT." });
  } catch (error: any) {
    console.error("Error duplicating job:", error);
    return NextResponse.json({ error: "Failed to duplicate job" }, { status: 500 });
  }
}
