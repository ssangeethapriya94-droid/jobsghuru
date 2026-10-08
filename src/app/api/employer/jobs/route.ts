import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer } from "@/lib/employer/auth";
import { canPostJob, getCompanyPlanInfo } from "@/lib/employer/entitlements";
import { recordAuditLog } from "@/lib/admin/audit";
import { JobStatus, JobType, WorkMode } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = { companyId: employer.companyId };
    if (status && status !== "ALL") {
      where.status = status as JobStatus;
    }

    const [jobs, planInfo, quota] = await Promise.all([
      db.job.findMany({
        where,
        include: {
          _count: {
            select: { applications: true, interviews: true, offers: true },
          },
        },
        orderBy: { postedAt: "desc" },
      }),
      getCompanyPlanInfo(employer.companyId),
      canPostJob(employer.companyId),
    ]);

    return NextResponse.json({
      success: true,
      quota,
      plan: planInfo,
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        department: j.department,
        location: j.location,
        workMode: j.workMode,
        jobType: j.jobType,
        minExp: j.minExp,
        maxExp: j.maxExp,
        salaryMinLpa: j.salaryMinLpa,
        salaryMaxLpa: j.salaryMaxLpa,
        status: j.status,
        postedAt: j.postedAt,
        expiresAt: j.expiresAt,
        skills: j.skills,
        preferredSkills: j.preferredSkills,
        responseRatePct: j.responseRatePct,
        applicationsCount: j._count.applications,
        interviewsCount: j._count.interviews,
        offersCount: j._count.offers,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching employer jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (employer.role === "INTERVIEWER") {
      return NextResponse.json(
        { error: "Forbidden: Interviewers are not authorized to post or manage jobs." },
        { status: 403 }
      );
    }

    // Check plan limits
    const entitlement = await canPostJob(employer.companyId);
    if (!entitlement.allowed) {
      return NextResponse.json({ error: entitlement.reason }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      department,
      location,
      workMode,
      jobType,
      minExp,
      maxExp,
      salaryMinLpa,
      salaryMaxLpa,
      skills,
      preferredSkills,
      description,
      responsibilities,
      requirements,
      status,
    } = body;

    if (!title || !department || !location || !description) {
      return NextResponse.json(
        { error: "Title, department, location, and description are required." },
        { status: 400 }
      );
    }

    const newJob = await db.job.create({
      data: {
        title,
        department,
        location,
        workMode: (workMode as WorkMode) || "HYBRID",
        jobType: (jobType as JobType) || "FULL_TIME",
        minExp: parseInt(minExp, 10) || 0,
        maxExp: parseInt(maxExp, 10) || 0,
        salaryMinLpa: salaryMinLpa ? parseInt(salaryMinLpa, 10) : null,
        salaryMaxLpa: salaryMaxLpa ? parseInt(salaryMaxLpa, 10) : null,
        skills: Array.isArray(skills) ? skills : (skills || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        description,
        responsibilities: Array.isArray(responsibilities) ? responsibilities : ["Deliver high-quality features", "Collaborate with cross-functional leads"],
        requirements: Array.isArray(requirements) ? requirements : [`${minExp || 2}+ years relevant experience`],
        // All employer-submitted jobs require Admin Moderation approval before publication
        status: status === "DRAFT" ? JobStatus.DRAFT : JobStatus.PENDING_REVIEW,
        companyId: employer.companyId,
        expiresAt: new Date(Date.now() + 30 * 86400000), // 30-day listing
        responseRatePct: 85,
      },
    });

    // Record Immutable Audit Log
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role,
      action: "JOB_CREATED",
      entityType: "JOB",
      entityId: newJob.id,
      reason: `Employer created job requisition "${title}"`,
      afterJson: JSON.stringify({ jobId: newJob.id, title, status: newJob.status }),
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || undefined,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      job: newJob,
      message: newJob.status === "PENDING_REVIEW" 
        ? "Job created and submitted to JobsGuru Admin for review and approval."
        : "Job draft saved successfully.",
    });
  } catch (error: any) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: error.message || "Failed to create job" }, { status: 500 });
  }
}
