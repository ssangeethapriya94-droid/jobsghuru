import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCandidateSession } from "@/lib/candidate/auth";
import { calculateProfileCompleteness } from "@/lib/candidate/profileCompleteness";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json(
        { error: "Token and email are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Lookup valid, unexpired, unused token
    const record = await db.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        tokenHash,
        type: "EMAIL_VERIFICATION",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired verification link. Please request a new one." },
        { status: 400 }
      );
    }

    // Burn token
    await db.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    // Activate user
    const user = await db.user.update({
      where: { email: normalizedEmail },
      data: { status: "ACTIVE" },
    });

    // Idempotent Backfill: Link existing applications matching verified email
    const matchingApplications = await db.application.findMany({
      where: { candidateEmail: normalizedEmail },
      orderBy: { appliedAt: "desc" },
    });

    let linkedCount = 0;
    for (const app of matchingApplications) {
      if (app.candidateId !== user.id) {
        await db.application.update({
          where: { id: app.id },
          data: { candidateId: user.id },
        });

        await db.applicationEvent.create({
          data: {
            applicationId: app.id,
            actorId: user.id,
            actorName: user.name || "Candidate",
            actorRole: "CANDIDATE",
            action: "CANDIDATE_LINKED",
            metadata: {
              reason: "Application attached to verified candidate account",
              verifiedEmail: normalizedEmail,
            },
          },
        });
        linkedCount++;
      }
    }

    // Extract prefill data from most recent application if available
    const latestApp = matchingApplications[0];

    const existingProfile = await db.candidateProfile.findUnique({
      where: { userId: user.id },
    });

    if (!existingProfile) {
      const completeness = calculateProfileCompleteness({
        name: user.name,
        email: user.email,
        phone: user.phone || latestApp?.candidatePhone,
        currentCompany: latestApp?.currentCompany,
        currentRole: latestApp?.currentRole,
        totalExperienceYears: latestApp?.experienceYears,
        resumeUrl: latestApp?.resumeUrl,
      });

      await db.candidateProfile.create({
        data: {
          userId: user.id,
          phone: user.phone || latestApp?.candidatePhone || null,
          currentCompany: latestApp?.currentCompany || null,
          currentRole: latestApp?.currentRole || null,
          totalExperienceYears: latestApp?.experienceYears || 0,
          currentCtc: latestApp?.currentCtc || null,
          expectedCtc: latestApp?.expectedCtc || null,
          noticePeriod: latestApp?.noticePeriod || null,
          resumeUrl: latestApp?.resumeUrl || null,
          resumeFileName: latestApp?.resumeFileName || null,
          profileCompleteness: completeness,
          // Privacy defaults (most private)
          searchableByEmployers: false,
          contactableByEmployers: false,
          hideSalaryFromEmployers: true,
          consentGivenAt: new Date(),
          consentVersion: "v1.0",
        },
      });
    }

    // Create active session and issue cookie
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Candidate Browser";
    await createCandidateSession(user.id, ip, userAgent);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully and account activated.",
      applicationsLinked: linkedCount,
      totalApplications: matchingApplications.length,
    });
  } catch (err: any) {
    console.error("Email verification error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify email." },
      { status: 500 }
    );
  }
}
