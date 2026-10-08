import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { recordAuditLog } from "@/lib/admin/audit";
import { UserRole, ReportStatus, JobStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await requireAdmin([
      UserRole.SUPER_ADMIN,
      UserRole.PLATFORM_ADMIN,
      UserRole.MODERATION_ADMIN,
    ]);
    if (!authorized) return response!;

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "OPEN";

    const reports = await db.report.findMany({
      where: statusFilter !== "ALL" ? { status: statusFilter as ReportStatus } : {},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    console.error("Error fetching reports queue:", error);
    return NextResponse.json({ error: "Failed to fetch moderation queue" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { authorized, admin, response } = await requireAdmin([
      UserRole.SUPER_ADMIN,
      UserRole.PLATFORM_ADMIN,
      UserRole.MODERATION_ADMIN,
    ]);
    if (!authorized) return response!;

    const body = await req.json();
    const { reportId, action, resolutionNote } = body; // action: "DISMISS" | "HIDE_JOB" | "SUSPEND_COMPANY"

    if (!reportId || !action) {
      return NextResponse.json({ error: "reportId and action are required." }, { status: 400 });
    }

    const report = await db.report.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (action === "DISMISS") {
      await db.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.DISMISSED,
          actionTaken: "DISMISSED",
          resolutionNote: resolutionNote || "Dismissed by admin moderation",
          resolvedBy: admin.email,
        },
      });
    } else if (action === "HIDE_JOB") {
      if (report.targetType === "JOB") {
        await db.job.update({
          where: { id: report.targetId },
          data: { status: JobStatus.REJECTED, moderationNotes: resolutionNote || "Hidden due to moderation report" },
        }).catch(() => {});
      }

      await db.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.ACTION_TAKEN,
          actionTaken: "HIDE_JOB",
          resolutionNote: resolutionNote || "Job hidden from platform",
          resolvedBy: admin.email,
        },
      });
    } else if (action === "SUSPEND_COMPANY") {
      if (report.targetType === "COMPANY") {
        await db.company.update({
          where: { id: report.targetId },
          data: { verified: false },
        }).catch(() => {});
      }

      await db.report.update({
        where: { id: reportId },
        data: {
          status: ReportStatus.ACTION_TAKEN,
          actionTaken: "SUSPEND_COMPANY",
          resolutionNote: resolutionNote || "Company suspended by admin moderation",
          resolvedBy: admin.email,
        },
      });
    }

    // Record Immutable Audit Log
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    await recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: `REPORT_ACTION_${action}`,
      entityType: report.targetType,
      entityId: report.targetId,
      reason: resolutionNote || `Executed moderation action ${action}`,
      ipAddress: ip,
    }).catch(() => {});

    return NextResponse.json({ success: true, message: `Moderation action ${action} executed.` });
  } catch (error: any) {
    console.error("Error processing moderation report:", error);
    return NextResponse.json({ error: "Failed to process report action" }, { status: 500 });
  }
}
