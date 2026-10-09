import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { recordAuditLog } from "@/lib/admin/audit";
import { UserRole, UserStatus, VerificationStatus } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { authorized, admin, response } = await requireAdmin([
      UserRole.SUPER_ADMIN,
      UserRole.PLATFORM_ADMIN,
      UserRole.MODERATION_ADMIN,
    ]);
    if (!authorized) return response!;

    const body = await req.json();
    const { action, notes, reason } = body;

    const normalizedAction = action === "VERIFY" ? "APPROVE" : action;

    if (!normalizedAction || (normalizedAction !== "APPROVE" && normalizedAction !== "REJECT")) {
      return NextResponse.json({ error: "Action must be APPROVE or REJECT." }, { status: 400 });
    }

    const company = await db.company.findUnique({ where: { id: params.id } });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const isVerified = normalizedAction === "APPROVE";
    const auditNotes = notes || reason;

    const updated = await db.company.update({
      where: { id: params.id },
      data: { verified: isVerified },
    });

    // Update Company Users Status
    await db.user.updateMany({
      where: { companyId: params.id },
      data: {
        status: isVerified ? UserStatus.ACTIVE : UserStatus.SUSPENDED,
      },
    });

    // Ensure CompanyVerification record exists and update status
    const existingVerif = await db.companyVerification.findFirst({
      where: { companyId: params.id },
      orderBy: { submittedAt: "desc" },
    });

    const companyUser = await db.user.findFirst({
      where: { companyId: params.id },
      orderBy: { createdAt: "asc" },
    });

    if (existingVerif) {
      await db.companyVerification.update({
        where: { id: existingVerif.id },
        data: {
          status: isVerified ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED,
          notes: auditNotes || undefined,
          reviewedBy: admin.email,
          reviewedAt: new Date(),
        },
      });
    } else {
      await db.companyVerification.create({
        data: {
          companyId: params.id,
          legalName: company.legalName || company.name,
          taxId: null,
          businessRegister: null,
          domain: companyUser?.email || company.slug,
          recruiterProof: "Admin Audit Verification Record",
          status: isVerified ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED,
          notes: auditNotes || undefined,
          reviewedBy: admin.email,
          reviewedAt: new Date(),
        },
      });
    }

    let dispatchedEmail: string | undefined = undefined;

    // If approved, send approval email to initial recruiter / company admin
    if (isVerified) {
      let companyUser = await db.user.findFirst({
        where: { companyId: params.id },
        orderBy: { createdAt: "asc" },
      });

      let targetEmail = companyUser?.email;
      if (!targetEmail) {
        const verifRecord = await db.companyVerification.findFirst({
          where: { companyId: params.id },
          orderBy: { submittedAt: "desc" },
        });
        if (verifRecord?.domain && verifRecord.domain.includes("@")) {
          targetEmail = verifRecord.domain;
        }
      }

      if (targetEmail) {
        dispatchedEmail = targetEmail;
        const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const loginUrl = `${origin}/employer/login?email=${encodeURIComponent(targetEmail)}`;

        const { sendEmployerApprovalEmail } = await import("@/lib/email/mailer");
        await sendEmployerApprovalEmail({
          toEmail: targetEmail,
          recipientName: companyUser?.name || company.displayName || company.name,
          companyName: company.displayName || company.name,
          password: "•••••••• (As created during registration)",
          loginUrl,
        }).catch((e) => console.error("Error sending approval email:", e));

        // Log to EmailOutbox
        await db.emailOutbox.create({
          data: {
            companyId: company.id,
            to: targetEmail,
            subject: `🎉 Approved: Your JobsGuru Employer Account is Active - Login Credentials`,
            template: "EMPLOYER_APPROVAL",
            status: "SENT",
            sentAt: new Date(),
          },
        }).catch(() => {});
      }
    }

    // Immutable Audit Log
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    await recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: isVerified ? "COMPANY_VERIFIED" : "COMPANY_VERIFICATION_REJECTED",
      entityType: "COMPANY",
      entityId: company.id,
      reason: auditNotes || `Admin ${normalizedAction.toLowerCase()}d company verification`,
      beforeJson: JSON.stringify({ verified: company.verified }),
      afterJson: JSON.stringify({ verified: isVerified }),
      ipAddress: ip,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      company: updated,
      emailDispatchedTo: dispatchedEmail,
      credentials: dispatchedEmail ? { email: dispatchedEmail, password: "•••••••• (As created during registration)" } : undefined,
      message: `Company verification ${normalizedAction.toLowerCase()}d successfully.`,
    });
  } catch (error: any) {
    console.error("Error verifying company:", error);
    return NextResponse.json({ error: "Failed to process verification" }, { status: 500 });
  }
}
