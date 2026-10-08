import { db } from "@/lib/db";
import { OfferStatus, UserRole } from "@prisma/client";
import crypto from "crypto";
import { queueAndSendEmail } from "@/lib/email/outbox";
import { recordAuditLog } from "@/lib/admin/audit";

// State Machine transitions rules
const VALID_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  DRAFT: [OfferStatus.PENDING_APPROVAL, OfferStatus.APPROVED, OfferStatus.SENT, OfferStatus.WITHDRAWN],
  PENDING_APPROVAL: [OfferStatus.APPROVED, OfferStatus.REJECTED, OfferStatus.WITHDRAWN],
  APPROVED: [OfferStatus.SENT, OfferStatus.WITHDRAWN],
  SENT: [OfferStatus.VIEWED, OfferStatus.ACCEPTED, OfferStatus.REJECTED, OfferStatus.EXPIRED, OfferStatus.WITHDRAWN, OfferStatus.COUNTERED],
  VIEWED: [OfferStatus.ACCEPTED, OfferStatus.REJECTED, OfferStatus.EXPIRED, OfferStatus.WITHDRAWN, OfferStatus.COUNTERED],
  COUNTERED: [OfferStatus.SENT, OfferStatus.WITHDRAWN, OfferStatus.ACCEPTED, OfferStatus.REJECTED],
  ACCEPTED: [],
  REJECTED: [],
  DECLINED: [],
  EXPIRED: [],
  WITHDRAWN: [],
};

export function canTransitionOfferStatus(current: OfferStatus, target: OfferStatus): boolean {
  if (current === target) return true;
  const allowed = VALID_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateOfferToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  return {
    rawToken,
    tokenHash: hashToken(rawToken),
  };
}

export async function checkLazyOfferExpiry(offer: any) {
  if (!offer) return offer;
  if (
    (offer.status === OfferStatus.SENT || offer.status === OfferStatus.VIEWED || offer.status === OfferStatus.APPROVED || offer.status === OfferStatus.PENDING_APPROVAL) &&
    new Date() > new Date(offer.expiryDate)
  ) {
    const updated = await db.offer.update({
      where: { id: offer.id },
      data: { status: OfferStatus.EXPIRED },
    });
    return { ...offer, status: OfferStatus.EXPIRED };
  }
  return offer;
}

