import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPasswordSync } from "@/lib/auth/password";
import { recordAuditLog } from "@/lib/admin/audit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== "string" || !token.trim()) {
      return NextResponse.json(
        { error: "Invalid or missing password reset token." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Hash the input token to match stored hash
    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const record = await db.verificationToken.findFirst({
      where: {
        tokenHash,
        type: "PASSWORD_RESET",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "This password reset token is invalid, expired, or has already been used." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: record.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found matching this reset token." },
        { status: 404 }
      );
    }

    const newHash = hashPasswordSync(password);

    // Atomically update user password & invalidate reset token
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      }),
      db.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate existing sessions for security
      db.adminSession.deleteMany({
        where: { userId: user.id, realm: "EMPLOYER" },
      }),
    ]);

    // Record Audit Log
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "EMPLOYER_PASSWORD_RESET",
      entityType: "USER",
      entityId: user.id,
      reason: "Employer user successfully reset account password using reset token.",
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || undefined,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now log in with your new password.",
    });
  } catch (error: any) {
    console.error("Error in employer reset-password route:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again or request a new reset link." },
      { status: 500 }
    );
  }
}
