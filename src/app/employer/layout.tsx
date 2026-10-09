"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Layers,
  Calendar,
  Sparkles,
  Building2,
  Settings,
  CreditCard,
  LogOut,
  Plus,
  Search,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Award,
  Bell,
  Clock,
  Menu,
  X,
  FileCheck,
  TrendingUp,
  ArrowRight,
  GitBranch,
  FileCode2,
  Activity,
} from "lucide-react";
import CompanySwitcher from "@/components/employer/CompanySwitcher";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(pathname !== "/employer/login");

  useEffect(() => {
    if (pathname === "/employer/login") {
      setCheckingAuth(false);
      return;
    }

    fetch("/api/employer/dashboard/stats")
      .then((res) => {
        if (res.status === 401) {
          router.push("/employer/login");
          return null;
        }
        return res.json();
      })
      .then((d) => {
        if (d && d.success) {
          setData(d);
        } else if (d && !d.success) {
          router.push("/employer/login");
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, [pathname, router]);

  // If on employer login page, render children directly without the dashboard sidebar
  if (pathname === "/employer/login") {
    return <>{children}</>;
  }

  // Loading screen while verifying company session
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-sm">
          <div className="h-10 w-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-sm font-bold text-slate-800">Verifying Company Credentials</div>
          <div className="text-xs text-slate-500 mt-1">Authenticating with your company workspace...</div>
        </div>
      </div>
    );
  }

  // Access Restricted: prompt to sign in with company account
  if (!data || !data.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Building2 size={28} />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">Company Sign In Required</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Please sign in with your official company credentials to access your organization&apos;s recruitment workspace.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/employer/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              Sign In to Company Portal <ArrowRight size={14} />
            </Link>
            <Link
              href="/employers"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition py-1"
            >
              Back to Employer Platform
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navSections = [
    {
      group: "MAIN",
      items: [
        { label: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
        { label: "Jobs", href: "/employer/jobs", icon: Briefcase },
        { label: "Candidates", href: "/employer/candidates", icon: Search },
        { label: "Applications", href: "/employer/applications", icon: Layers },
        { label: "Hiring Pipelines", href: "/employer/pipelines", icon: GitBranch },
        { label: "Interviews", href: "/employer/interviews", icon: Calendar },
        { label: "Assessments", href: "/employer/assessments", icon: FileCode2 },
        { label: "Offers", href: "/employer/offers", icon: FileCheck },
      ],
    },
    {
      group: "AI RECRUITING",
      items: [
        { label: "Recruiter AI", href: "/employer/ai", icon: Sparkles, badge: "AI Copilot" },
        { label: "Hiring Analytics", href: "/employer/analytics", icon: TrendingUp },
      ],
    },
    {
      group: "ORGANIZATION",
      items: [
        { label: "Company Profile", href: "/employer/company", icon: Building2 },
        { label: "Team & Roles", href: "/employer/team", icon: Users },
        { label: "Employer Branding", href: "/employer/branding", icon: Award },
        { label: "Audit Logs", href: "/employer/audit", icon: Activity },
        { label: "Settings", href: "/employer/settings", icon: Settings },
      ],
    },
    {
      group: "BUSINESS & BILLING",
      items: [
        { label: "Plans & Usage", href: "/employer/plans", icon: ShieldCheck },
        { label: "Billing & Invoices", href: "/employer/billing", icon: CreditCard },
      ],
    },
  ];

  const handleLogout = async () => {
    await fetch("/api/employer/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/employer/login");
  };

  const company = data.company;
  const usage = data.usage || {
    planName: "Employer Plan",
    jobsUsed: 0,
    jobsLimit: 5,
    searchCreditsRemaining: 50,
    searchCreditsTotal: 50,
  };
  const recruiter = data.employerUser;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/90 bg-white backdrop-blur-xl transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 lg:w-64 xl:w-72 h-screen shrink-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/employer/dashboard" className="flex items-center gap-3 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600 text-white shadow-md shadow-blue-600/25 transition-transform group-hover:scale-105">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13C6 7.5 18 7.5 21 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="5.5" y="12" width="2.5" height="7.5" rx="1.2" fill="white" />
                <rect x="10.75" y="8" width="2.5" height="11.5" rx="1.2" fill="white" />
                <rect x="16" y="12" width="2.5" height="7.5" rx="1.2" fill="white" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="font-display text-base font-extrabold text-slate-900 tracking-tight leading-tight">JobsGhuru</span>
              <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 leading-none mt-0.5">
                <Sparkles size={10} className="text-blue-600 fill-blue-600" />
                HIRING OS
              </span>
            </div>
          </Link>

          {/* Close mobile sidebar */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Active Company Card & Switcher */}
        <div className="mx-3.5 mt-3.5 mb-1.5">
          <CompanySwitcher
            currentCompany={company}
            availableCompanies={data.availableCompanies || []}
          />
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-5 no-scrollbar">
          {navSections.map((sec) => (
            <div key={sec.group}>
              <div className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                {sec.group}
              </div>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/employer/dashboard"
                      ? pathname === "/employer/dashboard"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-0.5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={17} className={isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600 transition-colors"} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                          isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Recruiter User Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0">
              {recruiter.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 truncate">{recruiter.name}</div>
              <div className="text-[10px] font-semibold text-slate-500 truncate">{recruiter.role.replace("_", " ")}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white shadow-2xs px-4 sm:px-6 md:px-8">
          {/* Mobile Trigger & Quick Search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              aria-label="Open navigation sidebar"
            >
              <Menu size={19} />
            </button>

            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 text-xs text-slate-400 w-64 md:w-80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:bg-white transition-all">
              <Search size={15} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates, job titles, skills..."
                className="bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none w-full text-xs font-semibold"
              />
              <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">⌘K</span>
            </div>
          </div>

          {/* Right Actions & Usage Meter */}
          <div className="flex items-center gap-3">
            {/* Live Usage Badges */}
            <div className="hidden md:flex items-center gap-2.5 text-xs">
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Jobs Limit</span>
                <span className="font-extrabold text-blue-700">
                  {usage.jobsUsed} / {usage.jobsLimit}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Credits</span>
                <span className="font-extrabold text-slate-900">
                  {usage.searchCreditsRemaining} Left
                </span>
              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                {usage.planName.split(" ")[0]} Plan
              </span>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex items-center gap-2">
              <Link
                href="/employer/candidates"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
              >
                <Search size={14} className="text-slate-400" />
                Find Talent
              </Link>

              <Link
                href="/employer/jobs/new"
                className="rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 active:scale-95"
              >
                <Plus size={15} />
                <span>Post Job</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 container-x w-full py-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
