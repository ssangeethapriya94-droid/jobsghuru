import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { recordAuditLog } from "@/lib/admin/audit";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { authorized, admin, response } = await requireAdmin([
      UserRole.SUPER_ADMIN,
      UserRole.PLATFORM_ADMIN,
      UserRole.MODERATION_ADMIN,
    ]);
    if (!authorized) return response!;

    const body = await req.json();
    const { action, notes } = body; // action: "APPROVE" | "REJECT"

    if (!action || (action !== "APPROVE" && action !== "REJECT")) {
      return NextResponse.json({ error: "Action must be APPROVE or REJECT." }, { status: 400 });
    }

    const company = await db.company.findUnique({ where: { id: params.id } });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const isVerified = action === "APPROVE";

    const updated = await db.company.update({
      where: { id: params.id },
      data: { verified: isVerified },
    });

    // Update CompanyVerification record
    await db.companyVerification.updateMany({
      where: { companyId: params.id, status: "PENDING" },
      data: {
        status: isVerified ? "VERIFIED" : "REJECTED",
        notes: notes || undefined,
        reviewedBy: admin.email,
        reviewedAt: new Date(),
      },
    });

    // Immutable Audit Log
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    await recordAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: isVerified ? "COMPANY_VERIFIED" : "COMPANY_VERIFICATION_REJECTED",
      entityType: "COMPANY",
      entityId: company.id,
      reason: notes || `Admin ${action.toLowerCase()}d company verification`,
      beforeJson: JSON.stringify({ verified: company.verified }),
      afterJson: JSON.stringify({ verified: isVerified }),
      ipAddress: ip,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      company: updated,
      message: `Company verification ${action.toLowerCase()}d successfully.`,
    });
  } catch (error: any) {
    console.error("Error verifying company:", error);
    return NextResponse.json({ error: "Failed to process verification" }, { status: 500 });
  }
}
