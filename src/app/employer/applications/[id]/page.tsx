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
  Layers,
  History,
  FileText,
  Plus,
  ExternalLink,
  ChevronRight,
  Send,
  Lock,
  Trash2,
  Check,
  X,
  Award,
  Sparkles,
  ArrowRight,
  CalendarCheck,
  Mail,
  DollarSign,
  TrendingUp,
  Shield,
  Loader2,
} from "lucide-react";

export default function EmployerApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params?.id as string;

  const [application, setApplication] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("COMPANY_ADMIN");
  const [permissions, setPermissions] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "TIMELINE" | "NOTES" | "INTERVIEWS" | "ASSESSMENTS">("OVERVIEW");

  // Notes state
  const [newNote, setNewNote] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Timeline state
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelinePage, setTimelinePage] = useState(1);
  const [timelineTotalPages, setTimelineTotalPages] = useState(1);

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showMoveStageModal, setShowMoveStageModal] = useState(false);

  // Action Form States
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    interviewType: "TECHNICAL",
    mode: "VIDEO",
    scheduledAt: "",
    durationMinutes: 45,
    meetingLink: "",
    location: "",
    phoneDetails: "",
    notes: "",
    interviewerName: "",
    interviewerEmail: "",
  });
  const [availableAssessments, setAvailableAssessments] = useState<any[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [assessmentDaysValid, setAssessmentDaysValid] = useState(7);
  const [shortlistNextStageId, setShortlistNextStageId] = useState("");
  const [shortlistNotes, setShortlistNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("Qualifications mismatch");
  const [rejectInternalNote, setRejectInternalNote] = useState("");
  const [rejectCandidateMsg, setRejectCandidateMsg] = useState("");
  const [targetStageId, setTargetStageId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
      fetchTimeline(1);
      fetchAssessments();
    }
  }, [applicationId]);

  const showToastMsg = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchApplication = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employer/applications/${applicationId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load application");
      setApplication(data.application);
      setUserRole(data.userRole || "COMPANY_ADMIN");
      setPermissions(data.userPermissions || {});
      if (data.application.currentStageId) {
        setTargetStageId(data.application.currentStageId);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch application");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (page: number = 1) => {
    setTimelineLoading(true);
    try {
      const res = await fetch(`/api/employer/applications/${applicationId}/timeline?page=${page}&limit=15`);
      const data = await res.json();
      if (res.ok) {
        setTimelineEvents(data.timeline || []);
        setTimelinePage(data.page || 1);
        setTimelineTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimelineLoading(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      const res = await fetch(`/api/employer/assessments`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.assessments)) {
        const publishedOnly = data.assessments.filter((a: any) => a.status === "PUBLISHED" && !a.isArchived);
        setAvailableAssessments(publishedOnly);
        if (publishedOnly.length > 0) {
          setSelectedAssessmentId(publishedOnly[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/employer/applications/${applicationId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote, isPrivate: isPrivateNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add note");
      setNewNote("");
      showToastMsg("success", "Note added successfully.");
      fetchApplication();
      fetchTimeline(timelinePage);
    } catch (e: any) {
      showToastMsg("error", e.message || "Failed to add note");
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`/api/employer/applications/${applicationId}/notes/${noteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete note");
      showToastMsg("success", "Note deleted successfully.");
      fetchApplication();
      fetchTimeline(timelinePage);
    } catch (e: any) {
      showToastMsg("error", e.message || "Failed to delete note");
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.scheduledAt) {
      showToastMsg("error", "Please select interview date and time.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/employer/applications/${applicationId}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...scheduleForm,
          interviewers: scheduleForm.interviewerName
            ? [{ name: scheduleForm.interviewerName, email: scheduleForm.interviewerEmail }]
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule interview");
      showToastMsg("success", "Interview scheduled and candidate notification queued.");
      setShowScheduleModal(false);
      fetchApplication();
      fetchTimeline(1);
    } catch (e: any) {
      showToastMsg("error", e.message || "Failed to schedule interview");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessmentId) {
      showToastMsg("error", "Please select an assessment to assign.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/employer/assessments/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: selectedAssessmentId,
          applicationId,
          daysValid: assessmentDaysValid,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign assessment");
      showToastMsg("success", "Assessment assigned and candidate invite dispatched.");
      setShowAssessmentModal(false);
      fetchApplication();
      fetchTimeline(1);
    } catch (e: any) {
      showToastMsg("error", e.message || "Failed to assign assessment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleShortlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/employer/applications/${applicationId}/shortlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextStageId: shortlistNextStageId || undefined,
          notes: shortlistNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to shortlist candidate");
      showToastMsg("success", "Candidate shortlisted successfully.");
      setShowShortlistModal(false);
      fetchApplication();
      fetchTimeline(1);
    } catch (e: any) {
      showToastMsg("error", e.message || "Failed to shortlist candidate");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason) {
      showToastMsg("error", "Please choose a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/employer/applications/${applicationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: rejectReason,
          internalNote: rejectInternalNote || undefined,
          candidateMessage: rejectCandidateMsg || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject candidate");
      showToastMsg("success", "Application marked as rejected.");
      setShowRejectModal(false);
      fetchApplication();
      fetchTimeline(1);
    } catch (e: any) {
      showToastMsg("error", e.message || "Failed to reject candidate");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStageId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/employer/applications/${applicationId}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId: targetStageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to move stage");
      showToastMsg("success", data.message || "Stage updated successfully.");
      setShowMoveStageModal(false);
      fetchApplication();
      fetchTimeline(1);
    } catch (e: any) {
      showToastMsg("error", e.message || "Failed to move stage");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-44 rounded-3xl bg-slate-200 animate-pulse" />
        <div className="h-96 rounded-3xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="rounded-3xl border border-red-200 bg-white p-12 text-center shadow-xs max-w-xl mx-auto my-12">
        <AlertCircle size={44} className="mx-auto text-red-500 mb-3" />
        <h3 className="font-display text-lg font-bold text-slate-900">Application Unavailable</h3>
        <p className="mt-2 text-sm text-slate-500">{error || "The application could not be found or you lack permission to view it."}</p>
        <div className="mt-6">
          <Link
            href="/employer/applications"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
          >
            <ArrowLeft size={14} /> Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const candidateName = application.candidate?.name || application.candidateName || "Candidate";
  const candidateEmail = application.candidate?.email || application.candidateEmail || "";
  const candidatePhone = application.candidate?.phone || application.candidatePhone || "";
  const jobTitle = application.job?.title || "Job Position";
  const stages = application.pipelineVersion?.stages || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">Applied</span>;
      case "UNDER_REVIEW":
        return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">Under Review</span>;
      case "SHORTLISTED":
        return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">Shortlisted</span>;
      case "INTERVIEW_SCHEDULED":
        return <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200">Interviewing</span>;
      case "OFFERED":
        return <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">Offered</span>;
      case "HIRED":
        return <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">Hired</span>;
      case "REJECTED":
        return <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">Rejected</span>;
      case "ARCHIVED":
        return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">Archived</span>;
      default:
        return <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold shadow-xl transition-all animate-bounce ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employer/applications"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Applications</span>
              <ChevronRight size={12} className="text-slate-400" />
              <span className="font-semibold text-slate-700">{jobTitle}</span>
            </div>
            <h1 className="font-display text-2xl font-black text-slate-900 mt-0.5">{candidateName}</h1>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {permissions.canMoveStage && stages.length > 0 && (
            <button
              onClick={() => setShowMoveStageModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <Layers size={14} className="text-blue-600" />
              Move Stage
            </button>
          )}

          {permissions.canScheduleInterview && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
            >
              <CalendarCheck size={14} />
              Schedule Interview
            </button>
          )}

          {permissions.canAssignAssessment && (
            <button
              onClick={() => setShowAssessmentModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-xs"
            >
              <Award size={14} className="text-blue-600" />
              Assign Assessment
            </button>
          )}

          {permissions.canShortlist && application.status !== "SHORTLISTED" && application.status !== "HIRED" && (
            <button
              onClick={() => setShowShortlistModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <ThumbsUp size={14} />
              Shortlist
            </button>
          )}

          {permissions.canReject && application.status !== "REJECTED" && application.status !== "HIRED" && (
            <button
              onClick={() => setShowRejectModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-xs"
            >
              <ThumbsDown size={14} />
              Reject
            </button>
          )}
        </div>
      </div>

      {/* Main Candidate Banner Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {candidateName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-display text-xl font-black text-slate-900">{candidateName}</h2>
                {getStatusBadge(application.status)}
                {application.currentStage && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200 flex items-center gap-1.5">
                    <Layers size={12} className="text-blue-600" />
                    {application.currentStage.name}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-600 mt-1 flex items-center gap-2">
                <Briefcase size={14} className="text-slate-400" />
                {application.currentRole || "Candidate"} {application.currentCompany ? `at ${application.currentCompany}` : ""}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2.5">
                <span className="flex items-center gap-1"><Mail size={13} className="text-slate-400" /> {candidateEmail}</span>
                {candidatePhone && <span className="flex items-center gap-1"><Phone size={13} className="text-slate-400" /> {candidatePhone}</span>}
                <span className="flex items-center gap-1"><Clock size={13} className="text-slate-400" /> Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Match Score</span>
              <span className="font-display text-2xl font-black text-blue-600">{application.matchScore || 85}%</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Experience</span>
              <span className="font-display text-lg font-bold text-slate-800">{application.experienceYears || 0} yrs</span>
            </div>
            {permissions.canViewSalary && application.expectedCtc && (
              <>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expected CTC</span>
                  <span className="font-display text-lg font-bold text-slate-800">₹{application.expectedCtc} LPA</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { key: "OVERVIEW", label: "Overview", icon: User },
          { key: "TIMELINE", label: "Timeline", icon: History, count: timelineEvents.length },
          ...(permissions.canAddNote ? [{ key: "NOTES", label: "Notes", icon: MessageSquare, count: application.notes?.length || 0 }] : []),
          { key: "INTERVIEWS", label: "Interviews", icon: Video, count: application.interviews?.length || 0 },
          { key: "ASSESSMENTS", label: "Assessments", icon: Award, count: application.candidateAssessments?.length || 0 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon size={15} />
              {tab.label}
              {typeof tab.count === "number" && tab.count > 0 && (
                <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                  isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-display text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" />
                Professional Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Current Role</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{application.currentRole || "Not specified"}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Current Employer</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{application.currentCompany || "Not specified"}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Total Experience</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{application.experienceYears || 0} Years</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-semibold">Notice Period</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{application.noticePeriod || "Immediate / Standard"}</span>
                </div>
                {permissions.canViewSalary && (
                  <>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Current CTC</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">{application.currentCtc ? `₹${application.currentCtc} LPA` : "Confidential"}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Expected CTC</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">{application.expectedCtc ? `₹${application.expectedCtc} LPA` : "Negotiable"}</span>
                    </div>
                  </>
                )}
              </div>

              {application.coverNote && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-slate-400 block text-xs font-semibold mb-1.5">Candidate Cover Note</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed italic">
                    "{application.coverNote}"
                  </p>
                </div>
              )}
            </div>

            {/* Resume Viewer */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-display text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                Resume & Attachments
              </h3>
              {application.resumeUrl ? (
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      PDF
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{application.resumeFileName || "Candidate_Resume.pdf"}</p>
                      <span className="text-[10px] text-slate-500">Uploaded with application</span>
                    </div>
                  </div>
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                  >
                    View Resume <ExternalLink size={13} />
                  </a>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Resume file not available
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Pipeline & Job Info */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-display text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-blue-600" />
                Recruitment Pipeline
              </h3>
              <div className="space-y-3">
                {stages.map((stg: any, index: number) => {
                  const isCurrent = stg.id === application.currentStageId;
                  return (
                    <div
                      key={stg.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition ${
                        isCurrent
                          ? "bg-blue-50 border-blue-300 font-bold text-blue-800"
                          : "bg-slate-50 border-slate-100 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isCurrent ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {index + 1}
                        </span>
                        <span>{stg.name}</span>
                      </div>
                      {isCurrent && <CheckCircle2 size={16} className="text-blue-600" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 text-xs">
              <h3 className="font-display text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                Job Context
              </h3>
              <div className="space-y-2 text-slate-600">
                <p><strong>Position:</strong> {jobTitle}</p>
                <p><strong>Department:</strong> {application.job?.department || "General"}</p>
                <p><strong>Location:</strong> {application.job?.location || "Remote"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TIMELINE */}
      {activeTab === "TIMELINE" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <History size={16} className="text-blue-600" />
              Application Audit Timeline (Newest First)
            </h3>
            <span className="text-xs text-slate-400">{timelineEvents.length} events logged</span>
          </div>

          {timelineLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading timeline events...</div>
          ) : timelineEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No timeline events recorded.</div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timelineEvents.map((ev, idx) => (
                <div key={ev.id || idx} className="relative group">
                  <div className="absolute -left-6 top-1 h-5 w-5 rounded-full border-2 border-white bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 hover:bg-slate-50 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-900">{ev.action}</span>
                      <span className="text-[10px] text-slate-400">{new Date(ev.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>Actor: <strong>{ev.actorName || "System"}</strong></span>
                      <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">{ev.actorRole}</span>
                    </div>
                    {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                      <div className="mt-2 text-[11px] text-slate-600 bg-white/80 rounded-xl p-2.5 border border-slate-100 space-y-1">
                        {ev.metadata.fromStage && <p>Stage: {ev.metadata.fromStage} → <strong>{ev.metadata.toStage}</strong></p>}
                        {ev.metadata.reason && <p>Reason: {ev.metadata.reason}</p>}
                        {ev.metadata.rating && <p>Rating: ⭐ {ev.metadata.rating}/5 ({ev.metadata.recommendation})</p>}
                        {ev.metadata.assessmentTitle && <p>Assessment: {ev.metadata.assessmentTitle}</p>}
                        {ev.metadata.score !== undefined && <p>Score: <strong>{ev.metadata.score}%</strong></p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {timelineTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-100">
              <button
                disabled={timelinePage <= 1}
                onClick={() => fetchTimeline(timelinePage - 1)}
                className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500">Page {timelinePage} of {timelineTotalPages}</span>
              <button
                disabled={timelinePage >= timelineTotalPages}
                onClick={() => fetchTimeline(timelinePage + 1)}
                className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: NOTES */}
      {activeTab === "NOTES" && permissions.canAddNote && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <h3 className="font-display text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-600" />
            Recruiter & Hiring Team Notes (Internal Only)
          </h3>

          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add confidential observations, interview remarks, or compensation considerations..."
              className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivateNote}
                  onChange={(e) => setIsPrivateNote(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <Lock size={12} className="text-slate-400" />
                Mark as private note
              </label>
              <button
                type="submit"
                disabled={submittingNote || !newNote.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-xs"
              >
                {submittingNote ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Add Note
              </button>
            </div>
          </form>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            {application.notes?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recruiter notes added yet.</p>
            ) : (
              application.notes?.map((note: any) => (
                <div key={note.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{note.author?.name || note.authorName}</span>
                      <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[9px] font-black text-slate-700 uppercase">
                        {note.author?.role || note.authorRole}
                      </span>
                      {note.isPrivate && (
                        <span className="rounded-md bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-1">
                          <Lock size={10} /> Private
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400">{new Date(note.createdAt).toLocaleString()}</span>
                      {permissions.canDeleteNote && (
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-slate-400 hover:text-red-600 transition p-1"
                          title="Delete note"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: INTERVIEWS */}
      {activeTab === "INTERVIEWS" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Video size={16} className="text-blue-600" />
              Scheduled Interviews & Feedback
            </h3>
            {permissions.canScheduleInterview && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                <Plus size={13} /> Schedule New
              </button>
            )}
          </div>

          {application.interviews?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No interviews scheduled yet for this candidate.</p>
          ) : (
            <div className="space-y-4">
              {application.interviews?.map((inv: any) => (
                <div key={inv.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{inv.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{inv.subtype || inv.interviewType} • {inv.mode}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      inv.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block">Date & Time</span>
                      <span className="font-semibold text-slate-800">{new Date(inv.scheduledAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Duration</span>
                      <span className="font-semibold text-slate-800">{inv.durationMinutes} Minutes</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Location / Link</span>
                      {inv.meetingLink ? (
                        <a href={inv.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                          Join Call <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="font-semibold text-slate-800">{inv.location || "Online"}</span>
                      )}
                    </div>
                  </div>

                  {inv.participants?.length > 0 && (
                    <div className="text-xs">
                      <span className="text-slate-400 font-semibold block mb-1">Interviewers:</span>
                      <div className="flex flex-wrap gap-2">
                        {inv.participants.map((p: any) => (
                          <span key={p.id} className="rounded-lg bg-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-800">
                            {p.name} ({p.roleTitle || "Interviewer"})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {inv.feedbacks?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-800">Submitted Feedback:</span>
                      {inv.feedbacks.map((fb: any) => (
                        <div key={fb.id} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{fb.interviewerName}</span>
                            <span className="text-emerald-700 font-bold">⭐ {fb.overallRating}/5 • {fb.recommendation}</span>
                          </div>
                          {fb.comments && <p className="text-slate-600 italic">"{fb.comments}"</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ASSESSMENTS */}
      {activeTab === "ASSESSMENTS" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-blue-600" />
              Technical Assessments
            </h3>
            {permissions.canAssignAssessment && (
              <button
                onClick={() => setShowAssessmentModal(true)}
                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                <Plus size={13} /> Assign Assessment
              </button>
            )}
          </div>

          {application.candidateAssessments?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No assessments assigned yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.candidateAssessments?.map((asg: any) => (
                <div key={asg.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{asg.assessment?.title || "Assessment"}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      asg.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {asg.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Assigned on: {new Date(asg.createdAt).toLocaleDateString()}</p>
                    <p>Expires on: {new Date(asg.expiresAt).toLocaleDateString()}</p>
                    {asg.submittedAt && <p>Completed on: {new Date(asg.submittedAt).toLocaleDateString()}</p>}
                  </div>

                  {asg.score !== null && asg.score !== undefined && (
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-semibold">Result Score</span>
                      <span className="text-sm font-black text-blue-600">{asg.score}% ({asg.passed ? "Passed" : "Failed"})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. SCHEDULE INTERVIEW MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-black text-slate-900 flex items-center gap-2">
                <CalendarCheck size={18} className="text-blue-600" />
                Schedule Interview Round
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Round Title</label>
                <input
                  type="text"
                  placeholder="e.g. System Design & Distributed Architecture"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interview Type</label>
                  <select
                    value={scheduleForm.interviewType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  >
                    <option value="TECHNICAL">Technical Round</option>
                    <option value="HR">HR / Culture Screen</option>
                    <option value="MANAGERIAL">Managerial / Leadership</option>
                    <option value="FINAL">Final Executive Round</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mode</label>
                  <select
                    value={scheduleForm.mode}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, mode: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  >
                    <option value="VIDEO">Google Meet / Video Call</option>
                    <option value="PHONE">Phone Call</option>
                    <option value="IN_PERSON">In-Person at Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date & Time (Future)</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleForm.scheduledAt}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={scheduleForm.durationMinutes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, durationMinutes: parseInt(e.target.value, 10) || 45 })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
              </div>

              {scheduleForm.mode === "VIDEO" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meeting Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/xyz-abc-123"
                    value={scheduleForm.meetingLink}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interviewer Name</label>
                  <input
                    type="text"
                    placeholder="Lead Architect"
                    value={scheduleForm.interviewerName}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interviewer Email</label>
                  <input
                    type="email"
                    placeholder="architect@company.com"
                    value={scheduleForm.interviewerEmail}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerEmail: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {actionLoading ? "Scheduling..." : "Confirm & Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ASSIGN ASSESSMENT MODAL */}
      {showAssessmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-black text-slate-900 flex items-center gap-2">
                <Award size={18} className="text-blue-600" />
                Assign Technical Assessment
              </h3>
              <button onClick={() => setShowAssessmentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignAssessment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Assessment</label>
                {availableAssessments.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    No assessments published for your company yet.
                  </p>
                ) : (
                  <select
                    value={selectedAssessmentId}
                    onChange={(e) => setSelectedAssessmentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium"
                  >
                    {availableAssessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} ({a.durationMinutes} mins, {a.passingScore || 70}% pass)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Validity (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={assessmentDaysValid}
                  onChange={(e) => setAssessmentDaysValid(parseInt(e.target.value, 10) || 7)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssessmentModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || availableAssessments.length === 0}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {actionLoading ? "Assigning..." : "Assign & Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SHORTLIST MODAL */}
      {showShortlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-black text-slate-900 flex items-center gap-2">
                <ThumbsUp size={18} className="text-emerald-600" />
                Shortlist Candidate
              </h3>
              <button onClick={() => setShowShortlistModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleShortlist} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Shortlisting will advance <strong>{candidateName}</strong> to the next phase of evaluation and send a positive status update.
              </p>

              {stages.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Stage (Optional)</label>
                  <select
                    value={shortlistNextStageId}
                    onChange={(e) => setShortlistNextStageId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  >
                    <option value="">Keep / Default Next Stage</option>
                    {stages.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Note (Optional)</label>
                <textarea
                  rows={2}
                  value={shortlistNotes}
                  onChange={(e) => setShortlistNotes(e.target.value)}
                  placeholder="e.g. Strong technical scores, recommend scheduling Lead Architect round."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowShortlistModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Confirm Shortlist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-black text-slate-900 flex items-center gap-2">
                <ThumbsDown size={18} className="text-red-600" />
                Reject Candidate Application
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rejection Reason (Internal)*</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium"
                >
                  <option value="Qualifications mismatch">Qualifications & Core Skill Mismatch</option>
                  <option value="Experience level insufficient">Insufficient Seniority / Experience</option>
                  <option value="Compensation misalignment">Compensation Expectation Misalignment</option>
                  <option value="Interview performance">Technical Interview Evaluation Below Bar</option>
                  <option value="Culture & communication fit">Communication / Culture Fit</option>
                  <option value="Position filled">Role Filled / Hiring Strategy Shift</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Team Note (Private)</label>
                <textarea
                  rows={2}
                  value={rejectInternalNote}
                  onChange={(e) => setRejectInternalNote(e.target.value)}
                  placeholder="Confidential notes for ATS records..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Custom Message to Candidate (Optional)</label>
                <textarea
                  rows={2}
                  value={rejectCandidateMsg}
                  onChange={(e) => setRejectCandidateMsg(e.target.value)}
                  placeholder="Leave empty for polite default template..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MOVE STAGE MODAL */}
      {showMoveStageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-black text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-blue-600" />
                Transition Pipeline Stage
              </h3>
              <button onClick={() => setShowMoveStageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMoveStage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Stage</label>
                <select
                  value={targetStageId}
                  onChange={(e) => setTargetStageId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900"
                >
                  {stages.map((stg: any, i: number) => (
                    <option key={stg.id} value={stg.id}>
                      Stage {i + 1}: {stg.name} ({stg.stageType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMoveStageModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Update Stage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
