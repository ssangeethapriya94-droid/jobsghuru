"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, UserCheck, FolderPlus, Mail, Briefcase, MapPin, Award, CheckCircle2, AlertCircle } from "lucide-react";

export default function CandidateSearchPage() {
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showPoolModal, setShowPoolModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [targetPoolId, setTargetPoolId] = useState("");
  const [inviteJobId, setInviteJobId] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCandidates();
    fetchPoolsAndJobs();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (skill) params.set("skill", skill);
      if (location) params.set("location", location);

      const res = await fetch(`/api/employer/candidates/search?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoolsAndJobs = async () => {
    try {
      const [poolRes, jobRes] = await Promise.all([
        fetch("/api/employer/talent-pools"),
        fetch("/api/employer/jobs"),
      ]);
      const poolData = await poolRes.json();
      const jobData = await jobRes.json();

      if (poolData.success) setPools(poolData.pools || []);
      if (jobData.jobs) setJobs(jobData.jobs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleAddToPool = async () => {
    if (!targetPoolId || !selectedCandidate) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/employer/talent-pools/${targetPoolId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateEmail: selectedCandidate.email || "candidate@example.com",
          candidateName: selectedCandidate.name,
          candidateId: selectedCandidate.userId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Added to talent pool successfully.");
        setShowPoolModal(false);
      } else {
        alert(data.error || "Failed to add to pool");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteJobId || !selectedCandidate) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/employer/candidates/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateEmail: selectedCandidate.email || "candidate@example.com",
          candidateName: selectedCandidate.name,
          jobId: inviteJobId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Invitation dispatched successfully.");
        setShowInviteModal(false);
      } else {
        alert(data.error || "Failed to send invitation");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Talent Search</h1>
        <p className="text-xs text-slate-500 mt-1">Discover verified candidates who have explicitly opted in for employer discovery.</p>
      </div>

      {/* Search Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="p-4 rounded-3xl border border-slate-200 bg-white shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <input
            type="text"
            placeholder="Search keywords, title, or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Filter by skill (e.g. React, Node.js)"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Location (e.g. Bengaluru, Remote)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none"
          />
        </div>
        <button type="submit" className="p-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-1.5">
          <Search size={14} /> Search Candidates
        </button>
      </form>

      {/* Candidate List */}
      {loading ? (
        <div className="p-8 text-center text-slate-400">Searching opted-in talent database...</div>
      ) : candidates.length > 0 ? (
        <div className="space-y-4">
          {candidates.map((c) => (
            <div key={c.id} className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-base font-extrabold text-slate-900">{c.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {c.profileCompleteness}% Complete
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">{c.headline}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {c.location}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {c.totalExperienceYears} Yrs Exp</span>
                  <span>•</span>
                  <span>Notice: {c.noticePeriod}</span>
                  {!c.hideSalaryFromEmployers && c.expectedCtc && (
                    <>
                      <span>•</span>
                      <span className="font-bold text-slate-800">Expected CTC: ₹{c.expectedCtc} LPA</span>
                    </>
                  )}
                </div>

                {c.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {c.skills.slice(0, 6).map((sk: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                <button
                  onClick={() => {
                    setSelectedCandidate(c);
                    setShowPoolModal(true);
                  }}
                  className="px-3 py-2 border border-slate-300 font-bold text-xs text-slate-700 rounded-xl hover:bg-slate-50 flex items-center gap-1"
                >
                  <FolderPlus size={14} /> Add to Pool
                </button>

                <button
                  onClick={() => {
                    setSelectedCandidate(c);
                    setShowInviteModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 font-bold text-xs text-white rounded-xl hover:bg-blue-700 shadow-xs flex items-center gap-1"
                >
                  <Mail size={14} /> Invite to Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <AlertCircle size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-base text-slate-900">No Candidates Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try broadening your search criteria or removing filters.</p>
        </div>
      )}

      {/* ADD TO POOL MODAL */}
      {showPoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h2 className="font-bold text-base text-slate-900">Add {selectedCandidate?.name} to Talent Pool</h2>
            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700">Select Talent Pool *</label>
              <select
                value={targetPoolId}
                onChange={(e) => setTargetPoolId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none"
              >
                <option value="">-- Choose a Talent Pool --</option>
                {pools.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowPoolModal(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                <button
                  onClick={handleAddToPool}
                  disabled={submitting || !targetPoolId}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  Save to Pool
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h2 className="font-bold text-base text-slate-900">Invite {selectedCandidate?.name} to Apply</h2>
            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700">Target Position *</label>
              <select
                value={inviteJobId}
                onChange={(e) => setInviteJobId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none"
              >
                <option value="">-- Choose Open Job --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title} ({j.location})</option>
                ))}
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                <button
                  onClick={handleSendInvite}
                  disabled={submitting || !inviteJobId}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  Dispatch Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
