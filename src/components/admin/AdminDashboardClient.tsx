"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  Building2,
  Briefcase,
  FileSpreadsheet,
  CalendarCheck,
  Award,
  IndianRupee,
  Bot,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
  Zap,
  RefreshCw,
  Search,
  Plus,
  ShieldAlert,
  SlidersHorizontal,
  ChevronUp,
} from "lucide-react";
import AdminKpiCard from "./AdminKpiCard";
import AdminPostJobModal from "./AdminPostJobModal";

interface ApplicationItem {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  currentRole: string | null;
  currentCompany: string | null;
  experienceYears: number;
  expectedCtc: number | null;
  matchScore: number;
  status: string;
  appliedAt: string;
  job: {
    title: string;
    company: { name: string };
  };
}

interface AuditItem {
  id: string;
  actorEmail: string;
  action: string;
  reason: string;
  createdAt: string;
}

interface CompanyItem {
  id: string;
  name: string;
  industry: string;
  location: string;
  verified: boolean;
  _count: { jobs: number };
}

interface SettingItem {
  id: string;
  key: string;
  value: string;
}

export default function AdminDashboardClient({
  period,
  metrics,
  recentApplications,
  recentAudits,
  topCompanies,
  systemSettings,
  pendingCounts,
}: {
  period: string;
  metrics: {
    totalUsers: number;
    totalCandidates: number;
    verifiedCompanies: number;
    totalCompanies: number;
    activeJobs: number;
    pendingJobs: number;
    totalApplications: number;
    interviewApplications: number;
    hiredApplications: number;
    pendingReports: number;
    totalRevenue: number;
    totalTokens: number;
    totalAICalls: number;
    estimatedCostUsd: number;
  };
  recentApplications: ApplicationItem[];
  recentAudits: AuditItem[];
  topCompanies: CompanyItem[];
  systemSettings: SettingItem[];
  pendingCounts: {
    verifications: number;
    jobs: number;
    reports: number;
  };
}) {
  const router = useRouter();
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [apps, setApps] = useState<ApplicationItem[]>(recentApplications);
  const [appSearch, setAppSearch] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      setSuccessToast("Telemetry stream synchronized with live database");
      setTimeout(() => setSuccessToast(""), 2500);
    }, 600);
  };

  const filteredApps = apps.filter(
    (a) =>
      a.candidateName.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.job.title.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.job.company.name.toLowerCase().includes(appSearch.toLowerCase())
  );

  const handleUpdateAppStatus = async (appId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: appId,
          status: newStatus,
          reason: `Admin updated pipeline status to ${newStatus}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update on server");
      }

      setApps((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      if (selectedApp?.id === appId) {
        setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      setSuccessToast(`Application marked as ${newStatus.replace(/_/g, " ")}`);
      setTimeout(() => setSuccessToast(""), 3500);
    } catch (err: any) {
      console.error(err);
      setSuccessToast(err.message || "Failed to update status. Please try again.");
      setTimeout(() => setSuccessToast(""), 4000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 90) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    }
    if (score >= 75) {
      return "bg-blue-50 text-blue-700 border-blue-200/80";
    }
    return "bg-slate-100 text-slate-700 border-slate-200/70";
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs border border-slate-800 animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* TOP COMMAND CENTER HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Platform Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Database Active
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Real-time telemetry, trust & safety queues, application pipeline, and AI usage metrics.
          </p>
        </div>

        {/* Action Controls: Responsive Date Filter Pills & CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {/* Horizontally Scrollable Pills for all screen sizes */}
          <div className="flex items-center rounded-2xl border border-slate-200/90 bg-white p-1 shadow-2xs text-xs font-semibold text-slate-600 overflow-x-auto no-scrollbar scrollbar-none w-full sm:w-auto min-w-0">
            {[
              { label: "Today", value: "today" },
              { label: "7 Days", value: "7d" },
              { label: "30 Days", value: "30d" },
              { label: "3 Months", value: "90d" },
              { label: "1 Year", value: "1y" },
              { label: "All Time", value: "all" },
            ].map((item) => (
              <Link
                key={item.value}
                href={`/admin/dashboard?period=${item.value}`}
                className={`rounded-xl px-2.5 sm:px-3 py-1.5 transition-all text-nowrap duration-200 shrink-0 ${
                  period === item.value
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Post Job Action Button */}
            <button
              onClick={() => setIsPostJobOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
              title="Create and publish a new job listing"
            >
              <Plus size={15} />
              <span>Post Job</span>
            </button>

            {/* Refresh Action Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
              title="Synchronize telemetry with database"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : "text-slate-400"} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 10 CORE KPI METRICS GRID - Full Adaptive Layout across Mobile / Tablet / Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 lg:gap-4">
        <AdminKpiCard
          label="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          change="+14.2%"
          changeType="increase"
          icon={Users}
          iconBgColor="bg-blue-50 border-blue-100/90"
          iconColor="text-blue-600"
          accentColor="from-blue-600 to-indigo-600"
        />

        <AdminKpiCard
          label="Candidates"
          value={metrics.totalCandidates.toLocaleString()}
          change="+18.5%"
          changeType="increase"
          icon={UserCheck}
          iconBgColor="bg-indigo-50 border-indigo-100/90"
          iconColor="text-indigo-600"
          accentColor="from-indigo-600 to-violet-600"
        />

        <AdminKpiCard
          label="Verified Companies"
          value={`${metrics.verifiedCompanies} / ${metrics.totalCompanies}`}
          change="+8.3%"
          changeType="increase"
          icon={Building2}
          iconBgColor="bg-emerald-50 border-emerald-100/90"
          iconColor="text-emerald-600"
          accentColor="from-emerald-600 to-teal-600"
        />

        <AdminKpiCard
          label="Active Jobs"
          value={metrics.activeJobs.toLocaleString()}
          change="+6.1%"
          changeType="increase"
          icon={Briefcase}
          iconBgColor="bg-sky-50 border-sky-100/90"
          iconColor="text-sky-600"
          accentColor="from-sky-600 to-blue-600"
        />

        <AdminKpiCard
          label="Applications"
          value={metrics.totalApplications.toLocaleString()}
          change="+24.8%"
          changeType="increase"
          icon={FileSpreadsheet}
          iconBgColor="bg-purple-50 border-purple-100/90"
          iconColor="text-purple-600"
          accentColor="from-purple-600 to-fuchsia-600"
        />

        <AdminKpiCard
          label="Interviews"
          value={metrics.interviewApplications.toLocaleString()}
          change="+12.0%"
          changeType="increase"
          icon={CalendarCheck}
          iconBgColor="bg-teal-50 border-teal-100/90"
          iconColor="text-teal-600"
          accentColor="from-teal-600 to-cyan-600"
        />

        <AdminKpiCard
          label="Hires"
          value={metrics.hiredApplications.toLocaleString()}
          change="+15.3%"
          changeType="increase"
          icon={Award}
          iconBgColor="bg-amber-50 border-amber-100/90"
          iconColor="text-amber-600"
          accentColor="from-amber-600 to-orange-600"
        />

        <AdminKpiCard
          label="Gross Revenue"
          value={`₹${(metrics.totalRevenue / 1000).toFixed(1)}k`}
          change="+31.2%"
          changeType="increase"
          icon={IndianRupee}
          iconBgColor="bg-emerald-50 border-emerald-100/90"
          iconColor="text-emerald-600"
          accentColor="from-emerald-600 to-green-600"
        />

        <AdminKpiCard
          label="AI Requests"
          value={metrics.totalAICalls.toLocaleString()}
          change={`${(metrics.totalTokens / 1000).toFixed(0)}k tkns`}
          changeType="neutral"
          icon={Bot}
          iconBgColor="bg-fuchsia-50 border-fuchsia-100/90"
          iconColor="text-fuchsia-600"
          accentColor="from-fuchsia-600 to-pink-600"
        />

        <AdminKpiCard
          label="Pending Reports"
          value={metrics.pendingReports.toLocaleString()}
          change={metrics.pendingReports > 0 ? "Requires Attention" : "Clear"}
          changeType={metrics.pendingReports > 0 ? "decrease" : "increase"}
          icon={AlertTriangle}
          iconBgColor={metrics.pendingReports > 0 ? "bg-rose-50 border-rose-100/90" : "bg-slate-50 border-slate-100/90"}
          iconColor={metrics.pendingReports > 0 ? "text-rose-600" : "text-slate-500"}
          accentColor="from-rose-600 to-red-600"
        />
      </div>

      {/* PRIORITY OPERATIONAL QUEUE ALERT BANNER */}
      {(pendingCounts.verifications > 0 || pendingCounts.jobs > 0 || pendingCounts.reports > 0) && (
        <div className="rounded-2xl sm:rounded-3xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 p-5 sm:p-6 shadow-xs backdrop-blur-xs transition-all hover:border-amber-400">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-display text-sm sm:text-base font-extrabold text-slate-900">
                  Priority Operational Queue Requires Attention
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Pending corporate KYC verifications, unmoderated listings, or safety escalations awaiting resolution.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
              {pendingCounts.verifications > 0 && (
                <Link
                  href="/admin/verifications"
                  className="rounded-xl bg-white border border-amber-300 px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-50 transition-all shadow-2xs active:scale-95 flex items-center gap-1.5"
                >
                  <span>{pendingCounts.verifications} Pending Companies</span>
                  <ArrowRight size={13} />
                </Link>
              )}
              {pendingCounts.jobs > 0 && (
                <Link
                  href="/admin/moderation"
                  className="rounded-xl bg-white border border-blue-300 px-3.5 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-50 transition-all shadow-2xs active:scale-95 flex items-center gap-1.5"
                >
                  <span>{pendingCounts.jobs} Job Moderation</span>
                  <ArrowRight size={13} />
                </Link>
              )}
              {pendingCounts.reports > 0 && (
                <Link
                  href="/admin/reports"
                  className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <span>{pendingCounts.reports} User Safety Reports</span>
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2-COLUMN MAIN CONTENT (Pipeline Stream & Governance Sidebar) */}
      <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-12 items-start">
        {/* Left Column: Recent Applications Stream & Audit Log (8 cols on xl) */}
        <div className="space-y-6 sm:space-y-8 lg:col-span-7 xl:col-span-8">
          {/* Live Application Stream Card */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet size={18} className="text-blue-600" />
                    <span>Live Application Pipeline Stream</span>
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 shadow-2xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Pipeline
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Real-time direct candidate submissions saved to PostgreSQL database
                </p>
              </div>

              {/* Filter and View All Link */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter candidate or role..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all w-44 sm:w-52"
                  />
                </div>
                <Link
                  href="/admin/applications"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 shrink-0 px-2 py-1.5 rounded-xl hover:bg-blue-50 transition"
                >
                  <span>All ({apps.length})</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* Applications List */}
            <div className="mt-3 divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <FileSpreadsheet size={32} className="mx-auto mb-2 text-slate-300" />
                  No applications found matching your criteria.
                </div>
              ) : (
                filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-3 sm:px-3.5 rounded-2xl transition-all duration-200 cursor-pointer group border border-transparent hover:border-slate-200/60"
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {/* Candidate Avatar Initials */}
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-700 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {app.candidateName.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {app.candidateName}
                          </span>
                          <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold ${getMatchScoreBadge(app.matchScore)}`}>
                            {app.matchScore}% Match
                          </span>
                          {app.experienceYears > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              • {app.experienceYears}y exp
                            </span>
                          )}
                          {app.currentRole && (
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px] hidden md:inline">
                              • {app.currentRole}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Applied for <b className="text-slate-800 font-semibold">{app.job.title}</b> at {app.job.company.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="inline-block rounded-full bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                          {app.status.replace(/_/g, " ")}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                        title="View Application Dossier"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Immutable Administrative Security Audit Trail */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock size={18} className="text-blue-600" />
                  <span>Administrative Security Audit Trail</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Every sensitive platform intervention is immutably logged with mandatory rationale
                </p>
              </div>
              <Link
                href="/admin/audit-logs"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-blue-50 transition"
              >
                <span>Full Ledger</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="mt-4 space-y-2.5">
              {recentAudits.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No audit records recorded yet.</p>
              ) : (
                recentAudits.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs text-slate-700 hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center justify-between font-semibold flex-wrap gap-1">
                      <span className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="rounded-md bg-blue-100 border border-blue-200/70 px-2 py-0.5 text-[10px] font-mono text-blue-800">
                          {log.action}
                        </span>
                        <span className="truncate max-w-[200px] sm:max-w-none">by {log.actorEmail}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mt-1.5 text-slate-600 italic">
                      &ldquo;{log.reason}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions, Employers, AI Telemetry, Flags (4 cols on xl) */}
        <div className="space-y-6 sm:space-y-8 lg:col-span-5 xl:col-span-4">
          {/* Fast Administrative Actions Matrix */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)]">
            <h3 className="font-display text-sm font-extrabold text-slate-900 mb-3.5 flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span>Fast Administrative Actions</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {/* Primary Post Job Button (Fix typo from '+ +') */}
              <button
                type="button"
                onClick={() => setIsPostJobOpen(true)}
                className="col-span-2 p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold transition-all text-center flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-98 cursor-pointer"
              >
                <Plus size={16} />
                <span>Post New Job Card</span>
              </button>

              <Link
                href="/admin/jobs"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200/80 font-bold text-slate-700 transition-all text-center block shadow-2xs"
              >
                Inspect Listings
              </Link>
              <Link
                href="/admin/verifications"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-slate-200/80 font-bold text-slate-700 transition-all text-center block shadow-2xs"
              >
                Review KYC
              </Link>
              <Link
                href="/admin/users"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200/80 font-bold text-slate-700 transition-all text-center block shadow-2xs"
              >
                User Directory
              </Link>
              <Link
                href="/admin/settings"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200/80 font-bold text-slate-700 transition-all text-center block shadow-2xs"
              >
                Platform Config
              </Link>
            </div>
          </div>

          {/* Top Hiring Employers Card */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" />
                <span>Top Hiring Employers</span>
              </h3>
              <Link href="/admin/companies" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                Manage
              </Link>
            </div>

            <div className="mt-3.5 space-y-2">
              {topCompanies.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">No company records found.</p>
              ) : (
                topCompanies.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-2xl transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-xs shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">{c.name}</span>
                          {c.verified && (
                            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 truncate block">{c.industry} • {c.location}</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 border border-slate-200/70 px-2.5 py-0.5 text-xs font-extrabold text-slate-700 shrink-0">
                      {c._count.jobs} Jobs
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Core Telemetry Card with Deep Modern Indigo Mesh */}
          <div className="rounded-2xl sm:rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-[#090E21] via-[#121B3B] to-[#0A0F26] p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
            <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3.5">
              <div className="flex items-center gap-2">
                <Sparkles size={17} className="text-blue-400" />
                <h3 className="font-display text-base font-extrabold text-white">
                  AI Core Telemetry
                </h3>
              </div>
              <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-300 border border-blue-400/30">
                gemini-1.5-flash
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3">
                <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Total Tokens</span>
                <p className="mt-1 text-lg sm:text-xl font-extrabold text-white font-mono">
                  {metrics.totalTokens.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3">
                <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Estimated Cost</span>
                <p className="mt-1 text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
                  ${metrics.estimatedCostUsd.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Latency Avg: 412ms
              </span>
              <Link href="/admin/ai" className="font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <span>AI Controls</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Active Platform Governance Flags */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal size={15} className="text-slate-600" />
                <span>Core Governance Flags</span>
              </h3>
              <Link href="/admin/settings" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                Configure
              </Link>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              {systemSettings.length === 0 ? (
                <div className="text-slate-400 py-3 text-center">Default governance configuration active.</div>
              ) : (
                systemSettings.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-1 border-b border-slate-100/80 last:border-0">
                    <span className="text-slate-500 font-mono text-[11px] truncate">{s.key}</span>
                    <span className="font-bold text-slate-800 text-[11px]">{s.value}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Application Packet Dossier Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-600">
                  Application Packet Dossier
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {selectedApp.candidateName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedApp.id}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">Applied Position</span>
                <span className="font-bold text-slate-900 block text-sm mt-0.5">
                  {selectedApp.job.title}
                </span>
                <span className="text-slate-500 text-[11px] font-medium">{selectedApp.job.company.name}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">AI Match Score</span>
                <span className="text-emerald-600 font-black text-base block mt-0.5">
                  {selectedApp.matchScore}%
                </span>
                <span className="text-slate-500 text-[11px]">Requirement alignment</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">Candidate Contact</span>
                <span className="text-slate-900 font-bold block mt-0.5 truncate">
                  {selectedApp.candidateEmail}
                </span>
                <span className="text-slate-500 text-[11px] font-mono">{selectedApp.candidatePhone}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-semibold text-[11px]">Profile Experience</span>
                <span className="text-slate-900 font-bold block mt-0.5">
                  {selectedApp.experienceYears} Years Exp
                </span>
                <span className="text-slate-500 text-[11px]">
                  Role: {selectedApp.currentRole || "Fresher"}
                </span>
              </div>
            </div>

            {/* Pipeline Stage Transitions */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] uppercase font-extrabold text-slate-400 block mb-2">
                Update Pipeline Status:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateAppStatus(selectedApp.id, st)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      selectedApp.status === st
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {st.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Job Card Modal */}
      <AdminPostJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
        onJobCreated={(newJob) => {
          setSuccessToast(`Job listing "${newJob.title}" published successfully!`);
          router.refresh();
        }}
      />
    </div>
  );
}
