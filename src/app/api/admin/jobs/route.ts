import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { WorkMode, JobType, JobStatus } from "@prisma/client";

// GET all companies for the dropdown selector
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const companies = await db.company.findMany({
      select: { id: true, name: true, location: true, verified: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ companies });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch companies" }, { status: 500 });
  }
}

// POST create a new job card
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const actorEmail = admin.email;
    const actorRole = admin.role;

    const body = await req.json();
    const {
      title,
      companyId,
      department = "Engineering",
      location = "Bengaluru",
      workMode = "HYBRID",
      jobType = "FULL_TIME",
      minExp = 2,
      maxExp = 5,
      salaryMinLpa = 10,
      salaryMaxLpa = 20,
      skills = [],
      description,
      responsibilities = [],
      requirements = [],
      status = "PUBLISHED",
    } = body;

    if (!title || !companyId) {
      return NextResponse.json(
        { error: "Title and Company are required." },
        { status: 400 }
      );
    }

    // Verify company exists
    const company = await db.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Selected company does not exist." }, { status: 404 });
    }

    // Prepare arrays
    const parsedSkills = Array.isArray(skills)
      ? skills
      : String(skills)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const parsedResponsibilities = Array.isArray(responsibilities) && responsibilities.length > 0
      ? responsibilities
      : [
          `Collaborate with cross-functional teams to build high-scale solutions for ${title}.`,
          "Design, develop, and maintain high performance, scalable software services.",
          "Write clean, readable, testable code and participate in architecture discussions.",
        ];

    const parsedRequirements = Array.isArray(requirements) && requirements.length > 0
      ? requirements
      : [
          `Strong working knowledge of ${parsedSkills.slice(0, 3).join(", ") || "core domain technologies"}.`,
          `${minExp}+ years of practical hands-on experience.`,
          "Bachelor's or Master's degree in Computer Science, Engineering, or equivalent practical experience.",
        ];

    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days validity

    const newJob = await db.job.create({
      data: {
        title,
        companyId,
        department,
        location,
        workMode: (workMode as WorkMode) || "HYBRID",
        jobType: (jobType as JobType) || "FULL_TIME",
        minExp: Number(minExp) || 0,
        maxExp: Number(maxExp) || 0,
        salaryMinLpa: salaryMinLpa ? Number(salaryMinLpa) : null,
        salaryMaxLpa: salaryMaxLpa ? Number(salaryMaxLpa) : null,
        skills: parsedSkills.length > 0 ? parsedSkills : ["React", "TypeScript", "Node.js"],
        preferredSkills: parsedSkills.slice(0, 3),
        description: description || `We are looking for an exceptional ${title} to join our growing team at ${company.name}.`,
        responsibilities: parsedResponsibilities,
        requirements: parsedRequirements,
        status: (status as JobStatus) || "PUBLISHED",
        expiresAt,
        responseRatePct: 75,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            verified: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    // Record audit log entry
    await db.auditLog.create({
      data: {
        actorEmail,
        actorRole,
        action: "JOB_CREATED_BY_ADMIN",
        entityType: "JOB",
        entityId: newJob.id,
        reason: `Admin created job posting "${title}" for company "${company.name}"`,
        afterJson: JSON.stringify({
          jobId: newJob.id,
          title: newJob.title,
          company: company.name,
          status: newJob.status,
          location: newJob.location,
        }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      job: {
        id: newJob.id,
        title: newJob.title,
        department: newJob.department,
        location: newJob.location,
        workMode: newJob.workMode,
        jobType: newJob.jobType,
        minExp: newJob.minExp,
        maxExp: newJob.maxExp,
        salaryMinLpa: newJob.salaryMinLpa,
        salaryMaxLpa: newJob.salaryMaxLpa,
        status: newJob.status,
        skills: newJob.skills,
        description: newJob.description,
        postedAt: newJob.postedAt.toISOString(),
        company: newJob.company,
        _count: newJob._count,
      },
    });
  } catch (error: any) {
    console.error("Job creation failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create job posting" },
      { status: 500 }
    );
  }
}
