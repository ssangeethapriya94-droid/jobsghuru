"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  Video,
  Plus,
  CheckCircle2,
  XCircle,
  ExternalLink,
  User,
  Star,
  MessageSquare,
  AlertCircle,
  Briefcase,
  Users,
  Search,
  Filter,
  UserCheck,
  MapPin,
  Phone,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export default function EmployerInterviewsPage() {
  const searchParams = useSearchParams();
  const prefillCandidate = searchParams.get("candidateName") || "";
  const prefillEmail = searchParams.get("candidateEmail") || "";
  const prefillJob = searchParams.get("jobTitle") || "";
  const prefillAppId = searchParams.get("appId") || "";

  const [interviews, setInterviews] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    upcomingCount: 0,
    todayCount: 0,
    pendingFeedbackCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    noShowCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(Boolean(prefillCandidate));
  const [activeFeedbackModal, setActiveFeedbackModal] = useState<any | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // New Interview Form with Multi-interviewer and mode support
  const [scheduleForm, setScheduleForm] = useState({
    candidateName: prefillCandidate,
    candidateEmail: prefillEmail,
    title: prefillJob ? `Interview for ${prefillJob}` : "Technical Evaluation Round",
    interviewType: "TECHNICAL",
    subtype: "",
    mode: "VIDEO",
    scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    durationMinutes: "45",
    meetingLink: "https://meet.google.com/xyz-careerbridge",
    location: "",
    phoneDetails: "",
    candidateConfirmation: true,
    candidateRescheduling: true,
    feedbackRequired: true,
    notes: "Review architecture fundamentals, React component patterns, and past projects.",
    applicationId: prefillAppId,
    interviewers: [
      { name: "Rahul Sharma", role: "Senior Developer", email: "" },
    ],
  });

  // Feedback Form
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("4");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInterviews();
    if (prefillCandidate || prefillEmail) {
      setScheduleForm((prev) => ({
        ...prev,
        candidateName: prefillCandidate || prev.candidateName,
        candidateEmail: prefillEmail || prev.candidateEmail,
        title: prefillJob ? `Interview for ${prefillJob}` : prev.title,
        applicationId: prefillAppId || prev.applicationId,
      }));
      setShowScheduleModal(true);
    }
  }, [prefillCandidate, prefillEmail, prefillJob, prefillAppId, selectedStatus, selectedType]);

  const fetchInterviews = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedStatus !== "ALL") params.append("status", selectedStatus);
    if (selectedType !== "ALL") params.append("type", selectedType);
    if (searchTerm) params.append("search", searchTerm);

    fetch(`/api/employer/interviews?${params.toString()}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setInterviews(d.interviews || []);
          if (d.metrics) {
            setMetrics(d.metrics);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInterviews();
  };

  const handleAddInterviewer = () => {
    setScheduleForm((prev) => ({
      ...prev,
      interviewers: [...prev.interviewers, { name: "", role: "Interviewer", email: "" }],
    }));
  };

  const handleRemoveInterviewer = (index: number) => {
    setScheduleForm((prev) => ({
      ...prev,
      interviewers: prev.interviewers.filter((_, i) => i !== index),
    }));
  };

  const handleInterviewerChange = (index: number, field: string, value: string) => {
    setScheduleForm((prev) => {
      const updated = [...prev.interviewers];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, interviewers: updated };
    });
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/employer/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleForm),
      });
      if (res.ok) {
        setShowScheduleModal(false);
        fetchInterviews();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to schedule interview");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFeedbackModal) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/employer/interviews/${activeFeedbackModal.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overallRating: feedbackRating,
          recommendation: Number(feedbackRating) >= 4 ? "HIRE" : "MAYBE",
          comments: feedbackNotes,
        }),
      });
      if (res.ok) {
        setActiveFeedbackModal(null);
        fetchInterviews();
      } else {
        // Fallback to PATCH if needed
        const patchRes = await fetch("/api/employer/interviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interviewId: activeFeedbackModal.id,
            status: "COMPLETED",
            feedback: feedbackNotes,
            rating: feedbackRating,
          }),
        });
        if (patchRes.ok) {
          setActiveFeedbackModal(null);
          fetchInterviews();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900">Interviews & Hiring Rounds</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate multi-round interviews, track attendance, collect panel scorecards, and shortlist candidates.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={14} /> Schedule Interview
        </button>
      </div>

      {/* Metric Cards (Section 35) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => {
            setSelectedStatus("SCHEDULED");
          }}
          className={`cursor-pointer rounded-2xl border p-3.5 transition ${
            selectedStatus === "SCHEDULED" ? "border-blue-500 bg-blue-50/50 shadow-xs" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Upcoming</span>
          <div className="text-xl font-black text-blue-700 mt-1">{metrics.upcomingCount}</div>
        </div>

        <div
          onClick={() => {
            setSelectedStatus("TODAY");
            fetchInterviews();
          }}
          className={`cursor-pointer rounded-2xl border p-3.5 transition ${
            selectedStatus === "TODAY" ? "border-amber-500 bg-amber-50/50 shadow-xs" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Today's Rounds</span>
          <div className="text-xl font-black text-amber-600 mt-1">{metrics.todayCount}</div>
        </div>

        <div
          onClick={() => {
            setSelectedStatus("PENDING_FEEDBACK");
            fetchInterviews();
          }}
          className={`cursor-pointer rounded-2xl border p-3.5 transition ${
            selectedStatus === "PENDING_FEEDBACK" ? "border-purple-500 bg-purple-50/50 shadow-xs" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pending Scorecard</span>
          <div className="text-xl font-black text-purple-700 mt-1">{metrics.pendingFeedbackCount}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("COMPLETED")}
          className={`cursor-pointer rounded-2xl border p-3.5 transition ${
            selectedStatus === "COMPLETED" ? "border-emerald-500 bg-emerald-50/50 shadow-xs" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Completed</span>
          <div className="text-xl font-black text-emerald-700 mt-1">{metrics.completedCount}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("CANCELLED")}
          className={`cursor-pointer rounded-2xl border p-3.5 transition ${
            selectedStatus === "CANCELLED" ? "border-red-500 bg-red-50/50 shadow-xs" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cancelled</span>
          <div className="text-xl font-black text-slate-600 mt-1">{metrics.cancelledCount}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("NO_SHOW")}
          className={`cursor-pointer rounded-2xl border p-3.5 transition ${
            selectedStatus === "NO_SHOW" ? "border-rose-500 bg-rose-50/50 shadow-xs" : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">No-Show</span>
          <div className="text-xl font-black text-rose-600 mt-1">{metrics.noShowCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate, job, or round..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-300 py-2 px-3 text-slate-800 bg-white font-medium focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="RESCHEDULE_REQUESTED">Reschedule Requested</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-300 py-2 px-3 text-slate-800 bg-white font-medium focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="TECHNICAL">Technical Round</option>
            <option value="HR">HR Interview</option>
            <option value="MANAGERIAL">Manager Interview</option>
            <option value="CULTURE">Culture Fit</option>
            <option value="LEADERSHIP">Leadership</option>
            <option value="FINAL">Final Round</option>
            <option value="CUSTOM">Custom Round</option>
          </select>

          {(selectedStatus !== "ALL" || selectedType !== "ALL" || searchTerm) && (
            <button
              onClick={() => {
                setSelectedStatus("ALL");
                setSelectedType("ALL");
                setSearchTerm("");
              }}
              className="text-xs text-blue-600 hover:underline px-2 py-1 font-bold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Interviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : interviews.length > 0 ? (
        <div className="space-y-3.5">
          {interviews.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-bold text-slate-900">{item.candidateName}</span>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    {item.interviewType}
                  </span>
                  {item.subtype && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {item.subtype}
                    </span>
                  )}
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.status === "CONFIRMED"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.status === "SCHEDULED"
                        ? "bg-amber-50 text-amber-700"
                        : item.status === "NO_SHOW"
                        ? "bg-red-50 text-red-700"
                        : item.status === "RESCHEDULE_REQUESTED"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.status.replace("_", " ")}
                  </span>

                  {item.candidateAttendance && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      Attendance: {item.candidateAttendance}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{item.title}</span>
                  {item.job?.title && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Briefcase size={12} className="text-slate-400" /> {item.job.title}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    {new Date(item.scheduledAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ({item.durationMinutes} min)
                  </span>
                  {item.participants && item.participants.length > 0 ? (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <Users size={12} className="text-blue-600" />
                        Panel ({item.participants.length}): {item.participants.map((p: any) => p.interviewerName).join(", ")}
                      </span>
                    </>
                  ) : item.interviewerName ? (
                    <>
                      <span>•</span>
                      <span>Interviewer: {item.interviewerName}</span>
                    </>
                  ) : null}
                </div>

                {/* Scorecard rating summary */}
                {item.feedbacks && item.feedbacks.length > 0 ? (
                  <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600 flex items-center gap-3">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      <span>
                        Consolidated:{" "}
                        {(
                          item.feedbacks.reduce((a: number, b: any) => a + (b.overallRating || 0), 0) /
                          item.feedbacks.length
                        ).toFixed(1)}
                        /5
                      </span>
                    </div>
                    <span className="text-slate-400">•</span>
                    <span>{item.feedbacks.length} scorecard(s) submitted</span>
                  </div>
                ) : item.feedback ? (
                  <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600">
                    <div className="font-bold text-slate-800 flex items-center gap-1 mb-0.5">
                      <span>Rating: {item.rating}/5</span>
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                    </div>
                    <div>{item.feedback}</div>
                  </div>
                ) : null}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {item.meetingLink && item.status !== "CANCELLED" && (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <Video size={13} className="text-blue-600" /> Join
                  </a>
                )}

                {item.status === "SCHEDULED" && (
                  <button
                    onClick={() => {
                      setActiveFeedbackModal(item);
                      setFeedbackNotes(item.feedback || "");
                    }}
                    className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-600 transition flex items-center gap-1"
                  >
                    Feedback
                  </button>
                )}

                <Link
                  href={`/employer/interviews/${item.id}`}
                  className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition flex items-center gap-1 shadow-xs"
                >
                  Manage & Attendance <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <Calendar size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-900">No Interviews Found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Schedule candidate discussions directly from the applicant pipeline or using the button below.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
            >
              <Plus size={14} /> Schedule Interview
            </button>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL (Section 7, 8, 5) */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">Schedule Interview Round</h2>
                <p className="text-xs text-slate-500">
                  Connect candidate to interview panel with automated email invitations.
                </p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Candidate Name *</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.candidateName}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, candidateName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Candidate Email *</label>
                  <input
                    type="email"
                    required
                    value={scheduleForm.candidateEmail}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, candidateEmail: e.target.value })}
                    placeholder="candidate@example.com"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Interview Round Title *</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Type, Subtype, Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interview Type</label>
                  <select
                    value={scheduleForm.interviewType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewType: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="TECHNICAL">Technical Interview</option>
                    <option value="HR">HR Interview</option>
                    <option value="MANAGERIAL">Manager Interview</option>
                    <option value="CULTURE">Culture Fit</option>
                    <option value="LEADERSHIP">Leadership</option>
                    <option value="FINAL">Final Interview</option>
                    <option value="CUSTOM">Custom Round</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mode</label>
                  <select
                    value={scheduleForm.mode}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, mode: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="VIDEO">Video Meeting</option>
                    <option value="IN_PERSON">In-Person Office</option>
                    <option value="PHONE">Phone Call</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Min)</label>
                  <select
                    value={scheduleForm.durationMinutes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, durationMinutes: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>
              </div>

              {/* Custom Subtype if CUSTOM */}
              {scheduleForm.interviewType === "CUSTOM" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Custom Round Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Founder Interview, Case Study Discussion, Panel Interview"
                    value={scheduleForm.subtype}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, subtype: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              )}

              {/* Date & Time */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleForm.scheduledAt}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Mode-specific field */}
              {scheduleForm.mode === "VIDEO" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Video Meeting Link</label>
                  <input
                    type="url"
                    value={scheduleForm.meetingLink}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              )}

              {scheduleForm.mode === "IN_PERSON" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office Location Address</label>
                  <input
                    type="text"
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    placeholder="e.g. 5th Floor, Tower B, Tech Park, Bangalore"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              )}

              {scheduleForm.mode === "PHONE" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Contact Details</label>
                  <input
                    type="text"
                    value={scheduleForm.phoneDetails}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, phoneDetails: e.target.value })}
                    placeholder="e.g. Recruiter will call candidate directly at registered mobile number."
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              )}

              {/* Multi-Interviewer Panel (Section 8) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Interview Panel Members</label>
                  <button
                    type="button"
                    onClick={handleAddInterviewer}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Interviewer
                  </button>
                </div>

                <div className="space-y-2">
                  {scheduleForm.interviewers.map((inv, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Interviewer Name (e.g. Rahul Sharma)"
                        value={inv.name}
                        onChange={(e) => handleInterviewerChange(idx, "name", e.target.value)}
                        className="flex-1 rounded-xl border border-slate-300 py-1.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Role / Title (e.g. Senior Dev)"
                        value={inv.role}
                        onChange={(e) => handleInterviewerChange(idx, "role", e.target.value)}
                        className="w-36 rounded-xl border border-slate-300 py-1.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                      {scheduleForm.interviewers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInterviewer(idx)}
                          className="text-slate-400 hover:text-red-500 p-1.5"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles: Confirmation & Rescheduling */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={scheduleForm.candidateConfirmation}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, candidateConfirmation: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Require Candidate Confirmation before round</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={scheduleForm.candidateRescheduling}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, candidateRescheduling: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Allow Candidate to Request Rescheduling</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Scheduling & Sending Email..." : "Schedule Interview"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK SCORECARD MODAL */}
      {activeFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900">
                Evaluation Scorecard: {activeFeedbackModal.candidateName}
              </h2>
              <button
                onClick={() => setActiveFeedbackModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Overall Rating (1 to 5 Stars)</label>
                <select
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none bg-white font-bold"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 - Exceptional Fit / Strong Hire</option>
                  <option value="4">⭐⭐⭐⭐ 4 - Good Competency / Recommend Hire</option>
                  <option value="3">⭐⭐⭐ 3 - Meets Baseline Criteria</option>
                  <option value="2">⭐⭐ 2 - Skill Gaps Observed</option>
                  <option value="1">⭐ 1 - Not Recommended</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Interviewer Notes & Skill Feedback</label>
                <textarea
                  rows={4}
                  required
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Detail problem-solving approach, technical depth, communication, and recommendation..."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFeedbackModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Scorecard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
