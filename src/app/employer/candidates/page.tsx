"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  User,
  Filter,
  DollarSign,
  Calendar,
  Send,
  ArrowRight,
} from "lucide-react";

export default function EmployerCandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [naturalQuery, setNaturalQuery] = useState("");
  const [skills, setSkills] = useState("React, TypeScript");
  const [minExp, setMinExp] = useState("2");
  const [location, setLocation] = useState("All Locations");
  const [noticePeriod, setNoticePeriod] = useState("Any Notice");
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    executeSearch();
  }, []);

  const executeSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/employer/candidates/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills,
          minExp,
          location,
          noticePeriod,
          aiNaturalPrompt: naturalQuery,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to search candidates.");
      }

      setCandidates(data.candidates);
      setCreditsRemaining(data.creditsRemaining);
    } catch (err: any) {
      setError(err.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAiNaturalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery) return;

    // Convert natural prompt into structured parameters
    const queryLower = naturalQuery.toLowerCase();
    if (queryLower.includes("react")) setSkills("React, TypeScript");
    if (queryLower.includes("node") || queryLower.includes("backend")) setSkills("Node.js, PostgreSQL");
    if (queryLower.includes("chennai")) setLocation("Chennai");
    if (queryLower.includes("bengaluru") || queryLower.includes("bangalore")) setLocation("Bengaluru");
    if (queryLower.includes("30 days") || queryLower.includes("immediate")) setNoticePeriod("30 Days");
    if (queryLower.includes("3") || queryLower.includes("3+")) setMinExp("3");
    if (queryLower.includes("5") || queryLower.includes("5+")) setMinExp("5");

    executeSearch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Talent Search & Sourcing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Query pre-screened tech, marketing, and sales professionals with evidence-based match scoring.
          </p>
        </div>

        {creditsRemaining !== null && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-1.5 text-xs flex items-center gap-2 self-start sm:self-auto">
            <span className="text-blue-900 font-bold">Search Credits:</span>
            <span className="font-black text-blue-700">{creditsRemaining} Remaining</span>
          </div>
        )}
      </div>

      {/* Recruiter AI Natural Prompt Search */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-white p-5 shadow-xs">
        <form onSubmit={handleAiNaturalSubmit}>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-2">
            <Sparkles size={15} className="text-blue-600" />
            Recruiter AI Semantic Search
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder='e.g. "Find React developers in Chennai with 3+ years experience available within 30 days"'
                value={naturalQuery}
                onChange={(e) => setNaturalQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 py-3 pl-4 pr-10 text-xs text-slate-900 focus:border-blue-600 focus:outline-none shadow-2xs"
              />
              <Sparkles size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-600" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-98 transition flex items-center justify-center gap-1.5 shrink-0"
            >
              Run AI Search
            </button>
          </div>
        </form>
      </div>

      {/* Structured Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Required Skills</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, TypeScript, Node.js"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Min Experience</label>
          <select
            value={minExp}
            onChange={(e) => setMinExp(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
          >
            <option value="0">Any experience</option>
            <option value="2">2+ years</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
            <option value="8">8+ years</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
          >
            <option value="All Locations">All Locations</option>
            <option value="Chennai">Chennai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Notice Period</label>
          <select
            value={noticePeriod}
            onChange={(e) => setNoticePeriod(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
          >
            <option value="Any Notice">Any Notice</option>
            <option value="Immediate">Immediate</option>
            <option value="15 Days">Within 15 Days</option>
            <option value="30 Days">Within 30 Days</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Candidate Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs hover:border-blue-300 hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-slate-900">{c.name}</h3>
                      <div className="text-xs text-slate-500">
                        {c.currentRole} at <span className="font-semibold text-slate-700">{c.currentCompany}</span>
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-black text-blue-700">
                    {c.matchScore}% Match
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-xs border-y border-slate-100 py-2.5 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Experience</span>
                    <span className="font-bold text-slate-800">{c.experienceYears}y</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Location</span>
                    <span className="font-bold text-slate-800">{c.location}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Notice Period</span>
                    <span className="font-bold text-slate-800">{c.noticePeriod}</span>
                  </div>
                </div>

                {/* Evidence Matching Breakdown */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span>Skills: {c.matchEvidence?.matching?.join(", ") || "General stack"}</span>
                  </div>

                  {c.matchEvidence?.missing?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-amber-700 text-[11px]">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>Skill gap: {c.matchEvidence.missing.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">₹{c.expectedCtc} LPA Exp</span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/employer/interviews?candidateName=${encodeURIComponent(c.name)}&candidateEmail=${encodeURIComponent(c.email)}`}
                    className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                  >
                    Schedule Interview
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <Search size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-900">No Candidates Found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your required skills or location filters to broaden your candidate search pool.
          </p>
        </div>
      )}
    </div>
  );
}
