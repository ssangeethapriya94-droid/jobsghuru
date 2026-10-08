import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPasswordAsync, createCandidateSession } from "@/lib/candidate/auth";
import { checkRateLimitAsync } from "@/lib/auth/rateLimit";
import { UserRole, UserStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Candidate Browser";

    const rateLimit = await checkRateLimitAsync(`candidate:login:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rateLimit.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { candidateProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Strict realm isolation: Candidate realm only accepts CANDIDATE role
    if (user.role !== UserRole.CANDIDATE) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === UserStatus.PENDING_VERIFICATION) {
      return NextResponse.json(
        {
          error: "Please verify your email address before logging in.",
          requiresVerification: true,
          email: normalizedEmail,
        },
        { status: 403 }
      );
    }

    if (user.status === UserStatus.SUSPENDED) {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Verify password with Bcrypt / SHA-256 fallback
    const isValid = await verifyPasswordAsync(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create CandidateSession
    await createCandidateSession(user.id, ip, userAgent);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        profileCompleteness: user.candidateProfile?.profileCompleteness || 0,
      },
    });
  } catch (err: any) {
    console.error("Candidate login error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to log in." },
      { status: 500 }
    );
  }
}
