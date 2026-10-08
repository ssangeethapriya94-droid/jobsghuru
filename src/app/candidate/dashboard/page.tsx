"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  User,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  LogOut,
  Building,
  Video,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [candidate, setCandidate] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meRes, appsRes] = await Promise.all([
          fetch("/api/candidate/auth/me"),
          fetch("/api/candidate/applications"),
        ]);

        if (!meRes.ok) {
          router.push("/candidate/login");
          return;
        }

        const meData = await meRes.json();
        const appsData = await appsRes.json();

        setCandidate(meData.candidate);
        setApplications(appsData.applications || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/candidate/auth/logout", { method: "POST" });
      router.push("/candidate/login");
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading candidate portal...</p>
        </div>
      </div>
    );
  }

  const activeApps = applications.filter((a) => a.status !== "Not Selected" && a.status !== "Withdrawn");
  const interviewApps = applications.filter((a) => a.status === "Interview");
  const upcomingInterviews = applications
    .flatMap((a) => (a.interviews || []).map((inv: any) => ({ ...inv, companyName: a.companyName, jobTitle: a.jobTitle })))
    .filter((inv) => inv.status === "SCHEDULED" || inv.status === "CONFIRMED");

  const completeness = candidate?.profileCompleteness || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F8FC] via-[#EEF5FC]/50 to-white text-slate-900">
      {/* Candidate Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-xs">
        <div className="container-x h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-extrabold text-slate-900 group">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs group-hover:scale-105 transition">
                <Briefcase size={16} />
              </span>
              <span>Jobs<span className="text-blue-600">Guru</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-600">
              <Link
                href="/candidate/dashboard"
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700"
              >
                Dashboard
              </Link>
              <Link
                href="/candidate/applications"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                My Applications ({applications.length})
              </Link>
              <Link
                href="/candidate/saved-jobs"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Saved Jobs
              </Link>
              <Link
                href="/candidate/notifications"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Notifications
              </Link>
              <Link
                href="/candidate/profile"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Profile & Privacy
              </Link>
              <Link
                href="/jobs"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500"
              >
                Browse Jobs ↗
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/candidate/profile"
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 transition"
            >
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                {candidate?.name?.[0]?.toUpperCase() || "C"}
              </div>
              <span className="hidden sm:inline">{candidate?.name}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition"
              title="Sign Out"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container-x py-8 space-y-8">
        {/* Welcome Banner & Profile Completeness Gauge */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-md shadow-blue-950/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              <Sparkles size={13} className="text-blue-600" />
              Candidate Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {candidate?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Track your application pipeline stages and interactive interview invitations in real time.
            </p>
          </div>

          {/* Completeness Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 sm:p-5 rounded-2xl border border-blue-100 shrink-0 min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-700">Profile Completeness</span>
              <span className="text-blue-700 font-extrabold">{completeness}%</span>
            </div>
            <div className="w-full h-2.5 bg-blue-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {completeness >= 80 ? "✨ Profile looks strong!" : "Complete profile to boost visibility"}
              </span>
              <Link
                href="/candidate/profile"
                className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Edit Profile →
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Applied</span>
              <FileText size={18} className="text-blue-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{applications.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Across verified employers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">In Pipeline</span>
              <TrendingUp size={18} className="text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{activeApps.length}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Active review stages</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Interviews</span>
              <Video size={18} className="text-indigo-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{interviewApps.length}</p>
            <p className="text-[11px] text-indigo-600 font-semibold mt-1">Scheduled or completed</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Privacy Status</span>
              <ShieldCheck size={18} className="text-purple-600" />
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {candidate?.profile?.searchableByEmployers ? "Publicly Searchable" : "Private (Confidential)"}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Configured in settings</p>
          </div>
        </div>

        {/* UPCOMING INTERVIEWS SECTION */}
        {upcomingInterviews.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Upcoming Interviews</h2>
                  <p className="text-xs text-slate-500">Scheduled rounds requiring your attendance</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {upcomingInterviews.map((inv, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100"
                >
                  <div className="space-y-1">
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider bg-blue-200/80 text-blue-800 px-2 py-0.5 rounded">
                      {inv.interviewType} ROUND
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{inv.title}</h4>
                    <p className="text-xs text-slate-600">
                      {inv.companyName} • {inv.jobTitle}
                    </p>
                    <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 mt-1">
                      <Clock size={13} />
                      {new Date(inv.scheduledAt).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ({inv.durationMinutes} mins)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {inv.secureLink && (
                      <Link
                        href={inv.secureLink}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <Video size={14} />
                        <span>Join / Confirm Room</span>
                      </Link>
                    )}
                    {inv.meetingLink && !inv.secureLink && (
                      <a
                        href={inv.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <ExternalLink size={14} />
                        <span>Meeting Link</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECENT APPLICATIONS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Recent Applications</h2>
              <p className="text-xs text-slate-500">Real-time status updates directly from employer hiring teams</p>
            </div>
            <Link
              href="/candidate/applications"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View All Applications</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
              <Briefcase size={36} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No applications yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Explore thousands of verified job postings and apply with one click.
              </p>
              <Link
                href="/jobs"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
              >
                <span>Browse Active Jobs</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {app.jobTitle}
                      </h4>
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          app.status === "Interview"
                            ? "bg-purple-100 text-purple-800"
                            : app.status === "Offer"
                            ? "bg-emerald-100 text-emerald-800"
                            : app.status === "Shortlisted"
                            ? "bg-blue-100 text-blue-800"
                            : app.status === "Not Selected"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{app.companyName}</span>
                      <span>•</span>
                      <span>{app.location} ({app.workMode})</span>
                      <span>•</span>
                      <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <Link
                    href={`/candidate/applications/${app.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-3.5 py-2 rounded-xl border border-slate-200/80 transition shrink-0"
                  >
                    <span>View Status</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
