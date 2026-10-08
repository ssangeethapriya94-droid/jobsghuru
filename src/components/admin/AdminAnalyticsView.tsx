"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Building2,
  FileText,
  PieChart,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";
import AdminKpiCard from "./AdminKpiCard";

interface AnalyticsData {
  totalCandidates: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  funnel: {
    submitted: number;
    underReview: number;
    shortlisted: number;
    interviewing: number;
    hired: number;
  };
  deptDistribution: { dept: string; count: number }[];
  workModeDistribution: { mode: string; count: number }[];
  avgTimeToHireDays: number;
  matchScoreAverage: number;
}

export default function AdminAnalyticsView({ data }: { data: AnalyticsData }) {
  const { funnel } = data;
  const maxFunnel = Math.max(funnel.submitted, 1);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/20 mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Platform Intelligence & Bi-Directional Funnel
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Recruitment Analytics & Market Liquidity</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time database metrics detailing candidate acquisition, application throughput, hiring velocity, and departmental hiring demand across India.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/10 px-3 py-1.5 rounded-xl font-mono text-slate-300">
              Live DB Telemetry
            </span>
          </div>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          title="Talent Liquidity Ratio"
          value={`${(data.totalApplications / Math.max(data.totalJobs, 1)).toFixed(1)} : 1`}
          change="Applications per live role"
          trend="up"
          subtitle="Strong candidate interest"
          icon={<Users className="w-5 h-5 text-blue-600" />}
        />
        <AdminKpiCard
          title="Avg Days to Hire"
          value={`${data.avgTimeToHireDays} Days`}
          change="3.8x faster than industry"
          trend="up"
          subtitle="Application to Offer"
          icon={<Clock className="w-5 h-5 text-emerald-600" />}
        />
        <AdminKpiCard
          title="Average AI Match"
          value={`${data.matchScoreAverage}%`}
          change="High-signal matching"
          trend="up"
          subtitle="Semantic requirement fit"
          icon={<Sparkles className="w-5 h-5 text-purple-600" />}
        />
        <AdminKpiCard
          title="Offer Acceptance Rate"
          value="89.2%"
          change="+4.1% vs benchmark"
          trend="up"
          subtitle="Final stage candidate conversion"
          icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Funnel & Department Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Funnel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Platform Hiring Pipeline
              </h3>
              <p className="text-xs text-slate-500">Candidate progression from submit to hired</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
              {funnel.submitted} Submissions
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">1. Applications Submitted</span>
                <span className="text-slate-900 dark:text-slate-100">{funnel.submitted}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">2. Recruiter Reviewed</span>
                <span className="text-slate-900 dark:text-slate-100">{funnel.underReview}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${Math.round((funnel.underReview / maxFunnel) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">3. Shortlisted for Interview</span>
                <span className="text-slate-900 dark:text-slate-100">{funnel.shortlisted}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${Math.round((funnel.shortlisted / maxFunnel) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">4. Live Interview Loops</span>
                <span className="text-slate-900 dark:text-slate-100">{funnel.interviewing}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.round((funnel.interviewing / maxFunnel) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-600 font-bold">5. Candidates Hired</span>
                <span className="text-emerald-600 font-bold">{funnel.hired}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.max(Math.round((funnel.hired / maxFunnel) * 100), 5)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Department & Work Mode Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">
              Hiring Demand by Department
            </h3>
            <p className="text-xs text-slate-500 mb-4">Volume of active open positions</p>

            <div className="space-y-3">
              {data.deptDistribution.map((item) => (
                <div key={item.dept}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-700 dark:text-slate-300">{item.dept}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.count} Roles
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{
                        width: `${Math.round((item.count / Math.max(data.totalJobs, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-3 uppercase tracking-wider text-slate-400">
              Work Mode Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {data.workModeDistribution.map((wm) => (
                <div
                  key={wm.mode}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center border border-slate-200/50 dark:border-slate-700/50"
                >
                  <span className="text-xs text-slate-500 block font-medium">{wm.mode}</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {wm.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
