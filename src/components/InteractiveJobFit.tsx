"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, CircleAlert, Briefcase, ArrowRight, Zap, Target } from "lucide-react";
import { explainMatch, Profile } from "@/lib/match";

const popularSkills = [
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Python",
  "SQL",
  "Figma",
  "CI/CD",
];

interface JobSummary {
  id: string;
  title: string;
  department: string;
  location: string;
  workMode: string;
  skills: string[];
  minExp: number;
  maxExp: number;
  salaryMinLpa: number | null;
  salaryMaxLpa: number | null;
  company: {
    name: string;
    verified: boolean;
  };
}

export default function InteractiveJobFit({ initialJobs }: { initialJobs: JobSummary[] }) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["React", "TypeScript", "AWS"]);
  const [years, setYears] = useState<number>(3);
  const [mode, setMode] = useState<string>("REMOTE");

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const profile: Profile = useMemo(
    () => ({
      skills: selectedSkills,
      years,
      minLpa: 8,
      mode: mode === "ANY" ? undefined : mode,
    }),
    [selectedSkills, years, mode]
  );

  // Calculate live matches across database jobs
  const evaluatedJobs = useMemo(() => {
    if (!initialJobs || initialJobs.length === 0) return [];

    return initialJobs
      .map((job) => {
        const match = explainMatch(job as any, profile);
        const totalSkills = job.skills.length || 1;
        const skillScore = (match.covered.length / totalSkills) * 55;
        const expScore = profile.years >= job.minExp ? 25 : Math.max(0, (profile.years / (job.minExp || 1)) * 20);
        const modeScore = !profile.mode || profile.mode === job.workMode ? 10 : 0;
        const salaryScore = 10;
        const score = Math.min(100, Math.round(skillScore + expScore + modeScore + salaryScore));

        return {
          job,
          match,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [initialJobs, profile]);

  const bestMatch = evaluatedJobs[0];
  const overallScore = bestMatch ? bestMatch.score : 80;

  return (
    <div className="relative rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xs p-6 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08)] transition-all duration-300 md:p-8 hover:shadow-[0_20px_50px_-8px_rgba(15,23,42,0.12)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Target size={19} className="transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              Interactive Fit Engine
            </h2>
            <p className="text-xs text-slate-500 font-medium">Live rule-based candidate matching</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-2xs">
          <Zap size={13} className="text-blue-600 fill-current animate-pulse" />
          <span>{overallScore}% Match</span>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="mt-5 space-y-4">
        {/* Skills Selector */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your Stack ({selectedSkills.length} selected)
            </label>
            <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => setSelectedSkills(["React", "TypeScript", "Node.js", "AWS"])}>
              Preset Tech Lead
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {popularSkills.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                    active
                      ? "bg-slate-900 text-white shadow-xs scale-[1.02]"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="inline-block transition-transform">{active ? "✓ " : "+ "}</span>
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Slider & Mode */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3.5 transition-colors hover:border-slate-300">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Experience</span>
              <span className="rounded bg-white px-2 py-0.5 text-slate-900 shadow-2xs font-bold border border-slate-200/60">
                {years} {years === 1 ? "year" : "years"}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="mt-3.5 w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer transition-all"
            />
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3.5 transition-colors hover:border-slate-300">
            <span className="block text-xs font-semibold text-slate-600">Work Mode</span>
            <div className="mt-2 flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
              {[
                ["REMOTE", "Remote"],
                ["HYBRID", "Hybrid"],
                ["ONSITE", "Onsite"],
                ["ANY", "Any"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMode(val)}
                  className={`flex-1 rounded-md py-1 font-semibold transition-all duration-150 ${
                    mode === val
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Breakdown Cards */}
      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
        {bestMatch && (
          <>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 font-medium">Skill Alignment Rate</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-blue-600" />
                {bestMatch.match.covered.length} of {bestMatch.job.skills.length} matched
              </span>
            </div>
            {/* Animated Shimmer Progress Bar */}
            <div className="relative w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="relative bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500 overflow-hidden"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(10, (bestMatch.match.covered.length / (bestMatch.job.skills.length || 1)) * 100)
                  )}%`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>

            {bestMatch.match.missing.length > 0 && (
              <div className="mt-2.5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
                <span className="flex items-center gap-1.5 font-medium truncate mr-2">
                  <CircleAlert size={14} className="text-amber-600 shrink-0" />
                  <span className="truncate">Skill gap to 100%: <b className="text-slate-900">{bestMatch.match.missing.slice(0, 2).join(", ")}</b></span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleSkill(bestMatch.match.missing[0])}
                  className="font-bold text-blue-600 hover:text-blue-800 shrink-0 transition hover:scale-105 active:scale-95"
                >
                  + Add
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Top Matching Job Card Highlight with Hover Lift */}
      {bestMatch && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-block rounded bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Top Recommendation
              </span>
              <h3 className="mt-1 font-display text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                {bestMatch.job.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {bestMatch.job.company.name} · {bestMatch.job.location} ({bestMatch.job.workMode.toLowerCase()})
              </p>
            </div>
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 shrink-0 shadow-2xs">
              ₹{bestMatch.job.salaryMinLpa || 10}–{bestMatch.job.salaryMaxLpa || 24} LPA
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5">
            <span className="text-xs text-slate-600 font-medium">
              Match confidence: <b className="text-blue-600 font-bold">{bestMatch.score}%</b>
            </span>
            <Link
              href={`/jobs/${bestMatch.job.id}?skills=${encodeURIComponent(
                selectedSkills.join(",")
              )}&exp=${years}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 transition-transform hover:translate-x-0.5"
            >
              Inspect Fit <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Action CTA with Hover Glow */}
      <Link
        href={`/jobs?q=${encodeURIComponent(
          selectedSkills[0] || ""
        )}&skills=${encodeURIComponent(selectedSkills.join(","))}&exp=${years}`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.99]"
      >
        <Briefcase size={16} />
        Browse {evaluatedJobs.length} Matched Roles
      </Link>
    </div>
  );
}
