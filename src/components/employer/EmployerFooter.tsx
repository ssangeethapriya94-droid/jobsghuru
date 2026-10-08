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
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600">
      <div className="container-x py-12 lg:py-14">
        {/* Value Trust Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Zero Ghost Jobs</div>
              <div className="text-[11px] text-slate-500">Every company is verified</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Award size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Explainable AI</div>
              <div className="text-[11px] text-slate-500">Transparent skill matching</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Enterprise Security</div>
              <div className="text-[11px] text-slate-500">Isolated multi-tenant data</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Headphones size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Dedicated Support</div>
              <div className="text-[11px] text-slate-500">Fast response SLA</div>
            </div>
          </div>
        </div>

        {/* Directory Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <Link
              href="/employers"
              className="inline-flex items-center gap-2 font-display text-lg font-bold text-slate-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <Briefcase size={16} />
              </span>
              <span>
                Jobs<span className="text-blue-600">Ghuru</span>
              </span>
              <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                Employer
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-slate-500 max-w-sm">
              The hiring operating system connecting vetted organizations with verified talent through skill matching and collaborative recruitment workflows.
            </p>

            <div className="pt-2 text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                <span>employers@jobsghuru.com</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                <span>1800-419-HIRE (9 AM - 7 PM IST)</span>
              </div>
            </div>
          </div>

          {/* Industries */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Industries
            </h3>
            <ul className="space-y-2 text-xs">
              {industries.map((ind) => (
                <li key={ind.name}>
                  <Link
                    href={ind.href}
                    className="text-slate-600 hover:text-blue-600 transition"
                  >
                    {ind.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hiring Suite */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Hiring OS Suite
            </h3>
            <ul className="space-y-2 text-xs">
              {hiringSuite.map((item) => (
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

          {/* Plans & Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Plans &amp; Support
            </h3>
            <ul className="space-y-2 text-xs">
              {plansAndSupport.map((item) => (
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

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
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
