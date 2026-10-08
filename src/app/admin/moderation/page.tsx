import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminJobsView from "@/components/admin/AdminJobsView";

export const metadata = {
  title: "Job Moderation Queue | JobsGhuru Admin",
};

export default async function AdminModerationPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const jobs = await db.job.findMany({
    where: {
      status: {
        in: ["PENDING_REVIEW", "PAUSED", "REJECTED"],
      },
    },
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

  return (
    <div>
      <div className="mb-5 sm:mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-sm font-extrabold text-amber-900 dark:text-amber-300">
            Trust & Safety Review Queue
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
            This workspace isolates listings awaiting platform moderator clearance, AI risk flags, or user policy compliance.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-500 text-white shrink-0 self-start sm:self-auto shadow-2xs whitespace-nowrap">
          {serialized.length} Pending Actions
        </span>
      </div>
      <AdminJobsView initialJobs={serialized} filterOnlyModeration={true} />
    </div>
  );
}
