"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  ArrowRight,
  ShieldCheck,
  Send,
  RefreshCw,
} from "lucide-react";

export default function CandidateInterviewPage() {
  const params = useParams();
  const token = params?.token as string;

  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [confirming, setConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  // Reschedule modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchInterview();
  }, [token]);

  const fetchInterview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/candidate/interviews/${token}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load interview details");
      }
      setInterview(data.interview);
    } catch (err: any) {
      setError(err.message || "Failed to load interview details");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`/api/candidate/interviews/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONFIRM" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm interview");
      }
      setConfirmSuccess(true);
      fetchInterview();
    } catch (err: any) {
      alert(err.message || "Error confirming interview");
    } finally {
      setConfirming(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReschedule(true);
    try {
      const res = await fetch(`/api/candidate/interviews/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESCHEDULE",
          reason: rescheduleReason,
          preferredDate,
          preferredTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit reschedule request");
      }
      setRescheduleSuccess(true);
      setShowRescheduleModal(false);
      fetchInterview();
    } catch (err: any) {
      alert(err.message || "Error submitting reschedule request");
    } finally {
      setSubmittingReschedule(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 border border-slate-200 shadow-sm text-center">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800">Loading your interview details...</h2>
          <p className="text-xs text-slate-500 mt-1">Please wait while we securely fetch your schedule.</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 border border-red-200 shadow-sm text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Interview Not Found</h2>
          <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto">
            {error || "The interview link is invalid or has expired. Please check your email invitation or contact the hiring team."}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Back to JobsGhuru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmed = interview.candidateConfirmation === "CONFIRMED";
  const isCompleted = interview.status === "COMPLETED";
  const isCancelled = interview.status === "CANCELLED";
  const isReschedulePending =
    interview.status === "RESCHEDULE_REQUESTED" ||
    interview.latestRescheduleRequest?.status === "PENDING";

  const scheduledDate = new Date(interview.scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Branding Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              JG
            </div>
            <div>
              <span className="font-display text-base font-extrabold text-slate-900 tracking-tight">
                JobsGhuru
              </span>
              <span className="text-[10px] block text-slate-500 uppercase tracking-widest font-bold">
                Candidate Interview Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-semibold border border-emerald-200/60">
            <ShieldCheck size={14} /> Verified Invitation
          </div>
        </div>

        {/* Confirmation Status Banner */}
        {confirmSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Interview Confirmed!</div>
              <p className="text-xs text-emerald-700 mt-0.5">
                Thank you, {interview.candidateName}! We have notified the recruitment team at{" "}
                {interview.company?.name || "the company"} that you will attend.
              </p>
            </div>
          </div>
        )}

        {rescheduleSuccess && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 flex items-start gap-3 shadow-xs">
            <RefreshCw className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Reschedule Request Received</div>
              <p className="text-xs text-amber-700 mt-0.5">
                Your request has been forwarded to the recruiter. They will review your preferred time and send an updated invitation.
              </p>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-3 shadow-xs">
            <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">This Interview Has Been Cancelled</div>
              <p className="text-xs text-red-700 mt-0.5">
                The hiring team has cancelled this round. If you have questions, please reach out to your recruiter directly.
              </p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                  {interview.interviewType || "Interview Round"}
                </span>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                    isCompleted
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : isCancelled
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : isConfirmed
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : isReschedulePending
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {isCompleted
                    ? "Completed"
                    : isCancelled
                    ? "Cancelled"
                    : isConfirmed
                    ? "Confirmed"
                    : isReschedulePending
                    ? "Reschedule Requested"
                    : "Action Required: Confirm"}
                </span>
              </div>

              <h1 className="font-display text-2xl font-black text-slate-900">
                {interview.title || "Interview Session"}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Briefcase size={14} className="text-slate-400" />
                  {interview.job?.title || "Position"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 size={14} className="text-slate-400" />
                  {interview.company?.name || "Company"}
                </span>
              </div>
            </div>

            {/* Attendance badge if interview was completed */}
            {isCompleted && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-center sm:text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance</span>
                <span className="text-xs font-bold text-emerald-700">
                  {interview.candidateAttendance === "ATTENDED" ? "✓ Attended" : interview.candidateAttendance || "Completed"}
                </span>
              </div>
            )}
          </div>

          {/* Key Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                <Calendar size={14} className="text-blue-600" /> Date
              </div>
              <div className="font-bold text-sm text-slate-900">{formattedDate}</div>
            </div>

            <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                <Clock size={14} className="text-blue-600" /> Time & Duration
              </div>
              <div className="font-bold text-sm text-slate-900">
                {formattedTime} ({interview.durationMinutes} mins)
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                {interview.mode === "IN_PERSON" ? (
                  <MapPin size={14} className="text-blue-600" />
                ) : interview.mode === "PHONE" ? (
                  <Phone size={14} className="text-blue-600" />
                ) : (
                  <Video size={14} className="text-blue-600" />
                )}{" "}
                Mode
              </div>
              <div className="font-bold text-sm text-slate-900 capitalize">
                {interview.mode ? interview.mode.toLowerCase().replace("_", " ") : "Video Meeting"}
              </div>
            </div>
          </div>

          {/* Join / Meeting Details Section */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Video size={14} className="text-blue-600" /> Meeting Connection Details
            </h3>

            {interview.mode === "IN_PERSON" ? (
              <div className="text-xs text-slate-700">
                <span className="font-semibold block mb-0.5">Office Location:</span>
                <span className="text-slate-900 font-bold">{interview.location || "Office address will be provided by recruiter."}</span>
              </div>
            ) : interview.mode === "PHONE" ? (
              <div className="text-xs text-slate-700">
                <span className="font-semibold block mb-0.5">Phone Call Details:</span>
                <span className="text-slate-900 font-bold">{interview.phoneDetails || "Recruiter will call you at your registered phone number."}</span>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-600 mb-3">
                  Please join the video room at least 5 minutes prior to the scheduled time. Ensure your webcam and microphone are working.
                </p>
                {interview.meetingLink ? (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
                  >
                    <Video size={15} /> Join Video Interview
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    Meeting link will be shared prior to the interview session.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Interviewers Panel */}
          {((interview.participants && interview.participants.length > 0) || interview.interviewer) && (
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users size={14} className="text-slate-400" /> Interview Panel
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {interview.participants && interview.participants.length > 0 ? (
                  interview.participants.map((p: any, idx: number) => {
                    const displayName = p.name || p.interviewerName || "Interviewer";
                    const displayRole = p.roleTitle || p.interviewerRole || "Interviewer";
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3 shadow-2xs"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{displayName}</div>
                          <div className="text-[11px] text-slate-500">{displayRole}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3 shadow-2xs">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {interview.interviewer?.name?.charAt(0) || "I"}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{interview.interviewer?.name || "Hiring Manager"}</div>
                      <div className="text-[11px] text-slate-500">Interviewer</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons for Candidate */}
          {!isCompleted && !isCancelled && (
            <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                {isConfirmed ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={16} /> Interview Confirmed
                    {interview.candidateConfirmedAt && (
                      <span className="text-[11px] font-normal text-slate-500">
                        (on {new Date(interview.candidateConfirmedAt).toLocaleDateString()})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">
                    Please confirm your availability so the hiring team can prepare.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {interview.candidateRescheduling !== false && !isReschedulePending && (
                  <button
                    type="button"
                    onClick={() => setShowRescheduleModal(true)}
                    className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Request Reschedule
                  </button>
                )}

                {!isConfirmed && (
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="flex-1 sm:flex-none rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {confirming ? (
                      "Confirming..."
                    ) : (
                      <>
                        <CheckCircle2 size={15} /> Confirm Interview
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>This is a private invitation sent to {interview.candidateEmail}.</p>
          <p>© {new Date().getFullYear()} JobsGhuru Job Portal. All rights reserved.</p>
        </div>
      </div>

      {/* REQUEST RESCHEDULE MODAL */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900">Request Reschedule</h2>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3.5 text-xs">
              <p className="text-slate-500">
                Please let the recruiter know why you need to reschedule and suggest times when you will be available.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Rescheduling *</label>
                <textarea
                  required
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g., Unavoidable scheduling conflict at current workplace, health emergency..."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Time / Slot</label>
                  <input
                    type="text"
                    placeholder="e.g. 2:00 PM - 5:00 PM"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

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
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingReschedule ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
