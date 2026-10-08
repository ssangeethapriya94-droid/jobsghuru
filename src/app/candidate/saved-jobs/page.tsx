"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Building,
  MapPin,
  Briefcase,
  Trash2,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function CandidateSavedJobsPage() {
  const router = useRouter();
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/candidate/saved-jobs");
      if (res.status === 401) {
        router.push("/candidate/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSavedItems(data.savedJobs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId: string) => {
    try {
      const res = await fetch(`/api/candidate/saved-jobs/${jobId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSavedItems((prev) => prev.filter((item) => item.job.id !== jobId));
      }
    } catch (e) {
      alert("Failed to remove saved job.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-10 w-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading saved jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-slate-900 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/candidate/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>

          <Link
            href="/jobs"
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg shadow-xs transition"
          >
            Explore All Jobs
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 mb-2">
            <Bookmark size={13} className="text-blue-600" />
            Bookmarked Opportunities
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Saved Jobs ({savedItems.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Keep track of open roles you wish to apply for later.
          </p>
        </div>

        {savedItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <Bookmark size={40} className="text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No saved jobs yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Browse open positions and click the bookmark icon on any job card to save it here.
            </p>
            <Link
              href="/jobs"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              Browse Jobs Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                        {item.job.company?.name || "Company"}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                        {item.job.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleRemove(item.job.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Remove from saved"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {item.job.location} ({item.job.workMode})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={13} /> {item.job.department}
                    </span>
                  </p>

                  {(item.job.salaryMinLpa || item.job.salaryMaxLpa) && (
                    <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                      ₹{item.job.salaryMinLpa} - ₹{item.job.salaryMaxLpa} LPA
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Saved {new Date(item.savedAt).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/jobs/${item.job.id}`}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center gap-1"
                  >
                    <span>View & Apply</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
