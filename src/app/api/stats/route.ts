import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [totalJobs, totalCompanies, jobs] = await Promise.all([
      db.job.count({ where: { status: "PUBLISHED", expiresAt: { gt: new Date() } } }),
      db.company.count(),
      db.job.findMany({
        where: { status: "PUBLISHED", expiresAt: { gt: new Date() } },
        select: { skills: true, responseRatePct: true, salaryMaxLpa: true, department: true, workMode: true },
      }),
    ]);

    // Calculate aggregated stats
    const avgResponseRate = jobs.length
      ? Math.round(jobs.reduce((acc, j) => acc + j.responseRatePct, 0) / jobs.length)
      : 80;

    let highestSalary = 0;
    const departmentCounts: Record<string, number> = {};
    const skillCounts: Record<string, number> = {};

    for (const job of jobs) {
      if (job.salaryMaxLpa && job.salaryMaxLpa > highestSalary) {
        highestSalary = job.salaryMaxLpa;
      }
      departmentCounts[job.department] = (departmentCounts[job.department] || 0) + 1;
      for (const skill of job.skills) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      }
    }

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      success: true,
      totalJobs,
      totalCompanies,
      avgResponseRate,
      highestSalary,
      departmentCounts,
      topSkills,
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
