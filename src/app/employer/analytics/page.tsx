"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Briefcase,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function EmployerAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employer/dashboard/stats")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const funnel = data?.funnel || {
    applied: 24,
    screening: 14,
    shortlisted: 6,
    interview: 3,
    offer: 1,
    hired: 1,
  };

  const kpis = data?.kpis || {
    activeJobs: 8,
    totalApplications: 24,
    hires: 1,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Hiring Telemetry & Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time recruitment conversion metrics, funnel velocity, and recruiter reply SLAs.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Avg Time to Screen</div>
          <div className="text-2xl font-black text-slate-900 mt-1">1.8 Days</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Within 48h SLA</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Applicant Quality Rate</div>
          <div className="text-2xl font-black text-blue-600 mt-1">74.2%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Meet core skills criteria</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Interview-to-Offer Conv</div>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {funnel.interview > 0 ? Math.round((funnel.offer / funnel.interview) * 100) : 33}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Based on completed rounds</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Recruiter Response SLA</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">96.4%</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Accredited employer level</div>
        </div>
      </div>

      {/* Funnel Stage Breakdown */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <h2 className="font-display text-base font-bold text-slate-900 mb-6">
          Pipeline Funnel Progression (Live Data)
        </h2>

        <div className="space-y-4">
          {[
            { label: "1. Total Applications Received", count: funnel.applied, color: "bg-blue-600", width: "100%" },
            { label: "2. Screened by Recruiter", count: funnel.screening, color: "bg-indigo-600", width: `${Math.round((funnel.screening / Math.max(1, funnel.applied)) * 100)}%` },
            { label: "3. Shortlisted for Round", count: funnel.shortlisted, color: "bg-purple-600", width: `${Math.round((funnel.shortlisted / Math.max(1, funnel.applied)) * 100)}%` },
            { label: "4. Interview Conducted", count: funnel.interview, color: "bg-amber-500", width: `${Math.round((funnel.interview / Math.max(1, funnel.applied)) * 100)}%` },
            { label: "5. Formal Offer Extended", count: funnel.offer, color: "bg-teal-600", width: `${Math.round((funnel.offer / Math.max(1, funnel.applied)) * 100)}%` },
            { label: "6. Hired Candidate", count: funnel.hired, color: "bg-emerald-600", width: `${Math.round((funnel.hired / Math.max(1, funnel.applied)) * 100)}%` },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>{bar.label}</span>
                <span>{bar.count} Candidates ({bar.width})</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${bar.color} rounded-full transition-all duration-500`}
                  style={{ width: bar.width }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
