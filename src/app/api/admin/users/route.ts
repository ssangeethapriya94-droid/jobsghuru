import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdminAccess } from "@/lib/admin/auth";
import { recordAuditLog } from "@/lib/admin/audit";
import { UserRole, UserStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { authorized, admin, error } = await verifyAdminAccess("users.view");
  if (!authorized || !admin) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";

  const whereClause: any = {};

  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  if (role && role !== "ALL") {
    whereClause.role = role as UserRole;
  }

  if (status && status !== "ALL") {
    whereClause.status = status as UserStatus;
  }

  const users = await db.user.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true, verified: true } },
      _count: { select: { applications: true } },
    },
    take: 50,
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const { authorized, admin, error } = await verifyAdminAccess("users.manage_roles");
  if (!authorized || !admin) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 403 });
  }

  try {
    const { userId, role, status, reason } = await req.json();

    if (!userId || !reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "Valid User ID and mandatory audit reason required." },
        { status: 400 }
      );
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Protection: ordinary platform admins cannot demote or suspend Super Admins
    if (targetUser.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Insufficient privileges to modify Super Administrator account." },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (role && role in UserRole) updateData.role = role as UserRole;
    if (status && status in UserStatus) {
      updateData.status = status as UserStatus;
      if (status === "SUSPENDED") {
        updateData.suspensionReason = reason;
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Record Immutable Audit Log
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    await recordAuditLog({
      actorId: admin.userId,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: status ? (status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_REACTIVATED") : "USER_ROLE_CHANGED",
      entityType: "USER",
      entityId: userId,
      reason,
      beforeState: { role: targetUser.role, status: targetUser.status },
      afterState: { role: updatedUser.role, status: updatedUser.status },
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || "Admin Console",
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error("Failed to update user:", err);
    return NextResponse.json({ error: "Database error updating user account." }, { status: 500 });
  }
}
