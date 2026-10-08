import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createEmployerSession, EMPLOYER_ROLES } from "@/lib/employer/auth";
import { UserStatus } from "@prisma/client";
import { verifyPassword, hashPassword, isBcryptHash } from "@/lib/auth/password";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Work email address and password are required." },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Rate Limiting Check
    const rateLimitKey = `login:employer:${ip}:${cleanEmail}`;
    const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many failed login attempts. Please try again in ${rateCheck.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    // Look up user
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
      include: {
        company: {
          include: {
            verifications: {
              orderBy: { submittedAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    // Check user existence and verify password
    const isPasswordValid = user ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    // Role check: Must be an employer role only (Strict Realm Separation)
    if (!EMPLOYER_ROLES.includes(user.role)) {
      const isAdminAccount = [
        "SUPER_ADMIN",
        "PLATFORM_ADMIN",
        "MODERATION_ADMIN",
        "SUPPORT_ADMIN",
        "FINANCE_ADMIN",
        "AI_ADMIN",
        "ANALYTICS_ADMIN",
      ].includes(user.role);

      return NextResponse.json(
        {
          error: isAdminAccount
            ? "This is a CareerBridge Platform Admin account. Please sign in via the Admin Portal."
            : "Invalid credentials or unauthorized access.",
          isAdminAccount,
        },
        { status: 401 }
      );
    }

    // Check Suspension
    if (user.status === UserStatus.SUSPENDED) {
      return NextResponse.json(
        { error: "This account has been suspended by administration. Please contact support." },
        { status: 403 }
      );
    }

    // Check Company Verification Status
    const isCompanyVerified = user.company?.verified;
    const isUserPending = user.status === UserStatus.PENDING_VERIFICATION;

    if (!isCompanyVerified || isUserPending) {
      return NextResponse.json(
        {
          error: "Your company registration is currently pending admin approval. Once approved, you will receive an official approval email with your login credentials to access your company dashboard.",
          pendingApproval: true,
          companyName: user.company?.name || "Your Company",
        },
        { status: 403 }
      );
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
        console.error("Failed to rehash employer password:", rehashErr);
      }
    }

    // Reset rate limiter on successful login
    resetRateLimit(rateLimitKey);

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create Employer Session
    await createEmployerSession(user.id, ip, userAgent);

    return NextResponse.json({
      success: true,
      isAdmin: false,
      role: user.role,
      redirectUrl: "/employer/dashboard",
      companyName: user.company?.name,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.company?.name,
        companyId: user.companyId,
      },
    });
  } catch (err: any) {
    console.error("Employer login error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again.", message: err?.message, stack: err?.stack },
      { status: 500 }
    );
  }
}
