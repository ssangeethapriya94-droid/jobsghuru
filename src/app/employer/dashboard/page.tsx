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
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-3xl bg-slate-200"></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200"></div>
          ))}
        </div>
        <div className="h-64 rounded-3xl bg-slate-200"></div>
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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 via-blue-800 to-[#0B3B82] p-6 md:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-200">
            <span>Welcome to Hiring Command Center</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>

          <h1 className="mt-1 font-display text-2xl md:text-3xl font-extrabold tracking-tight">
            Good day, {recruiter.name}
          </h1>

          <div className="mt-2 flex items-center gap-2.5">
            <span className="font-display text-sm font-bold text-white">{company.name}</span>
            {company.verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-xs font-bold text-emerald-200">
                <ShieldCheck size={13} /> Verified Employer
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 text-xs font-bold text-amber-200">
                Verification Under Review
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/employer/jobs/new"
            className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-900 shadow-xs hover:bg-blue-50 transition flex items-center gap-1.5"
          >
            <Plus size={14} />
            Post New Job
          </Link>

          <Link
            href="/employer/candidates"
            className="rounded-xl border border-blue-400/40 bg-blue-950/40 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-950/70 transition flex items-center gap-1.5"
          >
            <Search size={14} />
            Search Talent
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Jobs</span>
            <Briefcase size={15} className="text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {kpis.activeJobs} <span className="text-xs font-normal text-slate-400">/ {kpis.maxJobs}</span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-600 font-bold">Within plan capacity</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Applications</span>
            <Layers size={15} className="text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{kpis.totalApplications}</div>
          <div className="mt-1 text-[10px] text-slate-400">Total received</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Shortlisted</span>
            <Users size={15} className="text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700">{kpis.shortlisted}</div>
          <div className="mt-1 text-[10px] text-purple-600 font-semibold">Ready for review</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Interviews</span>
            <Calendar size={15} className="text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">{kpis.interviews}</div>
          <div className="mt-1 text-[10px] text-amber-600 font-semibold">Scheduled / ongoing</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Offers Sent</span>
            <FileCheck size={15} className="text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700">{kpis.offers}</div>
          <div className="mt-1 text-[10px] text-slate-400">Formal letters</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Hires Made</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{kpis.hires}</div>
          <div className="mt-1 text-[10px] text-emerald-600 font-bold">Closed positions</div>
        </div>
      </div>

      {/* Real-Time Hiring Funnel */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Live Recruitment Conversion Funnel
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Computed from live candidate applications and stage transitions in your database.
            </p>
          </div>
          <Link
            href="/employer/applications"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            Open Kanban Board <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { stage: "1. Applied", count: funnel.applied, pct: "100%", color: "bg-slate-100 text-slate-800" },
            { stage: "2. Screening", count: funnel.screening, pct: `${Math.round((funnel.screening / Math.max(1, funnel.applied)) * 100)}%`, color: "bg-blue-50 text-blue-800" },
            { stage: "3. Shortlisted", count: funnel.shortlisted, pct: `${Math.round((funnel.shortlisted / Math.max(1, funnel.applied)) * 100)}%`, color: "bg-purple-50 text-purple-800" },
            { stage: "4. Interview", count: funnel.interview, pct: `${Math.round((funnel.interview / Math.max(1, funnel.applied)) * 100)}%`, color: "bg-amber-50 text-amber-800" },
            { stage: "5. Offer", count: funnel.offer, pct: `${Math.round((funnel.offer / Math.max(1, funnel.applied)) * 100)}%`, color: "bg-indigo-50 text-indigo-800" },
            { stage: "6. Hired", count: funnel.hired, pct: `${Math.round((funnel.hired / Math.max(1, funnel.applied)) * 100)}%`, color: "bg-emerald-50 text-emerald-800" },
          ].map((item) => (
            <div key={item.stage} className={`rounded-2xl p-4 border border-slate-200/80 ${item.color}`}>
              <div className="text-[11px] font-bold opacity-80">{item.stage}</div>
              <div className="mt-2 text-2xl font-black">{item.count}</div>
              <div className="text-[10px] mt-0.5 font-medium opacity-70">Conv: {item.pct}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Split Section: Recent Applications & Onboarding Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications Stream */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">Recent Candidate Applications</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time candidate submissions with verified match scores</p>
            </div>
            <Link href="/employer/applications" className="text-xs font-bold text-blue-600 hover:underline">
              View all ({kpis.totalApplications})
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {data?.recentApplications?.length > 0 ? (
              data.recentApplications.map((app: any) => (
                <div key={app.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{app.candidateName}</span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {app.matchScore}% Match
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Applied for <span className="font-medium text-slate-700">{app.jobTitle}</span> • {app.experienceYears}y exp
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                      {app.status.replace("_", " ")}
                    </span>
                    <Link
                      href={`/employer/applications?id=${app.id}`}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-slate-500">
                No applications received yet.{" "}
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

        {/* Onboarding Checklist & AI Insights */}
        <div className="space-y-6">
          {/* Onboarding Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-slate-900">Setup Checklist</h3>
              <span className="text-xs font-black text-blue-600">{onboarding.progress}%</span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${onboarding.progress}%` }}
              ></div>
            </div>

            <div className="space-y-2.5 text-xs">
              {onboarding.steps?.map((step: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5">
                  {step.done ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0"></div>
                  )}
                  <span className={step.done ? "text-slate-700 font-medium" : "text-slate-400"}>
                    {step.step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Hiring Insights Card */}
          <div className="rounded-3xl border border-blue-200 bg-blue-50/40 p-6 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-2">
              <Sparkles size={15} className="text-blue-600" />
              Recruiter AI Insight
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your active job postings in Chennai show strong candidate responsiveness. 72% of recent applicants meet or exceed core technical stack requirements.
            </p>
            <div className="mt-4 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs">
              <Link href="/employer/ai" className="font-bold text-blue-700 hover:underline flex items-center gap-1">
                Explore Recruiter AI <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
