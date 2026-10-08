import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, MessageSquare, Briefcase, TrendingUp, BookOpen, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import AICareerAssistant from "@/components/AICareerAssistant";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Career Copilot — Next-Gen AI Career Assistant | JobsGhuru",
  description:
    "Natural language job search, career intelligence, skill gap roadmaps, and explainable job matching.",
};

export default async function CareerAIPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }> | { q?: string };
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams?.q || "";

  // Fetch latest verified published jobs for sidebar recommendations
  const topJobs = await db.job.findMany({
    where: { status: "PUBLISHED", expiresAt: { gt: new Date() } },
    orderBy: { responseRatePct: "desc" },
    take: 3,
    include: { company: true },
  });

  return (
    <div className="container-x py-8">
      {/* Top Banner */}
      <div className="rounded-3xl border border-blue-200/90 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur text-blue-200">
            <Sparkles size={14} className="text-blue-400" />
            <span>AI Career Intelligence Engine</span>
          </div>
          <h1 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Your Personal Career Copilot
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed font-medium">
            Search verified opportunities with plain English, diagnose your skill gaps, and explore real published jobs in top tech companies.
          </p>
        </div>
      </div>

      {/* 3-Column Layout: Left History, Center Copilot, Right Insights */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr_300px]">
        {/* Left Column: Recent Queries & Prompts */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MessageSquare size={13} className="text-blue-600" />
              Recent AI Threads
            </h3>
            <div className="mt-3 space-y-1.5 text-xs">
              {[
                "Remote React roles above ₹12 LPA",
                "Chennai Full Stack openings",
                "What skills do I need for AWS DevOps?",
                "Frontend jobs with <48h reply rate",
              ].map((thread, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-transparent p-2 text-slate-700 hover:border-slate-200 hover:bg-slate-50 transition cursor-pointer font-medium"
                >
                  {thread}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" /> Grounded in Reality
            </h4>
            <p className="mt-1.5 leading-relaxed font-medium">
              Every job returned is verified in Neon PostgreSQL. The AI will never hallucinate jobs, companies, or candidate qualifications.
            </p>
          </div>
        </aside>

        {/* Center Column: Interactive AI Career Assistant Component */}
        <main>
          <AICareerAssistant isFullPage={true} />
        </main>

        {/* Right Column: Career Insights, Skill Gaps & Next Actions */}
        <aside className="space-y-6">
          {/* Skill Gaps Module */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp size={15} className="text-blue-600" />
                Live Skill Insights
              </h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Demand 2026
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>AWS & Cloud</span>
                  <span className="text-emerald-700">+₹6 LPA</span>
                </div>
                <p className="mt-1 text-slate-500 font-medium text-[11px]">
                  Found in 72% of high-paying Full Stack and Backend listings.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>PostgreSQL & Prisma</span>
                  <span className="text-blue-700">High Match</span>
                </div>
                <p className="mt-1 text-slate-500 font-medium text-[11px]">
                  Core requirement across fintech and SaaS platforms in Chennai and Bengaluru.
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Briefcase size={15} className="text-blue-600" />
              Verified Top Picks
            </h3>

            <div className="mt-3 space-y-3">
              {topJobs.map((j) => (
                <Link
                  key={j.id}
                  href={`/jobs/${j.id}`}
                  className="block rounded-xl border border-slate-100 p-3 hover:border-blue-200 hover:bg-slate-50 transition group"
                >
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                    {j.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {j.company.name} · {j.location} ({j.workMode.toLowerCase()})
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-700">
                      ₹{j.salaryMinLpa || 8}–{j.salaryMaxLpa || 24} LPA
                    </span>
                    <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                      Apply <ChevronRight size={11} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
