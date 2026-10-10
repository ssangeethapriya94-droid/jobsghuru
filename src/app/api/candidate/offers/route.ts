import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCandidate } from "@/lib/candidate/auth";
import { checkLazyOfferExpiry } from "@/lib/employer/offers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const candidate = await getCurrentCandidate();
    if (!candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawOffers = await db.offer.findMany({
      where: {
        OR: [
          { candidateEmail: { equals: candidate.email, mode: "insensitive" } },
          { application: { candidateId: candidate.id } },
        ],
      },
      include: {
        company: { select: { id: true, name: true, logo: true, location: true } },
        job: { select: { id: true, title: true, department: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const offers = await Promise.all(rawOffers.map(checkLazyOfferExpiry));

    // Sanitized response: ALLOW-LIST FIELDS ONLY. Absolutely NO internal notes or private comments!
    const sanitized = offers.map((o) => ({
      id: o.id,
      roleTitle: o.roleTitle,
      companyName: o.company.name,
      companyLogo: o.company.logo,
      companyLocation: o.company.location,
      fixedCtc: o.fixedCtc || o.baseSalaryLpa,
      variableCtc: o.variableCtc || 0,
      joiningBonus: o.joiningBonus || 0,
      currency: o.currency,
      startDate: o.startDate,
      expiryDate: o.expiryDate,
      employmentType: o.employmentType,
      location: o.location,
      benefits: o.benefits,
      terms: o.terms,
      letterContent: o.letterContent,
      status: o.status,
      version: o.version,
      sentAt: o.sentAt,
      viewedAt: o.viewedAt,
      acceptedAt: o.acceptedAt,
      rejectedAt: o.rejectedAt,
      counterNote: o.counterNote,
      createdAt: o.createdAt,
    }));

    return NextResponse.json({ success: true, offers: sanitized });
  } catch (error: any) {
    console.error("Error fetching candidate offers:", error);
    return NextResponse.json({ error: "Failed to fetch candidate offers" }, { status: 500 });
  }
}
