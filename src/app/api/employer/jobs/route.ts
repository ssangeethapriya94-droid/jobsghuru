import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { getCompanyPlanInfo } from "@/lib/employer/entitlements";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);

    if (!authorized) return response!;

    const companyId = employer.companyId;

    // Fetch company jobs
    const jobs = await db.job.findMany({
      where: { companyId },
      include: {
        company: {
          select: { id: true, name: true, verified: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { postedAt: "desc" },
    });

    // Fetch company plan limit & usage
    const plan = await getCompanyPlanInfo(companyId);
    const activeJobsCount = jobs.filter(
      (j) => j.status === "PUBLISHED" && j.expiresAt > new Date()
    ).length;

    const quota = {
      allowed: activeJobsCount < plan.jobLimit,
      current: activeJobsCount,
      limit: plan.jobLimit,
      planName: plan.planName,
    };

    const serialized = jobs.map((j) => ({
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
      skills: j.skills,
      description: j.description,
      postedAt: j.postedAt.toISOString(),
      expiresAt: j.expiresAt.toISOString(),
      company: j.company,
      applicationsCount: j._count.applications,
    }));

    return NextResponse.json({
      success: true,
      jobs: serialized,
      quota,
      plan,
    });
  } catch (error: any) {
    console.error("Error fetching employer jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch company job postings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);

    if (!authorized) return response!;

    const companyId = employer.companyId;
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
      description,
      responsibilities,
      requirements,
      status: requestedStatus,
    } = body;

    if (!title || !department || !location) {
      return NextResponse.json(
        { error: "Job title, department, and location are required." },
        { status: 400 }
      );
    }

    // Check plan limits
    const plan = await getCompanyPlanInfo(companyId);
    const activeJobsCount = await db.job.count({
      where: {
        companyId,
        status: "PUBLISHED",
        expiresAt: { gt: new Date() },
      },
    });

    if (activeJobsCount >= plan.jobLimit) {
      return NextResponse.json(
        {
          error: `Job post limit reached (${activeJobsCount}/${plan.jobLimit} active jobs used under your ${plan.planName}). Upgrade your plan to post additional jobs.`,
          limitReached: true,
        },
        { status: 403 }
      );
    }

    // Company verification status check for auto-publish
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { verified: true },
    });

    // If company is verified, job goes to PUBLISHED (or requested status). If unverified, PENDING_REVIEW.
    const initialStatus = requestedStatus || (company?.verified ? "PUBLISHED" : "PENDING_REVIEW");

    const parsedSkills = typeof skills === "string"
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : Array.isArray(skills)
      ? skills
      : [];

    const expiresAt = new Date(Date.now() + 60 * 24 * 3600 * 1000); // 60 days duration

    const newJob = await db.job.create({
      data: {
        companyId,
        title,
        department: department || "Engineering",
        location: location || "Remote",
        workMode: workMode || "HYBRID",
        jobType: jobType || "FULL_TIME",
        minExp: Number(minExp) || 0,
        maxExp: Number(maxExp) || 10,
        salaryMinLpa: salaryMinLpa ? Number(salaryMinLpa) : null,
        salaryMaxLpa: salaryMaxLpa ? Number(salaryMaxLpa) : null,
        status: initialStatus as any,
        skills: parsedSkills,
        description: description || "",
        responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
        requirements: Array.isArray(requirements) ? requirements : [],
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      job: newJob,
      message: initialStatus === "PENDING_REVIEW"
        ? "Job submitted for JobsGhuru Admin review."
        : "Job post published successfully and live on the website!",
    });
  } catch (error: any) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job posting." },
      { status: 500 }
    );
  }
}
