"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  ExternalLink,
  X,
  SlidersHorizontal,
  Compass,
  Users,
  Building2,
  Briefcase,
  Flag,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface SearchResultPage {
  title: string;
  href: string;
  category: string;
}

interface SearchResultUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface SearchResultCompany {
  id: string;
  name: string;
  industry: string;
  location: string;
  verified: boolean;
}

interface SearchResultJob {
  id: string;
  title: string;
  department: string;
  status: string;
  company: { name: string };
}

interface SearchResultReport {
  id: string;
  reporterEmail: string;
  targetTitle: string | null;
  reason: string;
  status: string;
}

interface SearchResults {
  pages: SearchResultPage[];
  users: SearchResultUser[];
  companies: SearchResultCompany[];
  jobs: SearchResultJob[];
  reports: SearchResultReport[];
}

export default function AdminHeader({
  adminName,
  adminEmail,
  adminRole,
  onOpenMobile,
  isDesktopCollapsed,
  onToggleDesktopCollapse,
}: {
  adminName: string;
  adminEmail: string;
  adminRole: string;
  onOpenMobile: () => void;
  isDesktopCollapsed?: boolean;
  onToggleDesktopCollapse?: () => void;
}) {
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New Company Verification Request",
      message: "TechCorp Alpha 360 submitted corporate KYC documents for verification.",
      time: "10 mins ago",
      type: "VERIFICATION",
      read: false,
      link: "/admin/verifications",
    },
    {
      id: "2",
      title: "Safety Incident Escalation",
      message: "User reported suspicious ghost job listing #JOB-8842.",
      time: "25 mins ago",
      type: "SAFETY",
      read: false,
      link: "/admin/reports",
    },
    {
      id: "3",
      title: "AI Token Threshold Notice",
      message: "Daily AI generation requests exceeded 25k tokens.",
      time: "2 hours ago",
      type: "AI",
      read: false,
      link: "/admin/ai/usage",
    },
    {
      id: "4",
      title: "System Telemetry Health Check",
      message: "PostgreSQL database & Redis sync latency normal (12ms).",
      time: "4 hours ago",
      type: "SYSTEM",
      read: true,
      link: "/admin/dashboard",
    },
  ]);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (/ or Ctrl+K / Cmd+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced Live Search
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      setIsDropdownOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data: SearchResults = await res.json();
          setSearchResults(data);
          setIsDropdownOpen(true);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click Outside to Dismiss Search & Notification Dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
      setIsLoggingOut(false);
    }
  };

  const handleNavigate = (url: string) => {
    setIsDropdownOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery("");
    router.push(url);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // 1. If we have matching pages, take the user directly to the top matched page
    if (searchResults && searchResults.pages.length > 0) {
      handleNavigate(searchResults.pages[0].href);
      return;
    }

    // 2. Intelligent direct routing based on common search keywords
    if (query.includes("report") || query.includes("abuse") || query.includes("flag")) {
      handleNavigate(`/admin/reports?q=${encodeURIComponent(query)}`);
      return;
    }
    if (query.includes("verif") || query.includes("kyc")) {
      handleNavigate(`/admin/verifications?q=${encodeURIComponent(query)}`);
      return;
    }
    if (query.includes("job") || query.includes("listing")) {
      handleNavigate(`/admin/jobs?q=${encodeURIComponent(query)}`);
      return;
    }
    if (query.includes("compan") || query.includes("employer")) {
      handleNavigate(`/admin/companies?q=${encodeURIComponent(query)}`);
      return;
    }
    if (query.includes("candidate") || query.includes("applicant")) {
      handleNavigate(`/admin/candidates?q=${encodeURIComponent(query)}`);
      return;
    }
    if (query.includes("setting") || query.includes("config")) {
      handleNavigate(`/admin/settings`);
      return;
    }
    if (query.includes("audit") || query.includes("log")) {
      handleNavigate(`/admin/audit-logs`);
      return;
    }
    if (query.includes("ai") || query.includes("token")) {
      handleNavigate(`/admin/ai/usage`);
      return;
    }

    // 3. Fallback to Users Directory with filter
    handleNavigate(`/admin/users?q=${encodeURIComponent(query)}`);
  };

  const totalResultsCount = searchResults
    ? searchResults.pages.length +
      searchResults.users.length +
      searchResults.companies.length +
      searchResults.jobs.length +
      searchResults.reports.length
    : 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 sm:px-6 lg:px-8 backdrop-blur-xl transition-all shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)]">
      {/* Left: Mobile Sidebar Trigger & Live Global Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobile}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden transition active:scale-95"
          aria-label="Open sidebar menu"
        >
          <Menu size={18} />
        </button>

        {/* Desktop Global Search Form with Interactive Dropdown Anchor */}
        <div ref={searchContainerRef} className="relative w-full max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative group">
            {isSearching ? (
              <Loader2
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 animate-spin"
              />
            ) : (
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
              />
            )}
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onFocus={() => {
                if (searchResults && totalResultsCount > 0) setIsDropdownOpen(true);
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, companies, jobs, reports..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-12 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100/70 transition shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsDropdownOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            ) : (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs">
                /
              </kbd>
            )}
          </form>

          {/* Interactive Live Search Results Dropdown Palette */}
          {isDropdownOpen && searchResults && (
            <div className="absolute top-11 left-0 right-0 max-h-[75vh] overflow-y-auto rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              {totalResultsCount === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <Search size={22} className="mx-auto mb-2 text-slate-300" />
                  No matching records or modules found for &ldquo;<span className="font-semibold text-slate-600">{searchQuery}</span>&rdquo;
                </div>
              ) : (
                <div className="space-y-3 p-1">
                  {/* Category 1: Navigation & Admin Modules */}
                  {searchResults.pages.length > 0 && (
                    <div>
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Compass size={12} className="text-blue-500" />
                        <span>Platform Modules & Navigation</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.pages.map((p) => (
                          <button
                            key={p.href}
                            type="button"
                            onClick={() => handleNavigate(p.href)}
                            className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700 transition group"
                          >
                            <span className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
                              <span>{p.title}</span>
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-600">
                              {p.category} →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 2: User Reports & Abuse Queue */}
                  {searchResults.reports.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Flag size={12} className="text-rose-500" />
                        <span>Abuse & Safety Reports</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.reports.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleNavigate(`/admin/reports?q=${encodeURIComponent(r.targetTitle || r.reporterEmail)}`)}
                            className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs hover:bg-rose-50/70 transition"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="block font-bold text-slate-900 truncate">
                                {r.targetTitle || r.reason}
                              </span>
                              <span className="block text-[10px] text-slate-500 truncate font-mono">
                                Reporter: {r.reporterEmail}
                              </span>
                            </div>
                            <span className="shrink-0 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-[10px] font-extrabold">
                              {r.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 3: Companies & Employers */}
                  {searchResults.companies.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Building2 size={12} className="text-emerald-500" />
                        <span>Companies</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.companies.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleNavigate(`/admin/companies?q=${encodeURIComponent(c.name)}`)}
                            className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs hover:bg-emerald-50/70 transition"
                          >
                            <div>
                              <span className="block font-bold text-slate-900">{c.name}</span>
                              <span className="block text-[10px] text-slate-500">
                                {c.industry} • {c.location}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600">
                              {c.verified ? "Verified ✓" : "Pending KYC"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 4: Jobs */}
                  {searchResults.jobs.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Briefcase size={12} className="text-sky-500" />
                        <span>Job Postings</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.jobs.map((j) => (
                          <button
                            key={j.id}
                            type="button"
                            onClick={() => handleNavigate(`/admin/jobs?q=${encodeURIComponent(j.title)}`)}
                            className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs hover:bg-sky-50/70 transition"
                          >
                            <div>
                              <span className="block font-bold text-slate-900">{j.title}</span>
                              <span className="block text-[10px] text-slate-500">
                                {j.company.name} • {j.department}
                              </span>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              {j.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 5: Users */}
                  {searchResults.users.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Users size={12} className="text-purple-500" />
                        <span>Users & Candidates</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {searchResults.users.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleNavigate(`/admin/users?q=${encodeURIComponent(u.email)}`)}
                            className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs hover:bg-purple-50/70 transition"
                          >
                            <div>
                              <span className="block font-bold text-slate-900">{u.name}</span>
                              <span className="block text-[10px] text-slate-500 font-mono">{u.email}</span>
                            </div>
                            <span className="rounded-full bg-purple-50 text-purple-700 px-2 py-0.5 text-[10px] font-bold">
                              {u.role.replace(/_/g, " ")}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Search Toggle Icon */}
        <button
          type="button"
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden transition active:scale-95"
          aria-label="Search"
        >
          <Search size={16} />
        </button>
      </div>

      {/* Mobile Search Overlay with Live Dropdown */}
      {isMobileSearchOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white/95 border-b border-slate-200 p-3 shadow-2xl backdrop-blur-xl md:hidden z-50 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            {isSearching ? (
              <Loader2 size={16} className="absolute left-3.5 text-blue-600 animate-spin" />
            ) : (
              <Search size={16} className="absolute left-3.5 text-slate-400" />
            )}
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, companies, jobs, reports..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchOpen(false);
                setIsDropdownOpen(false);
              }}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </form>

          {/* Mobile search list */}
          {searchResults && totalResultsCount > 0 && (
            <div className="mt-3 max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
              {searchResults.pages.map((p) => (
                <button
                  key={p.href}
                  type="button"
                  onClick={() => handleNavigate(p.href)}
                  className="w-full py-2.5 px-1 text-left text-xs font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>{p.title}</span>
                  <span className="text-[10px] text-blue-600 font-semibold">{p.category} →</span>
                </button>
              ))}
              {searchResults.reports.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleNavigate(`/admin/reports?q=${encodeURIComponent(r.targetTitle || r.reporterEmail)}`)}
                  className="w-full py-2 px-1 text-left text-xs"
                >
                  <span className="block font-bold text-slate-900 truncate">{r.targetTitle || r.reason}</span>
                  <span className="text-[10px] text-slate-500">{r.reporterEmail}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Right: Operational Health, Quick Links & Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* System Health Badge */}
        <div className="hidden lg:flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-[11px] font-bold text-emerald-800 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>System Healthy</span>
        </div>

        {/* Live Site Quick Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition"
        >
          <span>Live Site</span>
          <ExternalLink size={13} />
        </a>

        {/* Notifications Button & Dropdown */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition active:scale-95 shadow-2xs relative"
            aria-label="View notifications"
          >
            <Bell size={16} />
            {notifications.some((n) => !n.read) && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>

          {/* Notifications Popover Drawer */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-slate-200/90 bg-white p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-2">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-blue-600" />
                  <span className="text-xs font-extrabold text-slate-900">Notifications</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                  }
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  Mark all as read
                </button>
              </div>

              <div className="mt-2 max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                      );
                      setIsNotificationsOpen(false);
                      router.push(n.link);
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl transition-colors flex items-start gap-2.5 ${
                      n.read ? "hover:bg-slate-50" : "bg-blue-50/40 hover:bg-blue-50/70"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                        n.read ? "bg-slate-300" : "bg-blue-600 animate-ping"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 sm:gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-1 sm:p-1.5 sm:pr-2.5 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-2xs active:scale-98"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-blue-600/25">
              {adminName ? adminName.charAt(0) : "A"}
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                {adminName || "Administrator"}
              </span>
              <span className="block text-[10px] font-bold text-blue-600 truncate max-w-[120px]">
                {adminRole.replace(/_/g, " ")}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-slate-100 p-3 bg-slate-50/50 rounded-2xl mb-1">
                <p className="text-xs font-extrabold text-slate-900 truncate">{adminName}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">{adminEmail}</p>
                <span className="mt-2 inline-block rounded-md bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                  {adminRole.replace(/_/g, " ")}
                </span>
              </div>

              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push("/admin/settings");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition text-left"
                >
                  <SlidersHorizontal size={14} className="text-slate-500" />
                  <span>Platform Settings</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                >
                  <LogOut size={14} />
                  <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
