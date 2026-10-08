import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";
import { hasPermission, isPlatformAdmin, Permission } from "./permissions";
import {
  hashPassword as hashPwd,
  verifyPassword as verifyPwd,
  verifyPasswordSync,
  hashPasswordSync,
} from "@/lib/auth/password";
import crypto from "crypto";

const SESSION_COOKIE = "cb_admin_session";
const SESSION_DURATION_HOURS = 8;

export function hashPassword(password: string): string {
  return hashPasswordSync(password);
}

export function verifyPassword(password: string, hash: string): boolean {
  return verifyPasswordSync(password, hash);
}

export async function verifyPasswordAsync(password: string, hash: string): Promise<boolean> {
  return await verifyPwd(password, hash);
}

export interface AdminUserSession {
  id: string;
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  permissions: Permission[];
}

export async function getCurrentAdmin(): Promise<AdminUserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const session = await db.adminSession.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) return null;

    // Check realm: Only ADMIN realm is allowed
    if (session.realm && session.realm !== "ADMIN") {
      return null;
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      await db.adminSession.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    // Verify user is active and has platform admin role
    if (session.user.status !== UserStatus.ACTIVE || !isPlatformAdmin(session.user.role)) {
      return null;
    }

    return {
      id: session.user.id,
      sessionId: session.id,
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      phone: session.user.phone,
      avatar: session.user.avatar,
      permissions:
        session.user.role === "SUPER_ADMIN"
          ? (["*"] as any)
          : (await import("./permissions")).ROLE_PERMISSIONS[session.user.role] || [],
    };
  } catch (error) {
    console.error("Error retrieving admin session:", error);
    return null;
  }
}

export async function createAdminSession(userId: string, ip?: string, userAgent?: string): Promise<string> {
  const token = crypto.randomBytes(36).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 3600 * 1000);

  await db.adminSession.create({
    data: {
      token,
      userId,
      realm: "ADMIN",
      ipAddress: ip || "127.0.0.1",
      userAgent: userAgent || "Unknown",
      expiresAt,
    },
  });

  // Set secure cookie
  try {
    cookies().set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  } catch {}

  return token;
}

export async function destroyAdminSession(): Promise<void> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
      await db.adminSession.delete({ where: { token } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE);
    }
  } catch {}
}

export async function verifyAdminAccess(requiredPermission?: Permission): Promise<{
  authorized: boolean;
  admin: AdminUserSession | null;
  error?: string;
}> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { authorized: false, admin: null, error: "Authentication required" };
  }

  if (requiredPermission && !hasPermission(admin.role, requiredPermission)) {
    return {
      authorized: false,
      admin,
      error: `Access Denied: Missing permission '${requiredPermission}'`,
    };
  }

  return { authorized: true, admin };
}

export async function requireAdmin(allowedRoles?: UserRole[]): Promise<{
  authorized: boolean;
  admin: AdminUserSession;
  response?: any;
}> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    const { NextResponse } = await import("next/server");
    return {
      authorized: false,
      admin: null as any,
      response: NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 }),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(admin.role)) {
    const { NextResponse } = await import("next/server");
    return {
      authorized: false,
      admin,
      response: NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 }),
    };
  }

  return { authorized: true, admin };
}
