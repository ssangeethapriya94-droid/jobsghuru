import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminAccess } from "@/lib/admin/auth";
import { recordAuditLog } from "@/lib/admin/audit";
import { JobStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, admin, error } = await verifyAdminAccess("jobs.moderate");
  if (!authorized || !admin) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
  }

  try {
    const { action, reason, notes } = await req.json(); // action: "APPROVE" | "REQUEST_CHANGES" | "REJECT" | "SUSPEND"
    const jobId = params.id;

    if (!action || !reason) {
      return NextResponse.json(
        { error: "Moderation action and audit rationale are required." },
        { status: 400 }
      );
    }

    const job = await db.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job listing not found." }, { status: 404 });
    }

    let newStatus: JobStatus = JobStatus.PUBLISHED;
    if (action === "APPROVE") newStatus = JobStatus.PUBLISHED;
    else if (action === "REQUEST_CHANGES") newStatus = JobStatus.PENDING_REVIEW;
    else if (action === "REJECT") newStatus = JobStatus.REJECTED;
    else if (action === "SUSPEND") newStatus = JobStatus.PAUSED;

    const updatedJob = await db.job.update({
      where: { id: jobId },
      data: {
        status: newStatus,
        moderationNotes: notes || reason,
      },
    });

    // Record Immutable Audit Log
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    await recordAuditLog({
      actorId: admin.userId,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: `JOB_MODERATION_${action}`,
      entityType: "JOB",
      entityId: jobId,
      reason,
      beforeState: { status: job.status, title: job.title },
      afterState: { status: updatedJob.status },
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || "Admin Console",
    });

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (err: any) {
    console.error("Job moderation error:", err);
    return NextResponse.json(
      { error: "Failed to execute job moderation decision." },
      { status: 500 }
    );
  }
}
