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

    if (offer.status === OfferStatus.EXPIRED || offer.status === OfferStatus.WITHDRAWN) {
      return NextResponse.json({ error: "Cannot reject an expired or withdrawn offer." }, { status: 400 });
    }

    const body = await req.json();
    const { reason } = body;

    const updated = await db.offer.update({
      where: { id: offer.id },
      data: {
        status: OfferStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: reason || "Declined via guest link",
      },
    });

    await db.applicationEvent.create({
      data: {
        applicationId: offer.applicationId,
        actorName: offer.candidateName,
        actorRole: "CANDIDATE",
        action: "OFFER_REJECTED",
        metadata: { offerId: offer.id, reason },
      },
    }).catch(() => {});

    await db.notification.create({
      data: {
        companyId: offer.companyId,
        applicationId: offer.applicationId,
        title: "Offer Rejected",
        message: `${offer.candidateName} declined the offer for ${offer.roleTitle}.`,
        type: "OFFER_REJECTED",
        link: `/employer/offers/${offer.id}`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, offer: updated, message: "Offer declined." });
  } catch (error: any) {
    console.error("Error rejecting offer via guest token:", error);
    return NextResponse.json({ error: error.message || "Failed to reject offer" }, { status: 400 });
  }
}
