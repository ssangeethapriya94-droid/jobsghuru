"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

import EmployerHeader from "@/components/employer/EmployerHeader";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* Desktop Nav - Clear, larger font size (text-base) */}
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

        {/* Desktop Action Buttons - Spaced & High Visibility */}
        <div className="hidden lg:flex items-center gap-3.5 xl:gap-4 shrink-0">
          <Link
            href="/candidate/notifications"
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
            aria-label="Notifications"
          >
            <Bell size={20} />
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
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:bg-blue-700 active:scale-98 whitespace-nowrap"
          >
            Sign up
          </Link>
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

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/employers"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100 transition"
            >
              For Employers
            </Link>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-extrabold text-white hover:bg-blue-700 shadow-md transition"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
