"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  DollarSign,
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  ExternalLink,
  ShieldAlert,
  MessageSquare,
  Sparkles,
  Layers,
  Inbox,
  Lock,
} from "lucide-react";

export default function Candidate360Page() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<
    "applications" | "interviews" | "notes" | "assessments" | "offers" | "timeline" | "communication"
  >("applications");

  // Pagination states
  const [timelinePage, setTimelinePage] = useState(1);
  const [commPage, setCommPage] = useState(1);

  useEffect(() => {
    if (!candidateId) return;
    fetchCandidate360(timelinePage, commPage);
  }, [candidateId, timelinePage, commPage]);

  const fetchCandidate360 = async (tPage = 1, cPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/employer/candidates/${encodeURIComponent(candidateId)}/360?timelinePage=${tPage}&timelineLimit=10&commPage=${cPage}&commLimit=10`
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load candidate 360 profile");
      }
      setData(json);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading Candidate 360 Profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white border border-red-200 rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Unavailable</h2>
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          {error || "Candidate record could not be found or you do not have permission to view it."}
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const { candidate, applications, offers, timeline, communication, accessRole, isViewOnly } = data;
  const isInterviewer = accessRole === "INTERVIEWER";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Candidates
        </button>
        <div className="flex items-center gap-2">
          {isViewOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg">
              <Lock className="w-3 h-3" /> View Only Access ({accessRole})
            </span>
          )}
          <span className="text-xs text-slate-400">Opaque ID: {candidate.id}</span>
        </div>
      </div>

      {/* Candidate Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50/50 to-indigo-50/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
              {candidate.name ? candidate.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{candidate.name || "Unnamed Candidate"}</h1>
                {candidate.profileCompleteness > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> {candidate.profileCompleteness}% Profile
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-blue-600">{candidate.headline || "Applicant"}</p>

              {/* Contact & Meta Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                {candidate.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {candidate.email}
                  </span>
                )}
                {candidate.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {candidate.phone}
                  </span>
                )}
                {candidate.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {candidate.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {candidate.totalExperienceYears} yrs experience
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {candidate.resumeUrl && (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl hover:bg-blue-100 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download Resume
              </a>
            )}
            {candidate.linkedinUrl && (
              <a
                href={candidate.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-100 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Skills & Compensation Row */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">Key Skills:</span>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills && candidate.skills.length > 0 ? (
                candidate.skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No skills listed</span>
              )}
            </div>
          </div>

          <div className="md:text-right">
            <span className="text-xs font-bold text-slate-700 block mb-2">Compensation Overview:</span>
            {!isInterviewer ? (
              candidate.hideSalaryFromEmployers ? (
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile CTC: Confidential (Candidate Privacy)</span>
                </div>
              ) : (
                <div className="text-xs text-slate-600 space-x-3">
                  <span>Current: <strong>{candidate.currentCtc ? `₹${candidate.currentCtc} LPA` : "N/A"}</strong></span>
                  <span>Expected: <strong>{candidate.expectedCtc ? `₹${candidate.expectedCtc} LPA` : "N/A"}</strong></span>
                </div>
              )
            ) : (
              <span className="text-xs text-slate-400 italic">Redacted for Interviewer</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 overflow-x-auto pb-px">
          {[
            { id: "applications", label: `Applications (${applications.length})`, icon: Briefcase },
            {
              id: "interviews",
              label: `Interviews (${applications.reduce((acc: number, a: any) => acc + (a.interviews?.length || 0), 0)})`,
              icon: Calendar,
            },
            ...(!isInterviewer
              ? [
                  {
                    id: "notes",
                    label: `Notes (${applications.reduce((acc: number, a: any) => acc + (a.notes?.length || 0), 0)})`,
                    icon: MessageSquare,
                  },
                  {
                    id: "assessments",
                    label: `Assessments (${applications.reduce((acc: number, a: any) => acc + (a.assessments?.length || 0), 0)})`,
                    icon: Award,
                  },
                  { id: "offers", label: `Offers (${offers.length})`, icon: DollarSign },
                  { id: "communication", label: `Communications (${communication?.pagination?.total || 0})`, icon: Inbox },
                ]
              : []),
            { id: "timeline", label: `Timeline (${timeline?.pagination?.total || 0})`, icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab 1: Applications */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {applications.map((app: any) => (
            <div
              key={app.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{app.jobTitle}</h3>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold rounded-md">
                      {app.currentStage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {app.department || "General"} • {app.location || "Remote"} • {app.workMode} • Applied{" "}
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/employer/applications/${app.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
                  >
                    View Application <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Compensation for this application */}
              {!isInterviewer && (app.currentCtc || app.expectedCtc) && (
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs flex flex-wrap gap-4 text-slate-600">
                  {app.currentCtc && (
                    <span>
                      Application Current CTC: <strong>₹{app.currentCtc} LPA</strong>
                    </span>
                  )}
                  {app.expectedCtc && (
                    <span>
                      Application Expected CTC: <strong>₹{app.expectedCtc} LPA</strong>
                    </span>
                  )}
                  {app.noticePeriod && (
                    <span>
                      Notice Period: <strong>{app.noticePeriod}</strong>
                    </span>
                  )}
                </div>
              )}

              {app.coverNote && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  &ldquo;{app.coverNote}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Interviews */}
      {activeTab === "interviews" && (
        <div className="space-y-4">
          {applications.flatMap((a: any) => a.interviews).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
              No interviews scheduled for this candidate in this company.
            </div>
          ) : (
            applications.flatMap((app: any) =>
              app.interviews.map((inv: any) => (
                <div key={inv.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{inv.title || "Interview Session"}</h4>
                      <p className="text-xs text-slate-500">
                        {inv.roundName || "Round"} • {inv.format || "Video"} • Scheduled for{" "}
                        {new Date(inv.scheduledAt).toLocaleString()} ({inv.durationMinutes} mins)
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                        inv.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : inv.status === "CANCELLED"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  {inv.meetingUrl && (
                    <div className="text-xs text-slate-600">
                      Meeting Link:{" "}
                      <a href={inv.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {inv.meetingUrl}
                      </a>
                    </div>
                  )}

                  {/* Feedback Scorecards */}
                  {inv.feedback && inv.feedback.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Interview Feedback:</span>
                      {inv.feedback.map((fb: any) => (
                        <div key={fb.id} className="bg-slate-50 rounded-lg p-3 text-xs space-y-1 border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{fb.interviewerName}</span>
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                fb.recommendation === "STRONG_HIRE" || fb.recommendation === "HIRE"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {fb.recommendation} ({fb.rating}/5)
                            </span>
                          </div>
                          {fb.feedback && <p className="text-slate-600 mt-1">{fb.feedback}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      )}

      {/* Tab 3: Notes (Hidden from Interviewer) */}
      {!isInterviewer && activeTab === "notes" && (
        <div className="space-y-4">
          {applications.flatMap((a: any) => a.notes).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
              No recruiter notes recorded for this candidate.
            </div>
          ) : (
            applications.flatMap((app: any) =>
              app.notes.map((n: any) => (
                <div key={n.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{n.authorName || "Team Member"}</span>
                    <span className="text-[11px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap">{n.content}</p>
                </div>
              ))
            )
          )}
        </div>
      )}

      {/* Tab 4: Assessments (Hidden from Interviewer) */}
      {!isInterviewer && activeTab === "assessments" && (
        <div className="space-y-4">
          {applications.flatMap((a: any) => a.assessments).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
              No candidate assessments assigned.
            </div>
          ) : (
            applications.flatMap((app: any) =>
              app.assessments.map((ca: any) => (
                <div key={ca.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{ca.assessment?.title || "Skill Assessment"}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">({app.jobTitle})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Duration: {ca.assessment?.durationMinutes || 30} mins • Passing Mark: {ca.assessment?.passingScore || 70}% • Assigned {new Date(ca.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {ca.score !== null && (
                      <span className="text-xs font-black text-slate-800">
                        Score: {ca.score}%
                      </span>
                    )}
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                      ca.status === "COMPLETED"
                        ? ca.passed
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-rose-50 border-rose-200 text-rose-800"
                        : ca.status === "PENDING_REVIEW"
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}>
                      {ca.status === "COMPLETED" ? (ca.passed ? "Passed" : "Below Threshold") : ca.status}
                    </span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}

      {/* Tab 5: Offers (Read-Only consolidated view) */}
      {!isInterviewer && activeTab === "offers" && (
        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
              No offers extended to this candidate.
            </div>
          ) : (
            offers.map((offer: any) => (
              <div key={offer.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{offer.roleTitle}</h4>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-md">
                        {offer.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Application: {offer.jobTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">
                      ₹{offer.baseSalaryLpa} LPA {offer.variableLpa ? `+ ₹${offer.variableLpa} Var` : ""}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-lg p-3 text-xs text-slate-600 border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Start Date</span>
                    <span className="font-semibold">{offer.startDate ? new Date(offer.startDate).toLocaleDateString() : "TBD"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Expiry Date</span>
                    <span className="font-semibold">{offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString() : "TBD"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Created At</span>
                    <span className="font-semibold">{new Date(offer.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mode</span>
                    <span className="font-semibold">Strictly Read-Only</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 6: Activity Timeline (Paginated) */}
      {activeTab === "timeline" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">Application Events</h3>
            <span className="text-xs text-slate-400">Total {timeline?.pagination?.total || 0} Events</span>
          </div>

          <div className="divide-y divide-slate-100">
            {timeline?.events?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No timeline events recorded.</p>
            ) : (
              timeline.events.map((event: any) => (
                <div key={event.id} className="py-3 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{event.action}</span>
                      <span className="text-[11px] text-slate-400">{new Date(event.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      By {event.actorName || "System"} ({event.actorRole || "SYSTEM"})
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Timeline Pagination Controls */}
          {timeline?.pagination?.totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                disabled={timelinePage <= 1}
                onClick={() => setTimelinePage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-slate-500">
                Page {timelinePage} of {timeline.pagination.totalPages}
              </span>
              <button
                disabled={timelinePage >= timeline.pagination.totalPages}
                onClick={() => setTimelinePage((p) => p + 1)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Communication Log (Paginated) */}
      {!isInterviewer && activeTab === "communication" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">Email & Notification Log</h3>
            <span className="text-xs text-slate-400">Total {communication?.pagination?.total || 0} Messages</span>
          </div>

          <div className="divide-y divide-slate-100">
            {communication?.emails?.length === 0 && communication?.notifications?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No communication logs recorded for this company.</p>
            ) : (
              <>
                {communication.emails.map((email: any) => (
                  <div key={email.id} className="py-3 flex items-start gap-3">
                    <Mail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{email.subject || "Email Notification"}</span>
                        <span className="text-[11px] text-slate-400">{new Date(email.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Template: {email.template} • Status: <strong className="text-slate-700">{email.status}</strong>
                      </p>
                    </div>
                  </div>
                ))}
                {communication.notifications.map((notif: any) => (
                  <div key={notif.id} className="py-3 flex items-start gap-3">
                    <Inbox className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{notif.title}</span>
                        <span className="text-[11px] text-slate-400">{new Date(notif.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-600">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Comm Pagination Controls */}
          {communication?.pagination?.totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                disabled={commPage <= 1}
                onClick={() => setCommPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-slate-500">
                Page {commPage} of {communication.pagination.totalPages}
              </span>
              <button
                disabled={commPage >= communication.pagination.totalPages}
                onClick={() => setCommPage((p) => p + 1)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
