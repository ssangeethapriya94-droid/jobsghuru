import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/candidate/auth";
import { checkRateLimitAsync } from "@/lib/auth/rateLimit";
import { queueAndSendEmail } from "@/lib/email/outbox";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = await checkRateLimitAsync(`candidate:signup:${ip}`, 5, 15 * 60 * 1000);
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
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    // Look up user safely
    let user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // If user is already active candidate, generic response to prevent email enumeration
      if (user.status === "ACTIVE" && user.passwordHash !== "candidate_unclaimed_profile") {
        return NextResponse.json({
          success: true,
          message: "Registration initiated. If your email is eligible, a verification link has been sent.",
        });
      }

      // If user exists as unclaimed or pending, update password and mark pending verification
      user = await db.user.update({
        where: { id: user.id },
        data: {
          name: name.trim(),
          passwordHash,
          phone: phone || user.phone,
          status: "PENDING_VERIFICATION",
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
          status: "PENDING_VERIFICATION",
          role: "CANDIDATE",
        },
      });
    }

    // Generate secure raw verification token & hash it for storage
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours

    // Invalidate old tokens
    await db.verificationToken.deleteMany({
      where: {
        identifier: normalizedEmail,
        type: "EMAIL_VERIFICATION",
      },
    });

    await db.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        tokenHash,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });

    const verifyUrl = `${req.nextUrl.origin}/candidate/verify-email?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #2563eb; margin-bottom: 12px;">Verify Your Candidate Account</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Thank you for creating an account on JobsGuru. Please click the button below to verify your email address and activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This verification link expires in 24 hours. If you did not create this account, you can safely ignore this message.</p>
      </div>
    `;

    await queueAndSendEmail({
      to: normalizedEmail,
      subject: "Verify your email - JobsGuru Candidate Portal",
      html,
      template: "CANDIDATE_EMAIL_VERIFICATION",
      payload: { userId: user.id, email: normalizedEmail },
    });

    return NextResponse.json({
      success: true,
      message: "Registration initiated. If your email is eligible, a verification link has been sent.",
    });
  } catch (err: any) {
    console.error("Candidate signup error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process registration." },
      { status: 500 }
    );
  }
}
