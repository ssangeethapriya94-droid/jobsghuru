"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  ShieldCheck,
  Flag,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Share2,
  Bookmark,
  Sparkles,
  Zap,
  Building,
  Check,
  ExternalLink,
  Laptop,
  Users,
  Calendar,
  Layers,
  ChevronRight,
  Heart,
  Gift,
  Award,
  GraduationCap,
  TrendingUp,
  MessageSquare,
  ShieldAlert,
  HelpCircle,
  ThumbsUp,
  FileCheck,
} from "lucide-react";
import JobApplicationModal from "./JobApplicationModal";
import { modeLabel, typeLabel, salary, ago } from "@/lib/format";

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  industry: string;
  size: string;
  location: string;
  website: string | null;
  description: string;
  verified: boolean;
}

interface JobData {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  preferredSkills: string[];
  location: string;
  workMode: "REMOTE" | "HYBRID" | "ONSITE";
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  minExp: number;
  maxExp: number;
  salaryMinLpa: number | null;
  salaryMaxLpa: number | null;
  department: string;
  postedAt: string;
  lastActivityAt: string;
  responseRatePct: number;
  company: CompanyData;
}

interface SimilarJob {
  id: string;
  title: string;
  location: string;
  workMode: "REMOTE" | "HYBRID" | "ONSITE";
  salaryMinLpa: number | null;
  salaryMaxLpa: number | null;
  company: {
    name: string;
    verified: boolean;
  };
}

interface MatchExplanation {
  covered: string[];
  missing: string[];
  rows: {
    label: string;
    fit: string;
    note: string;
  }[];
}

const DEFAULT_BENEFITS = [
  {
    icon: Gift,
    title: "Health & Wellness",
    desc: "Comprehensive health insurance for you and dependents up to ₹5 Lakhs.",
    color: "from-rose-500/10 to-pink-500/10 text-rose-600 border-rose-100",
  },
  {
    icon: Laptop,
    title: "Remote Work Setup",
    desc: "Latest M-series MacBook Pro + ₹25,000 ergonomic home-office stipend.",
    color: "from-blue-500/10 to-cyan-500/10 text-blue-600 border-blue-100",
  },
  {
    icon: GraduationCap,
    title: "Learning & Growth",
    desc: "₹40,000/year annual stipend for courses, books, and international tech conferences.",
    color: "from-purple-500/10 to-indigo-500/10 text-purple-600 border-purple-100",
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    desc: "Autonomous core working hours with unlimited sick leaves and 24 PTO days.",
    color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-100",
  },
  {
    icon: TrendingUp,
    title: "Performance Bonus",
    desc: "Quarterly performance reviews with competitive bi-annual salary appraisal.",
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-100",
  },
  {
    icon: Award,
    title: "Family Friendly",
    desc: "Paid parental leaves, mental health consultation, and day-care support.",
    color: "from-sky-500/10 to-blue-500/10 text-sky-600 border-sky-100",
  },
];

