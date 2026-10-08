import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    const pipeline = await db.hiringPipeline.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          include: {
            stages: { orderBy: { orderIndex: "asc" } },
          },
          orderBy: { version: "desc" },
        },
      },
    });

    if (!pipeline || pipeline.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Hiring pipeline not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, pipeline });
  } catch (error: any) {
    console.error("Error fetching pipeline details:", error);
    return NextResponse.json({ error: "Failed to fetch pipeline" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // PUBLISH NEW PIPELINE VERSION (Existing applications keep their version!)
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const pipeline = await db.hiringPipeline.findUnique({
      where: { id: params.id },
      include: {
        versions: { orderBy: { version: "desc" }, take: 1, include: { stages: true } },
      },
    });

    if (!pipeline || pipeline.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Hiring pipeline not found" }, { status: 404 });
    }

    const body = await req.json();
    const { stages } = body; // Array of stage definitions { name, stageType, interviewSubtype, orderIndex, description }

    if (!Array.isArray(stages) || stages.length === 0) {
      return NextResponse.json({ error: "Pipeline stages array is required." }, { status: 400 });
    }

    const latestVer = pipeline.versions[0]?.version || 0;
    const newVerNumber = latestVer + 1;

    // Create new PipelineVersion
    const newVersion = await db.pipelineVersion.create({
      data: {
        pipelineId: pipeline.id,
        version: newVerNumber,
        isPublished: true,
        stages: {
          create: stages.map((s: any, idx: number) => ({
            name: s.name,
            stageType: s.stageType || "CUSTOM",
            interviewSubtype: s.interviewSubtype || null,
            orderIndex: idx,
            description: s.description || null,
            requiresFeedback: Boolean(s.requiresFeedback),
          })),
        },
      },
      include: { stages: true },
    });

    return NextResponse.json({
      success: true,
      version: newVersion,
      message: `Published new pipeline version v${newVerNumber}. Existing applications preserve their version.`,
    });
  } catch (error: any) {
    console.error("Error publishing new pipeline version:", error);
    return NextResponse.json({ error: error.message || "Failed to publish pipeline version" }, { status: 500 });
  }
}
