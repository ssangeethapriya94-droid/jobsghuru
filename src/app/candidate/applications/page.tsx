"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  Clock,
  Building,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from "lucide-react";

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch("/api/candidate/applications");
        if (!res.ok) {
          router.push("/candidate/login");
          return;
        }
        const data = await res.json();
        setApplications(data.applications || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [router]);

  const filteredApps = applications.filter((app) => {
    const matchesFilter =
      selectedFilter === "ALL" ? true : app.status.toUpperCase() === selectedFilter;
    const matchesSearch =
      searchQuery === ""
        ? true
        : app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-slate-900 pb-16">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/candidate/dashboard"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/jobs"
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg shadow-xs transition"
            >
              Explore Jobs
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Job Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review status updates, stage progressions, and interview schedules for all your applications.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role or company..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-bold">
            {["ALL", "APPLIED", "IN REVIEW", "SHORTLISTED", "INTERVIEW", "OFFER", "NOT SELECTED"].map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    selectedFilter === filter
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter}
                </button>
              )
            )}
          </div>
        </div>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
            <FileText size={40} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No applications match your filter</h3>
            <p className="text-xs text-slate-500 mt-1">Try switching tabs or clear your search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-md transition group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {app.jobTitle}
                      </h3>
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

                    <p className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{app.companyName}</span>
                      <span>•</span>
                      <span>{app.location} ({app.workMode})</span>
                      <span>•</span>
                      <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/candidate/applications/${app.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <span>Application Timeline & Details</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* If there are interviews attached */}
                {app.interviews && app.interviews.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg">
                      <Calendar size={13} />
                      <span>
                        Interview: {app.interviews[0].title} ({new Date(app.interviews[0].scheduledAt).toLocaleDateString()})
                      </span>
                    </div>
                    {app.interviews[0].secureLink && (
                      <Link
                        href={app.interviews[0].secureLink}
                        className="text-blue-600 hover:underline font-bold text-xs"
                      >
                        Open Interview Page →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
