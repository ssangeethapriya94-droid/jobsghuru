import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCandidate } from "@/lib/candidate/auth";

export async function GET(req: NextRequest) {
  try {
    const candidate = await getCurrentCandidate();
    if (!candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await db.user.findUnique({
      where: { id: candidate.id },
      include: {
        candidateProfile: true,
        applications: {
          include: {
            job: { select: { title: true, company: { select: { name: true } } } },
            events: true,
            candidateAssessments: {
              include: { assessment: { select: { title: true } } },
            },
          },
        },
        notifications: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "User data not found" }, { status: 404 });
    }

    // Exclude password hash and internal secrets
    const { passwordHash, twoFactorSecret, ...exportData } = userData;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="CareerBridge_Candidate_Data_${candidate.id}.json"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting candidate data:", error);
    return NextResponse.json({ error: "Failed to export candidate data" }, { status: 500 });
  }
}
