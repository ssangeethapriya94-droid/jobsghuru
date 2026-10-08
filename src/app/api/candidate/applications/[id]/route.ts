import { NextRequest, NextResponse } from "next/server";
import { requireCandidate } from "@/lib/candidate/auth";
import { db } from "@/lib/db";
import { serializeCandidateSafeApplication } from "@/lib/candidate/safeApplication";

/**
 * GET /api/candidate/applications/[id]
 * Fetch a single application owned by the logged-in candidate.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, candidate, response } = await requireCandidate();
    if (!authorized) return response!;

    const application = await db.application.findFirst({
      where: {
        id: params.id,
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
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found or unauthorized." },
        { status: 404 }
      );
    }

    const safeApp = serializeCandidateSafeApplication(application);

    return NextResponse.json({
      success: true,
      application: safeApp,
    });
  } catch (err: any) {
    console.error("Candidate application detail error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve application." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/candidate/applications/[id]
 * Withdraw (soft-delete) a candidate's own application.
 * - Blocked if the application has progressed to OFFER or HIRED stage.
 * - Preserves employer history via soft-delete (deletedAt timestamp).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, candidate, response } = await requireCandidate();
    if (!authorized) return response!;

    // Verify ownership — candidate can only withdraw their own application
    const application = await db.application.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
        OR: [
          { candidateId: candidate.id },
          { candidateEmail: candidate.email.toLowerCase() },
        ],
      },
      select: { id: true, status: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found or unauthorized." },
        { status: 404 }
      );
    }

    // Cannot withdraw if offer has been extended or candidate is already hired
    const nonWithdrawableStatuses = ["HIRED", "OFFER_EXTENDED", "OFFER_ACCEPTED"];
    if (nonWithdrawableStatuses.includes(application.status)) {
      return NextResponse.json(
        {
          error: `Cannot withdraw an application with status "${application.status}". Please contact the employer directly.`,
        },
        { status: 409 }
      );
    }

    // Soft-delete: preserve record for employer, mark as WITHDRAWN
    await db.application.update({
      where: { id: application.id },
      data: {
        deletedAt: new Date(),
        status: "WITHDRAWN",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Application withdrawn successfully.",
    });
  } catch (err: any) {
    console.error("Candidate application withdraw error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to withdraw application." },
      { status: 500 }
    );
  }
}
