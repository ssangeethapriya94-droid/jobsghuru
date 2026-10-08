"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  ShieldCheck,
  Video,
  AlertCircle,
  Briefcase,
} from "lucide-react";

const STAGES = ["Applied", "In Review", "Shortlisted", "Interview", "Offer", "Hired"];

export default function CandidateApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/candidate/applications/${params.id}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/candidate/login");
            return;
          }
          setError("Application not found or unauthorized.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setApp(data.application);
      } catch {
        setError("Failed to load application details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen bg-[#F4F8FC] p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center border border-slate-200">
          <AlertCircle size={36} className="text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Application Unavailable</h2>
          <p className="text-xs text-slate-500 mt-1">{error || "Could not retrieve application."}</p>
          <Link
            href="/candidate/applications"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            ← Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGES.indexOf(app.status);
  const isRejected = app.status === "Not Selected";

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-slate-900 pb-16">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/candidate/applications"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            <span>Back to All Applications</span>
          </Link>

          <span className="text-xs font-semibold text-slate-400">
            ID: {app.id.substring(0, 12)}...
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-md shadow-blue-950/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                {app.companyName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {app.jobTitle}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                <MapPin size={13} />
                <span>{app.location} ({app.workMode})</span>
                <span>•</span>
                <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span
                className={`text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full ${
                  app.status === "Interview"
                    ? "bg-purple-100 text-purple-800"
                    : app.status === "Offer"
                    ? "bg-emerald-100 text-emerald-800"
                    : app.status === "Shortlisted"
                    ? "bg-blue-100 text-blue-800"
                    : app.status === "Not Selected"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                Status: {app.status}
              </span>

              {app.status !== "Not Selected" && app.status !== "Withdrawn" && (
                <button
                  onClick={async () => {
                    if (!confirm("Are you sure you want to withdraw this application?")) return;
                    try {
                      const res = await fetch(`/api/candidate/applications/${app.id}`, {
                        method: "DELETE",
                      });
                      if (res.ok) {
                        setApp({ ...app, status: "Withdrawn" });
                      } else {
                        const errData = await res.json();
                        alert(errData.error || "Failed to withdraw application");
                      }
                    } catch {
                      alert("An error occurred while withdrawing.");
                    }
                  }}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-full transition border border-rose-200"
                >
                  Withdraw
                </button>
              )}
            </div>
          </div>

          {/* Pipeline Stage Visualizer */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Application Progression
            </h3>

            {isRejected ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <p className="font-bold text-slate-900">Application Closed</p>
                <p className="text-slate-500 mt-1">
                  {app.statusNotes || "Thank you for your interest in this role. The hiring team has decided to proceed with other candidates."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {STAGES.map((stage, idx) => {
                  const isCompleted = currentStageIndex >= idx;
                  const isCurrent = app.status === stage;

                  return (
                    <div
                      key={stage}
                      className={`p-3 rounded-xl border text-center transition ${
                        isCurrent
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs"
                          : isCompleted
                          ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {isCompleted ? (
                          <CheckCircle2 size={15} className={isCurrent ? "text-blue-600" : "text-emerald-600"} />
                        ) : (
                          <Clock size={15} className="text-slate-300" />
                        )}
                      </div>
                      <span className="text-[11px] block">{stage}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* INTERVIEW SCHEDULE CARD (If any) */}
        {app.interviews && app.interviews.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-xs">
            <h2 className="text-base font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
              <Video size={18} className="text-indigo-600" />
              <span>Scheduled Interviews</span>
            </h2>

            <div className="space-y-3">
              {app.interviews.map((inv: any) => (
                <div
                  key={inv.id}
                  className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded">
                      {inv.interviewType} ROUND
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{inv.title}</h4>
                    <p className="text-xs text-indigo-800 font-semibold flex items-center gap-1.5 mt-1">
                      <Calendar size={13} />
                      <span>
                        {new Date(inv.scheduledAt).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        ({inv.durationMinutes} mins)
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {inv.secureLink && (
                      <Link
                        href={inv.secureLink}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <Video size={14} />
                        <span>Open Interview Room</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBMITTED PROFILE DATA */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900 tracking-tight">Application Packet Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                Current Role & Company
              </span>
              <span className="font-bold text-slate-800">
                {app.currentRole || "Not specified"} {app.currentCompany ? `at ${app.currentCompany}` : ""}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                Experience & Notice Period
              </span>
              <span className="font-bold text-slate-800">
                {app.experienceYears} Years • Notice: {app.noticePeriod || "30 Days"}
              </span>
            </div>
          </div>

          {app.resumeFileName && (
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-blue-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{app.resumeFileName}</span>
                  <span className="text-[10px] text-slate-400">Attached Candidate Resume</span>
                </div>
              </div>
              {app.resumeUrl && (
                <a
                  href={app.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Download / View</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
