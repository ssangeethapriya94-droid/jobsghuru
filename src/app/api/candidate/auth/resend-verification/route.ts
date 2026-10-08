import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimitAsync } from "@/lib/auth/rateLimit";
import { queueAndSendEmail } from "@/lib/email/outbox";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = await checkRateLimitAsync(`candidate:resend:${ip}`, 3, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many resend attempts. Please try again in ${rateLimit.retryAfterSec} seconds.` },
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

    if (user && user.status === "PENDING_VERIFICATION") {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);

      await db.verificationToken.deleteMany({
        where: { identifier: normalizedEmail, type: "EMAIL_VERIFICATION" },
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
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hi ${user.name},</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Here is your new verification link. Click the button below to activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Link expires in 24 hours.</p>
        </div>
      `;

      await queueAndSendEmail({
        to: normalizedEmail,
        subject: "Verify your email - JobsGuru Candidate Portal",
        html,
        template: "CANDIDATE_RESEND_VERIFICATION",
        payload: { userId: user.id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an unverified account exists for this email, a new verification link has been sent.",
    });
  } catch (err: any) {
    console.error("Resend verification error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to resend verification email." },
      { status: 500 }
    );
  }
}
