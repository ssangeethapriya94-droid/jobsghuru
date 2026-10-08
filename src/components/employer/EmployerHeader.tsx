"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ChevronDown,
  Building2,
  Code2,
  Megaphone,
  TrendingUp,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Flame, Database } from "lucide-react";

export default function EmployerHeader() {
  const pathname = usePathname();
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [offeringsOpen, setOfferingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<{
    authenticated: boolean;
    employer: {
      id: string;
      name: string;
      email: string;
      role: string;
      companyName: string;
      companyLogo?: string | null;
      companyVerified: boolean;
    } | null;
  } | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const res = await fetch("/api/employer/auth/session", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setSession(data);
        }
      } catch (e) {
        // ignore
      }
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/employer/auth/logout", { method: "POST" });
      setSession({ authenticated: false, employer: null });
      setProfileDropdownOpen(false);
      window.location.href = "/employers";
    } catch (e) {
      window.location.href = "/employers";
    }
  };

  const industries = [
    { name: "IT & Software", slug: "it-software", icon: Code2, desc: "Frontend, Backend, Cloud & AI engineers" },
    { name: "Digital Marketing", slug: "digital-marketing", icon: Megaphone, desc: "Performance, SEO & growth leaders" },
    { name: "Sales & BD", slug: "sales", icon: TrendingUp, desc: "B2B enterprise, inside sales & account managers" },
    { name: "Startups & Scaleups", slug: "startups", icon: Rocket, desc: "Early-stage agile builders & cross-functional leads" },
    { name: "Enterprise Solutions", slug: "enterprise", icon: Building2, desc: "High-volume hiring, ATS sync & custom SLAs" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="container-x h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/employers"
            className="group flex items-center gap-3 font-display transition shrink-0"
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
                <path d="M3 13C6 7.5 18 7.5 21 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="5.5" y="12" width="2.5" height="7.5" rx="1.2" fill="white" />
                <rect x="10.75" y="8" width="2.5" height="11.5" rx="1.2" fill="white" />
                <rect x="16" y="12" width="2.5" height="7.5" rx="1.2" fill="white" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                Jobs<span className="text-blue-600">Ghuru</span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 leading-none">
                Employer Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-7 text-sm sm:text-base font-bold text-slate-800 lg:flex">
            {/* Our Offerings Mega Dropdown (Naukri Screenshot 4 Equivalent) */}
            <div
              className="relative"
              onMouseEnter={() => setOfferingsOpen(true)}
              onMouseLeave={() => setOfferingsOpen(false)}
            >
              <button
                type="button"
                className={`flex items-center gap-1.5 py-2 text-sm sm:text-base font-bold transition hover:text-blue-600 ${
                  offeringsOpen ? "text-blue-600" : "text-slate-800"
                }`}
              >
                Our Offerings <ChevronDown size={16} className={`transition duration-200 ${offeringsOpen ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {offeringsOpen && (
                <div className="absolute left-0 top-full pt-2 w-[560px]">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl grid grid-cols-12 gap-5">
                    {/* Left Card: Free Job Posting highlight */}
                    <div className="col-span-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/60 p-4 border border-blue-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                          Starter Privilege
                        </span>
                        <h4 className="mt-2 font-display text-sm font-bold text-slate-900 leading-snug">
                          With Free Job Posting, hire local talent at zero cost
                        </h4>
                        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                          Post verified jobs every month with up to 50 pre-screened applicants.
                        </p>
                      </div>
                      <Link
                        href="/employers/register?plan=STARTER_FREE"
                        className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <span>Post a Free Job</span>
                        <span>→</span>
                      </Link>
                    </div>

                    {/* Middle Column: BY PRODUCTS */}
                    <div className="col-span-4 space-y-2 text-xs">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        By Products
                      </div>
                      <div className="space-y-1">
                        <Link href="/employer/jobs/new" className="block p-1.5 rounded-lg hover:bg-slate-50">
                          <div className="font-bold text-slate-900 text-xs">Job Posting</div>
                          <div className="text-[11px] text-slate-500">Inbound verified applications</div>
                        </Link>
                        <Link href="/employers/plans" className="block p-1.5 rounded-lg hover:bg-slate-50">
                          <div className="font-bold text-slate-900 text-xs">Resdex</div>
                          <div className="text-[11px] text-slate-500">Search 10k+ resume database</div>
                        </Link>
                        <Link href="/employers" className="block p-1.5 rounded-lg hover:bg-slate-50">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                            <span>AI REX</span>
                            <span className="bg-rose-500 text-white text-[8px] font-black px-1 rounded">NEW</span>
                          </div>
                          <div className="text-[11px] text-slate-500">Auto match & explainable score</div>
                        </Link>
                        <Link href="/employers" className="block p-1.5 rounded-lg hover:bg-slate-50">
                          <div className="font-bold text-slate-900 text-xs">Employer Branding</div>
                          <div className="text-[11px] text-slate-500">Showcase tech culture & perks</div>
                        </Link>
                      </div>
                    </div>

                    {/* Right Column: BY BUSINESS TYPE */}
                    <div className="col-span-3 space-y-2 text-xs border-l border-slate-100 pl-3">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        By Business
                      </div>
                      <div className="space-y-1.5 text-slate-700 font-semibold text-xs">
                        <Link href="/employers/enterprise" className="block hover:text-blue-600 transition">
                          Enterprises
                        </Link>
                        <Link href="/employers/startups" className="block hover:text-blue-600 transition">
                          Startups & SMBs
                        </Link>
                        <Link href="/employers/sales" className="block hover:text-blue-600 transition">
                          Hiring Agencies
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Solutions Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button
                type="button"
                className={`flex items-center gap-1.5 py-2 text-sm sm:text-base font-bold transition hover:text-blue-600 ${
                  pathname.startsWith("/employers/") && !pathname.includes("/plans") ? "text-blue-600" : "text-slate-800"
                }`}
              >
                Solutions <ChevronDown size={16} className={`transition duration-200 ${solutionsOpen ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {solutionsOpen && (
                <div className="absolute left-0 top-full pt-2 w-84">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                    <div className="px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Industry Solutions
                    </div>
                    {industries.map((ind) => {
                      const Icon = ind.icon;
                      return (
                        <Link
                          key={ind.slug}
                          href={`/employers/${ind.slug}`}
                          className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-slate-50"
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Icon size={16} />
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{ind.name}</div>
                            <div className="text-[11px] text-slate-500 leading-snug">{ind.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                    <div className="mt-1 border-t border-slate-100 pt-2">
                      <Link
                        href="/employers/plans"
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition"
                      >
                        <span>View All 14 Industries</span>
                        <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Explore</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/employers/it-software"
              className={`text-sm sm:text-base font-bold transition hover:text-blue-600 ${
                pathname === "/employers/it-software" ? "text-blue-600 font-extrabold" : "text-slate-800"
              }`}
            >
              For IT & Tech
            </Link>

            <Link
              href="/employers/plans"
              className={`text-sm sm:text-base font-bold transition hover:text-blue-600 ${
                pathname === "/employers/plans" ? "text-blue-600 font-extrabold" : "text-slate-800"
              }`}
            >
              Pricing & Plans
            </Link>

            <Link
              href="/employers/contact-sales"
              className={`text-sm sm:text-base font-bold transition hover:text-blue-600 ${
                pathname === "/employers/contact-sales" ? "text-blue-600 font-extrabold" : "text-slate-800"
              }`}
            >
              Enterprise Sales
            </Link>
          </nav>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {session?.authenticated && session.employer ? (
            <>
              {/* Go to Dashboard CTA */}
              <Link
                href="/employer/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/90 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-100 transition"
              >
                <LayoutDashboard size={14} className="text-blue-600" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* Company Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 sm:px-2.5 sm:py-1.5 hover:border-slate-300 transition text-left cursor-pointer shadow-2xs"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs uppercase shrink-0">
                    {session.employer.companyName ? session.employer.companyName.charAt(0) : "C"}
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-tight max-w-[120px] truncate">
                      {session.employer.companyName || "Company"}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 leading-none mt-0.5">
                      <CheckCircle2 size={10} /> Verified
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 shrink-0" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {session.employer.name || "Company Admin"}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {session.employer.email}
                      </div>
                      <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <Building2 size={11} /> {session.employer.companyName}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/employer/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                      >
                        <LayoutDashboard size={14} />
                        Employer Dashboard
                      </Link>
                      <Link
                        href="/employer/jobs"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                      >
                        <Briefcase size={14} />
                        Manage Jobs
                      </Link>
                      <Link
                        href="/employer/candidates"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                      >
                        <Users size={14} />
                        Applications & Interviews
                      </Link>
                      <Link
                        href="/employer/company"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                      >
                        <Building2 size={14} />
                        Company Profile
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/employer/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
              >
                <ShieldCheck size={15} className="text-blue-600" />
                <span>Employer Login</span>
              </Link>

              <Link
                href="/employers/register"
                className="hidden sm:inline-flex rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-100 transition"
              >
                Register Company
              </Link>
            </>
          )}

          <Link
            href="/employer/jobs/new"
            className="rounded-xl bg-blue-600 px-3.5 sm:px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-98 transition flex items-center gap-1.5"
          >
            <Briefcase size={14} />
            <span>Post a Job</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-3 shadow-lg">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Solutions & Industries
            </div>
            {industries.map((ind) => (
              <Link
                key={ind.slug}
                href={`/employers/${ind.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {ind.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <Link
              href="/employers/plans"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Pricing & Plans
            </Link>
            <Link
              href="/employers/contact-sales"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Enterprise Sales
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {session?.authenticated && session.employer ? (
              <>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs uppercase shrink-0">
                    {session.employer.companyName ? session.employer.companyName.charAt(0) : "C"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {session.employer.companyName}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {session.employer.email}
                    </span>
                  </div>
                </div>

                <Link
                  href="/employer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  <LayoutDashboard size={15} />
                  Go to Employer Dashboard
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/employer/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
                >
                  <ShieldCheck size={16} className="text-blue-600" />
                  Employer Sign In
                </Link>
                <Link
                  href="/employers/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Register Your Company
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
