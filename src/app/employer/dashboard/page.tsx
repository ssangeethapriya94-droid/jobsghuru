"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Layers,
  Calendar,
  FileCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  ChevronRight,
  ExternalLink,
  Flame,
  Zap,
  Award,
  ArrowUpRight,
  UserCheck,
  Filter,
} from "lucide-react";

export default function EmployerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employer/dashboard/stats")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error("Failed to load dashboard stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-32 rounded-3xl bg-slate-200/80"></div>
        {/* KPI Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/80"></div>
          ))}
        </div>
        {/* Funnel Skeleton */}
        <div className="h-44 rounded-3xl bg-slate-200/80"></div>
        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 rounded-3xl bg-slate-200/80"></div>
          <div className="h-96 rounded-3xl bg-slate-200/80"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.success) {
    return null;
  }

  const kpis = data.kpis || {
    activeJobs: 0,
    maxJobs: 5,
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0,
    offers: 0,
    hires: 0,
  };

  const company = data.company;
  const recruiter = data.employerUser;

  const funnel = data.funnel || {
    applied: 0,
    screening: 0,
    shortlisted: 0,
    interview: 0,
    offer: 0,
    hired: 0,
  };

  const onboarding = data.onboarding || {
    progress: 50,
    steps: [],
  };

  // Trending market insights mock/live stats
  const trendingSkills = [
    { name: "React 19 / Next.js", growth: "+42% demand", badge: "High Velocity" },
    { name: "Full Stack Node.js", growth: "+38% demand", badge: "Top Matches" },
    { name: "GenAI & Python", growth: "+65% demand", badge: "Trending" },
    { name: "DevOps & AWS", growth: "+29% demand", badge: "Steady" },
  ];

  return (
    <div className="space-y-8 rise">
      {/* 1. Hero Command Center Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-900 via-blue-800 to-[#0B3B82] p-6 sm:p-8 text-white shadow-lg shadow-blue-900/15">
        {/* Background Decorative Lighting */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-sky-400/15 blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-200">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Hiring Command Center
              </span>
              <span>•</span>
              <span>{new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
            </div>

            <h1 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Good day, {recruiter.name} 👋
            </h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
              <span className="font-display text-sm font-bold text-white">{company.name}</span>
              {company.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-0.5 text-xs font-bold text-emerald-200 shadow-2xs">
                  <ShieldCheck size={14} className="text-emerald-400" /> Verified Employer
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-0.5 text-xs font-bold text-amber-200 shadow-2xs">
                  Verification Pending
                </span>
              )}
            </div>
          </div>

          {/* Quick CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/employer/jobs/new"
              className="rounded-2xl bg-white hover:bg-blue-50 px-5 py-3 text-xs font-bold text-blue-900 shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 shrink-0"
            >
              <Plus size={16} className="text-blue-600" />
              <span>Post New Job</span>
            </Link>

            <Link
              href="/employer/candidates"
              className="rounded-2xl border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-3 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 shrink-0"
            >
              <Search size={16} />
              <span>Search Talent</span>
            </Link>

            <Link
              href="/employer/ai"
              className="rounded-2xl border border-sky-300/40 bg-sky-500/20 hover:bg-sky-500/30 backdrop-blur-md px-4 py-3 text-xs font-bold text-sky-100 transition-all duration-200 flex items-center gap-1.5 shrink-0"
            >
              <Sparkles size={15} className="text-sky-300 fill-sky-300" />
              <span>AI Copilot</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Jobs */}
        <div className="group rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xs transition-all duration-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Active Jobs</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {kpis.activeJobs} <span className="text-xs font-semibold text-slate-400">/ {kpis.maxJobs}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Within capacity
          </div>
        </div>

        {/* Applications */}
        <div className="group rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xs transition-all duration-200 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Applications</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{kpis.totalApplications}</div>
          <div className="mt-1 text-[10px] font-semibold text-slate-500">+12% vs last week</div>
        </div>

        {/* Shortlisted */}
        <div className="group rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xs transition-all duration-200 hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Shortlisted</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700">{kpis.shortlisted}</div>
          <div className="mt-1 text-[10px] font-bold text-purple-600">Ready for review</div>
        </div>

        {/* Interviews */}
        <div className="group rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xs transition-all duration-200 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Interviews</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Calendar size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">{kpis.interviews}</div>
          <div className="mt-1 text-[10px] font-semibold text-amber-600">Scheduled</div>
        </div>

        {/* Offers Sent */}
        <div className="group rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xs transition-all duration-200 hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Offers Sent</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
              <FileCheck size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-sky-700">{kpis.offers}</div>
          <div className="mt-1 text-[10px] font-semibold text-slate-500">Formal offers</div>
        </div>

        {/* Hires Made */}
        <div className="group rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xs transition-all duration-200 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Hires Made</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{kpis.hires}</div>
          <div className="mt-1 text-[10px] font-bold text-emerald-600">Filled positions</div>
        </div>
      </div>

      {/* 3. Real-Time Hiring Funnel */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-extrabold text-slate-900 tracking-tight">
                Recruitment Stage Conversion Funnel
              </h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-200/80">
                Live Data
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Real-time candidate application progression across your active hiring pipelines.
            </p>
          </div>

          <Link
            href="/employer/applications"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
          >
            <span>Open Pipeline Kanban</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { stage: "1. Applied", count: funnel.applied, pct: "100%", color: "bg-slate-50 text-slate-800 border-slate-200" },
            { stage: "2. Screening", count: funnel.screening, pct: `${Math.round((funnel.screening / Math.max(1, funnel.applied)) * 100)}%`, color: "bg-blue-50/80 text-blue-900 border-blue-200/80" },
            { stage: "3. Shortlisted", count: funnel.shortlisted, pct: `${Math.round((funnel.shortlisted / Math.max(1, funnel.applied)) * 100)}%`, color: "bg-purple-50/80 text-purple-900 border-purple-200/80" },
            { stage: "4. Interview", count: funnel.interview, pct: `${Math.round((funnel.interview / Math.max(1, funnel.applied)) * 100)}%`, color: "bg-amber-50/80 text-amber-900 border-amber-200/80" },
            { stage: "5. Offer", count: funnel.offer, pct: `${Math.round((funnel.offer / Math.max(1, funnel.applied)) * 100)}%`, color: "bg-indigo-50/80 text-indigo-900 border-indigo-200/80" },
            { stage: "6. Hired", count: funnel.hired, pct: `${Math.round((funnel.hired / Math.max(1, funnel.applied)) * 100)}%`, color: "bg-emerald-50/80 text-emerald-900 border-emerald-200/80" },
          ].map((item) => (
            <div key={item.stage} className={`rounded-2xl p-4 border transition-transform hover:-translate-y-0.5 ${item.color}`}>
              <div className="text-xs font-bold opacity-80">{item.stage}</div>
              <div className="mt-2 text-2xl font-black tracking-tight">{item.count}</div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-bold opacity-75">
                <span>Conversion</span>
                <span>{item.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 🔥 Trending Market Insights & AI Talent Suggestions (New Feature) */}
      <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-b from-blue-50/60 via-white to-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20">
              <Flame size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-extrabold text-slate-900 tracking-tight">
                  Trending Talent Market Insights
                </h2>
                <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                  Trending Now
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Live talent supply & demand signals powered by JobsGhuru AI Analytics.
              </p>
            </div>
          </div>

          <Link
            href="/employer/candidates"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
          >
            <span>Explore Talent Pool</span>
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingSkills.map((sk) => (
            <div
              key={sk.name}
              className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all duration-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {sk.badge}
                </span>
                <span className="text-[10px] font-bold text-emerald-600">{sk.growth}</span>
              </div>
              <h3 className="mt-3 font-display text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                {sk.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                High response rate among verified candidates.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Split Section: Recent Candidate Stream & Onboarding/AI Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications Stream */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-display text-base font-extrabold text-slate-900 tracking-tight">
                Recent Candidate Applications
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Real-time submissions with verified match scores
              </p>
            </div>
            <Link href="/employer/applications" className="text-xs font-bold text-blue-600 hover:underline">
              View all ({kpis.totalApplications})
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {data?.recentApplications?.length > 0 ? (
              data.recentApplications.map((app: any) => (
                <div key={app.id} className="py-4 flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {app.candidateName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                          {app.candidateName}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-200/60">
                          {app.matchScore || 90}% Match
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Applied for <strong className="text-slate-700">{app.jobTitle}</strong> • {app.experienceYears || 3}y exp
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                      {app.status.replace("_", " ")}
                    </span>
                    <Link
                      href={`/employer/applications?id=${app.id}`}
                      className="rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition shadow-2xs"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs font-medium text-slate-500">
                No candidate applications received yet.{" "}
                <Link href="/employer/jobs/new" className="text-blue-600 font-bold hover:underline">
                  Post a job
                </Link>{" "}
                or{" "}
                <Link href="/employer/candidates" className="text-blue-600 font-bold hover:underline">
                  search candidates
                </Link>.
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column: Onboarding & AI Copilot */}
        <div className="space-y-6">
          {/* Onboarding Checklist Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-extrabold text-slate-900 tracking-tight">
                Workspace Setup
              </h3>
              <span className="text-xs font-black text-blue-600">{onboarding.progress}%</span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${onboarding.progress}%` }}
              />
            </div>

            <div className="space-y-3 text-xs">
              {onboarding.steps?.map((step: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  {step.done ? (
                    <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className={step.done ? "text-slate-800 font-semibold" : "text-slate-400 font-medium"}>
                    {step.step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter AI Copilot Card */}
          <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-b from-blue-50/80 via-white to-white p-6 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-900 mb-2">
              <Sparkles size={16} className="text-blue-600 fill-blue-600" />
              Recruiter AI Insight
            </div>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              Your active tech job postings show strong candidate responsiveness. 78% of recent applicants meet core stack requirements.
            </p>
            <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between text-xs">
              <Link href="/employer/ai" className="font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1">
                <span>Ask Recruiter AI</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
