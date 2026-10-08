import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { JobSearchFilters } from "@/lib/ai/schemas";

export async function searchJobsInDatabase(filters: JobSearchFilters, limit = 15) {
  const and: Prisma.JobWhereInput[] = [
    { status: "PUBLISHED" },
    { expiresAt: { gt: new Date() } },
  ];

  // 1. Role / Title filter
  if (filters.role && filters.role.trim()) {
    const roleTerm = filters.role.trim();
    and.push({
      OR: [
        { title: { contains: roleTerm, mode: "insensitive" } },
        { department: { contains: roleTerm, mode: "insensitive" } },
      ],
    });
  }

  // 2. Skills filter
  if (filters.skills && filters.skills.length > 0) {
    const skillTerms = filters.skills.map((s) => s.trim()).filter(Boolean);
    if (skillTerms.length > 0) {
      and.push({
        OR: skillTerms.map((skill) => ({
          skills: {
            hasSome: [
              skill,
              skill.toLowerCase(),
              skill[0].toUpperCase() + skill.slice(1),
            ],
          },
        })),
      });
    }
  }

  // 3. Location filter
  if (filters.location && filters.location.length > 0) {
    const locationConditions: Prisma.JobWhereInput[] = [];

    for (const loc of filters.location) {
      const locClean = loc.trim();
      if (!locClean || locClean.toLowerCase() === "all locations") continue;

      if (locClean.toLowerCase() === "remote") {
        locationConditions.push({ workMode: "REMOTE" });
        locationConditions.push({ location: { contains: "remote", mode: "insensitive" } });
      } else {
        locationConditions.push({ location: { contains: locClean, mode: "insensitive" } });
        if (locClean.toLowerCase().includes("bangalore") || locClean.toLowerCase().includes("bengaluru")) {
          locationConditions.push({ location: { contains: "Bengaluru", mode: "insensitive" } });
          locationConditions.push({ location: { contains: "Bangalore", mode: "insensitive" } });
        }
      }
    }

    if (locationConditions.length > 0) {
      and.push({ OR: locationConditions });
    }
  }

  // 4. Work mode filter
  if (filters.workMode && filters.workMode !== "ANY") {
    and.push({ workMode: filters.workMode });
  }

  // 5. Job type filter
  if (filters.jobType && filters.jobType !== "ANY") {
    and.push({ jobType: filters.jobType });
  }

  // 6. Experience filter
  if (filters.experienceMin !== undefined && filters.experienceMin > 0) {
    // Return jobs where maxExp is at least the candidate's minExp, or minExp is within range
    and.push({
      OR: [
        { maxExp: { gte: filters.experienceMin } },
        { minExp: { lte: filters.experienceMin } },
      ],
    });
  }

  // 7. Salary filter (in LPA)
  if (filters.salaryMinLpa !== undefined && filters.salaryMinLpa > 0) {
    and.push({
      salaryMaxLpa: { gte: filters.salaryMinLpa },
    });
  }

  // 8. Verified companies only
  if (filters.verifiedOnly) {
    and.push({
      company: { verified: true },
    });
  }

  const where: Prisma.JobWhereInput = { AND: and };

  const jobs = await db.job.findMany({
    where,
    orderBy: [
      { postedAt: "desc" },
      { responseRatePct: "desc" },
    ],
    take: limit,
    include: {
      company: true,
    },
  });

  const totalCount = await db.job.count({ where });

  return {
    jobs,
    totalCount,
  };
}
