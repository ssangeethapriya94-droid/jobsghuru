"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Sparkles,
  PhoneCall,
  Zap,
} from "lucide-react";

interface PlansClientViewProps {
  initialPlans: any[];
}

export default function PlansClientView({ initialPlans }: PlansClientViewProps) {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  const matrixRows = [
    { label: "Active Job Listings", starter: "3 Jobs", growth: "10 Jobs", pro: "30 Jobs", ent: "100+ Jobs" },
    { label: "Candidate Search Credits", starter: "50 / mo", growth: "250 / mo", pro: "1,000 / mo", ent: "5,000+ / mo" },
    { label: "AI Candidate Matching", starter: "Basic", growth: "Explainable AI", pro: "Advanced Recruiter AI", ent: "Full Custom Model" },
    { label: "Recruiter Team Seats", starter: "1 Seat", growth: "5 Seats", pro: "15 Seats", ent: "50+ Custom Seats" },
    { label: "Applicant Kanban Pipeline", starter: true, growth: true, pro: true, ent: true },
    { label: "Interview Scheduler & Scorecards", starter: false, growth: true, pro: true, ent: true },
    { label: "Formal Offer Letter Generation", starter: false, growth: false, pro: true, ent: true },
    { label: "Employer Profile Branding", starter: "Accredited Badge", growth: "Custom Profile", pro: "Branded Career Page", ent: "Full Talent Community" },
    { label: "Hiring Funnel Analytics", starter: "Basic", growth: "Velocity Funnel", pro: "Full Telemetry + SLA", ent: "Custom Executive Reports" },
    { label: "Featured Job Promotion Slots", starter: "—", growth: "2 Included", pro: "6 Included", ent: "20 Included" },
    { label: "Support SLA", starter: "48h Email", growth: "24h Priority", pro: "12h Dedicated Mgr", ent: "1h 24/7 Slack & Phone" },
    { label: "Custom ATS Sync (Webhooks / API)", starter: false, growth: false, pro: false, ent: true },
    { label: "Single Sign-On (SAML / Okta)", starter: false, growth: false, pro: false, ent: true },
  ];

  return (
    <div className="bg-[#F8FAFC] py-16 lg:py-24">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-md">
            Hiring Partnerships
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-5xl">
            Choose a hiring partnership that fits your business.
          </h1>
          <p className="mt-4 text-base text-slate-500 max-w-xl mx-auto">
            From lean seed startups to continuous high-volume enterprises. Transparent billing backed by verified candidate matching.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setBillingCycle("MONTHLY")}
              className={`rounded-xl px-5 py-2 text-xs font-bold transition ${
                billingCycle === "MONTHLY"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle("ANNUAL")}
              className={`relative rounded-xl px-5 py-2 text-xs font-bold transition ${
                billingCycle === "ANNUAL"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Annual Billing
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 4 Core Plans */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialPlans.map((p) => {
            const isPopular = p.badge === "Most Popular";
            const price = billingCycle === "ANNUAL" ? p.annualPriceInr : p.monthlyPriceInr;

            return (
              <div
                key={p.code}
                className={`rounded-3xl border p-7 flex flex-col justify-between transition relative ${
                  isPopular
                    ? "border-blue-600 bg-white shadow-xl ring-2 ring-blue-600/20"
                    : "border-slate-200 bg-white shadow-2xs hover:border-slate-300"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    {p.badge}
                  </span>
                )}

                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">{p.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 min-h-[36px] leading-relaxed">{p.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">/ month</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {billingCycle === "ANNUAL"
                      ? `Billed ₹${(price * 12).toLocaleString("en-IN")} annually`
                      : "Billed monthly, cancel anytime"}
                  </div>

                  {/* Highlights */}
                  <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                      <span>{p.jobPostingLimit} Active Job Postings</span>
                    </div>

                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                      <span>{p.searchCreditsMonthly} Candidate Search Credits</span>
                    </div>

                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                      <span>{p.recruiterSeatsLimit} Recruiter Team Seat{p.recruiterSeatsLimit > 1 ? "s" : ""}</span>
                    </div>

                    {p.features.slice(3, 8).map((f: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-600">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  <Link
                    href={`/employers/register?plan=${p.code}&cycle=${billingCycle}`}
                    className={`block w-full text-center rounded-xl py-3 text-xs font-bold transition shadow-xs ${
                      isPopular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    Select {p.name.split(" ")[0]}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Specialized Solutions: Hiring Campaign & Volume Hiring */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plan 5: Dedicated Hiring Campaign */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                Specialized Plan 5
              </span>
              <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
                Targeted Hiring Campaign
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                For companies with a rapid headcount sprint (e.g. <em>"Hire 50 Sales Executives in 30 days"</em> or launching a new regional engineering hub).
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 size={14} className="text-purple-600" /> Dedicated campaign manager coordinating screening
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 size={14} className="text-purple-600" /> Curated sourcing drives with fast-track phone interviews
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 size={14} className="text-purple-600" /> Custom branding banners on JobsGhuru homepage
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Pricing</div>
                <div className="text-base font-bold text-slate-900">Custom Campaign Quote</div>
              </div>
              <Link
                href="/employers/contact-sales?intent=campaign"
                className="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition"
              >
                Inquire Campaign
              </Link>
            </div>
          </div>

          {/* Plan 6: Bulk / Volume Hiring */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                Specialized Plan 6
              </span>
              <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
                Bulk & Volume Staffing
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Designed for BPO, Logistics, Retail, and Operations requiring high-throughput applicant screening and batch scheduling.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 size={14} className="text-blue-600" /> Unlimited applicant intake with automated rule-based filters
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 size={14} className="text-blue-600" /> Bulk WhatsApp/Email interview invitation blasts
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 size={14} className="text-blue-600" /> Turnaround SLAs under 48 hours from application to offer
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Pricing</div>
                <div className="text-base font-bold text-slate-900">Tiered Per-Hire Pricing</div>
              </div>
              <Link
                href="/employers/contact-sales?intent=bulk"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Request Volume Quote
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Detailed Feature Comparison Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Compare limits, candidate credits, and enterprise capabilities side by side.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="py-4 px-6 font-bold text-slate-900 w-1/3">Feature Capability</th>
                  <th className="py-4 px-4 font-bold text-slate-700 text-center">Starter</th>
                  <th className="py-4 px-4 font-bold text-blue-700 text-center">Growth</th>
                  <th className="py-4 px-4 font-bold text-slate-700 text-center">Professional</th>
                  <th className="py-4 px-4 font-bold text-slate-700 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{row.label}</td>

                    {/* Starter */}
                    <td className="py-3.5 px-4 text-center">
                      {typeof row.starter === "boolean" ? (
                        row.starter ? (
                          <CheckCircle2 size={16} className="text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )
                      ) : (
                        <span className="font-medium text-slate-600">{row.starter}</span>
                      )}
                    </td>

                    {/* Growth */}
                    <td className="py-3.5 px-4 text-center bg-blue-50/20">
                      {typeof row.growth === "boolean" ? (
                        row.growth ? (
                          <CheckCircle2 size={16} className="text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )
                      ) : (
                        <span className="font-bold text-blue-700">{row.growth}</span>
                      )}
                    </td>

                    {/* Pro */}
                    <td className="py-3.5 px-4 text-center">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? (
                          <CheckCircle2 size={16} className="text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )
                      ) : (
                        <span className="font-medium text-slate-700">{row.pro}</span>
                      )}
                    </td>

                    {/* Ent */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {typeof row.ent === "boolean" ? (
                        row.ent ? (
                          <CheckCircle2 size={16} className="text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )
                      ) : (
                        <span>{row.ent}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enterprise Callout */}
        <div className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <PhoneCall size={24} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Need a custom recruitment agreement?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Our talent solutions team provides custom MSAs, vendor onboarding, and tailored invoicing cycles.
              </p>
            </div>
          </div>

          <Link
            href="/employers/contact-sales"
            className="shrink-0 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            Schedule Enterprise Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}
