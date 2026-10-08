import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCandidate } from "@/lib/candidate/auth";
import crypto from "crypto";

function hashAlertToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function GET(req: NextRequest) {
  try {
    const candidate = await getCurrentCandidate();
    if (!candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alerts = await db.jobAlert.findMany({
      where: { userId: candidate.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, alerts });
  } catch (error: any) {
    console.error("Error fetching candidate job alerts:", error);
    return NextResponse.json({ error: "Failed to fetch job alerts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const candidate = await getCurrentCandidate();
    if (!candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { query, location, jobType, minSalary, frequency } = body;

    const rawToken = crypto.randomBytes(24).toString("hex");
    const tokenHash = hashAlertToken(rawToken);

    const alert = await db.jobAlert.create({
      data: {
        userId: candidate.id,
        query: query?.trim() || null,
        location: location?.trim() || null,
        jobType: jobType || null,
        minSalary: minSalary ? parseInt(minSalary) : null,
        frequency: frequency || "DAILY",
        tokenHash,
        active: true,
      },
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const unsubscribeLink = `${appUrl}/api/alerts/unsubscribe/${rawToken}`;

    return NextResponse.json({
      success: true,
      alert,
      unsubscribeLink,
      message: "Job alert saved successfully.",
    });
  } catch (error: any) {
    console.error("Error creating job alert:", error);
    return NextResponse.json({ error: "Failed to create job alert" }, { status: 500 });
  }
}
