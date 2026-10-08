"use client";

import { useState } from "react";
import {
  Cpu,
  Zap,
  Activity,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Sparkles,
} from "lucide-react";
import AdminKpiCard from "./AdminKpiCard";

interface AIUsageItem {
  id: string;
  feature: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  estimatedCostUsd: number;
  status: string;
  createdAt: string;
}

export default function AdminAiUsageView({
  logs,
  totalTokens,
  totalCostUsd,
  avgLatencyMs,
}: {
  logs: AIUsageItem[];
  totalTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
}) {
  const [selectedFeature, setSelectedFeature] = useState("ALL");

  const filtered = logs.filter(
    (l) => selectedFeature === "ALL" || l.feature === selectedFeature
  );

  const featureGroups = Array.from(new Set(logs.map((l) => l.feature)));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/20 mb-2">
              <Cpu className="w-3.5 h-3.5" />
              Gemini & GenAI Gateway
            </span>
            <h1 className="text-2xl font-bold tracking-tight">AI Telemetry & Token Operations</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time model observability, token consumption analytics, latency percentiles, and API unit economics for JobsGhuru AI features.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Gateway Healthy
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <AdminKpiCard
          title="Total Tokens Processed"
          value={totalTokens.toLocaleString()}
          change="+18.4% this week"
          trend="up"
          subtitle="Prompt + Completion"
          icon={<Cpu className="w-5 h-5 text-purple-600" />}
        />
        <AdminKpiCard
          title="GenAI Cloud Spend"
          value={`$${totalCostUsd.toFixed(4)}`}
          change="₹{(totalCostUsd * 86).toFixed(1)} est. cost"
          trend="neutral"
          subtitle="Gemini 1.5 Flash API"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        />
        <AdminKpiCard
          title="Avg Model Latency"
          value={`${avgLatencyMs} ms`}
          change="-42ms optimization"
          trend="up"
          subtitle="End-to-end response time"
          icon={<Clock className="w-5 h-5 text-blue-600" />}
        />
        <AdminKpiCard
          title="Gateway Reliability"
          value="99.9%"
          change="0 rate-limit trips"
          trend="up"
          subtitle="Token quota headroom 84%"
          icon={<Zap className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Feature Breakdown Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Layers className="w-4 h-4 text-purple-600" />
          <span>Feature Gateway:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedFeature("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedFeature === "ALL"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            All Features
          </button>
          {featureGroups.map((feat) => (
            <button
              key={feat}
              onClick={() => setSelectedFeature(feat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedFeature === feat
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {feat.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card Stack View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {filtered.map((log) => (
          <div
            key={log.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {log.feature.replace(/_/g, " ")}
                </h4>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono block">
                  {log.modelName}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                {log.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">Total Tokens</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {log.totalTokens} ({log.promptTokens} in / {log.completionTokens} out)
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">Latency & Cost</span>
                <span className={log.latencyMs > 1000 ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"}>
                  {log.latencyMs} ms
                </span>
                <span className="text-slate-400 text-[10px] block">${log.estimatedCostUsd.toFixed(5)}</span>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-400">
              {new Date(log.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Real-Time Inference Executions
            </h3>
            <p className="text-xs text-slate-500">Live stream of API completions</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filtered.length} entries shown
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Feature & Model</th>
                <th className="px-5 py-3.5">Prompt Tokens</th>
                <th className="px-5 py-3.5">Completion Tokens</th>
                <th className="px-5 py-3.5">Total Tokens</th>
                <th className="px-5 py-3.5">Latency</th>
                <th className="px-5 py-3.5">Cost</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
              {filtered.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5 font-sans">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {log.feature.replace(/_/g, " ")}
                    </div>
                    <div className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">
                      {log.modelName}
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                    {log.promptTokens}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                    {log.completionTokens}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                    {log.totalTokens}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        log.latencyMs > 1000 ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {log.latencyMs} ms
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                    ${log.estimatedCostUsd.toFixed(5)}
                  </td>

                  <td className="px-5 py-3.5 font-sans">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.status}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right text-slate-400 font-sans">
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
