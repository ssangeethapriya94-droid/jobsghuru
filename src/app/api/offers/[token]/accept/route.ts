import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken, processCandidateAcceptance } from "@/lib/employer/offers";

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const computedHash = hashToken(params.token);

    const offer = await db.offer.findFirst({
      where: { tokenHash: computedHash },
    });

    if (!offer) {
      return NextResponse.json({ error: "Invalid or expired offer link" }, { status: 404 });
    }

    const result = await processCandidateAcceptance(offer.id, offer.candidateEmail);

    return NextResponse.json({
      success: true,
      offer: result.offer,
      message: "Congratulations! You have accepted the formal offer of employment.",
    });
  } catch (error: any) {
    console.error("Error accepting offer via guest token:", error);
    return NextResponse.json({ error: error.message || "Failed to accept offer" }, { status: 400 });
  }
}
