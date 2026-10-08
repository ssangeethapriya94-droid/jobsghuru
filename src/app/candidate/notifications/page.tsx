"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Briefcase,
  Calendar,
  FileText,
  Award,
  ChevronRight,
  ArrowLeft,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  APPLICATION_STATUS: <Briefcase className="h-4 w-4" />,
  INTERVIEW_SCHEDULED: <Calendar className="h-4 w-4" />,
  OFFER_RECEIVED: <Award className="h-4 w-4" />,
  ASSESSMENT_ASSIGNED: <FileText className="h-4 w-4" />,
  GENERAL: <Info className="h-4 w-4" />,
};

const COLOR_MAP: Record<string, string> = {
  APPLICATION_STATUS: "bg-blue-100 text-blue-600",
  INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-600",
  OFFER_RECEIVED: "bg-green-100 text-green-600",
  ASSESSMENT_ASSIGNED: "bg-amber-100 text-amber-600",
  GENERAL: "bg-slate-100 text-slate-600",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CandidateNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.status === 401) {
        router.push("/candidate/login");
        return;
      }
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const filtered = notifications.filter((n) =>
    filter === "UNREAD" ? !n.read : true
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-[3px] border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading notifications…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {(["ALL", "UNREAD"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                filter === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"
              }`}
            >
              {tab === "ALL" ? `All (${notifications.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notification list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {filter === "UNREAD" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-sm text-slate-500">
              {filter === "UNREAD"
                ? "You're all caught up!"
                : "Notifications about your applications, interviews and offers will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => {
              const colorClass = COLOR_MAP[notif.type] || COLOR_MAP.GENERAL;
              const icon = ICON_MAP[notif.type] || ICON_MAP.GENERAL;
              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl border transition-all hover:shadow-sm ${
                    !notif.read
                      ? "border-blue-200 shadow-sm"
                      : "border-slate-200"
                  }`}
                >
                  <div className="p-4 flex items-start gap-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm leading-snug ${
                            !notif.read
                              ? "font-semibold text-slate-900"
                              : "font-medium text-slate-700"
                          }`}
                        >
                          {notif.title || notif.message}
                        </p>
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      {notif.title && notif.message && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Quick Links
          </p>
          <div className="space-y-1">
            {[
              { label: "My Applications", href: "/candidate/applications", icon: <Briefcase className="h-4 w-4" /> },
              { label: "My Interviews", href: "/candidate/interviews", icon: <Calendar className="h-4 w-4" /> },
              { label: "My Offers", href: "/candidate/offers", icon: <Award className="h-4 w-4" /> },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
                  {link.icon}
                </span>
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                  {link.label}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 ml-auto group-hover:text-blue-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
