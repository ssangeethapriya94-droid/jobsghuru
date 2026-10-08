"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  CreditCard,
  Layers,
} from "lucide-react";

export default function EmployerPlansManagementPage() {
  const [data, setData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/employer/dashboard/stats").then((r) => r.json()),
      fetch("/api/admin/pricing").then((r) => r.json()).catch(() => ({ plans: [] })),
    ])
      .then(([stats, pricing]) => {
        if (stats.success) setData(stats);
      })
      .finally(() => setLoading(false));
  }, []);

  const usage = data?.usage || {
    planName: "Growth Partnership",
    planCode: "GROWTH",
    jobsUsed: 8,
    jobsLimit: 10,
    searchCreditsRemaining: 238,
    searchCreditsTotal: 250,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Plan & Usage Entitlements</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitor your concurrent job slot usage, monthly sourcing credits, and plan features.
        </p>
      </div>

      {/* Usage Meter Container */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-slate-400">Current Hiring Tier</div>
            <div className="text-xl font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
              {usage.planName}
              <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5">
                Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/employers/plans"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              Upgrade Partnership
            </Link>
          </div>
        </div>

        {/* Meter Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Jobs */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Active Job Listings</span>
              <span>{usage.jobsUsed} / {usage.jobsLimit}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden mt-2">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${Math.min(100, (usage.jobsUsed / usage.jobsLimit) * 100)}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              {usage.jobsLimit - usage.jobsUsed} open posting slots remaining
            </div>
          </div>

          {/* Sourcing Credits */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Candidate Search Credits</span>
              <span>{usage.searchCreditsRemaining} Left</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden mt-2">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${Math.min(100, (usage.searchCreditsRemaining / usage.searchCreditsTotal) * 100)}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Renews on 1st of next month ({usage.searchCreditsTotal} monthly quota)
            </div>
          </div>

          {/* Recruiter AI */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Recruiter AI Copilot</span>
              <span className="text-emerald-700">Active</span>
            </div>
            <div className="mt-2 text-xs text-slate-600">
              Evidence-based matching and automated dossier summaries included in your plan.
            </div>
          </div>
        </div>
      </div>

      {/* Plan Features Included */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <h2 className="font-display text-base font-bold text-slate-900 mb-4">
          Partnership Entitlements & Included Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            "Accredited company profile badge on all search results",
            "Explainable AI skill matching & gap diagnostics",
            "Multi-stage applicant Kanban board with drag-drop transitions",
            "Integrated interview scheduling & collaborative scorecards",
            "Formal employment offer letter generator & digital sign-off tracking",
            "Priority support SLA (within 24 business hours)",
            "Up to 5 recruiter and hiring manager seats with role governance",
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
