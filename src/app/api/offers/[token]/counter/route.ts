import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/employer/offers";
import { OfferStatus } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const computedHash = hashToken(params.token);

    const offer = await db.offer.findFirst({
      where: { tokenHash: computedHash },
    });

    if (!offer) {
      return NextResponse.json({ error: "Invalid or expired offer link" }, { status: 404 });
    }

    const body = await req.json();
    const { note } = body;

    if (!note) {
      return NextResponse.json({ error: "Counter note is required." }, { status: 400 });
    }

    const updated = await db.offer.update({
      where: { id: offer.id },
      data: {
        status: OfferStatus.COUNTERED,
        counterNote: note,
      },
    });

    await db.applicationEvent.create({
      data: {
        applicationId: offer.applicationId,
        actorName: offer.candidateName,
        actorRole: "CANDIDATE",
        action: "OFFER_COUNTERED",
        metadata: { offerId: offer.id, note },
      },
    }).catch(() => {});

    await db.notification.create({
      data: {
        companyId: offer.companyId,
        applicationId: offer.applicationId,
        title: "Offer Counter-Request",
        message: `${offer.candidateName} submitted a counter note regarding the offer for ${offer.roleTitle}.`,
        type: "OFFER_COUNTERED",
        link: `/employer/offers/${offer.id}`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, offer: updated, message: "Counter note submitted to employer." });
  } catch (error: any) {
    console.error("Error submitting counter note via guest token:", error);
    return NextResponse.json({ error: error.message || "Failed to submit counter note" }, { status: 400 });
  }
}
