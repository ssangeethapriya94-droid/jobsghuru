import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { EMPLOYER_ROLES } from "@/lib/employer/auth";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "A valid official work email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Neutral response message to prevent account enumeration
    const neutralSuccessResponse = NextResponse.json({
      success: true,
      message: "If an employer account exists for this email, password reset instructions have been sent.",
    });

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { company: true },
    });

    if (!user || !EMPLOYER_ROLES.includes(user.role)) {
      return neutralSuccessResponse;
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

    // Revoke any active password reset tokens for this email
    await db.verificationToken.updateMany({
      where: {
        identifier: normalizedEmail,
        type: "PASSWORD_RESET",
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Create new token record
    await db.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        tokenHash,
        type: "PASSWORD_RESET",
        expiresAt,
      },
    });

    // Construct official reset link using configured application base URL or origin
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${origin}/employer/reset-password?token=${rawToken}`;

    // Send email
    await sendPasswordResetEmail({
      toEmail: user.email,
      recipientName: user.name,
      resetUrl,
    }).catch((err: any) => console.error("Error sending password reset email:", err));

    return neutralSuccessResponse;
  } catch (error: any) {
    console.error("Error in employer forgot-password route:", error);
    return NextResponse.json(
      { error: "Unable to process password reset request." },
      { status: 500 }
    );
  }
}
