"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, X, Sparkles, User, LayoutDashboard, Briefcase, LogOut, ChevronDown, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import EmployerHeader from "@/components/employer/EmployerHeader";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [candidateUser, setCandidateUser] = useState<{
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchCandidateSession() {
      try {
        const res = await fetch("/api/candidate/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.candidate) {
            setCandidateUser(data.candidate);
          }
        }
      } catch (err) {
        // Unauthenticated
      }
    }
    fetchCandidateSession();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/candidate/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setCandidateUser(null);
    setProfileDropdownOpen(false);
    router.push("/login");
    router.refresh();
  };

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/employer/")) {
    return null;
  }

  if (pathname?.startsWith("/employers")) {
    return <EmployerHeader />;
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Jobs", href: "/jobs", active: pathname.startsWith("/jobs") },
    { label: "Companies", href: "/companies", active: pathname.startsWith("/companies") },
    { label: "Career AI", href: "/career-ai", active: pathname.startsWith("/career-ai"), badge: "New" },
    { label: "Career Tools", href: "/career", active: pathname.startsWith("/career") },
    { label: "Salary Insights", href: "/salary", active: pathname.startsWith("/salary") },
  ];

  // Calculate First Letter of Candidate Name or Email
  const firstLetter = candidateUser
    ? (candidateUser.name || candidateUser.email || "U").trim().charAt(0).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="container-x h-20 flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand Logo - Prominent & Larger */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="group flex items-center gap-3 font-display transition shrink-0"
          title="JobsGhuru - Return to Home"
          aria-label="JobsGhuru Homepage"
        >
          <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md transition duration-200 group-hover:bg-blue-700 group-hover:scale-105">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M3 13C6 7.5 18 7.5 21 13"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <rect x="5.5" y="12" width="2.5" height="7.5" rx="1.2" fill="white" />
              <rect x="10.75" y="8" width="2.5" height="11.5" rx="1.2" fill="white" />
              <rect x="16" y="12" width="2.5" height="7.5" rx="1.2" fill="white" />
            </svg>
          </span>
          <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Jobs<span className="text-blue-600">Ghuru</span>
          </span>
        </Link>

        {/* Desktop Nav - Clear, larger font size */}
        <nav aria-label="Main" className="hidden lg:flex items-center gap-6 xl:gap-8 text-base font-bold text-slate-700">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex items-center gap-1.5 py-1.5 transition ${
                item.active
                  ? "text-blue-600 font-extrabold"
                  : "hover:text-blue-600"
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-extrabold text-white leading-none shadow-xs">
                  {item.badge}
                </span>
              )}
              {item.active && (
                <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-blue-600" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons / Profile Avatar */}
        <div className="hidden lg:flex items-center gap-3.5 xl:gap-4 shrink-0">
          <Link
            href="/candidate/notifications"
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {candidateUser && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </Link>

          <Link
            href="/employers"
            className={`px-3 py-2 text-sm font-bold transition rounded-xl hover:bg-slate-100 ${
              pathname.startsWith("/employers")
                ? "text-blue-600 font-extrabold bg-blue-50"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            For Employers
          </Link>

          {candidateUser ? (
            /* Logged In User Profile Avatar with First Letter */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 pr-3 hover:bg-slate-100 transition shadow-xs group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-base shadow-xs group-hover:scale-105 transition">
                  {firstLetter}
                </div>
                <div className="text-left text-xs leading-tight">
                  <div className="font-extrabold text-slate-900 truncate max-w-[110px]">
                    {candidateUser.name || candidateUser.email.split("@")[0]}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Candidate</span>
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 border-b border-slate-100 text-xs">
                    <div className="font-extrabold text-slate-900">{candidateUser.name}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{candidateUser.email}</div>
                  </div>

                  <div className="py-1.5 space-y-1 text-xs font-semibold text-slate-700">
                    <Link
                      href="/candidate/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <LayoutDashboard size={15} className="text-blue-600" />
                      <span>My Dashboard</span>
                    </Link>
                    <Link
                      href="/candidate/applications"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <Briefcase size={15} className="text-blue-600" />
                      <span>My Applications</span>
                    </Link>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Log in / Sign up Buttons */
            <>
              <Link
                href="/login"
                className={`rounded-xl border border-slate-300 bg-white px-4.5 py-2.5 text-sm font-bold text-slate-800 shadow-2xs hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/50 transition ${
                  pathname === "/login" ? "border-blue-600 text-blue-600 font-extrabold bg-blue-50" : ""
                }`}
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="relative group rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-98 whitespace-nowrap overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <span>Sign up</span>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile / Tablet Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden grid h-11 w-11 cursor-pointer place-items-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs hover:bg-slate-50 transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile / Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-5 space-y-3 shadow-2xl animate-in slide-in-from-top duration-200">
          {candidateUser && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-base">
                {firstLetter}
              </div>
              <div>
                <div className="font-extrabold text-slate-900">{candidateUser.name}</div>
                <div className="text-slate-500 text-[11px] truncate">{candidateUser.email}</div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold ${
                  link.active
                    ? "bg-blue-50 text-blue-600 font-extrabold"
                    : "text-slate-800 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            {candidateUser ? (
              <>
                <Link
                  href="/candidate/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-extrabold text-white shadow-xs"
                >
                  <LayoutDashboard size={16} />
                  <span>My Candidate Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-600"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-xl border border-slate-300 bg-white py-3 text-center text-sm font-bold text-slate-800 shadow-2xs"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-extrabold text-white shadow-md"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
