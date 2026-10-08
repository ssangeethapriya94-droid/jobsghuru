"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Briefcase,
  User,
  Star,
  ExternalLink,
  ChevronRight,
  Eye,
  Info,
} from "lucide-react";

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
    id: string;
    title: string;
    location: string;
    company: {
      id: string;
      name: string;
      verified: boolean;
    };
  };
}

const statusColors: Record<string, { bg: string; text: string }> = {
  SUBMITTED: { bg: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", text: "Submitted" },
  UNDER_REVIEW: { bg: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", text: "Under Review" },
  SHORTLISTED: { bg: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", text: "Shortlisted" },
  INTERVIEW_SCHEDULED: { bg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", text: "Interviewing" },
  OFFER_EXTENDED: { bg: "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300", text: "Offer Extended" },
  HIRED: { bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", text: "Hired" },
  REJECTED: { bg: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300", text: "Rejected" },
  WITHDRAWN: { bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400", text: "Withdrawn" },
};

export default function AdminApplicationsView({
  initialApplications,
}: {
  initialApplications: ApplicationItem[];
}) {
  const [apps, setApps] = useState<ApplicationItem[]>(initialApplications);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    setIsUpdating(true);
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
        throw new Error("Failed to update status on server");
      }

      setApps((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      if (selectedApp?.id === appId) {
        setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      setToastMessage(`Application status updated to ${newStatus.replace(/_/g, " ")}`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setToastMessage(err.message || "Failed to update status");
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = apps.filter((app) => {
    const matchesSearch =
      app.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      app.candidateEmail.toLowerCase().includes(search.toLowerCase()) ||
      app.job.title.toLowerCase().includes(search.toLowerCase()) ||
      app.job.company.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl font-medium text-xs animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
      {/* Top Banner / Explanation */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/20 mb-2">
              <FileText className="w-3.5 h-3.5" />
              Platform Application Oversight
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Application Pipeline Monitor</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Inspect platform-wide candidate conversion, AI match health, and application velocity across all registered employers while honoring employer-recruiter candidate confidentiality.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-center">
              <div className="text-xs text-slate-300">Total Tracked</div>
              <div className="text-xl font-bold text-white">{apps.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-center">
              <div className="text-xs text-slate-300">Avg AI Match</div>
              <div className="text-xl font-bold text-emerald-400">86%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, email, role, employer..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {["ALL", "SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "HIRED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {st === "ALL" ? "All Statuses" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-5 py-3.5">Target Job & Employer</th>
                <th className="px-5 py-3.5">Experience & CTC</th>
                <th className="px-5 py-3.5">AI Match</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Applied Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No applications match the current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => {
                  const badge = statusColors[app.status] || {
                    bg: "bg-slate-100 text-slate-700",
                    text: app.status,
                  };
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {app.candidateName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {app.candidateEmail}
                        </div>
                        <div className="text-xs text-slate-400">
                          {app.candidatePhone}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {app.job.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.job.company.name}</span>
                          {app.job.company.verified && (
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded">
                              Verified
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-xs text-slate-900 dark:text-slate-100 font-medium">
                          {app.experienceYears > 0 ? `${app.experienceYears} yrs exp` : "Fresher"}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {app.currentRole ? `${app.currentRole}` : "Not specified"}
                        </div>
                        {app.expectedCtc && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            Expected: ₹{app.expectedCtc} LPA
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              app.matchScore >= 85
                                ? "bg-emerald-500"
                                : app.matchScore >= 70
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {app.matchScore}%
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}
                        >
                          {badge.text}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Application Metadata
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedApp.candidateName}
                </h3>
                <p className="text-xs text-slate-500">ID: {selectedApp.id}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-400 block font-medium">Position</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                  {selectedApp.job.title}
                </span>
                <span className="text-slate-500 block mt-0.5">{selectedApp.job.company.name}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-400 block font-medium">AI Match Score</span>
                <span className="text-emerald-600 font-bold text-base">
                  {selectedApp.matchScore}%
                </span>
                <span className="text-slate-500 block mt-0.5">Resume vs Job requirements</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-400 block font-medium">Contact Details</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium block">
                  {selectedApp.candidateEmail}
                </span>
                <span className="text-slate-500 block mt-0.5">{selectedApp.candidatePhone}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-400 block font-medium">Current Profile</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium block">
                  {selectedApp.currentRole || "Fresher"}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  {selectedApp.experienceYears} Years Total Experience
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Confidentiality Policy:</strong> As a Platform Administrator, you may observe submission velocity and delivery integrity. Detailed interview notes and hiring decision memos remain exclusively managed by the authorized employer recruiter.
              </span>
            </div>

            {/* Quick Status Action Controls */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2">
                Update Pipeline Status:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedApp.id, st)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                      selectedApp.status === st
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
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
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
