import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReportReason, ReportStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reporterEmail, targetType, targetId, targetTitle, reason, description, evidenceUrl } = body;

    if (!reporterEmail || !targetType || !targetId || !description) {
      return NextResponse.json({ error: "Reporter email, target, and description are required." }, { status: 400 });
    }

    // Rate Limiting (max 5 reports per 10 mins per IP/email)
    const rateKey = `report_limit_${reporterEmail}`;
    const windowStart = new Date(Date.now() - 600000);

    const bucket = await db.rateLimitBucket.findUnique({ where: { key: rateKey } });
    if (bucket && bucket.updatedAt > windowStart && bucket.count >= 5) {
      return NextResponse.json({ error: "Report submission rate limit reached. Please wait a few minutes." }, { status: 429 });
    }

    await db.rateLimitBucket.upsert({
      where: { key: rateKey },
      update: { count: (bucket?.count || 0) + 1 },
      create: { key: rateKey, count: 1, resetAt: new Date(Date.now() + 600000) },
    });

    const report = await db.report.create({
      data: {
        reporterEmail: reporterEmail.trim(),
        targetType: targetType.toUpperCase(),
        targetId: targetId.trim(),
        targetTitle: targetTitle || null,
        reason: (reason as ReportReason) || "OTHER",
        description: description.trim(),
        evidenceUrl: evidenceUrl || null,
        status: ReportStatus.OPEN,
      },
    });

    return NextResponse.json({
      success: true,
      report,
      message: "Report submitted to moderation queue.",
    });
  } catch (error: any) {
    console.error("Error submitting report:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
