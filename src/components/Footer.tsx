"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ShieldCheck,
  Building2,
  Mail,
  ArrowRight,
  Sparkles,
  Send,
  Github,
  Linkedin,
  Twitter,
  Heart,
  Globe,
  Lock,
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
    { name: "About JobsGuru", href: "/#about" },
    { name: "Scam-Free Guarantee", href: "/#scam-free" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Contact Support", href: "mailto:support@jobsghuru.com" },
  ];

  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-gradient-to-b from-[#090E1E] via-[#0E162B] to-[#070B16] text-slate-300 relative overflow-hidden">
      {/* Background ambient lighting glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-full max-w-7xl rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="container-x relative pt-12 pb-10 lg:pt-16 lg:pb-12">
        {/* Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12 pb-12 border-b border-slate-800/80">
          {/* Brand Info (Col 1 & 2) */}
          <div className="col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-display text-2xl font-extrabold text-white group"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Briefcase size={20} />
              </span>
              <span>
                Jobs<span className="text-blue-400">Guru</span>
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-slate-400 max-w-sm font-medium">
              India&apos;s transparent career and recruitment operating system with 100% verified employers, upfront salary disclosures, and zero ghost listings.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>100% Scam-Free Vetted Jobs</span>
            </div>

            <div className="pt-2 text-xs text-slate-400 space-y-1 font-medium">
              <div className="flex items-center gap-2 hover:text-white transition">
                <Mail size={14} className="text-blue-400" />
                <span>support@jobsghuru.com</span>
              </div>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Explore
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              {exploreLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Career Tools */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Career &amp; Tools
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              {careerTools.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              For Employers
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              {employerLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Company &amp; Trust
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              {supportLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Clean Bottom Bar with Social Links */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="font-medium">
            © {new Date().getFullYear()} JobsGuru Technologies Pvt Ltd. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-blue-400 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-400 transition">
              Terms of Service
            </Link>
            <Link href="/employers/plans" className="hover:text-blue-400 transition">
              Employer Pricing
            </Link>
            <Link href="/employer/login" className="font-extrabold text-blue-400 hover:text-blue-300 transition flex items-center gap-1">
              <span>Employer Portal</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
