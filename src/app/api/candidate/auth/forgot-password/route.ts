import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimitAsync } from "@/lib/auth/rateLimit";
import { queueAndSendEmail } from "@/lib/email/outbox";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = await checkRateLimitAsync(`candidate:forgot:${ip}`, 3, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many password reset requests. Please try again in ${rateLimit.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Only allow active candidates to reset password
    if (user && user.role === "CANDIDATE" && user.status === "ACTIVE") {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 2 * 3600 * 1000); // 2 hours

      await db.verificationToken.deleteMany({
        where: { identifier: normalizedEmail, type: "PASSWORD_RESET" },
      });

      await db.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          tokenHash,
          type: "PASSWORD_RESET",
          expiresAt,
        },
      });

      const resetUrl = `${req.nextUrl.origin}/candidate/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #2563eb; margin-bottom: 12px;">Reset Your Candidate Password</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hi ${user.name},</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">We received a request to reset your JobsGuru password. Click the button below to choose a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">This link is valid for 2 hours. If you did not make this request, you can safely ignore this email.</p>
        </div>
      `;

      await queueAndSendEmail({
        to: normalizedEmail,
        subject: "Reset your password - JobsGuru Candidate Portal",
        html,
        template: "CANDIDATE_PASSWORD_RESET",
        payload: { userId: user.id },
      });
    }

    // Always return generic message to avoid email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, password reset instructions have been sent.",
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process request." },
      { status: 500 }
    );
  }
}
