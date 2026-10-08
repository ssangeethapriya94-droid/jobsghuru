import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";
import {
  hashPassword as hashPwd,
  verifyPassword as verifyPwd,
  verifyPasswordSync,
  hashPasswordSync,
} from "@/lib/auth/password";
import crypto from "crypto";

export const CANDIDATE_SESSION_COOKIE = "cb_candidate_session";
const SESSION_DURATION_DAYS = 30;

export interface CandidateSessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  status: UserStatus;
  profileId?: string;
  profileCompleteness: number;
}

export function hashPassword(password: string): string {
  return hashPasswordSync(password);
}

export function verifyPassword(password: string, hash: string): boolean {
  return verifyPasswordSync(password, hash);
}

export async function verifyPasswordAsync(password: string, hash: string): Promise<boolean> {
  return await verifyPwd(password, hash);
}

/**
 * Retrieves the currently authenticated Candidate from the cb_candidate_session cookie.
 * Strictly verifies role === CANDIDATE and status === ACTIVE.
 */
export async function getCurrentCandidate(): Promise<CandidateSessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(CANDIDATE_SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const session = await db.candidateSession.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            candidateProfile: true,
          },
        },
      },
    });

    if (!session) return null;

    // Check expiration
    if (new Date() > session.expiresAt) {
      await db.candidateSession.delete({ where: { token } }).catch(() => {});
      return null;
    }

    const u = session.user;

    // Strict Candidate Realm Verification: Role MUST be CANDIDATE and status ACTIVE
    if (u.role !== UserRole.CANDIDATE || u.status !== UserStatus.ACTIVE) {
      return null;
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      avatar: u.avatar,
      status: u.status,
      profileId: u.candidateProfile?.id,
      profileCompleteness: u.candidateProfile?.profileCompleteness ?? 0,
    };
  } catch (err) {
    console.error("Error retrieving candidate session:", err);
    return null;
  }
}

/**
 * Creates a persistent CandidateSession in the database and sets the cb_candidate_session cookie.
 */
export async function createCandidateSession(
  userId: string,
  ip?: string,
  userAgent?: string
): Promise<string> {
  const token = crypto.randomBytes(36).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 3600 * 1000);

  await db.candidateSession.create({
    data: {
      token,
      userId,
      ipAddress: ip || "127.0.0.1",
      userAgent: userAgent || "Candidate Browser",
      expiresAt,
    },
  });

  try {
    cookies().set(CANDIDATE_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  } catch {}

  return token;
}

/**
 * Destroys the candidate session in DB and clears the cookie.
 */
export async function destroyCandidateSession(): Promise<void> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(CANDIDATE_SESSION_COOKIE)?.value;
    if (token) {
      await db.candidateSession.delete({ where: { token } }).catch(() => {});
      cookieStore.delete(CANDIDATE_SESSION_COOKIE);
    }
  } catch {}
}

/**
 * Route protection helper for candidate-only API endpoints.
 */
export async function requireCandidate() {
  const candidate = await getCurrentCandidate();
  if (!candidate) {
    return {
      authorized: false as const,
      candidate: null,
      response: NextResponse.json(
        { error: "Unauthorized: Active candidate session required." },
        { status: 401 }
      ),
    };
  }

  return {
    authorized: true as const,
    candidate,
    response: null,
  };
}

/**
 * Idempotently links all unlinked applications matching candidate email to candidate account.
 */
export async function backfillCandidateApplications(userId: string, email: string): Promise<{ linkedCount: number; totalMatching: number }> {
  const normalizedEmail = email.toLowerCase().trim();
  const matchingApplications = await db.application.findMany({
    where: { candidateEmail: normalizedEmail },
    orderBy: { appliedAt: "desc" },
  });

  const user = await db.user.findUnique({ where: { id: userId } });
  let linkedCount = 0;

  for (const app of matchingApplications) {
    if (app.candidateId !== userId) {
      await db.application.update({
        where: { id: app.id },
        data: { candidateId: userId },
      });

      await db.applicationEvent.create({
        data: {
          applicationId: app.id,
          actorId: userId,
          actorName: user?.name || "Candidate",
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

  return {
    linkedCount,
    totalMatching: matchingApplications.length,
  };
}

