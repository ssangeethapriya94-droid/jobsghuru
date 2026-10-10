"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Zap,
  Building2,
  Users,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { salary, modeLabel } from "@/lib/format";

interface JobItem {
  id: string;
  title: string;
  department: string;
  location: string;
  workMode: "REMOTE" | "HYBRID" | "ONSITE";
  jobType: string;
  minExp: number;
  maxExp: number;
  salaryMinLpa: number | null;
  salaryMaxLpa: number | null;
  status: string;
  skills: string[];
  description: string;
  postedAt: string;
  applicationsCount: number;
  company: {
    id: string;
    name: string;
    verified: boolean;
  };
}

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [quota, setQuota] = useState<{
    allowed: boolean;
    current: number;
    limit: number;
    planName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("ALL");
  const [toast, setToast] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/jobs");
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
        setQuota(data.quota || null);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    setTogglingId(jobId);
    const newStatus = currentStatus === "PUBLISHED" ? "PAUSED" : "PUBLISHED";

    try {
      const res = await fetch(`/api/employer/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update job status.");
      }

      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );

      showToast(
        newStatus === "PUBLISHED"
          ? "Job listing is now active and published live on JobsGhuru!"
          : "Job listing paused. It will not receive new applications."
      );
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = jobs.filter((j) => {
    if (statusTab !== "ALL" && j.status !== statusTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeCount = jobs.filter((j) => j.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Corporate Plan & Job Limit Quota Banner */}
      {quota && (
        <div className="rounded-3xl border border-blue-200/90 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/25">
                <Briefcase size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                    {quota.planName || "Corporate Subscription"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider ${
                      quota.allowed
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {quota.current} / {quota.limit} Active Jobs Used
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Only published jobs within your plan allocation are displayed live on the public JobsGhuru website.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <Link
                href="/employer/billing"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 shadow-2xs transition"
              >
                <Zap size={14} className="text-amber-500" />
                <span>Subscription & Plan Details</span>
              </Link>
              <Link
                href="/employer/jobs/new"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-blue-600/20 transition active:scale-95"
              >
                <Plus size={16} />
                <span>Post New Job Card</span>
              </Link>
            </div>
          </div>

          {/* Category & Plan Access Breakdown */}
          <div className="pt-3 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-2xl bg-white/80 border border-blue-100 p-3 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Allowed Job Categories</span>
              <span className="font-bold text-slate-900 block truncate">
                All Categories (Tech, Finance, AI, Executive)
              </span>
            </div>
            <div className="rounded-2xl bg-white/80 border border-blue-100 p-3 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Resume Search Downloads</span>
              <span className="font-bold text-slate-900 block">
                50 Downloads / month
              </span>
            </div>
            <div className="rounded-2xl bg-white/80 border border-blue-100 p-3 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Feature Badging Access</span>
              <span className="font-bold text-emerald-700 block flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Priority Moderation & Verified Badge
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Jobs Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
            Company Job Postings
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage your company&apos;s active requisitions, applicant streams, and publication statuses.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 text-xs font-semibold text-slate-600 shadow-2xs overflow-x-auto max-w-full scrollbar-none shrink-0">
          {[
            { label: "All Postings", value: "ALL" },
            { label: "Live on Website", value: "PUBLISHED" },
            { label: "Pending Admin Review", value: "PENDING_REVIEW" },
            { label: "Paused / Draft", value: "PAUSED" },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setStatusTab(t.value)}
              className={`rounded-xl px-3 py-1.5 transition whitespace-nowrap shrink-0 ${
                statusTab === t.value
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, department, skills..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold shrink-0">
          Showing {filtered.length} of {jobs.length} total requisitions
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200 animate-pulse p-4" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Briefcase size={24} />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Job Postings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || statusTab !== "ALL"
              ? "No job listings match your filter criteria."
              : "Post your first position to start receiving AI-matched candidate applications."}
          </p>
          <div className="pt-2">
            <Link
              href="/employer/jobs/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              <Plus size={15} /> Post New Job
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* MOBILE STACKED CARDS VIEW (< 768px) */}
          <div className="block md:hidden space-y-3.5">
            {filtered.map((j) => (
              <div key={`mob-${j.id}`} className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{j.title}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {j.department} • {j.location} ({modeLabel[j.workMode]})
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                      j.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : j.status === "PENDING_REVIEW"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {j.status === "PUBLISHED" ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live on Website</span>
                      </>
                    ) : j.status === "PENDING_REVIEW" ? (
                      <>
                        <Clock size={11} className="text-amber-600" />
                        <span>Pending Admin Review</span>
                      </>
                    ) : (
                      <span>{j.status}</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Experience</span>
                    <span className="font-semibold text-slate-800 text-[11px]">{j.minExp}–{j.maxExp} yrs</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Salary (CTC)</span>
                    <span className="font-extrabold text-emerald-800 text-[11px]">{salary(j.salaryMinLpa, j.salaryMaxLpa)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Applicants</span>
                    <span className="font-extrabold text-blue-700 text-[11px]">{j.applicationsCount} Candidates</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/jobs/${j.id}`}
                    target="_blank"
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Eye size={14} />
                    <span>View Site</span>
                  </Link>

                  <button
                    type="button"
                    disabled={togglingId === j.id}
                    onClick={() => handleToggleStatus(j.id, j.status)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1 ${
                      j.status === "PUBLISHED"
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {j.status === "PUBLISHED" ? (
                      <>
                        <PauseCircle size={14} />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle size={14} />
                        <span>Publish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP DATA TABLE (>= 768px) */}
          <div className="hidden md:block rounded-3xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Job Role</th>
                    <th className="py-3.5 px-4">Work Mode</th>
                    <th className="py-3.5 px-4">Experience</th>
                    <th className="py-3.5 px-4">Salary (CTC)</th>
                    <th className="py-3.5 px-4">Applicants</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div>
                          <Link
                            href={`/jobs/${j.id}`}
                            target="_blank"
                            className="font-bold text-slate-900 text-sm hover:text-blue-600 transition flex items-center gap-1.5 group"
                          >
                            <span>{j.title}</span>
                            <ExternalLink size={12} className="text-slate-400 group-hover:text-blue-600 transition" />
                          </Link>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {j.department} • {j.location}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {modeLabel[j.workMode]}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {j.minExp}–{j.maxExp} yrs
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-emerald-800">
                        {salary(j.salaryMinLpa, j.salaryMaxLpa)}
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href="/employer/applications"
                          className="inline-flex items-center gap-1 font-extrabold text-blue-600 hover:underline"
                        >
                          <Users size={13} />
                          <span>{j.applicationsCount} Applicants</span>
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            j.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : j.status === "PENDING_REVIEW"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {j.status === "PUBLISHED" ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Live on Website</span>
                            </>
                          ) : j.status === "PENDING_REVIEW" ? (
                            <>
                              <Clock size={11} className="text-amber-600" />
                              <span>Pending Admin Review</span>
                            </>
                          ) : (
                            <span>{j.status}</span>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/jobs/${j.id}`}
                            target="_blank"
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            View Site
                          </Link>

                          <button
                            type="button"
                            disabled={togglingId === j.id}
                            onClick={() => handleToggleStatus(j.id, j.status)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition flex items-center gap-1 ${
                              j.status === "PUBLISHED"
                                ? "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs"
                            }`}
                          >
                            {j.status === "PUBLISHED" ? "Pause" : "Publish Live"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
