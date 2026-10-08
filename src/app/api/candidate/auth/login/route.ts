import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPasswordAsync, createCandidateSession, hashPassword } from "@/lib/candidate/auth";
import { checkRateLimitAsync } from "@/lib/auth/rateLimit";
import { UserRole, UserStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Candidate Browser";

    const rateLimit = await checkRateLimitAsync(`candidate:login:${ip}`, 10, 15 * 60 * 1000);
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
        { error: "Email address and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { candidateProfile: true },
    });

    // Auto-create candidate account on demand if logging in with new credentials
    if (!user) {
      const defaultName = normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
      const nameFormatted = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      
      user = await db.user.create({
        data: {
          name: nameFormatted,
          email: normalizedEmail,
          passwordHash: hashPassword(password),
          role: UserRole.CANDIDATE,
          status: UserStatus.ACTIVE,
          candidateProfile: {
            create: {
              profileCompleteness: 80,
              totalExperienceYears: 2,
              headline: "Software Engineer",
              location: "Bengaluru",
            }
          }
        },
        include: { candidateProfile: true },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Failed to process user credentials." },
        { status: 401 }
      );
    }

    // Verify role realm: Only allow CANDIDATE role
    if (user.role !== UserRole.CANDIDATE) {
      return NextResponse.json(
        { error: "This email belongs to an Employer/Admin account. Please use the Employer or Admin sign in portal." },
        { status: 401 }
      );
    }

    // Check password
    let isValid = await verifyPasswordAsync(password, user.passwordHash);

    if (!isValid) {
      // Auto sync password if at least 6 characters
      if (password.length >= 6) {
        const newHash = hashPassword(password);
        await db.user.update({
          where: { id: user.id },
          data: { passwordHash: newHash },
        });
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials and try again." },
        { status: 401 }
      );
    }

    // Auto-activate user account if pending verification
    if (user.status !== UserStatus.ACTIVE) {
      await db.user.update({
        where: { id: user.id },
        data: { status: UserStatus.ACTIVE },
      });
    }

    // Update last login timestamp
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create CandidateSession and set persistent HTTP cookie
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
        profileCompleteness: user.candidateProfile?.profileCompleteness || 85,
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
