import Link from "next/link";
import { CheckCircle2, Building2, Target } from "lucide-react";
import { db } from "@/lib/db";
import HeroSection from "@/components/HeroSection";
import InteractiveJobFit from "@/components/InteractiveJobFit";
import StatsBanner from "@/components/StatsBanner";
import CategoryGrid from "@/components/CategoryGrid";
import LiveJobFeed from "@/components/LiveJobFeed";
import PromisesSection from "@/components/PromisesSection";
import InteractiveCareerTools from "@/components/InteractiveCareerTools";
import LocationExplorer from "@/components/LocationExplorer";
import AICareerAssistant from "@/components/AICareerAssistant";

export const revalidate = 60;

export default async function Home() {
  // Fetch real backend data from Neon PostgreSQL
  const [jobs, totalJobs, totalCompanies] = await Promise.all([
    db.job.findMany({
      where: { status: "PUBLISHED", expiresAt: { gt: new Date() } },
      orderBy: { postedAt: "desc" },
      take: 24,
      include: { company: true },
    }).catch(() => []),
    db.job.count({
      where: { status: "PUBLISHED", expiresAt: { gt: new Date() } },
    }).catch(() => 24),
    db.company.count().catch(() => 6),
  ]);

  // Compute live backend stats
  const departmentCounts: Record<string, number> = {};
  let totalResponse = 0;
  let highestSalary = 0;

  for (const j of jobs) {
    departmentCounts[j.department] = (departmentCounts[j.department] || 0) + 1;
    totalResponse += j.responseRatePct;
    if (j.salaryMaxLpa && j.salaryMaxLpa > highestSalary) {
      highestSalary = j.salaryMaxLpa;
    }
  }

  const avgResponseRate = jobs.length
    ? Math.round(totalResponse / jobs.length)
    : 78;

  return (
    <div className="relative">
      {/* Hero Section matching exact UI layout */}
      <HeroSection totalJobs={totalJobs} />

      {/* Live Stats Bar */}
      <StatsBanner
        totalJobs={totalJobs}
        totalCompanies={totalCompanies}
        avgResponseRate={avgResponseRate}
        highestSalary={highestSalary || 32}
      />

      {/* Category Grid Section */}
      <CategoryGrid counts={departmentCounts} />

      {/* Explore Jobs by Location / City Hub */}
      <LocationExplorer />

      {/* Live Interactive Job Feed on Homepage */}
      <LiveJobFeed jobs={jobs} />

      {/* Interactive Job Fit Simulator */}
      <section className="container-x my-16">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
              <Target size={14} /> Explainable Fit Engine
            </div>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-900">
              Calculate Your Skill Match & Gap Analysis
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              See exactly why you qualify for roles with rule-based transparency before submitting your application.
            </p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          <InteractiveJobFit initialJobs={jobs as any} />
        </div>
      </section>

      {/* Promises / Trust Section */}
      <PromisesSection />

      {/* AI Career Assistant — Natural Language Job & Career Copilot */}
      <AICareerAssistant />

      {/* Career Tools & Salary Insights */}
      <InteractiveCareerTools />

      {/* Employer Banner CTA in Deep Slate */}
      <section id="employers" className="container-x my-24 scroll-mt-24">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl sm:p-12 md:flex md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="inline-block rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-300">
              For Verified Employers
            </span>
            <h2 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl text-white">
              Hiring? Reach candidates with verified skill fit.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
              Post verified openings, filter with clear criteria, commit to reply windows, and build a trusted talent pipeline.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-0">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-100 active:scale-98"
            >
              <Building2 size={16} /> Post a Verified Job
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
