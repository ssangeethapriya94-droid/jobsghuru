import { db } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";

export interface ResolvedNotificationRecipient {
  email: string | null;
  userId: string | null;
  isUnrouted: boolean;
}

/**
 * Resolves a real user email for sending employer/company notifications.
 * Priority:
 * 1. Explicit target / preferred user (e.g. assigned interviewer when target)
 * 2. Application's assigned recruiter or job owner
 * 3. Active RECRUITER in Company
 * 4. Active COMPANY_ADMIN in Company
 * 
 * Rules:
 * - NEVER an INTERVIEWER or HIRING_MANAGER unless they are the explicit target.
 * - NEVER invent an email address (no system.local, no recruiter@careerbridge.com).
 * - If no valid recipient exists, returns null email and marks isUnrouted = true with a logged warning.
 */
export async function resolveNotificationRecipient(params: {
  companyId?: string | null;
  applicationId?: string | null;
  preferredUserId?: string | null;
}): Promise<ResolvedNotificationRecipient> {
  const { companyId, applicationId, preferredUserId } = params;

  try {
    // 1. Explicit target / preferred user (if active)
    if (preferredUserId) {
      const preferred = await db.user.findFirst({
        where: {
          id: preferredUserId,
          status: UserStatus.ACTIVE,
          ...(companyId ? { companyId } : {}),
        },
        select: { id: true, email: true },
      });
      if (preferred?.email && preferred.email.includes("@")) {
        return {
          email: preferred.email.toLowerCase().trim(),
          userId: preferred.id,
          isUnrouted: false,
        };
      }
    }

    // 2. Application-level assigned recruiter / job owner
    let derivedCompanyId = companyId;
    if (applicationId) {
      const application = await db.application.findUnique({
        where: { id: applicationId },
        select: {
          assignedRecruiter: {
            select: { id: true, email: true, status: true, role: true },
          },
          job: {
            select: {
              companyId: true,
            },
          },
        },
      });

      if (application) {
        if (!derivedCompanyId) {
          derivedCompanyId = application.job?.companyId;
        }

        if (
          application.assignedRecruiter &&
          application.assignedRecruiter.status === UserStatus.ACTIVE &&
          (application.assignedRecruiter.role === UserRole.RECRUITER ||
            application.assignedRecruiter.role === UserRole.COMPANY_ADMIN)
        ) {
          return {
            email: application.assignedRecruiter.email.toLowerCase().trim(),
            userId: application.assignedRecruiter.id,
            isUnrouted: false,
          };
        }
      }
    }

    if (derivedCompanyId) {
      // 3. Active RECRUITER in Company
      const recruiter = await db.user.findFirst({
        where: {
          companyId: derivedCompanyId,
          role: UserRole.RECRUITER,
          status: UserStatus.ACTIVE,
        },
        orderBy: { createdAt: "asc" },
        select: { id: true, email: true },
      });
      if (recruiter?.email && recruiter.email.includes("@")) {
        return {
          email: recruiter.email.toLowerCase().trim(),
          userId: recruiter.id,
          isUnrouted: false,
        };
      }

      // 4. Active COMPANY_ADMIN in Company
      const admin = await db.user.findFirst({
        where: {
          companyId: derivedCompanyId,
          role: UserRole.COMPANY_ADMIN,
          status: UserStatus.ACTIVE,
        },
        orderBy: { createdAt: "asc" },
        select: { id: true, email: true },
      });
      if (admin?.email && admin.email.includes("@")) {
        return {
          email: admin.email.toLowerCase().trim(),
          userId: admin.id,
          isUnrouted: false,
        };
      }
    }
  } catch (err) {
    console.error("[Notification] Error resolving recipient:", err);
  }

  // If no valid recipient exists, never invent an email address.
  // Store notification with null recipientEmail and mark unrouted.
  console.warn(
    `[Notification] WARNING: No valid active recipient (job owner / assigned recruiter / COMPANY_ADMIN) found for companyId=${companyId}, applicationId=${applicationId}. Storing notification as unrouted (recipientEmail=null).`
  );
  return {
    email: null,
    userId: null,
    isUnrouted: true,
  };
}

/**
 * Backward-compatibility wrapper for getCompanyStaffEmail
 */
export async function getCompanyStaffEmail(
  companyId: string,
  preferredUserId?: string | null,
  applicationId?: string | null
): Promise<{ email: string | null; userId: string | null; isUnrouted: boolean }> {
  return resolveNotificationRecipient({ companyId, preferredUserId, applicationId });
}
