import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/permissions";
import { createAuditLog } from "@/lib/admin/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(admin.role, "reports.resolve") && !hasPermission(admin.role, "reports.investigate")) {
      return NextResponse.json(
        { error: "Insufficient privileges for moderation actions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { action, resolutionNote, reason } = await req.json();

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "A valid administrative justification (min 5 chars) is mandatory" },
        { status: 400 }
      );
    }

    const report = await db.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    let nextStatus: "OPEN" | "INVESTIGATING" | "ACTION_TAKEN" | "DISMISSED" = "OPEN";
    let actionTakenDesc = "";

    if (action === "INVESTIGATE") {
      nextStatus = "INVESTIGATING";
      actionTakenDesc = "Marked under active trust & safety investigation";
    } else if (action === "DISMISS") {
      nextStatus = "DISMISSED";
      actionTakenDesc = "Dismissed as unsubstantiated or compliant";
    } else if (action === "ACTION_TAKEN") {
      nextStatus = "ACTION_TAKEN";
      actionTakenDesc = `Enforcement action executed: ${resolutionNote || "Target restricted"}`;

      // If target is a Job, pause or reject it
      if (report.targetType === "JOB") {
        await db.job.update({
          where: { id: report.targetId },
          data: {
            status: "PAUSED",
            moderationNotes: `Suspended due to Trust & Safety report #${report.id}: ${reason}`,
          },
        });
      }
    }

    const updated = await db.report.update({
      where: { id },
      data: {
        status: nextStatus,
        resolutionNote,
        actionTaken: actionTakenDesc,
        resolvedBy: admin.email,
      },
    });

    // Immutable Audit Log
    await createAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: `REPORT_${action}`,
      entityType: "REPORT",
      entityId: report.id,
      beforeJson: JSON.stringify({ status: report.status }),
      afterJson: JSON.stringify({
        status: updated.status,
        actionTaken: updated.actionTaken,
        resolvedBy: admin.email,
      }),
      reason,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true, report: updated });
  } catch (error: any) {
    console.error("Report action error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
