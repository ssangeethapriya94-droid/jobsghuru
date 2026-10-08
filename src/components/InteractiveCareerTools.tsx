"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, IndianRupee, Mic, ArrowRight, CheckCircle2 } from "lucide-react";

export default function InteractiveCareerTools() {
  const [activeTool, setActiveTool] = useState<number>(0);

  const tools = [
    {
      id: "copilot",
      icon: Sparkles,
      tag: "AI Assistant",
      title: "Career Copilot",
      description: "Ask questions about your career trajectory, required skills, and roadmap to target senior roles.",
      badge: "Release 2 Preview",
      preview: {
        heading: "Next Career Milestone: Senior Full Stack",
        points: [
          "Recommended skill addition: Docker & AWS to unlock 8 additional roles",
          "Average pay uplift with System Design: +₹8 LPA",
          "Your current profile matches 75% of Senior Frontend openings",
        ],
      },
    },
    {
      id: "skillgap",
      icon: TrendingUp,
      tag: "Skill Analyzer",
      title: "Skill Gap Visualizer",
      description: "Compare your resume directly against live job market demand in Bangalore, Chennai, and Remote.",
      badge: "Interactive",
      preview: {
        heading: "Top Missing Skills in Target Openings",
        points: [
          "AWS (Found in 70% of target backend listings) — Priority High",
          "Next.js App Router (Found in 85% of React roles) — Priority High",
          "Tailwind CSS (Covered in your current skillset) — Strong",
        ],
      },
    },
    {
      id: "salary",
      icon: IndianRupee,
      tag: "Market Insights",
      title: "Salary Transparency Benchmark",
      description: "Never apply blind. Real compensation brackets with verified minimums and maximums across experience tiers.",
      badge: "Verified Data",
      preview: {
        heading: "Salary Percentiles (India Tech 2026)",
        points: [
          "0-2 yrs Experience: ₹4.5 LPA – ₹9 LPA",
          "3-5 yrs Experience: ₹12 LPA – ₹24 LPA",
          "6+ yrs Experience: ₹22 LPA – ₹45+ LPA",
        ],
      },
    },
    {
      id: "interview",
      icon: Mic,
      tag: "Prep Simulator",
      title: "Role Interview Mockups",
      description: "Practice behavioral and system design interview questions customized to your specific target company.",
      badge: "Practice",
      preview: {
        heading: "Sample Question: System Architecture",
        points: [
          "\"How would you structure a scalable pub/sub architecture for real-time order tracking?\"",
          "Instant evaluation of completeness, edge-case handling, and communication",
        ],
      },
    },
  ];

  const current = tools[activeTool];
  const CurrentIcon = current.icon;

  return (
    <section id="career" className="container-x mt-24 scroll-mt-20">
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
        <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
          Career Acceleration
        </span>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-900 sm:text-4xl">
          More than job hunting. Grow your career.
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-500">
          Diagnose skill gaps, benchmark compensation, and prepare for interviews.
        </p>
      </div>

      {/* Interactive Tabs */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.3fr] items-center">
        {/* Navigation Selector */}
        <div className="space-y-3">
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            const isSelected = activeTool === idx;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(idx)}
                className={`w-full text-left rounded-2xl p-4 transition duration-150 border flex items-start gap-4 ${
                  isSelected
                    ? "bg-white border-slate-900 shadow-md scale-101"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition ${
                    isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-slate-900">
                      {tool.title}
                    </h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {tool.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Interactive Preview Box in Deep Navy / Slate */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-7 text-white shadow-xl">
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur text-slate-300">
                <CurrentIcon size={14} className="text-blue-400" />
                {current.badge}
              </span>
              <span className="text-xs text-slate-400 font-medium">{current.tag}</span>
            </div>

            <h3 className="mt-5 font-display text-xl font-bold sm:text-2xl text-white">
              {current.preview.heading}
            </h3>

            <div className="mt-6 space-y-3">
              {current.preview.points.map((pt, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-800/80 p-3.5 border border-slate-700/60">
                  <CheckCircle2 size={16} className="text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs leading-relaxed text-slate-200">{pt}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5">
              <span className="text-xs text-slate-400">Grounded in verified platform roles</span>
              <Link
                href="/jobs?salary=1"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition"
              >
                Explore Insights <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