export default function JobDetailClient({
  job,
  match,
  similarJobs,
  profile,
}: {
  job: JobData;
  match: MatchExplanation;
  similarJobs: SimilarJob[];
  profile: {
    skills: string[];
    years: number;
    minLpa: number;
    mode: string;
  };
}) {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [appliedInfo, setAppliedInfo] = useState<{
    applicationId: string;
    appliedAt: string;
    status: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "responsibilities" | "skills" | "benefits" | "company">("overview");

  useEffect(() => {
    try {
      const storedApplied = JSON.parse(
        localStorage.getItem("cb_applied_jobs") || "{}"
      );
      if (storedApplied[job.id]) {
        setAppliedInfo(storedApplied[job.id]);
      }

      const storedSaved = JSON.parse(
        localStorage.getItem("cb_saved_jobs") || "[]"
      );
      if (Array.isArray(storedSaved) && storedSaved.includes(job.id)) {
        setIsSaved(true);
      }
    } catch (e) {
      console.error("Failed to load local storage state", e);
    }

    const handleScroll = () => {
      if (window.scrollY > 420) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [job.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleSave = () => {
    try {
      const storedSaved = JSON.parse(
        localStorage.getItem("cb_saved_jobs") || "[]"
      );
      let updated: string[] = [];
      if (isSaved) {
        updated = storedSaved.filter((id: string) => id !== job.id);
        setIsSaved(false);
        showToast("Job removed from saved list");
      } else {
        updated = [...storedSaved, job.id];
        setIsSaved(true);
        showToast("Job saved to your shortlist!");
      }
      localStorage.setItem("cb_saved_jobs", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Job link copied to clipboard!");
    } else {
      showToast("Share URL: " + window.location.href);
    }
  };

  const handleApplicationSuccess = (appId: string) => {
    setAppliedInfo({
      applicationId: appId,
      appliedAt: new Date().toISOString(),
      status: "Under Review",
    });
    showToast("Application submitted successfully!");
  };

  // Match score calculation with sensible bounds
  const matchScore = Math.min(
    98,
    Math.max(
      65,
      Math.round(
        (match.covered.length / Math.max(1, job.skills.length)) * 50 +
          (profile.years >= job.minExp ? 35 : 20) +
          (job.salaryMaxLpa && job.salaryMaxLpa >= profile.minLpa ? 15 : 10)
      )
    )
  );

  const postedAgo = ago(new Date(job.postedAt));
  const activityDays = Math.floor(
    (Date.now() - new Date(job.lastActivityAt).getTime()) / 86_400_000
  );

  const scrollToSection = (id: string, tab: typeof activeTab) => {
    setActiveTab(tab);
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/95 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl backdrop-blur-md transition-all animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-slate-200/80 bg-white shadow-2xs">
        <div className="container-x py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
            >
              <ArrowLeft size={14} />
              <span>Back to all jobs</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 hover:text-blue-600 cursor-pointer">
              {job.department}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
              {job.title}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition active:scale-95"
              title="Share job"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handleToggleSave}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition shadow-2xs active:scale-95 ${
                isSaved
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
              title="Save job"
            >
              <Heart
                size={13}
                className={isSaved ? "fill-rose-500 text-rose-500" : ""}
              />
              <span className="hidden sm:inline">
                {isSaved ? "Shortlisted" : "Save Job"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="container-x mt-6">
        {/* HERO HEADER CARD (State-of-the-art SaaS Job Header) */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 lg:p-10 shadow-[0_16px_40px_-10px_rgba(15,23,42,0.07)]">
          {/* Subtle Accent Glows */}
          <div className="absolute top-0 right-0 h-96 w-96 -translate-y-24 translate-x-24 rounded-full bg-gradient-to-br from-blue-100/60 via-indigo-50/40 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            {/* Left: Company Monogram, Title, Meta */}
            <div className="flex items-start gap-4 sm:gap-6">
              {/* Rich Monogram Squircle */}
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white font-black text-2xl sm:text-3xl shadow-lg shadow-blue-500/25 shrink-0 border-2 border-white">
                {job.company.name.charAt(0)}
              </div>

              <div>
                {/* Title & Badge */}
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {job.title}
                  </h1>
                  <span className="rounded-full bg-blue-50 border border-blue-200/80 px-3 py-1 text-xs font-bold text-blue-700">
                    {typeLabel[job.jobType]}
                  </span>
                </div>

                {/* Company Name & Verified Tag */}
                <div className="mt-2 flex flex-wrap items-center gap-2.5 text-sm">
                  <span className="font-bold text-slate-900 text-base sm:text-lg">
                    {job.company.name}
                  </span>
                  {job.company.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-2xs">
                      <BadgeCheck size={14} className="text-emerald-600" />
                      <span>Verified Employer</span>
                    </span>
                  )}
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <span>★ 4.3</span>
                    <span className="text-slate-400 font-normal">(120+ reviews)</span>
                  </div>
                </div>

                {/* Badges Bar */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  {/* Location */}
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                    <MapPin size={13} className="text-blue-600" />
                    <span>{job.location}</span>
                  </div>

                  {/* Work Mode */}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-2xs ${
                      job.workMode === "REMOTE"
                        ? "border border-cyan-200 bg-cyan-50/90 text-cyan-800"
                        : job.workMode === "HYBRID"
                        ? "border border-purple-200 bg-purple-50/90 text-purple-800"
                        : "border border-slate-200 bg-slate-100 text-slate-800"
                    }`}
                  >
                    <Laptop size={13} />
                    <span>{modeLabel[job.workMode]}</span>
                  </div>

                  {/* Experience */}
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                    <Clock size={13} className="text-indigo-600" />
                    <span>{job.minExp}–{job.maxExp} Years Exp</span>
                  </div>

                  {/* Salary Highlight */}
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs">
                    <IndianRupee size={14} className="text-emerald-600" />
                    <span>{salary(job.salaryMinLpa, job.salaryMaxLpa)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Apply Button & Urgent Response SLA */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0 pt-2 lg:pt-0">
              {appliedInfo ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/95 p-4 text-left lg:text-right shadow-xs w-full lg:w-auto">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 lg:justify-end">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Applied on {new Date(appliedInfo.appliedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-700 font-mono">
                    Tracking: {appliedInfo.applicationId} • {appliedInfo.status}
                  </p>
                  <button
                    onClick={() => setIsApplyModalOpen(true)}
                    className="mt-2 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline block lg:inline-block"
                  >
                    View Application Packet →
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/35 active:scale-95 cursor-pointer w-full sm:w-auto"
                >
                  <span className="absolute -inset-x-full top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transition-all duration-700 group-hover:inset-x-full" />
                  <span>Apply Now</span>
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              )}

              {/* Fast Response Guarantee */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Zap size={14} className="text-amber-500" />
                <span>
                  Recruiter active {activityDays <= 0 ? "today" : `${activityDays}d ago`} • Posted {postedAgo}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION NAVIGATION TABS (Sticky feel for smooth scanning) */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none text-xs font-bold">
          <button
            onClick={() => scrollToSection("sec-overview", "overview")}
            className={`rounded-xl px-4 py-2 transition shrink-0 ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => scrollToSection("sec-responsibilities", "responsibilities")}
            className={`rounded-xl px-4 py-2 transition shrink-0 ${
              activeTab === "responsibilities"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Responsibilities & Requirements
          </button>
          <button
            onClick={() => scrollToSection("sec-skills", "skills")}
            className={`rounded-xl px-4 py-2 transition shrink-0 ${
              activeTab === "skills"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Skills & Stack
          </button>
          <button
            onClick={() => scrollToSection("sec-benefits", "benefits")}
            className={`rounded-xl px-4 py-2 transition shrink-0 ${
              activeTab === "benefits"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Perks & Benefits
          </button>
          <button
            onClick={() => scrollToSection("sec-company", "company")}
            className={`rounded-xl px-4 py-2 transition shrink-0 ${
              activeTab === "company"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            About Company
          </button>
        </div>

        {/* MAIN BODY: 2 COLUMN GRID */}
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px]">
          {/* LEFT COLUMN: Role Details, Responsibilities, Requirements, Benefits, Company */}
          <div className="space-y-6">
            {/* Quick Overview Spec Grid (6 Distinct Themed Cards) */}
            <div id="sec-overview" className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileCheck size={15} className="text-blue-600" />
                  <span>Job Snapshot & Overview</span>
                </h2>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <Zap size={13} /> Active Hiring Priority
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
                {/* Annual CTC */}
                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-teal-50/30 p-4 transition hover:border-emerald-300 hover:shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <IndianRupee size={15} />
                    </div>
                    <span>Annual CTC</span>
                  </div>
                  <p className="mt-2 text-base font-extrabold text-slate-900">
                    {salary(job.salaryMinLpa, job.salaryMaxLpa)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Fixed + Incentives</p>
                </div>

                {/* Experience */}
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-indigo-50/30 p-4 transition hover:border-blue-300 hover:shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <Clock size={15} />
                    </div>
                    <span>Experience</span>
                  </div>
                  <p className="mt-2 text-base font-extrabold text-slate-900">
                    {job.minExp} to {job.maxExp} Years
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mid-Senior Level</p>
                </div>

                {/* Work Mode */}
                <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/60 to-fuchsia-50/30 p-4 transition hover:border-purple-300 hover:shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-700">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                      <Laptop size={15} />
                    </div>
                    <span>Work Mode</span>
                  </div>
                  <p className="mt-2 text-base font-extrabold text-slate-900">
                    {modeLabel[job.workMode]}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Flexible arrangements</p>
                </div>

                {/* Job Type */}
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-blue-50/30 p-4 transition hover:border-indigo-300 hover:shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <Briefcase size={15} />
                    </div>
                    <span>Job Type</span>
                  </div>
                  <p className="mt-2 text-base font-extrabold text-slate-900">
                    {typeLabel[job.jobType]}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Direct Payroll</p>
                </div>

                {/* Openings */}
                <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/60 to-cyan-50/30 p-4 transition hover:border-sky-300 hover:shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                      <Users size={15} />
                    </div>
                    <span>Openings</span>
                  </div>
                  <p className="mt-2 text-base font-extrabold text-slate-900">
                    2 Immediate Roles
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Urgent requirement</p>
                </div>

                {/* Department */}
                <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/60 to-yellow-50/30 p-4 transition hover:border-amber-300 hover:shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <Layers size={15} />
                    </div>
                    <span>Department</span>
                  </div>
                  <p className="mt-2 text-base font-extrabold text-slate-900 truncate">
                    {job.department}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Core Product Team</p>
                </div>
              </div>
            </div>

            {/* About the Role */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                  <Briefcase size={16} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    Role Summary
                  </h2>
                  <p className="text-xs text-slate-500">
                    What this position accomplishes at {job.company.name}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-700">
                {job.description}
              </p>
            </div>

            {/* Key Responsibilities */}
            <div id="sec-responsibilities" className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm">
                    <CheckCircle2 size={18} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                      Key Responsibilities
                    </h3>
                    <p className="text-xs text-slate-500">
                      Your day-to-day focus and high-impact deliverables
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {job.responsibilities.length} Deliverables
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {job.responsibilities.map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-2xs"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-extrabold shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-700 leading-relaxed group-hover:text-slate-900 transition">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Requirements & Qualifications */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
                    <Award size={18} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                      Candidate Requirements & Qualifications
                    </h3>
                    <p className="text-xs text-slate-500">
                      What you bring to the table for this role
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  Essential Criteria
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {job.requirements.map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-2xs"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Check size={14} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 leading-relaxed group-hover:text-slate-900 transition">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Tech Stack */}
            <div id="sec-skills" className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                    Required Skills & Tech Stack
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Skills highlighted with checkmarks match your candidate profile
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {match.covered.length} of {job.skills.length} Matched
                </span>
              </div>

              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Core Requirements:
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {job.skills.map((skill) => {
                    const isMatched = match.covered.some(
                      (c) => c.toLowerCase() === skill.toLowerCase()
                    );
                    return (
                      <span
                        key={skill}
                        className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
                          isMatched
                            ? "border border-emerald-300 bg-emerald-50 text-emerald-800 hover:scale-105"
                            : "border border-blue-200 bg-blue-50/70 text-blue-700 hover:scale-105"
                        }`}
                      >
                        {isMatched ? (
                          <Check size={14} className="text-emerald-600 stroke-[3]" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        )}
                        <span>{skill}</span>
                        {isMatched && (
                          <span className="rounded-md bg-emerald-200/80 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-900 uppercase">
                            Matched
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              {job.preferredSkills.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Good To Have (Bonus):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>{skill}</span>
                        <span className="text-[10px] text-slate-400">
                          (Preferred)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Perks & Benefits Section (Transforms ordinary page into high-converting portal) */}
            <div id="sec-benefits" className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Gift size={20} className="text-rose-500" />
                    <span>Perks & Employee Benefits</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    What {job.company.name} offers beyond salary
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                  Full Benefits Package
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DEFAULT_BENEFITS.map((b, idx) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={idx}
                      className="group rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br border ${b.color} shadow-2xs shrink-0 group-hover:scale-110 transition`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {b.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {b.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transparent Hiring Process Timeline */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                    Transparent Hiring Process
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Typical selection stages for this role
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  ~7 Days Fast Track
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="relative rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white mb-2 shadow-xs">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Application Review
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">Within 48 hours</p>
                </div>

                <div className="relative rounded-2xl border border-slate-200/80 bg-white p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-700 mb-2">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Technical Screen
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">45 min live code</p>
                </div>

                <div className="relative rounded-2xl border border-slate-200/80 bg-white p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-700 mb-2">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Architecture Chat
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">Team interview</p>
                </div>

                <div className="relative rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white mb-2 shadow-xs">
                    4
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Offer Rollout
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">Fast turnaround</p>
                </div>
              </div>
            </div>

            {/* About the Company */}
            <div id="sec-company" className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xl shadow-xs">
                    {job.company.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                      About {job.company.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {job.company.industry} • {job.company.size} Team Members • {job.company.location}
                    </p>
                  </div>
                </div>

                {job.company.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl transition"
                  >
                    <span>Visit Website</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {job.company.description}
              </p>

              {/* Company Credibility Badges */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-5 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Verified Entity</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Zap size={16} className="text-amber-500 shrink-0" />
                  <span>High Response Ratio</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Building size={16} className="text-blue-600 shrink-0" />
                  <span>Direct Hiring Partner</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (Job Fit, Recruiter Contact, Trust Check, Similar Jobs) */}
          <aside className="space-y-6">
            {/* AI JOB FIT GAUGE CARD (Upgraded with Rich High-Tech Visuals) */}
            <div className="rounded-3xl border border-blue-200/90 bg-white shadow-[0_10px_30px_-5px_rgba(37,99,235,0.08)] overflow-hidden">
              {/* Card Header with Glowing Gradient */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-white leading-tight">
                        AI Fit Analysis
                      </h3>
                      <p className="text-[11px] text-blue-100">
                        Based on your profile skills & exp
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-black tracking-wide text-white border border-white/30">
                    {matchScore}% Match
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Interview Likelihood</span>
                    <span className="text-emerald-600">High Probability</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-500"
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                </div>

                {/* Criteria Rows */}
                <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
                  {match.rows.map((row) => (
                    <div key={row.label} className="pt-2.5 first:pt-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">
                          {row.label}
                        </span>
                        <span
                          className={`font-bold ${
                            row.fit === "Strong" || row.fit === "Match"
                              ? "text-emerald-600"
                              : row.fit === "Partial"
                              ? "text-amber-600"
                              : "text-slate-400"
                          }`}
                        >
                          {row.fit}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {row.note}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Missing Skills Recommendation Tip */}
                {match.missing.length > 0 && (
                  <div className="rounded-2xl bg-amber-50/80 p-3.5 text-xs text-amber-900 border border-amber-200/60">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CircleAlert size={14} className="text-amber-600 shrink-0" />
                      <span>Skill tip for your resume:</span>
                    </div>
                    <p className="mt-1 text-[11px] text-amber-800 leading-relaxed">
                      Highlighting projects involving{" "}
                      <b>{match.missing.join(", ")}</b> will maximize your
                      shortlisting probability.
                    </p>
                  </div>
                )}

                {/* Covered Skills */}
                {match.covered.length > 0 && (
                  <div className="rounded-2xl bg-emerald-50/80 p-3 text-xs text-emerald-900 border border-emerald-200/60">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>Covered Strengths:</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-emerald-700 font-medium">
                      {match.covered.join(", ")}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-95 text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Apply with This Profile</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* RECRUITER SPOTLIGHT CARD (Builds Huge Human Credibility) */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2 mb-3.5">
                <Users size={16} className="text-blue-600" />
                <span>Hiring Team Spotlight</span>
              </h3>

              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xs">
                    PS
                  </div>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Priya Sharma
                  </h4>
                  <p className="text-xs text-slate-500">
                    Talent Lead at {job.company.name}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online • Typically replies in 4 hours
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Application Routing:</span>
                <span className="font-bold text-blue-700">Direct Recruiter Inbox</span>
              </div>
            </div>

            {/* JOB TRUST & SAFETY CHECK */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
              <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-600" />
                <span>Job Trust & Safety Guarantee</span>
              </h3>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Employer Status</span>
                  <span
                    className={`font-bold ${
                      job.company.verified ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {job.company.verified ? "100% Verified" : "Reviewing"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Date Posted</span>
                  <span className="font-semibold text-slate-800">
                    {postedAgo}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Recruiter Activity</span>
                  <span className="font-semibold text-emerald-600">
                    Active {activityDays <= 0 ? "Today" : `${activityDays}d ago`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Response Rate</span>
                  <span className="font-bold text-blue-600">
                    {job.responseRatePct || 85}% (Fast Response)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500">Compensation</span>
                  <span className="font-semibold text-slate-800">
                    {job.salaryMinLpa ? "Transparently Disclosed" : "Market Standard"}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  100% Free • No placement fees
                </span>
                <button
                  type="button"
                  onClick={() => showToast("Job reported for moderation review")}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-red-600 transition"
                >
                  <Flag size={12} />
                  <span>Report</span>
                </button>
              </div>
            </div>

            {/* SIMILAR JOBS LIST */}
            {similarJobs.length > 0 && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
                <h3 className="font-display text-sm font-bold text-slate-900 mb-3.5 flex items-center justify-between">
                  <span>Similar Roles You Might Like</span>
                  <span className="text-xs text-blue-600 font-semibold hover:underline">
                    View all
                  </span>
                </h3>

                <div className="space-y-3">
                  {similarJobs.map((sJob) => (
                    <Link
                      key={sJob.id}
                      href={`/jobs/${sJob.id}`}
                      className="group block rounded-2xl border border-slate-100 p-3.5 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {sJob.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {sJob.company.name} • {sJob.location}
                          </p>
                        </div>
                        <ChevronRight
                          size={15}
                          className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition"
                        />
                      </div>
                      <div className="mt-2.5 flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5">
                          {modeLabel[sJob.workMode]}
                        </span>
                        <span className="text-emerald-700 font-bold">
                          {salary(sJob.salaryMinLpa, sJob.salaryMaxLpa)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* FLOATING STICKY QUICK-APPLY DOCK (Appears on scroll) */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xl transition-all duration-300 ${
          showStickyBar
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="container-x py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg shrink-0 shadow-xs">
              {job.company.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {job.title}
              </h4>
              <p className="text-xs text-slate-500">
                {job.company.name} • {salary(job.salaryMinLpa, job.salaryMaxLpa)} • {job.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSave}
              className={`rounded-xl border p-2.5 transition active:scale-95 ${
                isSaved
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              title="Save"
            >
              <Heart
                size={16}
                className={isSaved ? "fill-rose-500 text-rose-500" : ""}
              />
            </button>

            {appliedInfo ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-2.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Applied</span>
              </span>
            ) : (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-2.5 text-sm font-bold text-white shadow-md transition active:scale-95 cursor-pointer"
              >
                <span>Apply Now</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STATE-OF-THE-ART APPLICATION MODAL */}
      <JobApplicationModal
        job={{
          id: job.id,
          title: job.title,
          companyName: job.company.name,
          location: job.location,
          workMode: modeLabel[job.workMode],
          salaryMinLpa: job.salaryMinLpa,
          salaryMaxLpa: job.salaryMaxLpa,
          skills: job.skills,
        }}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
}
