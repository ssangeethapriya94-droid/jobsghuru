import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
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

    const application = await db.application.findFirst({
      where: {
        id: params.id,
        job: { companyId: employer.companyId },
      },
      include: {
        currentStage: true,
        pipelineVersion: {
          include: { stages: true },
        },
        job: {
          include: {
            pipeline: {
              include: {
                versions: {
                  where: { isPublished: true },
                  include: { stages: true },
                },
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const body = await req.json();
    const { stageId, notes } = body;

    if (!stageId) {
      return NextResponse.json({ error: "Target stageId is required." }, { status: 400 });
    }

    // Verify stage belongs to this application's active pipeline version
    const validStageIds = new Set<string>();
    
    if (application.pipelineVersion?.stages && application.pipelineVersion.stages.length > 0) {
      application.pipelineVersion.stages.forEach((s) => validStageIds.add(s.id));
    } else if (application.job.pipeline?.versions && application.job.pipeline.versions.length > 0) {
      // Fallback to active/published pipeline version
      const activeVersion = application.job.pipeline.versions[0];
      activeVersion.stages.forEach((s) => validStageIds.add(s.id));
    }

    // Also check stage directly in DB to verify company ownership and version
    const targetStage = await db.pipelineStage.findUnique({
      where: { id: stageId },
      include: {
        version: {
          include: { pipeline: true },
        },
      },
    });

    if (
      !targetStage ||
      targetStage.version.pipeline.companyId !== employer.companyId ||
      !validStageIds.has(stageId)
    ) {
      return NextResponse.json(
        { error: "Invalid stage: Stage does not belong to this application's active pipeline version." },
        { status: 400 }
      );
    }

    // Check if already at this stage
    if (application.currentStageId === stageId) {
      return NextResponse.json({
        success: true,
        message: "Application is already at the selected stage.",
        application,
      });
    }

    const updated = await db.application.update({
      where: { id: application.id },
      data: {
        currentStageId: stageId,
        ...(application.pipelineVersionId ? {} : { pipelineVersionId: targetStage.versionId }),
      },
      include: {
        currentStage: true,
      },
    });

    await db.applicationEvent.create({
      data: {
        applicationId: application.id,
        actorId: employer.id,
        actorName: employer.name,
        actorRole: employer.role,
        action: "STAGE_MOVED",
        metadata: {
          fromStage: application.currentStage?.name || "Initial Stage",
          toStage: targetStage.name,
          notes: notes || null,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Application moved to ${targetStage.name}.`,
      application: updated,
    });
  } catch (err: any) {
    console.error("Error moving stage:", err);
    return NextResponse.json(
      { error: err.message || "Failed to move stage." },
      { status: 500 }
    );
  }
}
