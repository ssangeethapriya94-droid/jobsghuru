import { NextResponse } from "next/server";
import { requireCandidate } from "@/lib/candidate/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { authorized, candidate, response } = await requireCandidate();
    if (!authorized) return response!;

    const userWithProfile = await db.user.findUnique({
      where: { id: candidate.id },
      include: {
        candidateProfile: true,
      },
    });

    if (!userWithProfile) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      candidate: {
        id: userWithProfile.id,
        name: userWithProfile.name,
        email: userWithProfile.email,
        phone: userWithProfile.phone,
        avatar: userWithProfile.avatar,
        role: userWithProfile.role,
        status: userWithProfile.status,
        profile: userWithProfile.candidateProfile || null,
        profileCompleteness: userWithProfile.candidateProfile?.profileCompleteness || 0,
      },
    });
  } catch (err: any) {
    console.error("Candidate me error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch candidate details." },
      { status: 500 }
    );
  }
}
