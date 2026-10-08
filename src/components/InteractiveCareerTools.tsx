"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  IndianRupee,
  Mic,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Search,
  BookOpen,
  ChevronRight,
  Zap,
  Award,
  Layers,
  Send,
  RefreshCw,
} from "lucide-react";

export default function InteractiveCareerTools() {
  const [activeTool, setActiveTool] = useState<number>(0);

  // Tool 0: Copilot state
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);

  // Tool 1: Skill Gap state
  const [selectedRole, setSelectedRole] = useState<"FRONTEND" | "FULLSTACK" | "DEVOPS" | "DATA">("FULLSTACK");

  // Tool 2: Salary Benchmark state
  const [selectedExpTier, setSelectedExpTier] = useState<"JUNIOR" | "MID" | "SENIOR" | "LEAD">("MID");

  // Tool 3: Interview Mockup state
  const [selectedInterviewRound, setSelectedInterviewRound] = useState<"SYSTEM_DESIGN" | "CODING" | "HR">("SYSTEM_DESIGN");

  const tools = [
    {
      id: "copilot",
      icon: Sparkles,
      tag: "AI Assistant",
      title: "Career Copilot",
      description: "Ask questions about your career trajectory, required skills, and roadmap to target senior roles.",
      badge: "AI Powered",
    },
    {
      id: "skillgap",
      icon: TrendingUp,
      tag: "Skill Analyzer",
      title: "Skill Gap Visualizer",
      description: "Compare your resume directly against live job market demand in Bangalore, Chennai, and Remote.",
      badge: "Interactive Radar",
    },
    {
      id: "salary",
      icon: IndianRupee,
      tag: "Market Insights",
      title: "Salary Transparency Benchmark",
      description: "Never apply blind. Real compensation brackets with verified minimums and maximums across experience tiers.",
      badge: "Verified Data",
    },
    {
      id: "interview",
      icon: Mic,
      tag: "Prep Simulator",
      title: "Role Interview Mockups",
      description: "Practice behavioral and system design interview questions customized to your specific target company.",
      badge: "Interactive Simulator",
    },
  ];

  const roleSkillsData = {
    FRONTEND: {
      roleTitle: "Senior Frontend Engineer",
      skills: [
        { name: "React 19 & Hooks", level: 95, status: "MATCH" },
        { name: "TypeScript", level: 90, status: "MATCH" },
        { name: "Next.js App Router", level: 85, status: "MATCH" },
        { name: "Tailwind CSS & Design Systems", level: 92, status: "MATCH" },
        { name: "Web Performance (CWV/LCP)", level: 60, status: "GAP" },
        { name: "State Management (Zustand/Redux)", level: 88, status: "MATCH" },
      ],
      missingCount: 1,
      targetJobsCount: 18,
      avgSalary: "₹18 – ₹32 LPA",
    },
    FULLSTACK: {
      roleTitle: "Full Stack Engineer",
      skills: [
        { name: "React & Next.js", level: 92, status: "MATCH" },
        { name: "Node.js & Express", level: 85, status: "MATCH" },
        { name: "PostgreSQL & Prisma ORM", level: 80, status: "MATCH" },
        { name: "AWS Cloud & EC2", level: 45, status: "GAP" },
        { name: "Docker & Containerization", level: 50, status: "GAP" },
        { name: "REST & GraphQL APIs", level: 88, status: "MATCH" },
      ],
      missingCount: 2,
      targetJobsCount: 24,
      avgSalary: "₹20 – ₹36 LPA",
    },
    DEVOPS: {
      roleTitle: "DevOps & Cloud Engineer",
      skills: [
        { name: "AWS Services & IAM", level: 85, status: "MATCH" },
        { name: "Docker & Containerization", level: 90, status: "MATCH" },
        { name: "Kubernetes Orchestration", level: 55, status: "GAP" },
        { name: "Terraform Infrastructure as Code", level: 50, status: "GAP" },
        { name: "CI/CD (GitHub Actions / GitLab)", level: 82, status: "MATCH" },
        { name: "Linux Administration & Shell", level: 88, status: "MATCH" },
      ],
      missingCount: 2,
      targetJobsCount: 14,
      avgSalary: "₹22 – ₹42 LPA",
    },
    DATA: {
      roleTitle: "Data Analyst / Analytics Engineer",
      skills: [
        { name: "SQL & Query Optimization", level: 95, status: "MATCH" },
        { name: "Python (Pandas / NumPy)", level: 82, status: "MATCH" },
        { name: "Power BI & Tableau", level: 88, status: "MATCH" },
        { name: "Data Warehousing (BigQuery/Snowflake)", level: 60, status: "GAP" },
        { name: "Excel Advanced Formulas", level: 90, status: "MATCH" },
        { name: "Statistical Modeling", level: 65, status: "GAP" },
      ],
      missingCount: 2,
      targetJobsCount: 12,
      avgSalary: "₹12 – ₹24 LPA",
    },
  };

  const salaryTiersData = {
    JUNIOR: {
      experience: "0 – 2 Years",
      roleLabel: "Junior / Associate Developer",
      min: "₹4.5 LPA",
      median: "₹7.5 LPA",
      max: "₹12 LPA",
      topPerformer: "₹15 LPA (Product Startups)",
      demandTrend: "+18% Hiring Growth in 2026",
      keyBoosters: ["React", "TypeScript", "Node.js", "Git"],
    },
    MID: {
      experience: "3 – 5 Years",
      roleLabel: "Mid-Level Engineer / Specialist",
      min: "₹12 LPA",
      median: "₹18 LPA",
      max: "₹28 LPA",
      topPerformer: "₹34 LPA (Unicorns & SaaS)",
      demandTrend: "+32% Highest Market Demand",
      keyBoosters: ["System Design", "AWS Cloud", "PostgreSQL", "Next.js Architecture"],
    },
    SENIOR: {
      experience: "6 – 9 Years",
      roleLabel: "Senior Engineer / Tech Lead",
      min: "₹22 LPA",
      median: "₹32 LPA",
      max: "₹48 LPA",
      topPerformer: "₹55+ LPA (MNCs & Global Capability Centers)",
      demandTrend: "+25% Premium Rate Growth",
      keyBoosters: ["Distributed Systems", "Team Leadership", "Microservices", "Cost Optimization"],
    },
    LEAD: {
      experience: "10+ Years",
      roleLabel: "Staff Engineer / Engineering Manager",
      min: "₹35 LPA",
      median: "₹52 LPA",
      max: "₹80+ LPA",
      topPerformer: "₹1.2 Cr+ (Executive Compensation)",
      demandTrend: "+15% High Retention Demand",
      keyBoosters: ["Architecture Governance", "Org Scaling", "Budgeting", "Product Strategy"],
    },
  };

  const mockQuestions = {
    SYSTEM_DESIGN: {
      title: "System Architecture & High Scalability",
      question: "How would you design a rate limiter service for a high-traffic API handling 100,000 requests per second?",
      difficulty: "Hard",
      timeLimit: "45 mins",
      expectedPoints: [
        "Mention Token Bucket or Leaky Bucket algorithm",
        "Use Redis / Memcached in-memory store for distributed counter",
        "Handle concurrency race conditions using Lua scripts",
        "Detail fallback mechanisms (HTTP 429 Too Many Requests)",
      ],
    },
    CODING: {
      title: "Data Structures & Algorithmic Optimization",
      question: "Given an array of integers, find all unique triplets that sum to zero in O(n²) time complexity.",
      difficulty: "Medium",
      timeLimit: "30 mins",
      expectedPoints: [
        "Sort the input array first to enable two-pointer technique",
        "Skip duplicate elements during iteration to ensure uniqueness",
        "Optimize space complexity to O(1) extra auxiliary space",
        "Address edge cases: empty array or fewer than 3 elements",
      ],
    },
    HR: {
      title: "Behavioral & Culture Fit Evaluation",
      question: "Tell me about a time when you had a disagreement with a product manager on technical scope. How did you resolve it?",
      difficulty: "Medium",
      timeLimit: "15 mins",
      expectedPoints: [
        "Use STAR method (Situation, Task, Action, Result)",
        "Focus on business outcome and trade-off compromise",
        "Demonstrate data-driven arguments without emotional conflict",
        "Share concrete outcome metrics achieved after resolution",
      ],
    },
  };

  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;
    setCopilotResponse(
      `Based on market data for "${copilotInput}": Adding AWS Cloud and System Design certification can increase your match score by 35% and unlock roles paying up to ₹28 LPA.`
    );
  };

  return (
    <section id="career" className="my-16 scroll-mt-20">
      {/* Header Container */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-4 py-1.5 text-xs font-extrabold text-blue-700 shadow-2xs">
          <Sparkles size={14} className="text-blue-600 animate-pulse" />
          <span>Interactive Career Acceleration Suite</span>
        </div>
        <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
          More than job hunting. <span className="text-blue-600">Grow your career.</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium max-w-2xl leading-relaxed">
          Diagnose your skill gaps against live market data, benchmark compensation tiers, and practice company-specific interview challenges.
        </p>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="mt-10 grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Tool Navigation Selector */}
        <div className="lg:col-span-5 space-y-3">
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            const isSelected = activeTool === idx;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(idx)}
                className={`w-full text-left rounded-2xl p-4.5 sm:p-5 transition-all duration-200 border flex items-start gap-4 cursor-pointer ${
                  isSelected
                    ? "bg-white border-blue-600 ring-4 ring-blue-100 shadow-lg -translate-y-0.5"
                    : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-slate-900 truncate">
                      {tool.title}
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tool.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Live Interactive Preview Box */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Background Blur Effect */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

          {/* TOOL 0: CAREER COPILOT */}
          {activeTool === 0 && (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-400" />
                  <span className="font-display text-sm font-bold uppercase tracking-wider text-slate-300">
                    AI Career Copilot Simulator
                  </span>
                </div>
                <span className="rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-0.5 text-xs font-bold text-blue-300">
                  Live Preview
                </span>
              </div>

              <div>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                  Next Career Milestone: Senior Full Stack Engineer
                </h3>
                <p className="mt-1 text-xs text-slate-400 font-medium">
                  Ask AI how to increase your salary or unlock senior tech roles.
                </p>
              </div>

              {/* Interactive Query Input */}
              <form onSubmit={handleCopilotSubmit} className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  placeholder="e.g. How to transition from React Dev to Tech Lead?"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-3 pl-4 pr-10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-xs font-bold text-white transition shrink-0 flex items-center gap-1"
                >
                  <Send size={14} /> Ask AI
                </button>
              </form>

              {copilotResponse && (
                <div className="rounded-2xl border border-blue-500/30 bg-blue-950/40 p-4 text-xs text-blue-200 leading-relaxed font-medium animate-fadeIn">
                  <Sparkles size={15} className="text-blue-400 inline mr-2" />
                  {copilotResponse}
                </div>
              )}

              {/* Verified Career Insights Cards */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-800/70 p-4 border border-slate-700/60">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">Recommended Skill Addition</span>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Adding <strong>Docker & AWS</strong> unlocks 8 additional verified senior roles in Bangalore & Remote.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-800/70 p-4 border border-slate-700/60">
                  <TrendingUp size={18} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">Salary Compensation Uplift</span>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Average pay uplift with <strong>System Design Architecture</strong>: <strong className="text-emerald-400">+₹8 LPA</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-5 text-xs">
                <span className="text-slate-400 font-medium">Grounded in verified platform roles</span>
                <Link
                  href="/career-ai"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500 transition shadow-md shadow-blue-600/20"
                >
                  Open Full AI Copilot <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {/* TOOL 1: SKILL GAP VISUALIZER */}
          {activeTool === 1 && (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" />
                  <span className="font-display text-sm font-bold uppercase tracking-wider text-slate-300">
                    Live Skill Gap Analyzer
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
                  Market Radar
                </span>
              </div>

              {/* Role Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "FULLSTACK", label: "Full Stack" },
                  { id: "FRONTEND", label: "Frontend" },
                  { id: "DEVOPS", label: "DevOps" },
                  { id: "DATA", label: "Data Analyst" },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id as any)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                      selectedRole === role.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-white">
                    Target: {roleSkillsData[selectedRole].roleTitle}
                  </h3>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">
                    Avg: {roleSkillsData[selectedRole].avgSalary}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {roleSkillsData[selectedRole].targetJobsCount} verified open listings match this profile.
                </p>
              </div>

              {/* Skill Progress Bar List */}
              <div className="space-y-3">
                {roleSkillsData[selectedRole].skills.map((s) => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                        {s.status === "MATCH" ? (
                          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle size={13} className="text-amber-400 shrink-0" />
                        )}
                        {s.name}
                      </span>
                      <span className={s.status === "MATCH" ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                        {s.status === "MATCH" ? `${s.level}% Match` : "Skill Gap"}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          s.status === "MATCH" ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${s.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-5 text-xs">
                <span className="text-amber-400 font-semibold">
                  ⚠️ {roleSkillsData[selectedRole].missingCount} missing skill gap(s) identified
                </span>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500 transition"
                >
                  Browse Qualifying Jobs <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {/* TOOL 2: SALARY TRANSPARENCY BENCHMARK */}
          {activeTool === 2 && (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <IndianRupee size={18} className="text-amber-400" />
                  <span className="font-display text-sm font-bold uppercase tracking-wider text-slate-300">
                    Salary Compensation Benchmark
                  </span>
                </div>
                <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-0.5 text-xs font-bold text-amber-300">
                  India Tech 2026
                </span>
              </div>

              {/* Experience Tier Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "JUNIOR", label: "0-2 Yrs" },
                  { id: "MID", label: "3-5 Yrs" },
                  { id: "SENIOR", label: "6-9 Yrs" },
                  { id: "LEAD", label: "10+ Yrs" },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedExpTier(tier.id as any)}
                    className={`rounded-xl py-2 px-3 text-xs font-bold transition cursor-pointer text-center ${
                      selectedExpTier === tier.id
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {salaryTiersData[selectedExpTier].roleLabel}
                </h3>
                <span className="text-xs text-emerald-400 font-bold">
                  ⚡ {salaryTiersData[selectedExpTier].demandTrend}
                </span>
              </div>

              {/* Pay Range Meter Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-800/80 p-3.5 border border-slate-700/60 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Minimum</span>
                  <span className="text-base sm:text-lg font-black text-slate-200 mt-1 block">
                    {salaryTiersData[selectedExpTier].min}
                  </span>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-blue-900/60 to-slate-800 p-3.5 border border-blue-500/40 text-center ring-2 ring-blue-500/20">
                  <span className="text-[10px] font-extrabold uppercase text-blue-300 block">Median Pay</span>
                  <span className="text-base sm:text-lg font-black text-white mt-1 block">
                    {salaryTiersData[selectedExpTier].median}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-800/80 p-3.5 border border-slate-700/60 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">Top 10%</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 mt-1 block">
                    {salaryTiersData[selectedExpTier].max}
                  </span>
                </div>
              </div>

              {/* Key Salary Boosters */}
              <div className="rounded-2xl bg-slate-800/60 p-4 border border-slate-700/60 space-y-2 text-xs">
                <span className="font-bold text-slate-300 block">Top Compensation Booster Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {salaryTiersData[selectedExpTier].keyBoosters.map((b) => (
                    <span key={b} className="rounded-lg bg-blue-950 border border-blue-700/60 px-2.5 py-1 text-blue-300 font-bold text-[11px]">
                      + {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-5 text-xs">
                <span className="text-slate-400">Based on verified platform minimums & maximums</span>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold px-4 py-2 hover:bg-amber-400 transition"
                >
                  Find Top Paying Jobs <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {/* TOOL 3: ROLE INTERVIEW MOCKUPS */}
          {activeTool === 3 && (
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Mic size={18} className="text-purple-400" />
                  <span className="font-display text-sm font-bold uppercase tracking-wider text-slate-300">
                    Interview Preparation Simulator
                  </span>
                </div>
                <span className="rounded-full bg-purple-500/20 border border-purple-400/30 px-3 py-0.5 text-xs font-bold text-purple-300">
                  AI Evaluator
                </span>
              </div>

              {/* Round Switcher */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "SYSTEM_DESIGN", label: "System Design" },
                  { id: "CODING", label: "DSA & Coding" },
                  { id: "HR", label: "Behavioral / HR" },
                ].map((round) => (
                  <button
                    key={round.id}
                    type="button"
                    onClick={() => setSelectedInterviewRound(round.id as any)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                      selectedInterviewRound === round.id
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {round.label}
                  </button>
                ))}
              </div>

              {/* Sample Question Box */}
              <div className="rounded-2xl bg-slate-800/90 p-5 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300">
                    {mockQuestions[selectedInterviewRound].title}
                  </span>
                  <span className="rounded bg-purple-950 border border-purple-800 px-2 py-0.5 text-[10px] font-bold text-purple-200">
                    Time: {mockQuestions[selectedInterviewRound].timeLimit}
                  </span>
                </div>
                <p className="text-sm font-bold text-white leading-relaxed">
                  "{mockQuestions[selectedInterviewRound].question}"
                </p>
              </div>

              {/* Expected Evaluation Criteria */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">AI Evaluation Rubric (Required for 5/5 Score):</span>
                <div className="space-y-2">
                  {mockQuestions[selectedInterviewRound].expectedPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-slate-800/60 p-3 border border-slate-700/60 text-xs text-slate-200 font-medium">
                      <CheckCircle2 size={15} className="text-purple-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-5 text-xs">
                <span className="text-slate-400 font-medium">Practice company-specific interview prompts</span>
                <Link
                  href="/candidate/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-500 transition"
                >
                  Start Practice Round <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
