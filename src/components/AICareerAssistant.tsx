"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  MapPin,
  Briefcase,
  Wallet,
  Clock,
  BadgeCheck,
  CheckCircle2,
  AlertCircle,
  X,
  SlidersHorizontal,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Bookmark,
  Share2,
  Send,
  HelpCircle,
  Lightbulb,
  FileText,
  UploadCloud,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CareerAssistantResponse, JobSearchFilters, AIMatchedJob } from "@/lib/ai/schemas";
import CandidateAuthModal from "./CandidateAuthModal";

const QUICK_PROMPTS = [
  "📄 Match jobs with my Resume",
  "Remote React Jobs",
  "Jobs in Chennai",
  "Jobs above ₹10 LPA",
  "What skills should I learn next?",
];

interface AICareerAssistantProps {
  initialQuery?: string;
  isFullPage?: boolean;
}

export default function AICareerAssistant({
  initialQuery = "",
  isFullPage = false,
}: AICareerAssistantProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CareerAssistantResponse | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [isEditingFilters, setIsEditingFilters] = useState(false);
  const [history, setHistory] = useState<string[]>([
    "Remote React Jobs",
    "Jobs in Chennai above ₹12 LPA",
  ]);

  // Auth Protection State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  // Resume Matching State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [extractedExp, setExtractedExp] = useState<number | null>(null);
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [activePlanJobId, setActivePlanJobId] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Verify Candidate Authentication
  const verifyCandidateAuth = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/candidate/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.candidate) {
          return true;
        }
      }
    } catch (err) {}
    return false;
  };

  // Automatically execute query if initialQuery was supplied via URL/navigation
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleAskAI(initialQuery);
    }
  }, [initialQuery]);

  // Execute query against the AI backend
  const handleAskAI = async (queryText?: string, previousFilters?: JobSearchFilters) => {
    const textToQuery = (queryText !== undefined ? queryText : query).trim();

    // Check Candidate Login Status
    const isAuthenticated = await verifyCandidateAuth();
    if (!isAuthenticated) {
      setPendingQuery(textToQuery || "Remote React Jobs");
      setIsAuthModalOpen(true);
      return;
    }
    
    // If prompt is "Match jobs with my Resume", open file picker or trigger resume match
    if (textToQuery.includes("Match jobs with my Resume") || textToQuery.includes("my Resume")) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
        return;
      }
    }

    if (!textToQuery) return;

    setLoading(true);
    setIsEditingFilters(false);

    try {
      const res = await fetch("/api/ai/career-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToQuery,
          previousFilters: previousFilters || response?.understoodFilters,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data);
        if (!history.includes(textToQuery)) {
          setHistory((prev) => [textToQuery, ...prev.slice(0, 5)]);
        }
      } else {
        console.error("AI Error:", data.error);
      }
    } catch (err) {
      console.error("AI Request Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Upload & Process Candidate Resume
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAuthenticated = await verifyCandidateAuth();
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      if (e.target) e.target.value = "";
      return;
    }

    setIsUploadingResume(true);
    setLoading(true);
    setResumeFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai/resume-match", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.response) {
        setResponse(data.response);
        setExtractedSkills(data.extractedSkills || []);
        setExtractedExp(data.extractedExp || null);
        setDetectedRole(data.detectedRole || null);
        setQuery(`Resume Matched: ${file.name}`);
      } else {
        console.warn("Resume parsing returned non-success, falling back to standard AI search:", data);
        handleAskAI("Find developer jobs matching my profile");
      }
    } catch (err) {
      console.error("Resume analysis failed:", err);
      handleAskAI("Find developer jobs matching my profile");
    } finally {
      setIsUploadingResume(false);
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Toggle saving a job
  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Remove a specific filter chip and re-query
  const handleRemoveFilter = (filterKey: keyof JobSearchFilters, itemToRemove?: string) => {
    if (!response?.understoodFilters) return;

    const updated: JobSearchFilters = { ...response.understoodFilters };

    if (filterKey === "skills" && itemToRemove) {
      updated.skills = updated.skills.filter((s) => s !== itemToRemove);
    } else if (filterKey === "location" && itemToRemove) {
      updated.location = updated.location.filter((l) => l !== itemToRemove);
    } else if (filterKey === "role") {
      delete updated.role;
    } else if (filterKey === "workMode") {
      delete updated.workMode;
    } else if (filterKey === "salaryMinLpa") {
      delete updated.salaryMinLpa;
    } else if (filterKey === "experienceMin") {
      delete updated.experienceMin;
    }

    // Re-run with updated filters
    handleAskAI(query, updated);
  };

  return (
    <section id="career" className={`scroll-mt-24 ${isFullPage ? "" : "container-x my-20"}`}>
      {/* Hidden File Input for Resume Match */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
      />

      {/* Header Container */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-2xs">
          <Sparkles size={14} className="text-blue-600 animate-pulse" />
          <span>Next-Gen Career Copilot</span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
          AI Career Assistant
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
          Find jobs, match your resume, and get personalized skill development plans.
        </p>
      </div>

      {/* Main Interactive Copilot Box */}
      <div className="mt-8 mx-auto max-w-4xl rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08)] sm:p-7">
        {/* Natural Language Query Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAI();
          }}
          className="relative flex flex-col sm:flex-row items-center gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-xs transition-all duration-200 focus-within:border-blue-600 focus-within:shadow-[0_8px_24px_-4px_rgba(37,99,235,0.15)] focus-within:ring-4 focus-within:ring-blue-100"
        >
          <div className="relative flex flex-1 items-center px-2 w-full">
            <Sparkles size={18} className="text-blue-600 shrink-0 mr-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you're looking for or click Upload Resume..."
              className="w-full border-0 bg-transparent py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              aria-label="Describe what you are looking for"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResumeFileName(null);
                  setExtractedSkills([]);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 mr-1"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Direct Upload Resume Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingResume || loading}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-bold text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition shrink-0"
              title="Upload your resume (PDF/DOCX) for AI job matching"
            >
              <UploadCloud size={15} className="text-blue-600" />
              <span>{isUploadingResume ? "Parsing..." : "Upload Resume"}</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition active:scale-98 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing...
                </span>
              ) : (
                <>
                  <Send size={15} />
                  Ask AI
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Prompts Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Lightbulb size={13} className="text-amber-500" /> Quick Prompts:
          </span>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuery(prompt);
                handleAskAI(prompt);
              }}
              className="rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 hover:-translate-y-0.5"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Ambiguous Query Clarification Box */}
        {response?.clarification?.needed && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <HelpCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  {response.clarification.question || "Could you clarify your target role?"}
                </h4>
                <p className="mt-1 text-xs text-amber-700 font-medium">
                  Select one of the common specializations below to get tailored matches:
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {response.clarification.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        const newQuery = `Find ${opt} jobs`;
                        setQuery(newQuery);
                        handleAskAI(newQuery);
                      }}
                      className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 shadow-2xs hover:bg-amber-100/60 transition"
                    >
                      {opt} →
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* "WHAT I UNDERSTOOD" Active Filter Chips & Summary */}
        {response && !response.clarification?.needed && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  What I Understood:
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  {response.summary}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                  {response.totalFound} verified job{response.totalFound === 1 ? "" : "s"} found
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingFilters(!isEditingFilters)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <SlidersHorizontal size={13} />
                  {isEditingFilters ? "Close Filters" : "Edit Filters"}
                </button>
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {response.understoodFilters.role && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-2xs">
                  Role: {response.understoodFilters.role}
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("role")}
                    className="hover:text-red-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              )}

              {response.understoodFilters.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-2xs"
                >
                  Skill: {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("skills", skill)}
                    className="hover:text-red-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}

              {response.understoodFilters.location.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-blue-800 shadow-2xs"
                >
                  <MapPin size={11} className="text-blue-600" />
                  {loc}
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("location", loc)}
                    className="hover:text-red-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}

              {response.understoodFilters.workMode && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-2xs">
                  Mode: {response.understoodFilters.workMode}
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("workMode")}
                    className="hover:text-red-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              )}

              {response.understoodFilters.experienceMin !== undefined && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-2xs">
                  Exp: {response.understoodFilters.experienceMin}+ yrs
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("experienceMin")}
                    className="hover:text-red-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              )}

              {response.understoodFilters.salaryMinLpa !== undefined && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
                  Pay: ₹{response.understoodFilters.salaryMinLpa}L+
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter("salaryMinLpa")}
                    className="hover:text-red-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Career Intelligence Learning Path Box (If Intent is Career Guidance) */}
        {response?.careerGuidance && (
          <div className="mt-6 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/90 via-white to-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  Target Career Roadmap: {response.careerGuidance.targetRole}
                </h3>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                {response.careerGuidance.readinessScorePct}% Profile Readiness
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {response.careerGuidance.skillGaps.map((gap) => (
                <div
                  key={gap.skill}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{gap.skill}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        gap.priority === "HIGH"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {gap.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed font-medium">
                    {gap.reason}
                  </p>
                  <div className="mt-2 text-[11px] text-blue-700 font-semibold border-t border-slate-100 pt-1.5">
                    📖 {gap.learningResource}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-slate-900 p-3.5 text-xs text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="font-bold text-emerald-400">Action Step:</span>{" "}
                <span>{response.careerGuidance.recommendedNextSteps[0]}</span>
              </div>
              <Link
                href="/jobs?skills=React,Node.js,AWS"
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-blue-500 shrink-0"
              >
                Browse Qualifying Jobs <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* Resume Analysis Summary Banner */}
        {resumeFileName && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <FileText size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    Resume Analyzed: <span className="underline">{resumeFileName}</span>
                  </h4>
                  <p className="mt-1 text-xs text-emerald-800 font-medium">
                    Role Detected: <strong className="text-emerald-950">{detectedRole || "Software Developer"}</strong> • Experience: <strong className="text-emerald-950">{extractedExp || 2}+ years</strong>
                  </p>
                  {extractedSkills.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-emerald-900">Extracted Skills:</span>
                      {extractedSkills.map((s) => (
                        <span key={s} className="rounded bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResumeFileName(null);
                  setExtractedSkills([]);
                  setQuery("");
                  handleAskAI("Find developer jobs");
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0"
              >
                Clear Resume
              </button>
            </div>
          </div>
        )}

        {/* Real Published Job Results Section */}
        {response && !response.clarification?.needed && (
          <div className="mt-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase size={17} className="text-blue-600" />
                Verified Matching Openings ({response.jobs.length})
              </h3>
              <Link
                href="/jobs"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Browse all in jobs page <ChevronRight size={14} />
              </Link>
            </div>

            {response.jobs.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-sm">
                No published jobs currently match all of these specific criteria.
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleAskAI("Find developer jobs in India")}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Try broader search →
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {response.jobs.map((job) => {
                  const isSaved = savedJobs.includes(job.id);
                  const devPlan = (job as any).developmentPlan || [];

                  return (
                    <div
                      key={job.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                    >
                      <div>
                        {/* Company & Title Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                              <span>{job.company.name}</span>
                              {job.company.verified && (
                                <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                                  <BadgeCheck size={13} className="text-emerald-600" /> Verified
                                </span>
                              )}
                            </div>
                            <h4 className="mt-0.5 font-display text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {job.title}
                            </h4>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => toggleSave(job.id, e)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-blue-600 transition"
                            title={isSaved ? "Saved" : "Save Job"}
                          >
                            <Bookmark
                              size={16}
                              className={isSaved ? "fill-blue-600 text-blue-600" : ""}
                            />
                          </button>
                        </div>

                        {/* Location, Mode, Pay */}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
                            <MapPin size={12} className="text-slate-500" />
                            {job.location} ({job.workMode.toLowerCase()})
                          </span>
                          <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded font-bold text-emerald-800">
                            <Wallet size={12} className="text-emerald-600" />
                            ₹{job.salaryMinLpa || 8}–{job.salaryMaxLpa || 24} LPA
                          </span>
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            <Clock size={12} className="text-slate-400" />
                            {job.minExp}–{job.maxExp} yrs
                          </span>
                        </div>

                        {/* Explainable Match: Why This Job Matches & Skill Gap */}
                        <div className="mt-3.5 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 text-[11px]">
                          <div className="font-bold uppercase tracking-wider text-slate-500 text-[10px] flex items-center justify-between">
                            <span>Why this job matches</span>
                            <span className="text-blue-700 font-extrabold">{job.matchScore}% Match</span>
                          </div>
                          {job.reasons.slice(0, 2).map((r, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              {r.status === "MATCH" ? (
                                <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                              ) : r.status === "GAP" ? (
                                <AlertCircle size={12} className="text-amber-500 shrink-0" />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                              )}
                              <span className="text-slate-700 truncate font-medium">{r.detail}</span>
                            </div>
                          ))}
                        </div>

                        {/* Missing Skills & Skill Development Plan Accordion */}
                        {devPlan.length > 0 && (
                          <div className="mt-3 border-t border-slate-100 pt-2">
                            <button
                              type="button"
                              onClick={() => setActivePlanJobId(activePlanJobId === job.id ? null : job.id)}
                              className="flex items-center justify-between w-full text-xs font-bold text-amber-700 hover:text-amber-900 py-1"
                            >
                              <span className="flex items-center gap-1">
                                <GraduationCap size={14} className="text-amber-600" />
                                Skill Gap Guide ({devPlan.length} missing skill{devPlan.length === 1 ? "" : "s"})
                              </span>
                              {activePlanJobId === job.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {activePlanJobId === job.id && (
                              <div className="mt-2 space-y-2 rounded-xl bg-amber-50/80 p-3 text-xs border border-amber-200">
                                {devPlan.map((plan: any, idx: number) => (
                                  <div key={idx} className="space-y-0.5">
                                    <div className="font-bold text-amber-950 flex items-center justify-between">
                                      <span>⚠️ Missing: {plan.skill}</span>
                                      <span className="text-[10px] text-amber-800 bg-amber-200/80 px-1.5 py-0.2 rounded font-bold">
                                        ~{plan.estimatedTime}
                                      </span>
                                    </div>
                                    <p className="text-amber-900 text-[11px] leading-relaxed font-medium">
                                      {plan.learningGuide}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        <span className="text-slate-400 font-medium">
                          {job.responseRatePct}% reply rate
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            View Job
                          </Link>
                          <Link
                            href={`/jobs/${job.id}?apply=1`}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white hover:bg-blue-700 transition"
                          >
                            Apply Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Conversational Follow-Up Prompts */}
        {response && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4 text-xs">
            <span className="text-slate-500 font-semibold">Refine this search:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleAskAI("Only remote")}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                + Only remote
              </button>
              <button
                type="button"
                onClick={() => handleAskAI("Above 15 LPA")}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                + Above 15 LPA
              </button>
              <button
                type="button"
                onClick={() => handleAskAI("Only in Chennai")}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                + In Chennai
              </button>
              <Link
                href="/career-ai"
                className="rounded-md bg-slate-900 px-3 py-1 font-bold text-white hover:bg-slate-800 transition"
              >
                Open Full Career Copilot →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* CANDIDATE AUTHENTICATION POPUP FOR AI ASSISTANT */}
      <CandidateAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (pendingQuery) {
            handleAskAI(pendingQuery);
            setPendingQuery(null);
          }
        }}
      />
    </section>
  );
}