export async function sendOfferEmail(offerId: string, companyId: string, actorId?: string, actorEmail?: string) {
  const offer = await db.offer.findUnique({
    where: { id: offerId },
    include: { company: true, job: true, application: true },
  });

  if (!offer || offer.companyId !== companyId) {
    throw new Error("Offer not found or unauthorized");
  }

  // Check approval rules
  if (offer.company.offerApprovalRequired && offer.approvalStatus !== "APPROVED") {
    throw new Error("Cannot send offer until it is approved.");
  }

  const tokenObj = generateOfferToken();
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const guestLink = `${appUrl}/offers/${tokenObj.rawToken}`;

  const updatedOffer = await db.offer.update({
    where: { id: offerId },
    data: {
      status: OfferStatus.SENT,
      sentAt: new Date(),
      tokenHash: tokenObj.tokenHash,
      tokenExpiresAt: offer.expiryDate,
    },
  });

  const offerHtml = `
    <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; color: #1e293b;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0;">
        <h2 style="color: #2563eb; margin-top: 0;">Formal Offer of Employment</h2>
        <p>Dear <strong>${offer.candidateName}</strong>,</p>
        <p>We are thrilled to extend a formal job offer for the <strong>${offer.roleTitle}</strong> position at <strong>${offer.company.name}</strong>.</p>
        
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Fixed Compensation:</strong> ${offer.currency} ${offer.fixedCtc || offer.baseSalaryLpa} LPA</p>
          ${offer.variableCtc ? `<p style="margin: 0 0 8px 0;"><strong>Variable Component:</strong> ${offer.currency} ${offer.variableCtc} LPA</p>` : ""}
          ${offer.joiningBonus ? `<p style="margin: 0 0 8px 0;"><strong>Joining Bonus:</strong> ${offer.currency} ${offer.joiningBonus}</p>` : ""}
          <p style="margin: 0 0 8px 0;"><strong>Joining Date:</strong> ${new Date(offer.startDate).toLocaleDateString("en-IN")}</p>
          <p style="margin: 0;"><strong>Valid Until:</strong> ${new Date(offer.expiryDate).toLocaleDateString("en-IN")}</p>
        </div>

        <p style="text-align: center; margin: 28px 0;">
          <a href="${guestLink}" style="background: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">
            Review and Respond to Offer
          </a>
        </p>

        <p style="font-size: 13px; color: #64748b;">If the button does not work, copy and paste this secure link into your browser:<br/>${guestLink}</p>
        <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Warm regards,<br/><strong>${offer.company.name} Hiring Team</strong></p>
      </div>
    </div>
  `;

  await queueAndSendEmail({
    to: offer.candidateEmail,
    companyId: offer.companyId,
    applicationId: offer.applicationId,
    subject: `Employment Offer: ${offer.roleTitle} at ${offer.company.name}`,
    html: offerHtml,
    template: "OFFER_LETTER",
    payload: { offerId: offer.id, applicationId: offer.applicationId, guestLink },
  });

  // Timeline & Audit log
  await db.applicationEvent.create({
    data: {
      applicationId: offer.applicationId,
      actorName: actorEmail || offer.company.name,
      actorRole: "RECRUITER",
      action: "OFFER_SENT",
      metadata: { offerId: offer.id, version: offer.version, candidateEmail: offer.candidateEmail },
    },
  }).catch(() => {});

  if (actorEmail) {
    await recordAuditLog({
      actorEmail,
      actorRole: UserRole.RECRUITER,
      action: "OFFER_SENT",
      entityType: "OFFER",
      entityId: offer.id,
      reason: `Dispatched offer v${offer.version} to ${offer.candidateEmail}`,
    }).catch(() => {});
  }

  return updatedOffer;
}

export async function processCandidateAcceptance(offerId: string, candidateIdentifier: string) {
  const offer = await db.offer.findUnique({
    where: { id: offerId },
    include: { application: true, company: true },
  });

  if (!offer) throw new Error("Offer not found");

  // Verify non-expired, non-withdrawn, non-superseded
  if (offer.status === OfferStatus.EXPIRED || offer.status === OfferStatus.WITHDRAWN) {
    throw new Error(`Cannot accept offer because it is ${offer.status.toLowerCase()}.`);
  }

  if (new Date() > new Date(offer.expiryDate)) {
    await db.offer.update({ where: { id: offerId }, data: { status: OfferStatus.EXPIRED } });
    throw new Error("Offer has expired.");
  }

  // Transactional accept
  const result = await db.$transaction(async (tx) => {
    const updatedOffer = await tx.offer.update({
      where: { id: offerId },
      data: {
        status: OfferStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });

    // Move ONLY this application to HIRED
    const updatedApp = await tx.application.update({
      where: { id: offer.applicationId },
      data: { status: "HIRED" },
    });

    // Write application timeline event
    await tx.applicationEvent.create({
      data: {
        applicationId: offer.applicationId,
        actorName: offer.candidateName,
        actorRole: "CANDIDATE",
        action: "OFFER_ACCEPTED",
        metadata: { offerId: offer.id, candidateIdentifier },
      },
    });

    // Create Notification for recruiter / company
    await tx.notification.create({
      data: {
        companyId: offer.companyId,
        applicationId: offer.applicationId,
        title: "Offer Accepted",
        message: `${offer.candidateName} accepted the offer for ${offer.roleTitle}!`,
        type: "OFFER_ACCEPTED",
        link: `/employer/offers/${offer.id}`,
      },
    });

    return { offer: updatedOffer, application: updatedApp };
  });

  return result;
}
