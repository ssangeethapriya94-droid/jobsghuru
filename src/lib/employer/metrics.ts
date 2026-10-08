import { db } from "@/lib/db";

export async function calculateCompanyResponseTimeHours(companyId: string): Promise<{ medianHours: number; responseRatePct: number }> {
  // Fetch application event timestamps
  const events = await db.applicationEvent.findMany({
    where: {
      application: { job: { companyId } },
      action: { in: ["APPLIED", "REVIEWED", "MOVED_STAGE", "INTERVIEW_SCHEDULED", "OFFER_SENT"] },
    },
    orderBy: { createdAt: "asc" },
  });

  if (events.length === 0) {
    return { medianHours: 24, responseRatePct: 90 }; // Default baseline for new companies
  }

  // Group events by applicationId
  const appMap: Record<string, { appliedAt?: Date; firstResponseAt?: Date }> = {};

  for (const e of events) {
    if (!appMap[e.applicationId]) {
      appMap[e.applicationId] = {};
    }

    if (e.action === "APPLIED" && !appMap[e.applicationId].appliedAt) {
      appMap[e.applicationId].appliedAt = e.createdAt;
    } else if (e.action !== "APPLIED" && !appMap[e.applicationId].firstResponseAt) {
      appMap[e.applicationId].firstResponseAt = e.createdAt;
    }
  }

  const responseDurationsHours: number[] = [];
  let totalApps = 0;
  let respondedApps = 0;

  for (const appId in appMap) {
    const data = appMap[appId];
    if (data.appliedAt) {
      totalApps++;
      if (data.firstResponseAt) {
        respondedApps++;
        const diffMs = data.firstResponseAt.getTime() - data.appliedAt.getTime();
        const diffHours = Math.max(1, Math.round(diffMs / (1000 * 3600)));
        responseDurationsHours.push(diffHours);
      }
    }
  }

  if (responseDurationsHours.length === 0) {
    return { medianHours: 24, responseRatePct: totalApps > 0 ? 0 : 90 };
  }

  responseDurationsHours.sort((a, b) => a - b);
  const mid = Math.floor(responseDurationsHours.length / 2);
  const medianHours = responseDurationsHours.length % 2 !== 0
    ? responseDurationsHours[mid]
    : Math.round((responseDurationsHours[mid - 1] + responseDurationsHours[mid]) / 2);

  const responseRatePct = Math.round((respondedApps / totalApps) * 100);

  return { medianHours, responseRatePct };
}
