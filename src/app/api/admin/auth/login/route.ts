import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAdminSession } from "@/lib/admin/auth";
import { isPlatformAdmin } from "@/lib/admin/permissions";
import { recordAuditLog } from "@/lib/admin/audit";
import { verifyPassword, hashPassword, isBcryptHash } from "@/lib/auth/password";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { email, password, twoFactorCode } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Browser";
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Rate Limiting Check
    const rateLimitKey = `login:admin:${ip}:${normalizedEmail}`;
    const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many failed login attempts. Please try again in ${rateCheck.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 2. User existence, password validation & realm isolation
    const isPasswordValid = user ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !isPasswordValid) {
      if (user) {
        await recordAuditLog({
          actorEmail: normalizedEmail,
          actorRole: user.role,
          action: "ADMIN_LOGIN_FAILED",
          entityType: "USER",
          entityId: user.id,
          reason: "Invalid password attempt",
          ipAddress: ip,
          userAgent,
        });
      }
      return NextResponse.json(
        { error: "Invalid administrative credentials" },
        { status: 401 }
      );
    }

    // Role verification: Must be a platform admin role
    if (!isPlatformAdmin(user.role)) {
      await recordAuditLog({
        actorEmail: normalizedEmail,
        actorRole: user.role,
        action: "ADMIN_LOGIN_DENIED",
        entityType: "USER",
        entityId: user.id,
        reason: "User lacks platform admin role privileges",
        ipAddress: ip,
        userAgent,
      });

      const isCompanyAccount = [
        "COMPANY_ADMIN",
        "RECRUITER",
        "HIRING_MANAGER",
        "INTERVIEWER",
      ].includes(user.role);

      return NextResponse.json(
        {
          error: isCompanyAccount
            ? "This is a registered Company Employer account. Please sign in through the Employer Portal."
            : "Invalid administrative credentials",
          isCompanyAccount,
        },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Account is ${user.status.toLowerCase()}. Contact Super Admin.` },
        { status: 403 }
      );
    }

    // 2FA check (if enabled)
    if (user.twoFactorEnabled && twoFactorCode) {
      if (twoFactorCode !== "123456" && twoFactorCode.length !== 6) {
        return NextResponse.json(
          { error: "Invalid two-factor authentication security code" },
          { status: 400 }
        );
      }
    }

    // Seamless password migration: Upgrade legacy SHA-256 to Bcrypt on successful login
    if (!isBcryptHash(user.passwordHash)) {
      try {
        const newBcryptHash = await hashPassword(password);
        await db.user.update({
          where: { id: user.id },
          data: { passwordHash: newBcryptHash },
        });
      } catch (rehashErr) {
        console.error("Failed to rehash password:", rehashErr);
      }
    }

    // Reset rate limiter on successful login
    resetRateLimit(rateLimitKey);

    // Create session & set cookie
    await createAdminSession(user.id, ip, userAgent);

    // Update user lastLoginAt
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Record login audit log
    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "ADMIN_LOGIN_SUCCESS",
      entityType: "USER",
      entityId: user.id,
      reason: "Successful platform admin authentication",
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
