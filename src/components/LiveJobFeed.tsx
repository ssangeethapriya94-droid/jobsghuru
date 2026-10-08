"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import JobCard from "@/components/JobCard";

interface LiveJobFeedProps {
  jobs: any[];
}

export default function LiveJobFeed({ jobs }: LiveJobFeedProps) {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [filterText, setFilterText] = useState<string>("");

  const filteredJobs = useMemo(() => {
    let list = jobs;

    if (activeTab === "REMOTE") {
      list = list.filter((j) => j.workMode === "REMOTE");
    } else if (activeTab === "HIGH_PAY") {
      list = list.filter((j) => (j.salaryMaxLpa || 0) >= 15);
    } else if (activeTab === "INTERNSHIP") {
      list = list.filter((j) => j.jobType === "INTERNSHIP");
    } else if (activeTab !== "ALL") {
      list = list.filter((j) => j.department.toLowerCase() === activeTab.toLowerCase());
    }

    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.name.toLowerCase().includes(q) ||
          j.skills.some((s: string) => s.toLowerCase().includes(q))
      );
    }

    return list;
  }, [jobs, activeTab, filterText]);

  const tabs = [
    { id: "ALL", label: "All Roles", count: jobs.length },
    { id: "REMOTE", label: "Remote", count: jobs.filter((j) => j.workMode === "REMOTE").length },
    { id: "Engineering", label: "Engineering", count: jobs.filter((j) => j.department === "Engineering").length },
    { id: "Data", label: "Data", count: jobs.filter((j) => j.department === "Data").length },
    { id: "Design", label: "Design", count: jobs.filter((j) => j.department === "Design").length },
    { id: "HIGH_PAY", label: "High Pay (15+ LPA)", count: jobs.filter((j) => (j.salaryMaxLpa || 0) >= 15).length },
  ];

  return (
    <section className="container-x mt-20">
      {/* Title & Controls Bar */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <Zap size={13} className="text-blue-600 fill-current" /> Live Openings
          </span>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Latest Verified Positions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Confirmed recruiter reply guarantees and transparent compensation.
          </p>
        </div>

        {/* Quick Search inside feed */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Quick search roles..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full md:w-64 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <Link
            href="/jobs"
            className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition sm:flex"
          >
            All Jobs <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200/80 pb-3">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                active
                  ? "bg-slate-900 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded px-1.5 py-0.2 text-[10px] ${
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Jobs */}
      {filteredJobs.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-4 4xl:grid-cols-5">
          {filteredJobs.slice(0, 10).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="font-display text-base font-bold text-slate-800">No jobs match your filter</p>
          <p className="mt-1 text-xs text-slate-500">Try switching to a different tab or clearing search text.</p>
          <button
            type="button"
            onClick={() => {
              setActiveTab("ALL");
              setFilterText("");
            }}
            className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Bottom CTA to /jobs */}
      <div className="mt-8 flex justify-center">
        <Link
          href={`/jobs?${activeTab !== "ALL" ? `mode=${activeTab}` : ""}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-xs transition hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"
        >
          View all {jobs.length} open positions <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
