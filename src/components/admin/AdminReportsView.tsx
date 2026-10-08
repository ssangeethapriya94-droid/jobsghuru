"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  ShieldCheck,
  Ban,
  FileText,
  Building2,
  Briefcase,
  User,
} from "lucide-react";
import AdminActionModal from "./AdminActionModal";

interface ReportItem {
  id: string;
  reporterEmail: string;
  targetType: string;
  targetId: string;
  targetTitle: string | null;
  reason: string;
  description: string;
  evidenceUrl: string | null;
  status: "OPEN" | "INVESTIGATING" | "ACTION_TAKEN" | "DISMISSED";
  resolutionNote: string | null;
  actionTaken: string | null;
  resolvedBy: string | null;
  createdAt: string;
}

const reasonLabels: Record<string, string> = {
  FAKE_JOB: "Fake / Ghost Job Posting",
  SCAM: "Suspected Fraud / Fee Request",
  HARASSMENT: "Harassment or Misconduct",
  DISCRIMINATION: "Discriminatory Hiring Policy",
  SPAM: "Bulk Unsolicited Spam",
  OTHER: "Policy Violation",
};

const statusColors: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300", text: "Open" },
  INVESTIGATING: { bg: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", text: "Investigating" },
  ACTION_TAKEN: { bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", text: "Action Taken" },
  DISMISSED: { bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400", text: "Dismissed" },
};

export default function AdminReportsView({
  initialReports,
  initialSearch = "",
}: {
  initialReports: ReportItem[];
  initialSearch?: string;
}) {
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [inspectReport, setInspectReport] = useState<ReportItem | null>(null);

  // Action Modal State
  const [activeAction, setActiveAction] = useState<{
    report: ReportItem;
    type: "INVESTIGATE" | "DISMISS" | "ACTION_TAKEN";
    title: string;
    description: string;
    variant: "primary" | "warning" | "danger" | "success";
  } | null>(null);

  const filtered = reports.filter((r) => {
    const matchesSearch =
      r.reporterEmail.toLowerCase().includes(search.toLowerCase()) ||
      (r.targetTitle && r.targetTitle.toLowerCase().includes(search.toLowerCase())) ||
      r.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExecuteAction = async (reason: string, notes?: string) => {
    if (!activeAction) return;

    const res = await fetch(`/api/admin/reports/${activeAction.report.id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: activeAction.type,
        reason,
        resolutionNote: notes,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to process report");
    }

    setReports((prev) =>
      prev.map((r) => (r.id === activeAction.report.id ? { ...r, ...data.report } : r))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-400/20 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              Trust & Safety Command
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Abuse, Scam & Policy Escalations</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Triage user reports regarding fraudulent job postings, unauthorized fee demands, phishing recruiters, and discriminatory behavior. All enforcement actions are bound to immutable audit logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-center">
              <div className="text-xs text-slate-300">Open Incidents</div>
              <div className="text-xl font-bold text-red-400">
                {reports.filter((r) => r.status === "OPEN").length}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-center">
              <div className="text-xs text-slate-300">Active Inquiries</div>
              <div className="text-xl font-bold text-amber-400">
                {reports.filter((r) => r.status === "INVESTIGATING").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reporter, incident details, target title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none shrink-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {["ALL", "OPEN", "INVESTIGATING", "ACTION_TAKEN", "DISMISSED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {st === "ALL" ? "All Incident Types" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE STACKED CARDS VIEW (< 768px) */}
      <div className="block md:hidden space-y-3.5">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
            No safety reports matching current criteria.
          </div>
        ) : (
          filtered.map((report) => {
            const badge = statusColors[report.status] || {
              bg: "bg-slate-100 text-slate-700",
              text: report.status,
            };

            return (
              <div
                key={`mob-${report.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {report.targetTitle || `${report.targetType} #${report.targetId}`}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {report.targetType}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">{report.targetId}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${badge.bg}`}>
                    {badge.text}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 mb-1">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      {reasonLabels[report.reason] || report.reason}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 italic text-[11px]">
                      "{report.description}"
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
                    <span>Reported by: {report.reporterEmail}</span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setInspectReport(report)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  {report.status === "OPEN" && (
                    <button
                      onClick={() =>
                        setActiveAction({
                          report,
                          type: "INVESTIGATE",
                          title: `Investigate Report #${report.id}`,
                          description: `Flag this report for full investigation.`,
                          variant: "warning",
                        })
                      }
                      className="px-3 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-lg text-xs font-semibold"
                    >
                      Investigate
                    </button>
                  )}

                  {report.status !== "ACTION_TAKEN" && (
                    <button
                      onClick={() =>
                        setActiveAction({
                          report,
                          type: "ACTION_TAKEN",
                          title: `Enforce Safety Sanction`,
                          description: `Take punitive action against ${report.targetType}.`,
                          variant: "danger",
                        })
                      }
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Sanction
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP REPORTS TABLE (>= 768px) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Incident Target</th>
                <th className="px-5 py-3.5">Violation Category</th>
                <th className="px-5 py-3.5">Reporter & Details</th>
                <th className="px-5 py-3.5">Current Status</th>
                <th className="px-5 py-3.5">Logged Date</th>
                <th className="px-5 py-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No safety reports matching current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((report) => {
                  const badge = statusColors[report.status] || {
                    bg: "bg-slate-100 text-slate-700",
                    text: report.status,
                  };
                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {report.targetTitle || `${report.targetType} #${report.targetId}`}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {report.targetType}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px]">
                            {report.targetId}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100/80 text-red-800 dark:bg-red-950/70 dark:text-red-300">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          {reasonLabels[report.reason] || report.reason}
                        </span>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <div className="text-xs text-slate-500 mb-0.5">
                          Reported by: <span className="text-slate-700 dark:text-slate-300 font-medium">{report.reporterEmail}</span>
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2">
                          "{report.description}"
                        </div>
                        {report.evidenceUrl && (
                          <a
                            href={report.evidenceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block text-[11px] text-blue-600 hover:underline mt-1"
                          >
                            View Evidence Attachment ↗
                          </a>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}
                        >
                          {badge.text}
                        </span>
                        {report.resolvedBy && (
                          <div className="text-[11px] text-slate-400 mt-1">
                            By {report.resolvedBy.split("@")[0]}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(report.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectReport(report)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {report.status === "OPEN" && (
                            <button
                              onClick={() =>
                                setActiveAction({
                                  report,
                                  type: "INVESTIGATE",
                                  title: `Investigate Report #${report.id}`,
                                  description: `Flag this report for full investigation. Target entity: ${report.targetTitle || report.targetId}.`,
                                  variant: "warning",
                                })
                              }
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:hover:bg-amber-900 dark:text-amber-300 rounded-lg text-xs font-medium transition-colors"
                            >
                              Investigate
                            </button>
                          )}

                          {report.status !== "ACTION_TAKEN" && (
                            <button
                              onClick={() =>
                                setActiveAction({
                                  report,
                                  type: "ACTION_TAKEN",
                                  title: `Enforce Safety Sanction`,
                                  description: `Take punitive action against ${report.targetType} (${report.targetTitle || report.targetId}). If target is a Job, it will be automatically removed from public candidate listing.`,
                                  variant: "danger",
                                })
                              }
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/60 dark:hover:bg-red-900 dark:text-red-300 rounded-lg text-xs font-medium transition-colors"
                            >
                              Sanction
                            </button>
                          )}

                          {report.status !== "DISMISSED" && report.status !== "ACTION_TAKEN" && (
                            <button
                              onClick={() =>
                                setActiveAction({
                                  report,
                                  type: "DISMISS",
                                  title: `Dismiss Report #${report.id}`,
                                  description: `Mark this report as dismissed/unsubstantiated. Target will not be penalized.`,
                                  variant: "primary",
                                })
                              }
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Report Modal */}
      {inspectReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                  Trust & Safety Dossier
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Report #{inspectReport.id}
                </h3>
              </div>
              <button
                onClick={() => setInspectReport(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50">
                <span className="text-slate-400 block font-medium">Target Entity</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                  {inspectReport.targetTitle || inspectReport.targetId}
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Type: {inspectReport.targetType} | ID: {inspectReport.targetId}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50">
                <span className="text-slate-400 block font-medium">Allegation</span>
                <span className="font-semibold text-red-600 block mt-0.5">
                  {reasonLabels[inspectReport.reason] || inspectReport.reason}
                </span>
                <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {inspectReport.description}
                </p>
              </div>

              {inspectReport.actionTaken && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-300">
                  <span className="font-bold block">Resolution Record:</span>
                  <p className="mt-0.5">{inspectReport.actionTaken}</p>
                  {inspectReport.resolutionNote && (
                    <p className="mt-1 text-xs opacity-80">
                      Notes: {inspectReport.resolutionNote}
                    </p>
                  )}
                  <span className="block mt-1 font-mono text-[10px]">
                    Resolved by {inspectReport.resolvedBy}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectReport(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Reason Action Modal */}
      {activeAction && (
        <AdminActionModal
          isOpen={true}
          title={activeAction.title}
          description={activeAction.description}
          actionLabel={`Confirm ${activeAction.type.replace("_", " ")}`}
          variant={activeAction.variant}
          onConfirm={handleExecuteAction}
          onClose={() => setActiveAction(null)}
        />
      )}
    </div>
  );
}
