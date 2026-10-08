import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken, checkLazyOfferExpiry } from "@/lib/employer/offers";
import { OfferStatus } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const computedHash = hashToken(params.token);

    let offer = await db.offer.findFirst({
      where: { tokenHash: computedHash },
      include: {
        company: { select: { id: true, name: true, logo: true, location: true, address: true } },
        job: { select: { id: true, title: true, department: true } },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Invalid or expired offer link" }, { status: 404 });
    }

    const activeOffer: any = await checkLazyOfferExpiry(offer);

    // If candidate opens guest link for first time and status is SENT, update to VIEWED
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
      candidateName: activeOffer.candidateName,
      candidateEmail: activeOffer.candidateEmail,
      roleTitle: activeOffer.roleTitle,
      companyName: activeOffer.company.name,
      companyLogo: activeOffer.company.logo,
      companyLocation: activeOffer.company.location,
      companyAddress: activeOffer.company.address,
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
    console.error("Error retrieving guest offer by token:", error);
    return NextResponse.json({ error: "Failed to retrieve offer" }, { status: 500 });
  }
}
