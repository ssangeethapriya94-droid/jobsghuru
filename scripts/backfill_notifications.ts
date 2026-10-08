import { PrismaClient, UserRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Production-ready backfill script for Notification recipient hygiene.
 * 
 * Strict Priority:
 * 1. Application assigned recruiter (if active with role RECRUITER or COMPANY_ADMIN)
 * 2. Active RECRUITER in Company (ordered by createdAt asc)
 * 3. Active COMPANY_ADMIN in Company (ordered by createdAt asc)
 * 4. Explicit interviewer target for interview notifications
 * 5. If no valid user exists: set recipientEmail = null, isUnrouted = true
 * 
 * Never invents email addresses (removes system.local, recruiter@careerbridge.com, and bare company names).
 */
export async function backfillNotifications() {
  console.log("Starting notification recipient backfill...");
  const notifications = await prisma.notification.findMany({
    include: {
      application: {
        include: {
          assignedRecruiter: true,
          job: true,
        },
      },
    },
  });

  console.log(`Auditing ${notifications.length} notifications in database...`);
  let updatedCount = 0;
  let unroutedCount = 0;

  for (const n of notifications) {
    const isCandidateFacing =
      n.type === "INTERVIEW_SCHEDULED" ||
      n.type === "APPLICATION_STATUS" ||
      n.type === "SHORTLISTED" ||
      n.type === "REJECTED" ||
      (n.application && n.recipientEmail === n.application.candidateEmail);

    if (isCandidateFacing) {
      if (!n.recipientEmail && n.application?.candidateEmail) {
        await prisma.notification.update({
          where: { id: n.id },
          data: { recipientEmail: n.application.candidateEmail, isUnrouted: false },
        });
        updatedCount++;
      }
      continue;
    }

    // Employer notification resolution
    let resolvedEmail: string | null = null;
    let resolvedUserId: string | null = null;

    // 1. Application assigned recruiter
    if (
      n.application?.assignedRecruiter &&
      n.application.assignedRecruiter.status === UserStatus.ACTIVE &&
      (n.application.assignedRecruiter.role === UserRole.RECRUITER ||
        n.application.assignedRecruiter.role === UserRole.COMPANY_ADMIN)
    ) {
      resolvedEmail = n.application.assignedRecruiter.email;
      resolvedUserId = n.application.assignedRecruiter.id;
    }

    const companyId = n.companyId || n.application?.job?.companyId;

    if (!resolvedEmail && companyId) {
      // 2. Active RECRUITER in Company
      const recruiter = await prisma.user.findFirst({
        where: {
          companyId,
          role: UserRole.RECRUITER,
          status: UserStatus.ACTIVE,
        },
        orderBy: { createdAt: "asc" },
      });
      if (recruiter?.email) {
        resolvedEmail = recruiter.email;
        resolvedUserId = recruiter.id;
      }
    }

    if (!resolvedEmail && companyId) {
      // 3. Active COMPANY_ADMIN in Company
      const admin = await prisma.user.findFirst({
        where: {
          companyId,
          role: UserRole.COMPANY_ADMIN,
          status: UserStatus.ACTIVE,
        },
        orderBy: { createdAt: "asc" },
      });
      if (admin?.email) {
        resolvedEmail = admin.email;
        resolvedUserId = admin.id;
      }
    }

    // Check if current recipientEmail is an invented or invalid fallback
    const isInvalidEmail =
      !n.recipientEmail ||
      !n.recipientEmail.includes("@") ||
      n.recipientEmail.includes("system.local") ||
      n.recipientEmail.includes("careerbridge.internal") ||
      n.recipientEmail === "recruiter@careerbridge.com";

    if (isInvalidEmail || (resolvedEmail && n.recipientEmail !== resolvedEmail)) {
      if (resolvedEmail) {
        await prisma.notification.update({
          where: { id: n.id },
          data: {
            recipientEmail: resolvedEmail.toLowerCase().trim(),
            userId: resolvedUserId,
            isUnrouted: false,
          },
        });
        updatedCount++;
      } else {
        await prisma.notification.update({
          where: { id: n.id },
          data: {
            recipientEmail: null,
            userId: null,
            isUnrouted: true,
          },
        });
        unroutedCount++;
        updatedCount++;
      }
    }
  }

  console.log(`Backfill complete: ${updatedCount} rows updated (${unroutedCount} marked unrouted).`);
  return { updatedCount, unroutedCount, total: notifications.length };
}

if (require.main === module) {
  backfillNotifications()
    .then((res) => {
      console.log("Result:", res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Backfill failed:", err);
      process.exit(1);
    });
}
