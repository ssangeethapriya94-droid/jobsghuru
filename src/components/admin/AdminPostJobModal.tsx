"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  IndianRupee,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  Loader2,
} from "lucide-react";

interface CompanyOption {
  id: string;
  name: string;
  location: string;
  verified: boolean;
}

interface AdminPostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated?: (newJob: any) => void;
}

export default function AdminPostJobModal({
  isOpen,
  onClose,
  onJobCreated,
}: AdminPostJobModalProps) {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("Bengaluru");
  const [workMode, setWorkMode] = useState<"REMOTE" | "HYBRID" | "ONSITE">("HYBRID");
  const [jobType, setJobType] = useState<"FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP">("FULL_TIME");
  const [minExp, setMinExp] = useState("2");
  const [maxExp, setMaxExp] = useState("5");
  const [salaryMinLpa, setSalaryMinLpa] = useState("12");
  const [salaryMaxLpa, setSalaryMaxLpa] = useState("24");
  const [skills, setSkills] = useState("React, TypeScript, Next.js, Tailwind CSS");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "PENDING_REVIEW">("PUBLISHED");

  useEffect(() => {
    if (isOpen) {
      setIsLoadingCompanies(true);
      fetch("/api/admin/jobs")
        .then((res) => res.json())
        .then((data) => {
          if (data.companies && data.companies.length > 0) {
            setCompanies(data.companies);
            setCompanyId((prev) => prev || data.companies[0].id);
          }
        })
        .catch((err) => console.error("Failed to load companies:", err))
        .finally(() => setIsLoadingCompanies(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a job title.");
      return;
    }
    if (!companyId) {
      setError("Please select a hiring employer/company.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          companyId,
          department,
          location,
          workMode,
          jobType,
          minExp: parseInt(minExp) || 0,
          maxExp: parseInt(maxExp) || 0,
          salaryMinLpa: salaryMinLpa ? parseInt(salaryMinLpa) : null,
          salaryMaxLpa: salaryMaxLpa ? parseInt(salaryMaxLpa) : null,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          description,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create job posting.");
      }

      if (onJobCreated) {
        onJobCreated(data.job);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create job posting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                Post New Job Card
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publish a verified opening to JobsGhuru job portal and candidate feed.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title & Employer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hiring Employer / Company <span className="text-rose-500">*</span>
              </label>
              {isLoadingCompanies ? (
                <div className="flex items-center gap-2 py-2 text-slate-400">
                  <Loader2 size={14} className="animate-spin text-blue-600" />
                  <span>Loading registered companies...</span>
                </div>
              ) : (
                <select
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.location}) {c.verified ? "✓ Verified" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Department & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Data & Analytics">Data & Analytics</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Bengaluru / Chennai / Mumbai / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Work Mode & Job Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Work Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["REMOTE", "HYBRID", "ONSITE"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setWorkMode(mode)}
                    className={`py-2 rounded-xl font-bold border transition text-center ${
                      workMode === mode
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {mode === "ONSITE" ? "On-site" : mode.charAt(0) + mode.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Employment Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="PART_TIME">Part Time</option>
              </select>
            </div>
          </div>

          {/* Experience Range & Salary Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Experience Range (Years)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="30"
                  placeholder="Min"
                  value={minExp}
                  onChange={(e) => setMinExp(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 text-center"
                />
                <span className="text-slate-400 font-bold">to</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  placeholder="Max"
                  value={maxExp}
                  onChange={(e) => setMaxExp(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Salary Range (₹ LPA)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="150"
                  placeholder="Min LPA"
                  value={salaryMinLpa}
                  onChange={(e) => setSalaryMinLpa(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 text-center"
                />
                <span className="text-slate-400 font-bold">to</span>
                <input
                  type="number"
                  min="1"
                  max="150"
                  placeholder="Max LPA"
                  value={salaryMaxLpa}
                  onChange={(e) => setSalaryMaxLpa(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 text-center"
                />
              </div>
            </div>
          </div>

          {/* Skills Required */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. React, TypeScript, Next.js, Node.js, SQL"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Job Description & Overview
            </label>
            <textarea
              rows={3}
              placeholder="Describe the role overview, mission, and key team expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Publication Status Selection */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Publication Mode
              </span>
              <span className="text-[11px] text-slate-500">
                {status === "PUBLISHED"
                  ? "Live immediately on JobsGhuru homepage and search."
                  : "Drafted into moderation queue for review."}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-700 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
              <button
                type="button"
                onClick={() => setStatus("PUBLISHED")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  status === "PUBLISHED"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                }`}
              >
                Published (Live)
              </button>
              <button
                type="button"
                onClick={() => setStatus("PENDING_REVIEW")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  status === "PENDING_REVIEW"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                }`}
              >
                Pending Review
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Publishing Card...</span>
                </>
              ) : (
                <>
                  <Plus size={15} />
                  <span>Publish Job Card</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
