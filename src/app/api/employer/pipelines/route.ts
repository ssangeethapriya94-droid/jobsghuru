import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer, requireEmployer } from "@/lib/employer/auth";
import { recordAuditLog } from "@/lib/admin/audit";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pipelines = await db.hiringPipeline.findMany({
      where: {
        companyId: employer.companyId,
        isArchived: false,
      },
      include: {
        versions: {
          orderBy: { version: "desc" },
          include: {
            stages: { orderBy: { orderIndex: "asc" } },
            _count: { select: { applications: true } },
          },
        },
        jobs: {
          select: { id: true, title: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // If company has no pipelines yet, create a default industry-standard pipeline
    if (pipelines.length === 0) {
      const defaultPipeline = await db.hiringPipeline.create({
        data: {
          companyId: employer.companyId,
          title: "Standard Engineering Pipeline",
          description: "Default multi-stage technical recruitment pipeline",
          isDefault: true,
          versions: {
            create: {
              version: 1,
              isPublished: true,
              stages: {
                create: [
                  { name: "Application Screening", stageType: "SCREENING", orderIndex: 0 },
                  { name: "Technical Interview", stageType: "INTERVIEW", interviewSubtype: "TECHNICAL", orderIndex: 1, requiresFeedback: true },
                  { name: "Managerial Round", stageType: "INTERVIEW", interviewSubtype: "MANAGERIAL", orderIndex: 2, requiresFeedback: true },
                  { name: "Offer & Rollout", stageType: "OFFER", orderIndex: 3 },
                ],
              },
            },
          },
        },
        include: {
          versions: {
            include: {
              stages: { orderBy: { orderIndex: "asc" } },
              _count: { select: { applications: true } },
            },
          },
          jobs: { select: { id: true, title: true, status: true } },
        },
      });

      return NextResponse.json({ success: true, pipelines: [defaultPipeline] });
    }

    return NextResponse.json({ success: true, pipelines });
  } catch (error: any) {
    console.error("Error fetching pipelines:", error);
    return NextResponse.json({ error: "Failed to fetch pipelines" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const body = await req.json();
    const { title, description, stages } = body;

    if (!title) {
      return NextResponse.json({ error: "Pipeline title is required." }, { status: 400 });
    }

    const stageList = Array.isArray(stages) && stages.length > 0 ? stages : [
      { name: "Application Screening", stageType: "SCREENING", orderIndex: 0 },
      { name: "Technical Assessment", stageType: "ASSESSMENT", orderIndex: 1 },
      { name: "Team Interview", stageType: "INTERVIEW", interviewSubtype: "TECHNICAL", orderIndex: 2, requiresFeedback: true },
      { name: "Formal Offer", stageType: "OFFER", orderIndex: 3 },
    ];

    const pipeline = await db.hiringPipeline.create({
      data: {
        companyId: employer.companyId,
        title,
        description: description || null,
        versions: {
          create: {
            version: 1,
            isPublished: true,
            stages: {
              create: stageList.map((st: any, idx: number) => ({
                name: st.name,
                stageType: st.stageType || "CUSTOM",
                interviewSubtype: st.interviewSubtype || null,
                orderIndex: idx,
                requiresFeedback: Boolean(st.requiresFeedback),
              })),
            },
          },
        },
      },
      include: {
        versions: {
          include: {
            stages: { orderBy: { orderIndex: "asc" } },
            _count: { select: { applications: true } },
          },
        },
        jobs: true,
      },
    });

    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role as any,
      action: "HIRING_PIPELINE_CREATED",
      entityType: "PIPELINE",
      entityId: pipeline.id,
      reason: `Created custom hiring pipeline: ${title}`,
    });

    return NextResponse.json({ success: true, pipeline });
  } catch (error: any) {
    console.error("Error creating pipeline:", error);
    return NextResponse.json({ error: "Failed to create pipeline" }, { status: 500 });
  }
}
