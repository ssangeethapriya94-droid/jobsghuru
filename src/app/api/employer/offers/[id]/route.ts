import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { OfferStatus, UserRole } from "@prisma/client";
import { recordAuditLog } from "@/lib/admin/audit";
import { canTransitionOfferStatus, checkLazyOfferExpiry } from "@/lib/employer/offers";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    let offer = await db.offer.findUnique({
      where: { id: params.id },
      include: {
        job: true,
        application: {
          include: {
            candidate: {
              select: { id: true, name: true, email: true, candidateProfile: true },
            },
          },
        },
      },
    });

    if (!offer || offer.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const activeOffer: any = await checkLazyOfferExpiry(offer);

    // Fetch version history for this application
    const versions = await db.offer.findMany({
      where: { applicationId: activeOffer.applicationId },
      orderBy: { version: "desc" },
      select: {
        id: true,
        version: true,
        status: true,
        fixedCtc: true,
        variableCtc: true,
        createdAt: true,
        sentAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      offer,
      versions,
    });
  } catch (error: any) {
    console.error("Error getting offer details:", error);
    return NextResponse.json({ error: "Failed to get offer details" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    const offer = await db.offer.findUnique({
      where: { id: params.id },
      include: { company: true },
    });

    if (!offer || offer.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action, status, withdrawalReason, internalNotes, ...updateFields } = body;

    // Hiring Manager can only perform APPROVE action or approve status updates on offers
    if (employer.role === UserRole.HIRING_MANAGER && action !== "APPROVE" && status !== "SENT" && status !== "APPROVED") {
      return NextResponse.json(
        { error: "Forbidden: Hiring Manager can only approve offers, not edit or withdraw." },
        { status: 403 }
      );
    }

    // ACTION: APPROVE OFFER
    if (action === "APPROVE") {
      if (employer.role !== UserRole.COMPANY_ADMIN && employer.role !== UserRole.HIRING_MANAGER) {
        return NextResponse.json({ error: "Only Company Admin or Hiring Manager can approve offers." }, { status: 403 });
      }

      // Creator cannot approve their own offer
      if (offer.createdBy === employer.id) {
        return NextResponse.json({ error: "Creator of the offer cannot approve their own offer." }, { status: 400 });
      }

      const updated = await db.offer.update({
        where: { id: params.id },
        data: {
          approvalStatus: "APPROVED",
          approvedBy: employer.id,
          approvedAt: new Date(),
          status: OfferStatus.APPROVED,
        },
      });

      await db.applicationEvent.create({
        data: {
          applicationId: offer.applicationId,
          actorId: employer.id,
          actorName: employer.name,
          actorRole: employer.role,
          action: "OFFER_APPROVED",
          metadata: { offerId: offer.id },
        },
      }).catch(() => {});

      return NextResponse.json({ success: true, offer: updated, message: "Offer approved successfully." });
    }

    // ACTION: WITHDRAW OFFER
    if (action === "WITHDRAW" || status === OfferStatus.WITHDRAWN) {
      if (!canTransitionOfferStatus(offer.status, OfferStatus.WITHDRAWN)) {
        return NextResponse.json({ error: `Cannot withdraw offer from state ${offer.status}.` }, { status: 400 });
      }

      const updated = await db.offer.update({
        where: { id: params.id },
        data: {
          status: OfferStatus.WITHDRAWN,
          withdrawalReason: withdrawalReason || "Withdrawn by employer",
        },
      });

      await db.applicationEvent.create({
        data: {
          applicationId: offer.applicationId,
          actorId: employer.id,
          actorName: employer.name,
          actorRole: employer.role,
          action: "OFFER_WITHDRAWN",
          metadata: { offerId: offer.id, reason: withdrawalReason },
        },
      }).catch(() => {});

      return NextResponse.json({ success: true, offer: updated, message: "Offer withdrawn." });
    }

    // ACTION: UPDATE / VERSIONING
    // If offer is SENT or VIEWED, editing creates a brand new version and supersedes the current version!
    if (offer.status === OfferStatus.SENT || offer.status === OfferStatus.VIEWED || offer.status === OfferStatus.COUNTERED) {
      // Mark current offer as superseded / withdrawn
      await db.offer.update({
        where: { id: params.id },
        data: { status: OfferStatus.WITHDRAWN, withdrawalReason: "Superseded by newer version" },
      });

      // Create new version
      const company = await db.company.findUnique({ where: { id: employer.companyId } });
      const requiresApproval = company?.offerApprovalRequired ?? false;

      const newVersionOffer = await db.offer.create({
        data: {
          applicationId: offer.applicationId,
          jobId: offer.jobId,
          companyId: offer.companyId,
          createdBy: employer.id,
          candidateName: updateFields.candidateName || offer.candidateName,
          candidateEmail: updateFields.candidateEmail || offer.candidateEmail,
          roleTitle: updateFields.roleTitle || offer.roleTitle,
          fixedCtc: parseFloat(updateFields.fixedCtc || offer.fixedCtc),
          variableCtc: parseFloat(updateFields.variableCtc || offer.variableCtc),
          baseSalaryLpa: parseFloat(updateFields.fixedCtc || offer.fixedCtc),
          joiningBonus: parseFloat(updateFields.joiningBonus || offer.joiningBonus),
          currency: updateFields.currency || offer.currency,
          startDate: updateFields.startDate ? new Date(updateFields.startDate) : offer.startDate,
          expiryDate: updateFields.expiryDate ? new Date(updateFields.expiryDate) : offer.expiryDate,
          employmentType: updateFields.employmentType || offer.employmentType,
          probation: updateFields.probation || offer.probation,
          location: updateFields.location || offer.location,
          benefits: updateFields.benefits || offer.benefits,
          terms: updateFields.terms || offer.terms,
          letterContent: updateFields.letterContent || offer.letterContent,
          internalNotes: internalNotes !== undefined ? internalNotes : offer.internalNotes,
          status: requiresApproval ? OfferStatus.PENDING_APPROVAL : OfferStatus.DRAFT,
          approvalStatus: requiresApproval ? "PENDING" : "NOT_REQUIRED",
          version: offer.version + 1,
          supersededById: null,
        },
      });

      return NextResponse.json({
        success: true,
        offer: newVersionOffer,
        message: `Created new offer version v${newVersionOffer.version}.`,
      });
    }

    // Normal edit if still DRAFT or PENDING_APPROVAL
    const updated = await db.offer.update({
      where: { id: params.id },
      data: {
        ...(updateFields.roleTitle && { roleTitle: updateFields.roleTitle }),
        ...(updateFields.fixedCtc && { fixedCtc: parseFloat(updateFields.fixedCtc), baseSalaryLpa: parseFloat(updateFields.fixedCtc) }),
        ...(updateFields.variableCtc && { variableCtc: parseFloat(updateFields.variableCtc) }),
        ...(updateFields.joiningBonus && { joiningBonus: parseFloat(updateFields.joiningBonus) }),
        ...(updateFields.startDate && { startDate: new Date(updateFields.startDate) }),
        ...(updateFields.expiryDate && { expiryDate: new Date(updateFields.expiryDate) }),
        ...(updateFields.terms && { terms: updateFields.terms }),
        ...(internalNotes !== undefined && { internalNotes }),
      },
    });

    return NextResponse.json({ success: true, offer: updated, message: "Offer updated." });
  } catch (error: any) {
    console.error("Error updating offer:", error);
    return NextResponse.json({ error: error.message || "Failed to update offer" }, { status: 500 });
  }
}
