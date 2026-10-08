import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCandidate } from "@/lib/candidate/auth";
import { processCandidateAcceptance, checkLazyOfferExpiry } from "@/lib/employer/offers";
import { OfferStatus } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const candidate = await getCurrentCandidate();
    if (!candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let offer = await db.offer.findUnique({
      where: { id: params.id },
      include: {
        company: { select: { id: true, name: true, logo: true, location: true } },
        job: { select: { id: true, title: true, department: true } },
        application: { select: { id: true, candidateId: true } },
      },
    });

    if (!offer || (offer.candidateEmail.toLowerCase() !== candidate.email.toLowerCase() && offer.application?.candidateId !== candidate.id)) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const activeOffer: any = await checkLazyOfferExpiry(offer);

    // If candidate views for first time and status is SENT, update to VIEWED
    if (activeOffer.status === OfferStatus.SENT) {
      await db.offer.update({
        where: { id: activeOffer.id },
        data: { status: OfferStatus.VIEWED, viewedAt: new Date() },
      });
      activeOffer.status = OfferStatus.VIEWED;
    }

    // Explicit ALLOW-LIST output. Strictly NO internalNotes!
    const sanitized = {
      id: activeOffer.id,
      roleTitle: activeOffer.roleTitle,
      companyName: activeOffer.company.name,
      companyLogo: activeOffer.company.logo,
      companyLocation: activeOffer.company.location,
      fixedCtc: activeOffer.fixedCtc || activeOffer.baseSalaryLpa,
      variableCtc: activeOffer.variableCtc || 0,
      joiningBonus: activeOffer.joiningBonus || 0,
      currency: activeOffer.currency,
      startDate: activeOffer.startDate,
      expiryDate: activeOffer.expiryDate,
      employmentType: activeOffer.employmentType,
      probation: activeOffer.probation,
      location: activeOffer.location,
      benefits: activeOffer.benefits,
      terms: activeOffer.terms,
      letterContent: activeOffer.letterContent,
      status: activeOffer.status,
      version: activeOffer.version,
      sentAt: activeOffer.sentAt,
      viewedAt: activeOffer.viewedAt,
      acceptedAt: activeOffer.acceptedAt,
      rejectedAt: activeOffer.rejectedAt,
      counterNote: activeOffer.counterNote,
      createdAt: activeOffer.createdAt,
    };

    return NextResponse.json({ success: true, offer: sanitized });
  } catch (error: any) {
    console.error("Error fetching candidate offer details:", error);
    return NextResponse.json({ error: "Failed to fetch offer details" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const candidate = await getCurrentCandidate();
    if (!candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const offer = await db.offer.findUnique({
      where: { id: params.id },
      include: { application: true },
    });

    if (!offer || (offer.candidateEmail.toLowerCase() !== candidate.email.toLowerCase() && offer.application?.candidateId !== candidate.id)) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action, reason, note } = body;

    // ACCEPT
    if (action === "ACCEPT") {
      const result = await processCandidateAcceptance(offer.id, candidate.email);
      return NextResponse.json({
        success: true,
        offer: result.offer,
        message: "Congratulations! You have accepted the offer of employment.",
      });
    }

    // REJECT
    if (action === "REJECT") {
      if (offer.status === OfferStatus.EXPIRED || offer.status === OfferStatus.WITHDRAWN) {
        return NextResponse.json({ error: "Cannot reject an expired or withdrawn offer." }, { status: 400 });
      }

      const updated = await db.offer.update({
        where: { id: offer.id },
        data: {
          status: OfferStatus.REJECTED,
          rejectedAt: new Date(),
          rejectionReason: reason || "Declined by candidate",
        },
      });

      await db.applicationEvent.create({
        data: {
          applicationId: offer.applicationId,
          actorName: candidate.name,
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
          message: `${candidate.name} declined the offer for ${offer.roleTitle}.`,
          type: "OFFER_REJECTED",
          link: `/employer/offers/${offer.id}`,
        },
      }).catch(() => {});

      return NextResponse.json({ success: true, offer: updated, message: "Offer declined." });
    }

    // COUNTER
    if (action === "COUNTER") {
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
          actorName: candidate.name,
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
          message: `${candidate.name} submitted a counter note regarding the offer for ${offer.roleTitle}.`,
          type: "OFFER_COUNTERED",
          link: `/employer/offers/${offer.id}`,
        },
      }).catch(() => {});

      return NextResponse.json({ success: true, offer: updated, message: "Counter note sent to recruiter." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Error responding to candidate offer:", error);
    return NextResponse.json({ error: error.message || "Failed to process response" }, { status: 500 });
  }
}
