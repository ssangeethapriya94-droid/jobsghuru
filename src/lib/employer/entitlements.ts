import { db } from "@/lib/db";

export async function getCompanyPlanInfo(companyId: string) {
  // Find active subscription or default to starter
  const subscription = await db.subscription.findFirst({
    where: {
      companyId,
      status: "ACTIVE",
      currentEnd: { gte: new Date() },
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (subscription) {
    return {
      planCode: subscription.plan.name.toUpperCase().includes("GROWTH")
        ? "GROWTH"
        : subscription.plan.name.toUpperCase().includes("PROFESSIONAL")
        ? "PROFESSIONAL"
        : subscription.plan.name.toUpperCase().includes("ENTERPRISE")
        ? "ENTERPRISE"
        : "STARTER",
      planName: subscription.plan.name,
      jobLimit: subscription.plan.jobLimit || 10,
      active: true,
      currentEnd: subscription.currentEnd,
    };
  }

  // Fallback to database EmployerPlan
  const employerPlan = await db.employerPlan.findFirst({
    where: { code: "GROWTH" },
  });

  return {
    planCode: employerPlan?.code || "GROWTH",
    planName: employerPlan?.name || "Growth Partnership",
    jobLimit: employerPlan?.jobPostingLimit || 10,
    active: true,
    currentEnd: new Date(Date.now() + 30 * 86400000),
  };
}

export async function canPostJob(companyId: string) {
  const planInfo = await getCompanyPlanInfo(companyId);
  const activeJobsCount = await db.job.count({
    where: {
      companyId,
      status: { in: ["PUBLISHED", "PENDING_REVIEW"] },
      expiresAt: { gt: new Date() },
    },
  });

  const allowed = activeJobsCount < planInfo.jobLimit;
  return {
    allowed,
    current: activeJobsCount,
    limit: planInfo.jobLimit,
    reason: allowed
      ? undefined
      : `You have reached your active job posting limit (${activeJobsCount}/${planInfo.jobLimit}). Upgrade your plan to post more jobs.`,
  };
}

export async function canSearchCandidates(companyId: string) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  let credit = await db.candidateSearchCredit.findUnique({
    where: {
      companyId_month: {
        companyId,
        month: currentMonth,
      },
    },
  });

  if (!credit) {
    credit = await db.candidateSearchCredit.create({
      data: {
        companyId,
        month: currentMonth,
        total: 250,
        used: 0,
      },
    });
  }

  const remaining = Math.max(0, credit.total - credit.used);
  return {
    allowed: remaining > 0,
    total: credit.total,
    used: credit.used,
    remaining,
    reason: remaining > 0 ? undefined : "Monthly candidate search credits exhausted. Purchase search add-ons or upgrade your plan.",
  };
}

export async function consumeSearchCredit(companyId: string, amount: number = 1) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return db.candidateSearchCredit.upsert({
    where: {
      companyId_month: {
        companyId,
        month: currentMonth,
      },
    },
    update: {
      used: { increment: amount },
    },
    create: {
      companyId,
      month: currentMonth,
      total: 250,
      used: amount,
    },
  });
}

export async function canUseAI(companyId: string) {
  const planInfo = await getCompanyPlanInfo(companyId);
  const allowed = planInfo.planCode !== "STARTER";
  return {
    allowed,
    reason: allowed ? undefined : "Recruiter AI features are available on Growth, Professional, and Enterprise plans.",
  };
}
