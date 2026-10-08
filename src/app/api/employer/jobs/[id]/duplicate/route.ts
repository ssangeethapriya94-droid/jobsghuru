import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer, requireEmployer } from "@/lib/employer/auth";
import { recordAuditLog } from "@/lib/admin/audit";
import { canPostJob } from "@/lib/employer/entitlements";
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

    const postQuota = await canPostJob(employer.companyId);
    if (!postQuota.allowed) {
      return NextResponse.json(
        { error: postQuota.reason || "Plan job posting limit reached. Please upgrade your plan." },
        { status: 403 }
      );
    }

    const sourceJob = await db.job.findFirst({
      where: {
        id: params.id,
        companyId: employer.companyId,
      },
    });

    if (!sourceJob) {
      return NextResponse.json({ error: "Source job not found" }, { status: 404 });
    }

    const clonedJob = await db.job.create({
      data: {
        title: `${sourceJob.title} (Copy)`,
        department: sourceJob.department,
        location: sourceJob.location,
        workMode: sourceJob.workMode,
        jobType: sourceJob.jobType,
        minExp: sourceJob.minExp,
        maxExp: sourceJob.maxExp,
        salaryMinLpa: sourceJob.salaryMinLpa,
        salaryMaxLpa: sourceJob.salaryMaxLpa,
        skills: sourceJob.skills,
        preferredSkills: sourceJob.preferredSkills,
        description: sourceJob.description,
        responsibilities: sourceJob.responsibilities,
        requirements: sourceJob.requirements,
        status: "DRAFT",
        companyId: employer.companyId,
        pipelineId: sourceJob.pipelineId,
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });

    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role as any,
      action: "EMPLOYER_JOB_DUPLICATED",
      entityType: "JOB",
      entityId: clonedJob.id,
      reason: `Cloned requisition from ${sourceJob.title}`,
    });

    return NextResponse.json({ success: true, job: clonedJob });
  } catch (error: any) {
    console.error("Error duplicating job:", error);
    return NextResponse.json({ error: "Failed to duplicate job" }, { status: 500 });
  }
}
