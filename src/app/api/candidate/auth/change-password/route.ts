import { NextRequest, NextResponse } from "next/server";
import { requireCandidate, verifyPasswordAsync, hashPassword } from "@/lib/candidate/auth";
import { db } from "@/lib/db";
import { checkRateLimitAsync } from "@/lib/auth/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { authorized, candidate, response } = await requireCandidate();
    if (!authorized) return response!;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = await checkRateLimitAsync(`candidate:change-pwd:${candidate.id}:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many password change attempts. Please try again in ${rateLimit.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: candidate.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    const isMatch = await verifyPasswordAsync(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const newHash = hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to change password." },
      { status: 500 }
    );
  }
}
