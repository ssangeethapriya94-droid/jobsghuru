import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { OfferStatus, UserRole } from "@prisma/client";
import { recordAuditLog } from "@/lib/admin/audit";
import { canTransitionOfferStatus, checkLazyOfferExpiry } from "@/lib/employer/offers";

export async function GET(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = { companyId: employer.companyId };
    if (statusFilter && Object.values(OfferStatus).includes(statusFilter as OfferStatus)) {
      where.status = statusFilter;
    }
    if (search) {
      where.OR = [
        { candidateName: { contains: search, mode: "insensitive" } },
        { candidateEmail: { contains: search, mode: "insensitive" } },
        { roleTitle: { contains: search, mode: "insensitive" } },
      ];
    }

    const [rawOffers, total] = await Promise.all([
      db.offer.findMany({
        where,
        include: {
          job: { select: { id: true, title: true, department: true } },
          application: { select: { id: true, candidateName: true, candidateEmail: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.offer.count({ where }),
    ]);

    // Check lazy expiry on read
    const offers = await Promise.all(rawOffers.map(checkLazyOfferExpiry));

    return NextResponse.json({
      success: true,
      offers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching employer offers:", error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const body = await req.json();
    const {
      applicationId,
      jobId,
      candidateName,
      candidateEmail,
      roleTitle,
      baseSalaryLpa,
      fixedCtc,
      variableCtc,
      joiningBonus,
      currency,
      startDate,
      expiryDate,
      employmentType,
      probation,
      location,
      benefits,
      terms,
      letterContent,
      internalNotes,
    } = body;

    if (!candidateName || !roleTitle) {
      return NextResponse.json(
        { error: "Candidate name and role title are required." },
        { status: 400 }
      );
    }

    let targetAppId = applicationId;
    let targetJobId = jobId;

    // Resolve Job ID from Application if not explicitly provided
    if (targetAppId && !targetJobId) {
      const app = await db.application.findUnique({
        where: { id: targetAppId },
        select: { jobId: true, candidateName: true, candidateEmail: true, job: { select: { companyId: true } } },
      });
      if (app) {
        if (app.job.companyId !== employer.companyId) {
          return NextResponse.json({ error: "Application does not belong to your company." }, { status: 404 });
        }
        targetJobId = app.jobId;
      }
    }

    if (!targetAppId || !targetJobId) {
      const anyJob = await db.job.findFirst({ where: { companyId: employer.companyId } });
      if (!anyJob) {
        return NextResponse.json({ error: "No active job requisition found to attach offer." }, { status: 400 });
      }
      targetJobId = targetJobId || anyJob.id;
      if (!targetAppId) {
        const newApp = await db.application.create({
          data: {
            jobId: targetJobId,
            candidateName: candidateName,
            candidateEmail: candidateEmail || "candidate@example.com",
            candidatePhone: "+91 98400 00000",
            status: "OFFER_EXTENDED",
          },
        });
        targetAppId = newApp.id;
      }
    }

    // Check single active offer rule
    const existingActiveOffer = await db.offer.findFirst({
      where: {
        applicationId: targetAppId,
        status: { in: [OfferStatus.DRAFT, OfferStatus.PENDING_APPROVAL, OfferStatus.APPROVED, OfferStatus.SENT, OfferStatus.VIEWED, OfferStatus.COUNTERED] },
      },
    });

    if (existingActiveOffer) {
      return NextResponse.json(
        { error: "This application already has an active offer. Withdraw or supersede it first before creating a new offer." },
        { status: 400 }
      );
    }

    // Check company approval config
    const company = await db.company.findUnique({
      where: { id: employer.companyId },
      select: { offerApprovalRequired: true },
    });

    const approvalStatus = company?.offerApprovalRequired ? "PENDING" : "NOT_REQUIRED";
    const initialStatus = company?.offerApprovalRequired ? OfferStatus.PENDING_APPROVAL : OfferStatus.DRAFT;

    const parsedFixed = parseFloat(fixedCtc || baseSalaryLpa || "0");
    const parsedVar = parseFloat(variableCtc || "0");
    const parsedBonus = parseFloat(joiningBonus || "0");

    const offer = await db.offer.create({
      data: {
        applicationId: targetAppId,
        jobId: targetJobId,
        companyId: employer.companyId,
        createdBy: employer.id,
        candidateName,
        candidateEmail: candidateEmail || "candidate@example.com",
        roleTitle,
        baseSalaryLpa: parsedFixed,
        fixedCtc: parsedFixed,
        variableCtc: parsedVar,
        variableLpa: parsedVar,
        joiningBonus: parsedBonus,
        currency: currency || "INR",
        startDate: new Date(startDate || Date.now() + 15 * 86400000),
        expiryDate: new Date(expiryDate || Date.now() + 7 * 86400000),
        employmentType: employmentType || "FULL_TIME",
        probation: probation || "6 Months",
        location: location || "Remote / Onsite",
        benefits: benefits || "Health Insurance, Provident Fund, Performance Bonus",
        status: initialStatus,
        approvalStatus: approvalStatus,
        terms: terms || "Standard employment contract subject to background verification.",
        letterContent: letterContent || null,
        internalNotes: internalNotes || null,
        version: 1,
      },
    });

    // Update Application stage & record timeline event
    await db.application.update({
      where: { id: targetAppId },
      data: { status: "OFFER_EXTENDED" },
    });

    await db.applicationEvent.create({
      data: {
        applicationId: targetAppId,
        actorId: employer.id,
        actorName: employer.name,
        actorRole: employer.role,
        action: "OFFER_CREATED",
        metadata: { offerId: offer.id, version: 1, fixedCtc: parsedFixed, approvalStatus },
      },
    }).catch(() => {});

    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role,
      action: "OFFER_CREATED",
      entityType: "OFFER",
      entityId: offer.id,
      reason: `Created offer v1 for ${candidateName} (${roleTitle})`,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      offer,
      message: "Offer created successfully.",
    });
  } catch (error: any) {
    console.error("Error creating offer:", error);
    return NextResponse.json({ error: error.message || "Failed to create offer" }, { status: 500 });
  }
}
