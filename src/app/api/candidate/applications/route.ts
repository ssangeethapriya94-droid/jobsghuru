import { NextResponse } from "next/server";
import { requireCandidate } from "@/lib/candidate/auth";
import { db } from "@/lib/db";
import { serializeCandidateSafeApplication } from "@/lib/candidate/safeApplication";

export async function GET() {
  try {
    const { authorized, candidate, response } = await requireCandidate();
    if (!authorized) return response!;

    const applications = await db.application.findMany({
      where: {
        deletedAt: null,
        OR: [
          { candidateId: candidate.id },
          { candidateEmail: candidate.email.toLowerCase() },
        ],
      },
      include: {
        job: {
          include: { company: true },
        },
        currentStage: true,
        interviews: {
          orderBy: { scheduledAt: "asc" },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    const safeApplications = applications.map(serializeCandidateSafeApplication);

    return NextResponse.json({
      success: true,
      applications: safeApplications,
      totalCount: safeApplications.length,
    });
  } catch (err: any) {
    console.error("Candidate applications fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch applications." },
      { status: 500 }
    );
  }
}
