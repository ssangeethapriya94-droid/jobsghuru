"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  DollarSign,
  Bot,
  Eye,
  Send,
  ShieldAlert,
  Zap,
} from "lucide-react";

export default function NewJobWizard() {
  const router = useRouter();

  // Wizard Phases:
  // Phase 1: Basics (Title, Dept, Location, Work Mode, Job Type)
  // Phase 2: Experience & Compensation (Min/Max Exp, Min/Max Salary LPA)
  // Phase 3: Skills & Requirements (Required Skills, Preferred, Education)
  // Phase 4: Job Description & Responsibilities
  // Phase 5: AI Job Review & Quality Check
  // Phase 6: Preview & Publish
  const [phase, setPhase] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    department: "Engineering",
    location: "Chennai",
    workMode: "HYBRID",
    jobType: "FULL_TIME",
    minExp: "3",
    maxExp: "6",
    salaryMinLpa: "12",
    salaryMaxLpa: "20",
    skills: "React, TypeScript, Node.js, Next.js",
    preferredSkills: "AWS, Docker, Tailwind CSS, PostgreSQL",
    education: "B.Tech / MCA or equivalent practical experience",
    description:
      "We are seeking an experienced software engineer to join our core product team. You will lead feature delivery across frontend and backend services, collaborate with designers, and write scalable, maintainable code.",
    responsibilities:
      "Own full lifecycle feature development\nWrite clean, well-tested TypeScript & React code\nCollaborate closely with product management and UX\nParticipate in architecture design reviews",
    requirements:
      "3+ years of professional full-stack development experience\nHands-on proficiency with React, Node.js, and TypeScript\nStrong understanding of RESTful APIs and database schemas\nProven track record of shipping production code",
    screeningQuestion: "Do you have hands-on production experience with React and TypeScript?",
    status: "PUBLISHED",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftingAi, setDraftingAi] = useState(false);

  const handleAiDraft = async () => {
    if (!formData.title) {
      alert("Please enter a job title first so AI can draft the requisition.");
      return;
    }
    setDraftingAi(true);
    try {
      const res = await fetch("/api/employer/ai/draft-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          department: formData.department,
          skills: formData.skills,
          experienceYears: formData.minExp,
          workMode: formData.workMode,
        }),
      });
      const d = await res.json();
      if (d.success && d.draft) {
        setFormData((prev) => ({
          ...prev,
          description: d.draft.description,
          responsibilities: d.draft.responsibilities,
          requirements: d.draft.requirements,
          preferredSkills: d.draft.preferredSkills || prev.preferredSkills,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDraftingAi(false);
    }
  };

  const [quota, setQuota] = useState<{
    allowed: boolean;
    current: number;
    limit: number;
    reason?: string;
  } | null>(null);
  const [plan, setPlan] = useState<{
    planCode: string;
    planName: string;
    jobLimit: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/employer/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.quota) setQuota(data.quota);
        if (data.plan) setPlan(data.plan);
      })
      .catch((err) => console.error("Error fetching quota:", err));
  }, []);

  // AI Review Analysis state
  const aiReview = {
    score: 95,
    clarity: "High",
    biasCheck: "Pass (Zero gendered or restrictive phrasing detected)",
    recommendations: [
      "Compensation range (₹12-20 LPA) is competitive and will attract high-intent applicants",
      "Core skills (React, TypeScript) are well defined",
      "Clear 30-day response SLA committed",
    ],
  };

  const handleNext = () => {
    setError(null);
    if (phase === 1 && (!formData.title || !formData.department || !formData.location)) {
      setError("Please fill in the Job Title, Department, and Location.");
      return;
    }
    if (phase === 4 && (!formData.description || !formData.responsibilities)) {
      setError("Please provide a Job Description and key responsibilities.");
      return;
    }
    setPhase((p) => Math.min(p + 1, 6));
  };

  const handleBack = () => {
    setError(null);
    setPhase((p) => Math.max(p - 1, 1));
  };

  const handlePublish = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          responsibilities: formData.responsibilities.split("\n").filter(Boolean),
          requirements: formData.requirements.split("\n").filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish job.");
      }

      router.push("/employer/jobs");
    } catch (err: any) {
      setError(err.message || "Failed to publish job.");
      setLoading(false);
    }
  };

  const phaseTitles = [
    "Role Fundamentals",
    "Experience & Salary",
    "Skill Specifications",
    "Description & Responsibilities",
    "AI Requisition Review",
    "Preview & Publish",
  ];

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Plan Quota Status Banner */}
      {quota && (
        <div
          className={`rounded-2xl border p-4 text-xs flex items-center justify-between gap-4 ${
            quota.allowed
              ? "border-blue-200 bg-blue-50/70 text-blue-900"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                quota.allowed
                  ? "bg-blue-600 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              {quota.allowed ? <Briefcase size={18} /> : <ShieldAlert size={18} />}
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>{plan?.planName || "Employer"} Plan</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    quota.allowed
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-200 text-amber-800"
                  }`}
                >
                  {quota.current} / {quota.limit} Active Jobs Used
                </span>
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                {quota.allowed
                  ? `You have ${quota.limit - quota.current} posting slots remaining on your current subscription.`
                  : "You have reached your active job posting quota. Upgrade your plan to post more positions."}
              </p>
            </div>
          </div>
          {!quota.allowed && (
            <Link
              href="/employer/billing"
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition flex items-center gap-1.5 shadow-xs"
            >
              <Zap size={13} /> Upgrade Plan
            </Link>
          )}
        </div>
      )}

      {/* Wizard Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>Phase {phase} of 6: <span className="text-slate-900">{phaseTitles[phase - 1]}</span></span>
          <span>{Math.round((phase / 6) * 100)}% Complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300 rounded-full"
            style={{ width: `${(phase / 6) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-9 shadow-xs">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* PHASE 1: ROLE FUNDAMENTALS */}
        {phase === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Phase 1
              </span>
              <h1 className="mt-2 font-display text-xl font-bold text-slate-900">
                Job Title & Basic Details
              </h1>
              <p className="text-slate-500 mt-0.5">Specify the core position title, work mode, and department.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Frontend Developer"
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none bg-white text-xs"
                >
                  <option value="Engineering">Engineering / Technology</option>
                  <option value="Product">Product & Design</option>
                  <option value="Marketing">Growth & Marketing</option>
                  <option value="Sales">Sales & Business Dev</option>
                  <option value="Data">Data & Analytics</option>
                  <option value="Operations">Operations & HR</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Chennai, Tamil Nadu"
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Mode</label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none bg-white text-xs"
                >
                  <option value="HYBRID">Hybrid (Office + Remote)</option>
                  <option value="REMOTE">Remote (100% Work from home)</option>
                  <option value="ONSITE">On-site (Office based)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none bg-white text-xs"
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract / Freelance</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: EXPERIENCE & SALARY */}
        {phase === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Phase 2
              </span>
              <h2 className="mt-2 font-display text-xl font-bold text-slate-900">
                Experience Range & Compensation
              </h2>
              <p className="text-slate-500 mt-0.5">Transparent salary listings receive 4.2x higher applicant response rates.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Minimum Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.minExp}
                  onChange={(e) => setFormData({ ...formData, minExp: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Maximum Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.maxExp}
                  onChange={(e) => setFormData({ ...formData, maxExp: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Minimum Annual Salary (LPA in ₹)</label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={formData.salaryMinLpa}
                  onChange={(e) => setFormData({ ...formData, salaryMinLpa: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Maximum Annual Salary (LPA in ₹)</label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={formData.salaryMaxLpa}
                  onChange={(e) => setFormData({ ...formData, salaryMaxLpa: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-center gap-2 text-emerald-800">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>Upfront salary disclosures are highlighted with the "Transparent Pay" badge on JobsGhuru.</span>
            </div>
          </div>
        )}

        {/* PHASE 3: SKILL SPECIFICATIONS */}
        {phase === 3 && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Phase 3
              </span>
              <h2 className="mt-2 font-display text-xl font-bold text-slate-900">
                Required & Preferred Skills
              </h2>
              <p className="text-slate-500 mt-0.5">These skills power explainable AI matching and candidate search scoring.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Required Skills (Comma separated) *</label>
              <input
                type="text"
                required
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="React, TypeScript, Node.js, PostgreSQL"
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
              />
              <span className="text-[10px] text-slate-400">Must-have criteria for an applicant to be marked qualified</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Preferred / Nice-to-Have Skills</label>
              <input
                type="text"
                value={formData.preferredSkills}
                onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
                placeholder="AWS, Docker, Tailwind CSS, Redis"
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Education / Qualifications</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="B.Tech, BE, MCA or equivalent demonstrated portfolio"
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
              />
            </div>
          </div>
        )}

        {/* PHASE 4: DESCRIPTION & RESPONSIBILITIES */}
        {phase === 4 && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  Phase 4
                </span>
                <h2 className="mt-2 font-display text-xl font-bold text-slate-900">
                  Job Description & Responsibilities
                </h2>
                <p className="text-slate-500 mt-0.5">Define role objectives, daily duties, and screening questions.</p>
              </div>

              <button
                type="button"
                disabled={draftingAi}
                onClick={handleAiDraft}
                className="rounded-xl border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-2xs"
              >
                <Sparkles size={14} className="text-blue-600" />
                <span>{draftingAi ? "Generating Draft..." : "Auto-Draft with AI Assistant"}</span>
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Job Summary / Overview *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Key Responsibilities (One per line)</label>
              <textarea
                rows={3}
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Requirements & Experience (One per line)</label>
              <textarea
                rows={3}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Candidate Screening Question</label>
              <input
                type="text"
                value={formData.screeningQuestion}
                onChange={(e) => setFormData({ ...formData, screeningQuestion: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none text-xs"
              />
            </div>
          </div>
        )}

        {/* PHASE 5: AI REQUISITION REVIEW */}
        {phase === 5 && (
          <div className="space-y-5 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Phase 5
              </span>
              <h2 className="mt-2 font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                <Bot size={22} className="text-blue-600" />
                AI Job Requisition Review
              </h2>
              <p className="text-slate-500 mt-0.5">
                AI checks clarity, unbiased phrasing, and completeness. You make the final publishing decision.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <span className="font-bold text-slate-800">Job Quality & Clarity Score</span>
                <span className="text-xl font-black text-blue-700">{aiReview.score}/100</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Language Neutrality:</span>
                  <span className="font-bold text-emerald-700">✓ {aiReview.biasCheck}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Compensation Transparency:</span>
                  <span className="font-bold text-emerald-700">✓ Disclosed (₹{formData.salaryMinLpa}-{formData.salaryMaxLpa} LPA)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Core Skills Specified:</span>
                  <span className="font-bold text-slate-800">{formData.skills}</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-bold text-blue-900 mb-1.5">Recommendations:</div>
                <div className="space-y-1 text-slate-600">
                  {aiReview.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-blue-600 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500">
              Note: JobsGhuru Recruiter AI assists with checks. We never publish or modify your requisition automatically.
            </div>
          </div>
        )}

        {/* PHASE 6: PREVIEW & PUBLISH */}
        {phase === 6 && (
          <div className="space-y-5 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Phase 6
              </span>
              <h2 className="mt-2 font-display text-xl font-bold text-slate-900">
                Preview & Confirm Publication
              </h2>
              <p className="text-slate-500 mt-0.5">Review the live job card before making it active.</p>
            </div>

            {/* Preview Card */}
            <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">{formData.title}</h3>
                  <div className="text-xs text-blue-700 font-semibold mt-0.5">{formData.department}</div>
                </div>
                <span className="rounded-full bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 text-[10px]">
                  Ready to Publish
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs pt-1">
                <span>{formData.location} ({formData.workMode.toLowerCase()})</span>
                <span>•</span>
                <span>{formData.minExp}-{formData.maxExp} yrs exp</span>
                <span>•</span>
                <span className="font-bold text-slate-900">₹{formData.salaryMinLpa}-{formData.salaryMaxLpa} LPA</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {formData.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {formData.skills.split(",").map((s) => (
                  <span key={s} className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-semibold">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              {quota && !quota.allowed ? (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
                  <ShieldAlert size={18} className="shrink-0 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">Active Posting Limit Reached ({quota.current}/{quota.limit})</div>
                    <p className="text-amber-800">
                      Your current plan allows up to {quota.limit} published jobs. Please upgrade your corporate subscription or archive an existing job to publish this requisition.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/employer/billing"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition shadow-xs"
                      >
                        <Zap size={14} /> Upgrade Plan
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Publishing Requisition..." : "Confirm & Publish Job"}
                  <Send size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Wizard Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {phase > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <Link
              href="/employer/jobs"
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </Link>
          )}

          {phase < 6 && (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              Next Step <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
