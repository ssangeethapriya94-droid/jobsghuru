import { NextRequest, NextResponse } from "next/server";
import { requireCandidate } from "@/lib/candidate/auth";
import { db } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { authorized, candidate, response } = await requireCandidate();
    if (!authorized) return response!;

    const { jobId } = params;

    await db.savedJob.deleteMany({
      where: {
        userId: candidate.id,
        jobId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Job removed from saved list",
    });
  } catch (error: any) {
    console.error("Error unsaving job:", error);
    return NextResponse.json(
      { error: "Failed to remove saved job" },
      { status: 500 }
    );
  }
}
