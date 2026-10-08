"use client";

import { useState } from "react";
import {
  Compass,
  Search,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  IndianRupee,
} from "lucide-react";

interface CareerPathItem {
  id: string;
  title: string;
  department: string;
  level: string;
  skills: string[];
  nextRoles: string[];
  avgSalary: string;
  createdAt: string;
}

const levelColors: Record<string, string> = {
  Entry: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Mid: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Senior: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Lead: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Executive: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function AdminCareerPathsView({
  initialPaths,
}: {
  initialPaths: CareerPathItem[];
}) {
  const [paths] = useState<CareerPathItem[]>(initialPaths);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");

  const departments = Array.from(new Set(paths.map((p) => p.department)));

  const filtered = paths.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      p.nextRoles.some((r) => r.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = deptFilter === "ALL" || p.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 mb-2">
              <Compass className="w-3.5 h-3.5" />
              Career Navigation Engine
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Role Progression & Salary Benchmarks</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Configure industry standard career ladders, stepping stones, requisite skills, and national compensation ranges powering the AI Career Copilot.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-center">
              <div className="text-xs text-slate-300">Active Paths</div>
              <div className="text-xl font-bold text-white">{paths.length}</div>
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
            placeholder="Search role title, required skill, or stepping stone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setDeptFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              deptFilter === "ALL"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            All Tracks
          </button>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                deptFilter === dept
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Career Ladders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((path) => (
          <div
            key={path.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-500/40 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      levelColors[path.level] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {path.level} Level
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {path.department} Track
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {path.title}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Market Benchmark</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {path.avgSalary}
                </span>
              </div>
            </div>

            {/* Core Skills */}
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1.5">
                Core Competencies Required
              </span>
              <div className="flex flex-wrap gap-1.5">
                {path.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Next Roles (Stepping Stones) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1.5">
                Natural Career Upgrades
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {path.nextRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold"
                  >
                    <ArrowRight className="w-3 h-3 text-blue-500" />
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
