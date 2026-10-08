"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Lock,
  Headphones,
  Briefcase,
  Building2,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";

export default function EmployerFooter() {
  const industries = [
    { name: "IT & Software", href: "/employers/it-software" },
    { name: "Digital Marketing", href: "/employers/digital-marketing" },
    { name: "Sales & BD", href: "/employers/sales" },
    { name: "Finance & Accounting", href: "/employers/finance" },
    { name: "Healthcare", href: "/employers/healthcare" },
    { name: "Startups & Scaleups", href: "/employers/startups" },
  ];

  const hiringSuite = [
    { name: "Post a Job", href: "/employer/jobs/new" },
    { name: "Candidate Search", href: "/employer/candidates" },
    { name: "Applicant Kanban", href: "/employer/applications" },
    { name: "Hiring Pipelines", href: "/employer/pipelines" },
    { name: "Skill Assessments", href: "/employer/assessments" },
    { name: "Interview Scheduler", href: "/employer/interviews" },
    { name: "Offer Letter Generator", href: "/employer/offers" },
    { name: "AI Recruiter Assistant", href: "/employer/ai" },
  ];

  const plansAndSupport = [
    { name: "Employer Pricing & Plans", href: "/employers/plans" },
    { name: "Enterprise Custom SLA", href: "/employers/contact-sales" },
    { name: "Company Registration", href: "/employers/register" },
    { name: "Employer Sign In", href: "/employer/login" },
    { name: "Recruiter Help Desk", href: "mailto:employers@jobsghuru.com" },
  ];

  return (
    <footer className="border-t border-slate-800/80 bg-gradient-to-b from-[#090E1E] via-[#0E162B] to-[#070B16] text-slate-300 relative overflow-hidden">
      {/* Background ambient lighting glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-full max-w-7xl rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="container-x relative py-12 lg:py-14">
        {/* Value Trust Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Zero Ghost Jobs</div>
              <div className="text-[11px] text-slate-400 font-medium">Every company is verified</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
              <Award size={20} />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Explainable AI</div>
              <div className="text-[11px] text-slate-400 font-medium">Transparent skill matching</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
              <Lock size={20} />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Enterprise Security</div>
              <div className="text-[11px] text-slate-400 font-medium">Isolated multi-tenant data</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <Headphones size={20} />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Dedicated Support</div>
              <div className="text-[11px] text-slate-400 font-medium">Fast response SLA</div>
            </div>
          </div>
        </div>

        {/* Directory Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <Link
              href="/employers"
              className="inline-flex items-center gap-2.5 font-display text-xl font-extrabold text-white group"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Briefcase size={18} />
              </span>
              <span>
                Jobs<span className="text-blue-400">Guru</span>
              </span>
              <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-extrabold text-blue-300 border border-blue-400/30">
                HIRING OS
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-slate-400 max-w-sm font-medium">
              The hiring operating system connecting vetted organizations with verified talent through skill matching and collaborative recruitment workflows.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1 font-medium">
              <div className="flex items-center gap-2 hover:text-white transition">
                <Mail size={14} className="text-blue-400" />
                <span>employers@jobsghuru.com</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white transition">
                <Phone size={14} className="text-blue-400" />
                <span>1800-419-HIRE (9 AM - 7 PM IST)</span>
              </div>
            </div>
          </div>

          {/* Industries */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Industries
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              {industries.map((ind) => (
                <li key={ind.name}>
                  <Link
                    href={ind.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {ind.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hiring Suite */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Hiring OS Suite
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              {hiringSuite.map((item) => (
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

          {/* Plans & Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Plans &amp; Support
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              {plansAndSupport.map((item) => (
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

        {/* Bottom Bar */}
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
