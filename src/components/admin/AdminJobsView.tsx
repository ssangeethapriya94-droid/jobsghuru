"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Building2,
  MapPin,
  IndianRupee,
  Clock,
  ExternalLink,
  ShieldCheck,
  Check,
  Plus,
} from "lucide-react";
import AdminActionModal from "./AdminActionModal";
import AdminPostJobModal from "./AdminPostJobModal";
import { salary, modeLabel, typeLabel } from "@/lib/format";

interface JobItem {
  id: string;
  title: string;
  department: string;
  location: string;
  workMode: "REMOTE" | "HYBRID" | "ONSITE";
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  minExp: number;
  maxExp: number;
  salaryMinLpa: number | null;
  salaryMaxLpa: number | null;
  status: string;
  skills: string[];
  description: string;
  postedAt: string;
  company: {
    id: string;
    name: string;
    verified: boolean;
  };
  _count: { applications: number };
}

export default function AdminJobsView({
  initialJobs,
  filterOnlyModeration = false,
}: {
  initialJobs: JobItem[];
  filterOnlyModeration?: boolean;
}) {
  const [jobs, setJobs] = useState<JobItem[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState(filterOnlyModeration ? "PENDING_REVIEW" : "ALL");
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [inspectJob, setInspectJob] = useState<JobItem | null>(null);

  // Moderation Modal
  const [modalAction, setModalAction] = useState<"APPROVE" | "REQUEST_CHANGES" | "REJECT" | "SUSPEND">("APPROVE");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = jobs.filter((j) => {
    if (statusTab !== "ALL" && j.status !== statusTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.company.name.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExecuteModeration = async (reason: string) => {
    if (!selectedJob) return;

    const res = await fetch(`/api/admin/jobs/${selectedJob.id}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: modalAction, reason }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to execute moderation decision.");

    let newStatus = "PUBLISHED";
    if (modalAction === "REJECT") newStatus = "REJECTED";
    if (modalAction === "SUSPEND") newStatus = "PAUSED";
    if (modalAction === "REQUEST_CHANGES") newStatus = "PENDING_REVIEW";

    setJobs((prev) =>
      prev.map((j) => (j.id === selectedJob.id ? { ...j, status: newStatus } : j))
    );

    showToast(`Job listing "${selectedJob.title}" status updated to ${newStatus}.`);
    setInspectJob(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
            {filterOnlyModeration ? "Job Moderation Queue" : "Job Listings Governance"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Verify pay transparency, non-discriminatory hiring criteria, and compliance before publication.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          {/* Status Filter - Scrollable on Mobile */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 text-xs font-semibold text-slate-600 shadow-2xs w-full sm:w-auto overflow-x-auto max-w-full scrollbar-none shrink-0">
            {[
              { label: "All Postings", value: "ALL" },
              { label: "Published", value: "PUBLISHED" },
              { label: "Pending Review", value: "PENDING_REVIEW" },
              { label: "Suspended", value: "PAUSED" },
              { label: "Rejected", value: "REJECTED" },
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

          {/* Post New Job Card Button */}
          {!filterOnlyModeration && (
            <button
              onClick={() => setIsCreateJobModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition active:scale-95 cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Post New Job Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, company, skills..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold shrink-0">
          {filtered.length} postings
        </span>
      </div>

      {/* MOBILE STACKED CARDS VIEW (< 768px) */}
      <div className="block md:hidden space-y-3.5">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 text-center text-xs text-slate-400">
            No job listings found in this queue.
          </div>
        ) : (
          filtered.map((j) => (
            <div key={`mob-${j.id}`} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{j.title}</h3>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <span>{j.company.name}</span>
                    {j.company.verified && <ShieldCheck size={13} className="text-emerald-600" />}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                    j.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : j.status === "PENDING_REVIEW"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {j.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Department & Location</span>
                  <span className="font-semibold text-slate-800 text-[11px] block truncate">{j.department} • {j.location}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Work Mode</span>
                  <span className="font-semibold text-slate-700 text-[11px]">{modeLabel[j.workMode]}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Experience</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{j.minExp}–{j.maxExp} yrs</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Salary (CTC)</span>
                  <span className="font-extrabold text-emerald-800 text-[11px]">{salary(j.salaryMinLpa, j.salaryMaxLpa)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectJob(j)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Review
                </button>

                {j.status !== "PUBLISHED" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJob(j);
                      setModalAction("APPROVE");
                      setIsModalOpen(true);
                    }}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white shadow-2xs transition"
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJob(j);
                      setModalAction("SUSPEND");
                      setIsModalOpen(true);
                    }}
                    className="flex-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 py-2 text-xs font-bold text-rose-700 transition"
                  >
                    Pause
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP DATA TABLE (>= 768px) */}
      <div className="hidden md:block rounded-3xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Job Role</th>
                <th className="py-3.5 px-4">Employer</th>
                <th className="py-3.5 px-4">Work Mode</th>
                <th className="py-3.5 px-4">Experience</th>
                <th className="py-3.5 px-4">Salary (CTC)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No job listings found in this queue.
                  </td>
                </tr>
              ) : (
                filtered.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div>
                        <div className="font-bold text-slate-900 text-sm leading-tight hover:text-blue-600 transition">
                          {j.title}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {j.department} • {j.location}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span>{j.company.name}</span>
                        {j.company.verified && (
                          <ShieldCheck size={13} className="text-emerald-600" />
                        )}
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

                    <td className="py-3.5 px-4 font-bold text-emerald-800">
                      {salary(j.salaryMinLpa, j.salaryMaxLpa)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          j.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : j.status === "PENDING_REVIEW"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectJob(j)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Review
                        </button>

                        {j.status !== "PUBLISHED" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJob(j);
                              setModalAction("APPROVE");
                              setIsModalOpen(true);
                            }}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs transition"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJob(j);
                              setModalAction("SUSPEND");
                              setIsModalOpen(true);
                            }}
                            className="rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-700 transition"
                          >
                            Pause
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Detailed Inspection Drawer */}
      {inspectJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setInspectJob(null)}
          />
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl my-auto max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Compliance Audit View
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                  {inspectJob.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {inspectJob.company.name} • {inspectJob.location}
                </p>
              </div>

              <button
                onClick={() => setInspectJob(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs text-slate-700">
              {/* Pay Transparency Inspection */}
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4">
                <span className="font-bold text-emerald-950 uppercase text-[10px] tracking-wider block mb-1">
                  Pay Transparency & Disclosure
                </span>
                <div className="flex justify-between items-center text-sm font-bold text-emerald-900">
                  <span>Salary Range: {salary(inspectJob.salaryMinLpa, inspectJob.salaryMaxLpa)}</span>
                  <span className="text-xs font-semibold">✓ Meets Disclosure Norms</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Role Description</h4>
                <p className="leading-relaxed text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {inspectJob.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Target Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {inspectJob.skills.map((s) => (
                    <span key={s} className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 font-semibold text-blue-700 text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJob(inspectJob);
                    setModalAction("REJECT");
                    setIsModalOpen(true);
                  }}
                  className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-2 font-bold hover:bg-rose-100 transition"
                >
                  Reject Policy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJob(inspectJob);
                    setModalAction("APPROVE");
                    setIsModalOpen(true);
                  }}
                  className="rounded-xl bg-blue-600 text-white px-5 py-2 font-bold shadow-xs hover:bg-blue-700 transition"
                >
                  Approve & Publish Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Action Modal */}
      <AdminActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalAction === "APPROVE"
            ? `Approve & Publish "${selectedJob?.title}"`
            : `Reject / Suspend "${selectedJob?.title}"`
        }
        description={`Moderation decisions are logged with timestamp and moderator ID. Published jobs are immediately visible to candidates across feeds.`}
        confirmLabel={modalAction === "APPROVE" ? "Confirm & Publish" : "Apply Moderation Status"}
        confirmVariant={modalAction === "APPROVE" ? "success" : "danger"}
        requireReason={true}
        onConfirm={handleExecuteModeration}
      />

      {/* Create New Job Card Modal */}
      <AdminPostJobModal
        isOpen={isCreateJobModalOpen}
        onClose={() => setIsCreateJobModalOpen(false)}
        onJobCreated={(newJob) => {
          setJobs((prev) => [newJob, ...prev]);
          showToast(`Job listing "${newJob.title}" posted successfully!`);
        }}
      />
    </div>
  );
}
