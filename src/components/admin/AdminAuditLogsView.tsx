"use client";

import { useState } from "react";
import {
  FileCheck,
  Search,
  Filter,
  ShieldAlert,
  User,
  Clock,
  Eye,
  Terminal,
  Code,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeJson: string | null;
  afterJson: string | null;
  reason: string;
  ipAddress: string | null;
  createdAt: string;
}

export default function AdminAuditLogsView({
  initialLogs,
}: {
  initialLogs: AuditLogItem[];
}) {
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const entityTypes = Array.from(new Set(logs.map((l) => l.entityType)));

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId.toLowerCase().includes(search.toLowerCase());

    const matchesEntity = entityFilter === "ALL" || l.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 mb-2">
              <FileCheck className="w-3.5 h-3.5" />
              SOC2 & ISO-27001 Compliance Trail
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Immutable Governance & Audit Ledger</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Cryptographically timestamped audit trail of all sensitive administrator interventions. Every suspension, verification, rate limit update, and permission change is recorded with mandatory justification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-center">
              <div className="text-xs text-slate-300">Total Entries</div>
              <div className="text-xl font-bold text-white">{logs.length}</div>
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
            placeholder="Search administrator email, action, entity ID or reason..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <button
            onClick={() => setEntityFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              entityFilter === "ALL"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            All Targets
          </button>
          {entityTypes.map((et) => (
            <button
              key={et}
              onClick={() => setEntityFilter(et)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                entityFilter === et
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {et}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Mobile Card View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {filtered.map((log) => (
          <div
            key={log.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  {log.action}
                </span>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-1.5">
                  {log.actorEmail}
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(log)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                Diff
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Target</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {log.entityType}
                </span>
                <span className="block text-[10px] font-mono text-slate-400 truncate">
                  {log.entityId}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Timestamp</span>
                <span className="text-slate-500 text-[11px]">
                  {new Date(log.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 text-xs text-slate-700 dark:text-slate-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Justification</span>
              <p className="italic text-xs mt-0.5">"{log.reason}"</p>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Logs Desktop Table (>= 768px) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Administrator</th>
                <th className="px-5 py-3.5">Action Executed</th>
                <th className="px-5 py-3.5">Entity Target</th>
                <th className="px-5 py-3.5">Mandatory Justification</th>
                <th className="px-5 py-3.5 text-right">State Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
              {filtered.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap font-sans text-xs">
                    {new Date(log.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="px-5 py-3.5 font-sans">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                      {log.actorEmail}
                    </div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                      {log.actorRole}
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      {log.action}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 font-sans">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {log.entityType}
                    </span>
                    <span className="block text-[11px] font-mono text-slate-400 mt-0.5 truncate max-w-[120px]">
                      {log.entityId}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 font-sans text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate">
                    "{log.reason}"
                  </td>

                  <td className="px-5 py-3.5 text-right font-sans">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Diff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* State Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Audit Snapshot #{selectedLog.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedLog.action}
                </h3>
                <p className="text-xs text-slate-500">
                  Target: {selectedLog.entityType} ({selectedLog.entityId})
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Administrator:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedLog.actorEmail} ({selectedLog.actorRole})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Justification:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 italic">
                  "{selectedLog.reason}"
                </span>
              </div>
              {selectedLog.ipAddress && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">IP Address:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {selectedLog.ipAddress}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-1">
                  Previous State (Before)
                </span>
                <pre className="p-3 bg-slate-950 text-red-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-52 border border-slate-800">
                  {selectedLog.beforeJson
                    ? JSON.stringify(JSON.parse(selectedLog.beforeJson), null, 2)
                    : "// No prior state recorded"}
                </pre>
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                  Mutated State (After)
                </span>
                <pre className="p-3 bg-slate-950 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-52 border border-slate-800">
                  {selectedLog.afterJson
                    ? JSON.stringify(JSON.parse(selectedLog.afterJson), null, 2)
                    : "// No after state recorded"}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
