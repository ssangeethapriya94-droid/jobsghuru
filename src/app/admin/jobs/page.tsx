import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminJobsView from "@/components/admin/AdminJobsView";

export const metadata = {
  title: "Job Oversight & Governance | JobsGhuru Admin",
};

export default async function AdminJobsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const jobs = await db.job.findMany({
    orderBy: { postedAt: "desc" },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          verified: true,
        },
      },
      _count: {
        select: { applications: true },
      },
    },
    take: 80,
  });

  const serialized = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    department: j.department,
    location: j.location,
    workMode: j.workMode,
    jobType: j.jobType,
    minExp: j.minExp,
    maxExp: j.maxExp,
    salaryMinLpa: j.salaryMinLpa,
    salaryMaxLpa: j.salaryMaxLpa,
    status: j.status,
    skills: j.skills,
    description: j.description,
    postedAt: j.postedAt.toISOString(),
    company: {
      id: j.company.id,
      name: j.company.name,
      verified: j.company.verified,
    },
    _count: j._count,
  }));

  return <AdminJobsView initialJobs={serialized} filterOnlyModeration={false} />;
}
