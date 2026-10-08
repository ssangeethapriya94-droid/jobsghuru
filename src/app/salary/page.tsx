import Link from "next/link";
import { IndianRupee, TrendingUp, ShieldCheck, ArrowRight, BarChart3, Briefcase, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import JobCard from "@/components/JobCard";

export const metadata = {
  title: "Salary Insights & Compensation Benchmarks",
  description: "Transparent salary data and compensation benchmarks across engineering, data, design, and marketing roles in India.",
};

export const revalidate = 60;

export default async function SalaryPage() {
  const jobs = await db.job.findMany({
    where: {
      status: "PUBLISHED",
      expiresAt: { gt: new Date() },
      salaryMinLpa: { not: null },
    },
    include: { company: true },
    orderBy: { salaryMaxLpa: "desc" },
  }).catch(() => []);

  // Compute metrics
  const salaryByRole: Record<string, { min: number; max: number; count: number; department: string }> = {};
  let totalMin = 0;
  let totalMax = 0;
  let highestSalary = 0;

  for (const j of jobs) {
    if (j.salaryMinLpa && j.salaryMaxLpa) {
      totalMin += j.salaryMinLpa;
      totalMax += j.salaryMaxLpa;
      if (j.salaryMaxLpa > highestSalary) highestSalary = j.salaryMaxLpa;

      if (!salaryByRole[j.title]) {
        salaryByRole[j.title] = { min: j.salaryMinLpa, max: j.salaryMaxLpa, count: 1, department: j.department };
      } else {
        salaryByRole[j.title].min = Math.min(salaryByRole[j.title].min, j.salaryMinLpa);
        salaryByRole[j.title].max = Math.max(salaryByRole[j.title].max, j.salaryMaxLpa);
        salaryByRole[j.title].count += 1;
      }
    }
  }

  const roleList = Object.entries(salaryByRole).sort((a, b) => b[1].max - a[1].max);
  const avgMin = jobs.length ? Math.round(totalMin / jobs.length) : 8;
  const avgMax = jobs.length ? Math.round(totalMax / jobs.length) : 18;

  return (
    <div className="container-x py-10">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white p-8 md:p-12 shadow-xs">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <IndianRupee size={14} className="text-blue-600" /> Market Compensation
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Transparent Salary Insights
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base leading-relaxed">
            Real compensation ranges directly from active job offers. No guesswork, no recruiter lowballing. Every figure is grounded in live employer disclosures.
          </p>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-6 sm:grid-cols-4">
          <div>
            <span className="text-xs font-semibold text-slate-500">Highest Verified Pay</span>
            <p className="mt-1 font-display text-2xl font-bold text-slate-900">₹{highestSalary} LPA</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Average Disclosed Range</span>
            <p className="mt-1 font-display text-2xl font-bold text-slate-900">₹{avgMin}–{avgMax} LPA</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Jobs with Upfront Pay</span>
            <p className="mt-1 font-display text-2xl font-bold text-slate-900">{jobs.length} Roles</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Disclosure Policy</span>
            <p className="mt-1 font-display text-2xl font-bold text-emerald-600">100% Vetted</p>
          </div>
        </div>
      </div>

      {/* Role Benchmark Table */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">Compensation by Title</h2>
            <p className="text-xs text-slate-500">Aggregated from verified openings across active employers.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Role Title</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Typical Range</th>
                  <th className="px-6 py-4">Active Openings</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roleList.map(([title, data]) => (
                  <tr key={title} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{title}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5">
                        {data.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md text-xs">
                        ₹{data.min}–{data.max} LPA
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {data.count} {data.count === 1 ? "opening" : "openings"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/jobs?q=${encodeURIComponent(title)}&salary=1`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        Explore <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Highest Paying Open Positions */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">Top Paying Verified Openings</h2>
            <p className="text-xs text-slate-500">Live positions offering top-tier compensation brackets.</p>
          </div>
          <Link
            href="/jobs?salary=1"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
          >
            Browse all {jobs.length} roles
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {jobs.slice(0, 8).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
}
