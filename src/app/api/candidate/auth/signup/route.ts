import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/candidate/auth";
import { checkRateLimitAsync } from "@/lib/auth/rateLimit";
import { UserStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = await checkRateLimitAsync(`candidate:signup:${ip}`, 10, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many signup attempts. Please try again in ${rateLimit.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email address, and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    // Look up user safely
    let user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          name: name.trim(),
          passwordHash,
          phone: phone || user.phone,
          status: UserStatus.ACTIVE,
          role: "CANDIDATE",
        },
      });
    } else {
      user = await db.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          phone: phone || null,
          status: UserStatus.ACTIVE,
          role: "CANDIDATE",
          candidateProfile: {
            create: {
              profileCompleteness: 85,
              totalExperienceYears: 2,
              headline: "Software Developer",
              location: "Bengaluru",
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: "Account created successfully. You can now sign in.",
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create account." },
      { status: 500 }
    );
  }
}
