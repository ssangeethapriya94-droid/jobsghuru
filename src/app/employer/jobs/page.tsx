"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  FileCheck,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = () => {
    setLoading(true);
    fetch(`/api/employer/jobs?status=${statusFilter}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setJobs(d.jobs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
        );
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handleDuplicateJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        fetchJobs();
      }
    } catch (e) {
      console.error("Failed to duplicate job:", e);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Company Jobs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your active requisitions, applicant pipelines, and job statuses.
          </p>
        </div>

        <Link
          href="/employer/jobs/new"
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={14} />
          Create New Job
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs by title, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
          {["ALL", "PUBLISHED", "PENDING_REVIEW", "CLOSED"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 transition ${
                statusFilter === s
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-3.5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display text-sm font-bold text-slate-900 hover:text-blue-600 transition">
                    <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                  </h2>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      job.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                        : job.status === "PENDING_REVIEW"
                        ? "bg-amber-50 text-amber-800 border border-amber-200/80"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {job.status === "PENDING_REVIEW" ? "Awaiting Admin Review" : job.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{job.department}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {job.location} ({job.workMode.toLowerCase()})
                  </span>
                  <span>•</span>
                  <span>
                    {job.minExp}-{job.maxExp} yrs exp
                  </span>
                  {job.salaryMinLpa && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        ₹{job.salaryMinLpa} - {job.salaryMaxLpa} LPA
                      </span>
                    </>
                  )}
                </div>

                {/* Skills Preview */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {job.skills?.slice(0, 4).map((sk: string) => (
                    <span
                      key={sk}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Stats & Actions */}
              <div className="flex items-center gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="flex items-center gap-3 text-center text-xs">
                  <div className="rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100">
                    <div className="font-bold text-slate-900">{job.applicationsCount}</div>
                    <div className="text-[10px] text-slate-400">Applications</div>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100">
                    <div className="font-bold text-amber-700">{job.interviewsCount}</div>
                    <div className="text-[10px] text-slate-400">Interviews</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/employer/applications?jobId=${job.id}`}
                    className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                  >
                    Pipeline
                  </Link>

                  {/* Status Toggle Actions */}
                  {job.status === "PUBLISHED" ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(job.id, "PAUSED")}
                      className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                      title="Temporarily pause receiving applicants"
                    >
                      Pause
                    </button>
                  ) : job.status === "PENDING_REVIEW" ? (
                    <span
                      className="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 flex items-center gap-1 shrink-0"
                      title="Submitted to JobsGuru Admin for review and approval"
                    >
                      <Clock size={12} /> Awaiting Admin Approval
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(job.id, "PENDING_REVIEW")}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition"
                      title="Submit job requisition to JobsGuru Admin for moderation approval"
                    >
                      Submit for Review
                    </button>
                  )}

                  {job.status !== "CLOSED" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(job.id, "CLOSED")}
                      className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition"
                      title="Close requisition"
                    >
                      Close
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDuplicateJob(job.id)}
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                    title="Duplicate as new draft"
                  >
                    Clone
                  </button>

                  <Link
                    href={`/jobs/${job.id}`}
                    target="_blank"
                    title="View public candidate listing"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                  >
                    <ExternalLink size={15} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-900">No Jobs Found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any jobs matching this filter. Create a new job requisition to start receiving matched candidates.
          </p>
          <div className="mt-6">
            <Link
              href="/employer/jobs/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
            >
              <Plus size={14} /> Create Your First Job
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
