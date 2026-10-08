"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  FileCheck,
  User,
  ArrowRight,
  Sparkles,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  Clock,
  Briefcase,
} from "lucide-react";

export default function EmployerApplicationsPage() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "";

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"KANBAN" | "LIST">("KANBAN");
  const [selectedJob, setSelectedJob] = useState(initialJobId);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeApp, setActiveApp] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "TIMELINE" | "NOTES">("OVERVIEW");
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [notesData, setNotesData] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchTimeline = (appId: string) => {
    setLoadingTimeline(true);
    fetch(`/api/employer/applications/${appId}/timeline`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setTimelineData(d.timeline || []);
          setNotesData(d.notes || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingTimeline(false));
  };

  const handleOpenApp = (app: any) => {
    setActiveApp(app);
    setActiveTab("OVERVIEW");
    fetchTimeline(app.id);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp || !newNote.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/employer/applications/${activeApp.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote, isPrivate: isPrivateNote }),
      });
      if (res.ok) {
        setNewNote("");
        fetchTimeline(activeApp.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingNote(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedJob]);

  const fetchApplications = () => {
    setLoading(true);
    const url = selectedJob
      ? `/api/employer/applications?jobId=${selectedJob}`
      : "/api/employer/applications";

    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setApplications(d.applications);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleStageMove = async (applicationId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/employer/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a))
        );
        if (activeApp?.id === applicationId) {
          setActiveApp((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const stages = [
    { key: "SUBMITTED", label: "Applied", color: "border-slate-300 bg-slate-50/60" },
    { key: "UNDER_REVIEW", label: "Screening", color: "border-blue-300 bg-blue-50/30" },
    { key: "SHORTLISTED", label: "Shortlisted", color: "border-purple-300 bg-purple-50/30" },
    { key: "INTERVIEW_SCHEDULED", label: "Interview", color: "border-amber-300 bg-amber-50/30" },
    { key: "OFFER_EXTENDED", label: "Offer", color: "border-indigo-300 bg-indigo-50/30" },
    { key: "HIRED", label: "Hired", color: "border-emerald-300 bg-emerald-50/30" },
  ];

  const filteredApps = applications.filter((a) =>
    a.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Applicant Pipeline</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time candidate workflow across screening, interview, offer, and hire stages.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`rounded-lg px-3 py-1.5 transition ${
                viewMode === "KANBAN" ? "bg-blue-600 text-white font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`rounded-lg px-3 py-1.5 transition ${
                viewMode === "LIST" ? "bg-blue-600 text-white font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Filter / Search Row */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search applicants by name, role, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredApps.length}</span> candidates
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === "KANBAN" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {stages.map((st) => {
            const stageApps = filteredApps.filter((a) => a.status === st.key);
            return (
              <div
                key={st.key}
                className={`rounded-2xl border p-3 min-h-[480px] flex flex-col justify-between ${st.color}`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 mb-3">
                    <span className="font-bold text-xs text-slate-800">{st.label}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs">
                      {stageApps.length}
                    </span>
                  </div>

                  {/* Candidate Cards */}
                  <div className="space-y-2.5">
                    {stageApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => handleOpenApp(app)}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-blue-400 hover:shadow-xs transition"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 hover:text-blue-600 line-clamp-1">
                            {app.candidateName}
                          </span>
                          <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 shrink-0">
                            {app.matchScore}%
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {app.job.title}
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
                          <span>{app.experienceYears}y exp</span>
                          {app.expectedCtc && <span>₹{app.expectedCtc} LPA</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 text-center text-[10px] text-slate-400">
                  {stageApps.length === 0 ? "No candidates" : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "LIST" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Job Role</th>
                <th className="py-3 px-4 text-center">Match</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Expected CTC</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{app.candidateName}</div>
                    <div className="text-[11px] text-slate-400">{app.candidateEmail}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{app.job.title}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      {app.matchScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{app.experienceYears} yrs</td>
                  <td className="py-3 px-4 text-slate-600">
                    {app.expectedCtc ? `₹${app.expectedCtc} LPA` : "Not specified"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {app.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenApp(app)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CANDIDATE DOSSIER MODAL WITH TABS */}
      {activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-slate-900">{activeApp.candidateName}</h2>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                    {activeApp.matchScore}% AI Match
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Applied for <span className="font-bold text-slate-800">{activeApp.job.title}</span> • {activeApp.candidateEmail} • {activeApp.candidatePhone}
                </div>
              </div>

              <button
                onClick={() => setActiveApp(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("OVERVIEW")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  activeTab === "OVERVIEW"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Overview & Profile
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("TIMELINE")}
                className={`rounded-lg px-3 py-1.5 transition flex items-center gap-1.5 ${
                  activeTab === "TIMELINE"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>Timeline & History</span>
                <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[9px] text-slate-800">
                  {timelineData.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("NOTES")}
                className={`rounded-lg px-3 py-1.5 transition flex items-center gap-1.5 ${
                  activeTab === "NOTES"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>Internal Notes</span>
                <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[9px] text-slate-800">
                  {notesData.length}
                </span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "OVERVIEW" && (
              <div className="space-y-4">
                {/* Candidate Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] text-slate-400 font-medium">Experience</span>
                    <div className="font-bold text-slate-900 mt-0.5">{activeApp.experienceYears} Years</div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] text-slate-400 font-medium">Expected Salary</span>
                    <div className="font-bold text-slate-900 mt-0.5">₹{activeApp.expectedCtc || 14} LPA</div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] text-slate-400 font-medium">Notice Period</span>
                    <div className="font-bold text-slate-900 mt-0.5">{activeApp.noticePeriod || "30 Days"}</div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] text-slate-400 font-medium">Current Role</span>
                    <div className="font-bold text-slate-900 mt-0.5">{activeApp.currentRole || "Software Engineer"}</div>
                  </div>
                </div>

                {/* Cover Note & Highlights */}
                {activeApp.coverNote && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 text-xs">
                    <div className="font-bold text-blue-900 mb-1">Candidate Cover Note:</div>
                    <p className="text-slate-600 leading-relaxed">{activeApp.coverNote}</p>
                  </div>
                )}

                {/* Stage Transition Selector */}
                <div className="border-t border-slate-100 pt-3">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Move Pipeline Stage</label>
                  <div className="flex flex-wrap gap-2">
                    {stages.map((st) => (
                      <button
                        key={st.key}
                        type="button"
                        disabled={updating}
                        onClick={() => handleStageMove(activeApp.id, st.key)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
                          activeApp.status === st.key
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {st.label} {activeApp.status === st.key && "✓"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TIMELINE */}
            {activeTab === "TIMELINE" && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500 font-medium">
                  Chronological record of every candidate touchpoint, interview, and decision.
                </div>

                {loadingTimeline ? (
                  <div className="h-32 rounded-2xl bg-slate-100 animate-pulse"></div>
                ) : timelineData.length > 0 ? (
                  <div className="relative pl-6 border-l-2 border-blue-200 space-y-5 text-xs">
                    {timelineData.map((ev: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-blue-600 border-2 border-white"></div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{ev.action}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(ev.timestamp).toLocaleString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Actor: <span className="font-semibold text-slate-700">{ev.actorName}</span> ({ev.actorRole})
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">No events logged yet.</div>
                )}
              </div>
            )}

            {/* TAB 3: NOTES */}
            {activeTab === "NOTES" && (
              <div className="space-y-4 text-xs">
                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <textarea
                    rows={2}
                    required
                    placeholder="Add internal recruiter feedback or private candidate assessment notes..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:outline-none focus:border-blue-600"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-slate-600 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrivateNote}
                        onChange={(e) => setIsPrivateNote(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>Private note (Interviewers only)</span>
                    </label>
                    <button
                      type="submit"
                      disabled={submittingNote || !newNote.trim()}
                      className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {submittingNote ? "Saving..." : "Add Note"}
                    </button>
                  </div>
                </form>

                {/* Notes List */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                  {notesData.length > 0 ? (
                    notesData.map((nt: any) => (
                      <div key={nt.id} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900">{nt.authorName} ({nt.authorRole})</span>
                          <span className="text-slate-400">
                            {new Date(nt.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-xs">{nt.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">No recruiter notes yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions in Modal */}
            <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href={`/employer/interviews?candidateName=${encodeURIComponent(activeApp.candidateName)}&candidateEmail=${encodeURIComponent(activeApp.candidateEmail)}&jobTitle=${encodeURIComponent(activeApp.job.title)}&appId=${activeApp.id}`}
                  className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-600 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Calendar size={13} /> Schedule Interview
                </Link>

                <Link
                  href="/employer/assessments"
                  className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition flex items-center gap-1.5"
                >
                  <FileCheck size={13} /> Assign Assessment
                </Link>

                <Link
                  href="/employer/offers"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 size={13} /> Extend Offer
                </Link>
              </div>

              <button
                onClick={() => setActiveApp(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
