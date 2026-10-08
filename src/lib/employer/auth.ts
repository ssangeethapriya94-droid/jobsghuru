import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";
import { EmployerSessionUser } from "./types";
import {
  hashPassword as hashPwd,
  verifyPassword as verifyPwd,
  verifyPasswordSync,
  hashPasswordSync,
} from "@/lib/auth/password";
import crypto from "crypto";

const EMPLOYER_SESSION_COOKIE = "cb_employer_session";
const SESSION_DURATION_HOURS = 24;

export const EMPLOYER_ROLES: UserRole[] = [
  UserRole.COMPANY_ADMIN,
  UserRole.RECRUITER,
  UserRole.HIRING_MANAGER,
  UserRole.INTERVIEWER,
];

export function hashPassword(password: string): string {
  return hashPasswordSync(password);
}

export function verifyPassword(password: string, hash: string): boolean {
  return verifyPasswordSync(password, hash);
}

export async function verifyPasswordAsync(password: string, hash: string): Promise<boolean> {
  return await verifyPwd(password, hash);
}

export async function getCurrentEmployer(): Promise<EmployerSessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(EMPLOYER_SESSION_COOKIE)?.value;

  if (token) {
    try {
      const session = await db.adminSession.findUnique({
        where: { token },
        include: {
          user: {
            include: { company: true },
          },
        },
      });

      if (!session) return null;

      // Realm check: Must be EMPLOYER realm
      if (session.realm && session.realm !== "EMPLOYER") {
        return null;
      }

      if (new Date() <= session.expiresAt && session.user.status === UserStatus.ACTIVE) {
        const u = session.user;

        // Role check: Must be an authorized employer role
        if (!EMPLOYER_ROLES.includes(u.role)) {
          return null;
        }

        const c = u.company;
        if (c && c.verified) {
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone,
            avatar: u.avatar,
            companyId: c.id,
            companyName: c.name,
            companySlug: c.slug,
            companyVerified: c.verified,
            companyLogo: c.logo,
            industry: c.industry,
          };
        }
      }
    } catch (e) {
      console.error("Error retrieving employer session:", e);
    }
  }

  return null;
}

export async function createEmployerSession(userId: string, ip?: string, userAgent?: string): Promise<string> {
  const token = crypto.randomBytes(36).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 3600 * 1000);

  await db.adminSession.create({
    data: {
      token,
      userId,
      realm: "EMPLOYER",
      ipAddress: ip || "127.0.0.1",
      userAgent: userAgent || "Employer Browser",
      expiresAt,
    },
  });

  try {
    cookies().set(EMPLOYER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  } catch {}

  return token;
}

export async function destroyEmployerSession(): Promise<void> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(EMPLOYER_SESSION_COOKIE)?.value;
    if (token) {
      await db.adminSession.delete({ where: { token } }).catch(() => {});
      cookieStore.delete(EMPLOYER_SESSION_COOKIE);
    }
  } catch {}
}

export async function requireEmployer(allowedRoles?: UserRole[]) {
  const employer = await getCurrentEmployer();
  if (!employer) {
    return {
      authorized: false as const,
      employer: null,
      response: NextResponse.json(
        { error: "Unauthorized: Active employer session required." },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(employer.role)) {
    return {
      authorized: false as const,
      employer,
      response: NextResponse.json(
        { error: "Forbidden: Insufficient permissions for this action." },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    employer,
    response: null,
  };
}
