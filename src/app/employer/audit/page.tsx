"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Clock,
  User,
  Filter,
  Activity,
  FileText,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

export default function EmployerAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = () => {
    setLoading(true);
    fetch(`/api/employer/audit?category=${filter}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setLogs(d.logs);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 mb-2">
            <Activity size={13} className="text-blue-600" />
            Compliance & Activity Telemetry
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Company Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of recruiter stage transitions, job modifications, interviews scheduled, and offer actions.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {["ALL", "JOB", "PIPELINE", "ASSESSMENT", "INTERVIEW", "OFFER"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-lg px-3 py-1.5 transition ${
                filter === cat
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl bg-slate-200 animate-pulse"></div>
      ) : logs.length > 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action.replace("_", " ")}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {log.entityType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {log.reason || "Recorded via hiring command center."}
                  </div>
                </div>

                <div className="text-right sm:text-right shrink-0">
                  <div className="font-semibold text-slate-700">{log.actorEmail}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(log.createdAt).toLocaleString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          No audit logs recorded for this category. Team activities and workflow decisions will automatically appear here.
        </div>
      )}
    </div>
  );
}
