import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OfferStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  return handleCronExpiry(req);
}

export async function POST(req: NextRequest) {
  return handleCronExpiry(req);
}

async function handleCronExpiry(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secretParam = searchParams.get("secret");
    const secretHeader = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET || "careerbridge_cron_secret_2026";

    if (secretParam !== expectedSecret && secretHeader !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized cron execution secret" }, { status: 401 });
    }

    const now = new Date();

    // Expire past-due active offers (NEVER expire ACCEPTED, REJECTED, DECLINED, WITHDRAWN)
    const result = await db.offer.updateMany({
      where: {
        status: { in: [OfferStatus.DRAFT, OfferStatus.PENDING_APPROVAL, OfferStatus.APPROVED, OfferStatus.SENT, OfferStatus.VIEWED, OfferStatus.COUNTERED] },
        expiryDate: { lt: now },
      },
      data: {
        status: OfferStatus.EXPIRED,
      },
    });

    return NextResponse.json({
      success: true,
      expiredCount: result.count,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Error executing offer expiry cron:", error);
    return NextResponse.json({ error: "Failed to execute offer expiry cron" }, { status: 500 });
  }
}
