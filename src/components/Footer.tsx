"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ShieldCheck,
  Building2,
  Mail,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import EmployerFooter from "@/components/employer/EmployerFooter";

export default function Footer() {
  const pathname = usePathname();

  // Suppress footer on admin dashboard or isolated employer workspace pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/employer/")) {
    return null;
  }

  // Use specialized employer footer when on employer section
  if (pathname?.startsWith("/employers")) {
    return <EmployerFooter />;
  }

  const exploreLinks = [
    { name: "All Jobs", href: "/jobs" },
    { name: "Top Companies", href: "/companies" },
    { name: "Remote Roles", href: "/jobs?mode=REMOTE" },
    { name: "Tech & Software Jobs", href: "/jobs?q=Software" },
    { name: "Internships", href: "/jobs?type=INTERNSHIP" },
  ];

  const careerTools = [
    { name: "Salary Insights (2026)", href: "/salary" },
    { name: "AI Resume & Career Tools", href: "/career-ai" },
    { name: "Skill Benchmarks", href: "/career" },
    { name: "Interview Simulator", href: "/career" },
  ];

  const employerLinks = [
    { name: "Post a Job", href: "/employers" },
    { name: "Employer Solutions", href: "/employers" },
    { name: "Pricing & Plans", href: "/employers/plans" },
    { name: "Register Company", href: "/employers/register" },
    { name: "Employer Login", href: "/employer/login" },
  ];

  const supportLinks = [
    { name: "About JobsGhuru", href: "/#about" },
    { name: "Scam-Free Guarantee", href: "/#scam-free" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Contact Support", href: "mailto:support@jobsghuru.com" },
  ];

  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50 text-slate-600">
      <div className="container-x py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Info (Col 1 & 2) */}
          <div className="col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-display text-xl font-bold text-slate-900"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <Briefcase size={18} />
              </span>
              <span>
                Jobs<span className="text-blue-600">Ghuru</span>
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-slate-500 max-w-sm">
              India&apos;s transparent career and recruitment platform with verified companies, upfront salaries, and scam-free job postings.
            </p>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>100% Scam-Free Vetted Jobs</span>
            </div>

            <div className="pt-2 text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                <span>support@jobsghuru.com</span>
              </div>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Explore
            </h3>
            <ul className="space-y-2.5 text-xs">
              {exploreLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-blue-600 transition"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Career Tools */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Career &amp; Tools
            </h3>
            <ul className="space-y-2.5 text-xs">
              {careerTools.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-blue-600 transition"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              For Employers
            </h3>
            <ul className="space-y-2.5 text-xs">
              {employerLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-blue-600 transition"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Company &amp; Trust
            </h3>
            <ul className="space-y-2.5 text-xs">
              {supportLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-blue-600 transition"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Clean Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} JobsGhuru Technologies Pvt Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-blue-600 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-600 transition">
              Terms of Service
            </Link>
            <Link href="/employers/plans" className="hover:text-blue-600 transition">
              Employer Pricing
            </Link>
            <Link href="/employer/login" className="font-semibold text-blue-600 hover:underline">
              Employer Sign In →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
