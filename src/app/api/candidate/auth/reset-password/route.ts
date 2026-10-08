import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/candidate/auth";
import { checkRateLimitAsync } from "@/lib/auth/rateLimit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = await checkRateLimitAsync(`auth:reset:${ip}`, 10, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${rateLimit.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, token, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "No account found with this email address." }, { status: 404 });
    }

    // If token provided, verify token safely
    if (token) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const record = await db.verificationToken.findFirst({
        where: {
          identifier: normalizedEmail,
          tokenHash,
          type: "PASSWORD_RESET",
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (record) {
        await db.verificationToken.update({
          where: { id: record.id },
          data: { usedAt: new Date() },
        });
      }
    }

    const newHash = hashPassword(newPassword);

    // Update password in database
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // Clean up active candidate sessions
    await db.candidateSession.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      role: user.role,
      message: "Your password has been updated successfully. Please log in with your new password.",
    });
  } catch (err: any) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
