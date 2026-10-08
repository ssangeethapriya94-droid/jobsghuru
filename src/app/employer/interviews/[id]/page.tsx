"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Users,
  Building2,
  Briefcase,
  ArrowLeft,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  UserX,
  RefreshCw,
  Send,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Award,
  Layers,
  History,
  FileText,
} from "lucide-react";

export default function EmployerInterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params?.id as string;

  const [interview, setInterview] = useState<any>(null);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Attendance Form
  const [candidateAttendance, setCandidateAttendance] = useState("ATTENDED");
  const [actualStart, setActualStart] = useState("");
  const [actualEnd, setActualEnd] = useState("");
  const [actualDuration, setActualDuration] = useState("");
  const [attendanceNotes, setAttendanceNotes] = useState("");
  const [interviewerAttendances, setInterviewerAttendances] = useState<Record<string, string>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Feedback Form
  const [feedbackForm, setFeedbackForm] = useState({
    interviewerId: "",
    technicalRating: "4",
    problemSolvingRating: "4",
    communicationRating: "4",
    roleKnowledgeRating: "4",
    overallRating: "4",
    recommendation: "HIRE",
    strengths: "",
    concerns: "",
    comments: "",
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Shortlist Form
  const [shortlistStageId, setShortlistStageId] = useState("");
  const [shortlistSendEmail, setShortlistSendEmail] = useState(true);
  const [shortlistSendNotification, setShortlistSendNotification] = useState(true);
  const [shortlistNotes, setShortlistNotes] = useState("");
  const [submittingShortlist, setSubmittingShortlist] = useState(false);

  // Reject Form
  const [rejectReason, setRejectReason] = useState("Interview performance");
  const [rejectInternalNote, setRejectInternalNote] = useState("");
  const [rejectSendEmail, setRejectSendEmail] = useState(true);
  const [rejectSendNotification, setRejectSendNotification] = useState(true);
  const [submittingReject, setSubmittingReject] = useState(false);

  // Reschedule Approval Form
  const [rescheduleAction, setRescheduleAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDuration, setNewDuration] = useState("45");
  const [newMeetingLink, setNewMeetingLink] = useState("");
  const [rescheduleRejectionReason, setRescheduleRejectionReason] = useState("");
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Cancel Form
  const [cancelReason, setCancelReason] = useState("");
  const [notifyCandidateOnCancel, setNotifyCandidateOnCancel] = useState(true);
  const [submittingCancel, setSubmittingCancel] = useState(false);

  useEffect(() => {
    if (interviewId) {
      fetchInterviewDetail();
    }
  }, [interviewId]);

  const fetchInterviewDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employer/interviews/${interviewId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load interview");
      }
      setInterview(data.interview);
      setPipelineStages(data.pipelineStages || []);
      setTeamMembers(data.teamMembers || []);

      // Pre-fill attendance defaults
      if (data.interview) {
        setCandidateAttendance(data.interview.candidateAttendance || "ATTENDED");
        setActualStart(
          data.interview.actualStart
            ? new Date(data.interview.actualStart).toISOString().slice(11, 16)
            : new Date(data.interview.scheduledAt).toISOString().slice(11, 16)
        );
        const scheduledEndTime = new Date(
          new Date(data.interview.scheduledAt).getTime() +
            (data.interview.durationMinutes || 45) * 60000
        );
        setActualEnd(
          data.interview.actualEnd
            ? new Date(data.interview.actualEnd).toISOString().slice(11, 16)
            : scheduledEndTime.toISOString().slice(11, 16)
        );
        setActualDuration(
          data.interview.actualDuration
            ? String(data.interview.actualDuration)
            : String(data.interview.durationMinutes || 45)
        );
        setAttendanceNotes(data.interview.attendanceNotes || "");

        // Pre-fill interviewer attendances
        const attMap: Record<string, string> = {};
        if (data.interview.participants && data.interview.participants.length > 0) {
          data.interview.participants.forEach((p: any) => {
            attMap[p.id] = p.attendanceStatus || "ATTENDED";
          });
        }
        setInterviewerAttendances(attMap);

        // Pre-fill default next stage if available
        if (data.pipelineStages && data.pipelineStages.length > 0) {
          const currentStageIndex = data.pipelineStages.findIndex(
            (s: any) => s.id === data.interview.application?.currentStageId
          );
          if (currentStageIndex >= 0 && currentStageIndex + 1 < data.pipelineStages.length) {
            setShortlistStageId(data.pipelineStages[currentStageIndex + 1].id);
          } else {
            setShortlistStageId(data.pipelineStages[0].id);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch interview details");
    } finally {
      setLoading(false);
    }
  };

  // 1. Save Attendance Handler
  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAttendance(true);
    try {
      const scheduledDateStr = new Date(interview.scheduledAt).toISOString().slice(0, 10);
      const startDateTime = actualStart ? `${scheduledDateStr}T${actualStart}:00.000Z` : undefined;
      const endDateTime = actualEnd ? `${scheduledDateStr}T${actualEnd}:00.000Z` : undefined;

      const participantPayload = Object.entries(interviewerAttendances).map(
        ([participantId, status]) => ({
          participantId,
          attendanceStatus: status,
        })
      );

      const res = await fetch(`/api/employer/interviews/${interviewId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateAttendance,
          actualStart: startDateTime,
          actualEnd: endDateTime,
          actualDuration: actualDuration ? parseInt(actualDuration, 10) : undefined,
          notes: attendanceNotes,
          interviewerAttendances: participantPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record attendance");

      setShowAttendanceModal(false);
      fetchInterviewDetail();
    } catch (err: any) {
      alert(err.message || "Error saving attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  // 2. Submit Feedback Handler
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/employer/interviews/${interviewId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

      setShowFeedbackModal(false);
      fetchInterviewDetail();
    } catch (err: any) {
      alert(err.message || "Error submitting feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // 3. Shortlist Candidate Handler
  const handleShortlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingShortlist(true);
    try {
      const res = await fetch(`/api/employer/interviews/${interviewId}/shortlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextStageId: shortlistStageId || undefined,
          sendEmail: shortlistSendEmail,
          sendNotification: shortlistSendNotification,
          notes: shortlistNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to shortlist candidate");

      setShowShortlistModal(false);
      fetchInterviewDetail();
    } catch (err: any) {
      alert(err.message || "Error shortlisting candidate");
    } finally {
      setSubmittingShortlist(false);
    }
  };

  // 4. Reject Candidate Handler
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReject(true);
    try {
      const res = await fetch(`/api/employer/interviews/${interviewId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: rejectReason,
          internalNote: rejectInternalNote,
          sendEmail: rejectSendEmail,
          sendNotification: rejectSendNotification,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject candidate");

      setShowRejectModal(false);
      fetchInterviewDetail();
    } catch (err: any) {
      alert(err.message || "Error rejecting candidate");
    } finally {
      setSubmittingReject(false);
    }
  };

  // 5. Reschedule Action Handler
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interview.rescheduleRequests || interview.rescheduleRequests.length === 0) return;
    const latestReq = interview.rescheduleRequests[0];

    setSubmittingReschedule(true);
    try {
      const res = await fetch(`/api/employer/interviews/${interviewId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: latestReq.id,
          action: rescheduleAction,
          newDate: rescheduleAction === "APPROVE" ? newDate : undefined,
          newTime: rescheduleAction === "APPROVE" ? newTime : undefined,
          newDuration: rescheduleAction === "APPROVE" ? newDuration : undefined,
          meetingLink: rescheduleAction === "APPROVE" ? newMeetingLink : undefined,
          rejectionReason: rescheduleAction === "REJECT" ? rescheduleRejectionReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to manage reschedule request");

      setShowRescheduleModal(false);
      fetchInterviewDetail();
    } catch (err: any) {
      alert(err.message || "Error processing reschedule request");
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // 6. Cancel Interview Handler
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCancel(true);
    try {
      const res = await fetch(`/api/employer/interviews/${interviewId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: cancelReason,
          notifyCandidate: notifyCandidateOnCancel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel interview");

      setShowCancelModal(false);
      fetchInterviewDetail();
    } catch (err: any) {
      alert(err.message || "Error cancelling interview");
    } finally {
      setSubmittingCancel(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
            <div className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-48 rounded-3xl bg-slate-200 animate-pulse" />
            <div className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="rounded-3xl border border-red-200 bg-white p-12 text-center shadow-xs">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
        <h3 className="font-display text-base font-bold text-slate-900">Interview Not Found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">{error || "The requested interview could not be found."}</p>
        <div className="mt-6">
          <Link
            href="/employer/interviews"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
          >
            <ArrowLeft size={14} /> Back to Interviews
          </Link>
        </div>
      </div>
    );
  }

  // Derived values
  const scheduledDate = new Date(interview.scheduledAt);
  const formattedScheduled = scheduledDate.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isCompleted = interview.status === "COMPLETED";
  const isCancelled = interview.status === "CANCELLED";
  const isNoShow = interview.status === "NO_SHOW" || interview.candidateAttendance === "NO_SHOW";
  const isReschedulePending = interview.status === "RESCHEDULE_REQUESTED";

  // Feedbacks breakdown
  const feedbacks = interview.feedbacks || [];
  const feedbackCount = feedbacks.length;
  const avgRating =
    feedbackCount > 0
      ? (feedbacks.reduce((acc: number, f: any) => acc + (f.overallRating || 0), 0) / feedbackCount).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employer/interviews"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Interviews</span>
              <ChevronRight size={12} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-700">{interview.title}</span>
            </div>
            <h1 className="font-display text-2xl font-black text-slate-900 mt-0.5">
              {interview.candidateName} — {interview.title}
            </h1>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Record Attendance */}
          {!isCancelled && (
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition flex items-center gap-1.5"
            >
              <UserCheck size={14} /> Record Attendance
            </button>
          )}

          {/* Submit Feedback */}
          {!isCancelled && (
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-600 transition flex items-center gap-1.5 shadow-xs"
            >
              <Star size={14} /> Submit Feedback
            </button>
          )}

          {/* Shortlist Candidate */}
          {interview.application && interview.application.status !== "REJECTED" && (
            <button
              onClick={() => setShowShortlistModal(true)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
            >
              <ThumbsUp size={14} /> Shortlist Candidate
            </button>
          )}

          {/* Reject Candidate */}
          {interview.application && interview.application.status !== "REJECTED" && (
            <button
              onClick={() => setShowRejectModal(true)}
              className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition flex items-center gap-1.5"
            >
              <ThumbsDown size={14} /> Reject
            </button>
          )}

          {/* Cancel Interview */}
          {!isCompleted && !isCancelled && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Reschedule Alert banner if candidate requested reschedule */}
      {isReschedulePending && interview.rescheduleRequests && interview.rescheduleRequests.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <RefreshCw className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-amber-900 uppercase tracking-wide">
                Candidate Requested Reschedule
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                <span className="font-bold">Reason:</span> "{interview.rescheduleRequests[0].reason}"
                {interview.rescheduleRequests[0].preferredDate && (
                  <span className="ml-2 font-medium">
                    (Preferred: {interview.rescheduleRequests[0].preferredDate} {interview.rescheduleRequests[0].preferredTime})
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (interview.rescheduleRequests[0].preferredDate) {
                setNewDate(interview.rescheduleRequests[0].preferredDate);
              }
              if (interview.rescheduleRequests[0].preferredTime) {
                setNewTime(interview.rescheduleRequests[0].preferredTime);
              }
              setShowRescheduleModal(true);
            }}
            className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition shrink-0"
          >
            Review & Reschedule
          </button>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details, Attendance, Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Interview Overview Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                    {interview.interviewType}
                  </span>
                  {interview.subtype && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                      {interview.subtype}
                    </span>
                  )}
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700"
                        : isCancelled
                        ? "bg-red-50 text-red-700"
                        : isNoShow
                        ? "bg-red-50 text-red-700"
                        : isReschedulePending
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {interview.status}
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold text-slate-900 mt-1">{interview.title}</h2>
              </div>

              {/* Candidate Confirmation Badge */}
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Candidate Confirmation</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold ${
                    interview.candidateConfirmation === "CONFIRMED" ? "text-emerald-700" : "text-amber-600"
                  }`}
                >
                  {interview.candidateConfirmation === "CONFIRMED" ? (
                    <>
                      <CheckCircle2 size={13} /> Confirmed
                      {interview.candidateConfirmedAt && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({new Date(interview.candidateConfirmedAt).toLocaleDateString()})
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <Clock size={13} /> Pending Confirmation
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Timing & Connection Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
                  <Calendar size={13} className="text-blue-600" /> Scheduled Date & Time
                </div>
                <div className="text-xs font-bold text-slate-900">{formattedScheduled}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Duration: {interview.durationMinutes} minutes</div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
                  {interview.mode === "IN_PERSON" ? (
                    <MapPin size={13} className="text-blue-600" />
                  ) : interview.mode === "PHONE" ? (
                    <Phone size={13} className="text-blue-600" />
                  ) : (
                    <Video size={13} className="text-blue-600" />
                  )}{" "}
                  Meeting Mode
                </div>
                <div className="text-xs font-bold text-slate-900 capitalize">
                  {interview.mode ? interview.mode.toLowerCase().replace("_", " ") : "Video"}
                </div>
                {interview.meetingLink && (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    Open Meeting Link <ExternalLink size={10} />
                  </a>
                )}
                {interview.location && (
                  <div className="text-[11px] text-slate-600 truncate mt-1">{interview.location}</div>
                )}
                {interview.phoneDetails && (
                  <div className="text-[11px] text-slate-600 truncate mt-1">{interview.phoneDetails}</div>
                )}
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
                  <Layers size={13} className="text-blue-600" /> Pipeline Stage
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {interview.stage?.name || "Interview Stage"}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  App Status:{" "}
                  <span className="font-bold text-slate-700">
                    {interview.application?.status || "ACTIVE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {interview.notes && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">Preparation Notes & Instructions:</span>
                <p className="whitespace-pre-line">{interview.notes}</p>
              </div>
            )}
          </div>

          {/* 2. COMPLETE ATTENDANCE DETAILS CARD (Section 14 & 15) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-blue-600" />
                <h3 className="font-display text-base font-bold text-slate-900">Interview Attendance</h3>
              </div>
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                {interview.candidateAttendance ? "Edit Attendance" : "+ Record Attendance"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate Attendance</span>
                <span
                  className={`font-bold text-sm block mt-1 ${
                    interview.candidateAttendance === "ATTENDED"
                      ? "text-emerald-700"
                      : interview.candidateAttendance === "NO_SHOW"
                      ? "text-red-700"
                      : interview.candidateAttendance === "LATE"
                      ? "text-amber-700"
                      : "text-slate-700"
                  }`}
                >
                  {interview.candidateAttendance || "Not Recorded"}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Actual Start Time</span>
                <span className="font-bold text-sm text-slate-900 block mt-1">
                  {interview.actualStart
                    ? new Date(interview.actualStart).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Actual End Time</span>
                <span className="font-bold text-sm text-slate-900 block mt-1">
                  {interview.actualEnd
                    ? new Date(interview.actualEnd).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Actual Duration</span>
                <span className="font-bold text-sm text-slate-900 block mt-1">
                  {interview.actualDuration ? `${interview.actualDuration} mins` : "—"}
                </span>
              </div>
            </div>

            {/* Interviewer Attendance List */}
            {interview.participants && interview.participants.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-700 mb-2">Interviewer Attendance:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {interview.participants.map((p: any) => {
                    const dispName = p.name || p.interviewerName || "Interviewer";
                    const dispRole = p.roleTitle || p.interviewerRole || "Interviewer";
                    const dispAtt = p.attendance || p.attendanceStatus || "ATTENDED";
                    return (
                      <div
                        key={p.id}
                        className="rounded-xl border border-slate-200 p-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{dispName}</div>
                          <div className="text-[10px] text-slate-500">{dispRole}</div>
                        </div>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            dispAtt === "ATTENDED"
                              ? "bg-emerald-50 text-emerald-700"
                              : dispAtt === "ABSENT"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {dispAtt}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {interview.attendanceNotes && (
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700 block mb-0.5">Attendance Notes:</span>
                {interview.attendanceNotes}
              </div>
            )}
          </div>

          {/* 3. MULTI-INTERVIEWER FEEDBACK RECORDS (Section 17 & 18) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  Interviewer Evaluations ({feedbackCount} Submitted)
                </h3>
              </div>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition"
              >
                + Add Feedback
              </button>
            </div>

            {/* Average Rating Scorecard */}
            {avgRating && (
              <div className="rounded-2xl bg-amber-50/60 border border-amber-200/60 p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Consolidated Panel Rating
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-display text-2xl font-black text-slate-900">{avgRating}</span>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          className={s <= Math.round(Number(avgRating)) ? "fill-amber-500 text-amber-500" : "text-slate-300"}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 ml-1">based on {feedbackCount} feedback records</span>
                  </div>
                </div>
              </div>
            )}

            {/* Separate Feedback Records per Interviewer */}
            {feedbacks.length > 0 ? (
              <div className="space-y-3.5">
                {feedbacks.map((fb: any) => (
                  <div
                    key={fb.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{fb.interviewerName}</span>
                        {fb.interviewerRole && (
                          <span className="text-[11px] text-slate-500 ml-1.5">({fb.interviewerRole})</span>
                        )}
                        <span className="text-[10px] text-slate-400 block">
                          Submitted on {new Date(fb.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                            fb.recommendation === "STRONG_HIRE"
                              ? "bg-emerald-600 text-white"
                              : fb.recommendation === "HIRE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : fb.recommendation === "MAYBE"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {fb.recommendation.replace("_", " ")}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                          <Star size={13} className="text-amber-500 fill-amber-500" />
                          {fb.overallRating}/5
                        </div>
                      </div>
                    </div>

                    {/* Detailed Ratings Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                      {fb.technicalRating && (
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="block text-slate-400 text-[10px]">Technical</span>
                          <span className="font-bold text-slate-800">{fb.technicalRating}/5</span>
                        </div>
                      )}
                      {fb.problemSolvingRating && (
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="block text-slate-400 text-[10px]">Problem Solving</span>
                          <span className="font-bold text-slate-800">{fb.problemSolvingRating}/5</span>
                        </div>
                      )}
                      {fb.communicationRating && (
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="block text-slate-400 text-[10px]">Communication</span>
                          <span className="font-bold text-slate-800">{fb.communicationRating}/5</span>
                        </div>
                      )}
                      {fb.roleKnowledgeRating && (
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="block text-slate-400 text-[10px]">Role Knowledge</span>
                          <span className="font-bold text-slate-800">{fb.roleKnowledgeRating}/5</span>
                        </div>
                      )}
                    </div>

                    {/* Strengths & Concerns */}
                    {fb.strengths && (
                      <div className="text-xs">
                        <span className="font-bold text-emerald-800 block">Key Strengths:</span>
                        <p className="text-slate-700 mt-0.5">{fb.strengths}</p>
                      </div>
                    )}
                    {fb.concerns && (
                      <div className="text-xs">
                        <span className="font-bold text-amber-800 block">Identified Concerns / Gaps:</span>
                        <p className="text-slate-700 mt-0.5">{fb.concerns}</p>
                      </div>
                    )}
                    {fb.comments && (
                      <div className="text-xs">
                        <span className="font-bold text-slate-700 block">Interviewer Remarks:</span>
                        <p className="text-slate-600 mt-0.5 whitespace-pre-line">{fb.comments}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                No evaluation submitted yet. Interviewers can submit their feedback scorecards once the round concludes.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Candidate Info, Stage Progress, Quick Decision Actions */}
        <div className="space-y-6">
          {/* Candidate Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Candidate Overview
            </h3>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 font-black text-lg flex items-center justify-center shrink-0">
                {interview.candidateName?.charAt(0) || "C"}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-slate-900 truncate">{interview.candidateName}</div>
                <div className="text-xs text-slate-500 truncate">{interview.candidateEmail}</div>
                {interview.application?.candidate?.phone && (
                  <div className="text-[11px] text-slate-500 mt-0.5">{interview.application.candidate.phone}</div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Job Title:</span>
                <span className="font-bold text-slate-800 truncate max-w-[180px]">{interview.job?.title || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-medium text-slate-800">{interview.job?.department || "General"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Match Score:</span>
                <span className="font-bold text-emerald-600">
                  {interview.application?.matchScore ? `${interview.application.matchScore}%` : "88%"}
                </span>
              </div>
            </div>

            {interview.application?.id && (
              <Link
                href={`/employer/applications/${interview.application.id}`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-center text-xs font-bold text-slate-700 hover:bg-slate-100 transition block"
              >
                View Full Application Profile
              </Link>
            )}
          </div>

          {/* Quick Decision Box (Section 20 & 21 & 23) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Recruitment Decisions
            </h3>
            <p className="text-xs text-slate-500">
              Move candidate through your customizable hiring pipeline based on panel consensus.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => setShowShortlistModal(true)}
                className="w-full rounded-xl bg-emerald-600 py-2.5 px-3 text-xs font-bold text-white hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ThumbsUp size={14} /> Shortlist to Next Stage
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                className="w-full rounded-xl border border-red-200 bg-red-50/50 py-2 px-3 text-xs font-bold text-red-600 hover:bg-red-100 transition flex items-center justify-center gap-1.5"
              >
                <ThumbsDown size={14} /> Reject Candidate
              </button>

              <Link
                href={`/employer/interviews?candidateName=${encodeURIComponent(
                  interview.candidateName
                )}&candidateEmail=${encodeURIComponent(interview.candidateEmail)}&jobTitle=${encodeURIComponent(
                  interview.job?.title || ""
                )}&appId=${interview.applicationId || ""}`}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5 block text-center"
              >
                <Calendar size={13} /> Schedule Another Round
              </Link>
            </div>
          </div>

          {/* Pipeline Stages Progress */}
          {pipelineStages.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Hiring Pipeline
              </h3>
              <div className="space-y-2">
                {pipelineStages.map((stage: any, index: number) => {
                  const isCurrent = stage.id === interview.application?.currentStageId;
                  const isPassed =
                    interview.application?.stageHistory?.some((h: any) => h.stageId === stage.id) ||
                    (interview.application?.currentStage && stage.orderIndex < interview.application.currentStage.orderIndex);

                  return (
                    <div
                      key={stage.id}
                      className={`flex items-center gap-2.5 p-2 rounded-xl text-xs ${
                        isCurrent
                          ? "bg-blue-50 text-blue-900 font-bold border border-blue-200"
                          : isPassed
                          ? "text-slate-700 font-medium"
                          : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isCurrent
                            ? "bg-blue-600 text-white"
                            : isPassed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isPassed ? "✓" : index + 1}
                      </div>
                      <span className="truncate">{stage.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. ATTENDANCE MODAL (Section 14 & 15) */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">Record Interview Attendance</h2>
                <p className="text-xs text-slate-500">Capture exact timing and participation records.</p>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Attendance Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  {["ATTENDED", "NO_SHOW", "LATE", "LEFT_EARLY", "CANCELLED", "RESCHEDULED"].map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setCandidateAttendance(status)}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold uppercase transition text-center ${
                        candidateAttendance === status
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Actual Start Time</label>
                  <input
                    type="time"
                    value={actualStart}
                    onChange={(e) => setActualStart(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Actual End Time</label>
                  <input
                    type="time"
                    value={actualEnd}
                    onChange={(e) => setActualEnd(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Actual Duration (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={actualDuration}
                    onChange={(e) => setActualDuration(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Panel Interviewer Attendance */}
              {interview.participants && interview.participants.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Interviewer Attendance</label>
                  <div className="space-y-2">
                    {interview.participants.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <span className="font-bold text-slate-800">{p.name || p.interviewerName}</span>
                        <select
                          value={interviewerAttendances[p.id] || "ATTENDED"}
                          onChange={(e) =>
                            setInterviewerAttendances({
                              ...interviewerAttendances,
                              [p.id]: e.target.value,
                            })
                          }
                          className="rounded-lg border border-slate-300 py-1 px-2 text-xs bg-white text-slate-800 font-bold"
                        >
                          <option value="ATTENDED">Attended</option>
                          <option value="ABSENT">Absent</option>
                          <option value="LATE">Late</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Attendance Notes</label>
                <textarea
                  rows={2}
                  value={attendanceNotes}
                  onChange={(e) => setAttendanceNotes(e.target.value)}
                  placeholder="e.g. Candidate joined on time, clear audio/video, conducted complete technical exercise."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAttendance}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingAttendance ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SUBMIT FEEDBACK MODAL (Section 17 & 18) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Interviewer Scorecard: {interview.candidateName}
                </h2>
                <p className="text-xs text-slate-500">Each interviewer submits separate confidential feedback.</p>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-3.5 text-xs">
              {teamMembers.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Submitting As Interviewer *</label>
                  <select
                    value={feedbackForm.interviewerId}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, interviewerId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 bg-white font-bold"
                  >
                    <option value="">Current Recruiter / Admin</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Numerical Ratings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Technical Knowledge (1-5)</label>
                  <select
                    value={feedbackForm.technicalRating}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, technicalRating: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-1.5 px-3 text-slate-900 bg-white"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} Stars
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Problem Solving (1-5)</label>
                  <select
                    value={feedbackForm.problemSolvingRating}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, problemSolvingRating: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-1.5 px-3 text-slate-900 bg-white"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} Stars
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Communication (1-5)</label>
                  <select
                    value={feedbackForm.communicationRating}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, communicationRating: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-1.5 px-3 text-slate-900 bg-white"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} Stars
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Overall Rating (1-5) *</label>
                  <select
                    value={feedbackForm.overallRating}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, overallRating: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-1.5 px-3 text-slate-900 bg-white font-bold"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} Stars
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hiring Recommendation *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "Strong Hire", val: "STRONG_HIRE" },
                    { label: "Hire", val: "HIRE" },
                    { label: "Maybe", val: "MAYBE" },
                    { label: "No Hire", val: "NO_HIRE" },
                  ].map((rec) => (
                    <button
                      type="button"
                      key={rec.val}
                      onClick={() => setFeedbackForm({ ...feedbackForm, recommendation: rec.val })}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition text-center ${
                        feedbackForm.recommendation === rec.val
                          ? "bg-amber-500 text-white border-amber-500"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {rec.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Strengths</label>
                <input
                  type="text"
                  value={feedbackForm.strengths}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, strengths: e.target.value })}
                  placeholder="e.g. Excellent system design intuition, crisp communication, deep SQL knowledge"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Concerns / Red Flags</label>
                <input
                  type="text"
                  value={feedbackForm.concerns}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, concerns: e.target.value })}
                  placeholder="e.g. Needs coaching on CI/CD pipelines, hesitated on edge cases"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Remarks</label>
                <textarea
                  rows={3}
                  value={feedbackForm.comments}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                  placeholder="Provide context on problem-solving flow, culture alignment, and next step guidance..."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {submittingFeedback ? "Submitting..." : "Submit Scorecard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SHORTLIST MODAL (Section 21 & 22) */}
      {showShortlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <ThumbsUp size={18} />
                <h2 className="font-display text-base font-bold text-slate-900">Shortlist Candidate</h2>
              </div>
              <button
                onClick={() => setShowShortlistModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleShortlistSubmit} className="space-y-3.5 text-xs">
              <p className="text-slate-600">
                Shortlisting marks candidate as <span className="font-bold text-emerald-700">SHORTLISTED</span> and
                progresses them to the selected pipeline stage.
              </p>

              {pipelineStages.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Next Pipeline Stage *</label>
                  <select
                    value={shortlistStageId}
                    onChange={(e) => setShortlistStageId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 bg-white font-bold"
                  >
                    {pipelineStages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.stageType})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Shortlist Note</label>
                <textarea
                  rows={2}
                  value={shortlistNotes}
                  onChange={(e) => setShortlistNotes(e.target.value)}
                  placeholder="e.g. Consensus hire from tech panel, moving to manager round."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={shortlistSendEmail}
                    onChange={(e) => setShortlistSendEmail(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Send Shortlist Celebration Email to Candidate</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={shortlistSendNotification}
                    onChange={(e) => setShortlistSendNotification(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Send In-App Notification</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowShortlistModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingShortlist}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submittingShortlist ? "Processing..." : "Confirm Shortlist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. REJECT MODAL (Section 23 & 24 & 25) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <ThumbsDown size={18} />
                <h2 className="font-display text-base font-bold text-slate-900">Reject Candidate</h2>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rejection Reason *</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 bg-white font-bold"
                >
                  <option value="Skills mismatch">Skills mismatch</option>
                  <option value="Experience mismatch">Experience mismatch</option>
                  <option value="Interview performance">Interview performance</option>
                  <option value="Assessment result">Assessment result</option>
                  <option value="Position filled">Position filled</option>
                  <option value="Salary mismatch">Salary mismatch</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Internal Private Note (Strictly Protected)
                </label>
                <textarea
                  rows={3}
                  value={rejectInternalNote}
                  onChange={(e) => setRejectInternalNote(e.target.value)}
                  placeholder="Internal justification for hiring record only. Candidate will NEVER see this note."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={rejectSendEmail}
                    onChange={(e) => setRejectSendEmail(e.target.checked)}
                    className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Send Polite Rejection Email to Candidate</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={rejectSendNotification}
                    onChange={(e) => setRejectSendNotification(e.target.checked)}
                    className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Send In-App Notification</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="rounded-xl bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {submittingReject ? "Processing..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. RESCHEDULE APPROVAL MODAL (Section 11) */}
      {showRescheduleModal && interview.rescheduleRequests && interview.rescheduleRequests.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900">Manage Reschedule Request</h2>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3.5 text-xs">
              <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-amber-900">
                <span className="font-bold block">Candidate's Stated Reason:</span>
                <p className="mt-0.5">{interview.rescheduleRequests[0].reason}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Recruiter Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRescheduleAction("APPROVE")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      rescheduleAction === "APPROVE"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    Approve & Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setRescheduleAction("REJECT")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      rescheduleAction === "REJECT"
                        ? "bg-red-600 text-white border-red-600"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    Reject Request
                  </button>
                </div>
              </div>

              {rescheduleAction === "APPROVE" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Date *</label>
                      <input
                        type="date"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Time *</label>
                      <input
                        type="time"
                        required
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Meeting Link (if updated)</label>
                    <input
                      type="url"
                      value={newMeetingLink}
                      onChange={(e) => setNewMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rejection Reason</label>
                  <textarea
                    rows={2}
                    value={rescheduleRejectionReason}
                    onChange={(e) => setRescheduleRejectionReason(e.target.value)}
                    placeholder="e.g. Schedule is fixed due to external panel availability."
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReschedule}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingReschedule ? "Processing..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CANCEL INTERVIEW MODAL (Section 12) */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900">Cancel Interview</h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-3.5 text-xs">
              <p className="text-slate-600">
                Cancelling marks this round as CANCELLED in the candidate timeline without deleting historical records.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cancellation Reason *</label>
                <textarea
                  required
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Position on hold, candidate withdrew, interviewer unavailable."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={notifyCandidateOnCancel}
                  onChange={(e) => setNotifyCandidateOnCancel(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Send Cancellation Email to Candidate</span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="rounded-xl bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {submittingCancel ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
