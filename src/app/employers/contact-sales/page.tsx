"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
  Zap,
  Globe,
  Clock,
  Layers,
  ChevronRight,
  Headphones,
} from "lucide-react";

export default function ContactSalesPage() {
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    workEmail: "",
    phone: "",
    industry: "IT & Software",
    companySize: "51-200",
    hiringVolume: "21-50",
    preferredPlan: "Enterprise Partnership",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/employers/contact-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 lg:py-16">
      <div className="w-full max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <Link href="/employers" className="hover:text-blue-600 transition">
            Employer Platform
          </Link>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="font-semibold text-slate-900">Enterprise Solutions & Sales</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: ENTERPRISE VALUE PROPOSITION & DIRECT CHANNELS               */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">
                <Sparkles size={13} className="text-blue-600" />
                Enterprise Talent Architecture
              </span>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Scale high-volume hiring with custom enterprise SLAs
              </h1>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Whether you need 50+ engineers, bespoke MCA/GST compliance MSAs, direct ATS webhooks (Greenhouse, Lever, Workday), or high-throughput talent pipelines, our executive team designs a tailored deployment for your company.
              </p>
            </div>

            {/* Pillar Value Cards */}
            <div className="space-y-3.5 pt-2">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs hover:border-blue-300 transition">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900">Dedicated Enterprise Account Director</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      A dedicated recruitment strategist in India who oversees sourcing sprints, candidate screening benchmarks, and quarterly requisition reviews.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs hover:border-blue-300 transition">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900">Bi-Directional ATS & HRMS Webhooks</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Zero duplicate data entry. Seamlessly sync applicants, interview feedback, and offer letters directly into Greenhouse, Lever, Workday, or Darwinbox.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs hover:border-blue-300 transition">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900">94.8% Candidate Response SLA Guarantee</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Multi-channel NVite (WhatsApp + Email + SMS) ensures candidates reply within committed timeframes. 85% reduction in applicant ghosting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contact Hotline & Support Card */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <Headphones size={15} className="text-blue-600" />
                <span>Direct Corporate Advisory Channels</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <a
                  href="tel:+914448001200"
                  className="rounded-xl border border-blue-200 bg-white p-3 hover:border-blue-400 transition block"
                >
                  <div className="text-[11px] font-bold text-slate-500">Corporate Phone Line</div>
                  <div className="text-sm font-extrabold text-blue-700 mt-0.5">+91 44 4800 1200</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Mon–Fri · 9:00 AM–7:00 PM IST</div>
                </a>

                <a
                  href="mailto:enterprise@jobsghuru.com"
                  className="rounded-xl border border-blue-200 bg-white p-3 hover:border-blue-400 transition block"
                >
                  <div className="text-[11px] font-bold text-slate-500">Executive Email</div>
                  <div className="text-sm font-extrabold text-blue-700 mt-0.5">enterprise@jobsghuru.com</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Guaranteed 2-Hour Response</div>
                </a>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>ISO 27001 Security</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>MCA & GST Registered Invoicing</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: HIGH-CONVERTING ENTERPRISE CONSULTATION FORM                */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-10 shadow-lg">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-slate-900">
                    Enterprise Request Transmitted
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-slate-900">{form.contactPerson}</strong>. Your enterprise consultation request for <strong className="text-slate-900">{form.companyName || "your company"}</strong> has been allocated to our Senior Solutions Partner. We will reach out to <strong className="text-blue-700">{form.workEmail}</strong> within 2 to 4 business hours.
                  </p>

                  <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/employers"
                      className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                    >
                      Return to Employer Platform
                    </Link>
                    <Link
                      href="/employers/plans"
                      className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      View Standard Plans
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                          Request an Enterprise Consultation
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Share your organization details to receive a customized volume proposal and SLA matrix.
                        </p>
                      </div>
                      <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                        ⚡ 4-Hour Callback SLA
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-2">
                      <span className="font-bold">Error:</span> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Company Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        placeholder="e.g. HexaCorp Technologies Pvt Ltd"
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.contactPerson}
                        onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                        placeholder="e.g. Priya Sundaram"
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Official Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.workEmail}
                        onChange={(e) => setForm({ ...form, workEmail: e.target.value })}
                        placeholder="recruiter@company.com"
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Direct Mobile / WhatsApp Number *
                      </label>
                      <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition bg-white">
                        <span className="flex items-center bg-slate-50 border-r border-slate-200 px-3 text-slate-600 font-semibold text-xs shrink-0">
                          +91 🇮🇳
                        </span>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="98401 23456"
                          className="w-full py-2.5 px-3 text-xs text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Primary Industry *
                      </label>
                      <select
                        value={form.industry}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white transition"
                      >
                        <option value="IT & Software">IT & Software Engineering</option>
                        <option value="Digital Marketing">Digital Marketing & Growth</option>
                        <option value="Sales & Business Dev">B2B Sales & Business Dev</option>
                        <option value="Fintech & Banking">Fintech & Banking</option>
                        <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                        <option value="Manufacturing & Supply">Manufacturing & Supply Chain</option>
                        <option value="Retail & E-commerce">Retail & E-commerce</option>
                        <option value="Startups & Scaleups">Startups & Scaleups</option>
                        <option value="Enterprise Solutions">Conglomerate / Enterprise</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Current Company Headcount
                      </label>
                      <select
                        value={form.companySize}
                        onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white transition"
                      >
                        <option value="1-50">1-50 employees (Early Growth)</option>
                        <option value="51-200">51-200 employees (Scaleup)</option>
                        <option value="201-500">201-500 employees (Mid-Market)</option>
                        <option value="501-1000">501-1000 employees (Large Corp)</option>
                        <option value="1000+">1000+ employees (Global Enterprise)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Projected 90-Day Hires
                      </label>
                      <select
                        value={form.hiringVolume}
                        onChange={(e) => setForm({ ...form, hiringVolume: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white transition"
                      >
                        <option value="1-5">1-5 strategic leadership hires</option>
                        <option value="6-20">6-20 tech & domain specialists</option>
                        <option value="21-50">21-50 cross-functional roles</option>
                        <option value="51-100">51-100 aggressive expansion</option>
                        <option value="100+">100+ high-volume campus/lateral drive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Preferred Enterprise Solution
                      </label>
                      <select
                        value={form.preferredPlan}
                        onChange={(e) => setForm({ ...form, preferredPlan: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white transition"
                      >
                        <option value="Enterprise Partnership">Enterprise Annual Partnership (Unlimited)</option>
                        <option value="Hiring Campaign">Quarterly Sprint / Dedicated Drive</option>
                        <option value="Custom ATS Integration">ATS API Integration (Greenhouse/Workday)</option>
                        <option value="Resdex Bulk Access">Resdex Resume Database (10,000+ CVs)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tell us about your specific hiring goals & technical requirements
                    </label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="e.g. We are expanding our Chennai & Bengaluru development centers and require 25 Senior Full Stack Developers and 5 Lead Architects with Node.js, React, and AWS proficiencies..."
                      className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Routing to Enterprise Director...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Enterprise Inquiry</span>
                          <Send size={15} />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-500" />
                      Confidential under standard bilateral NDA
                    </span>
                    <span>No third-party data sharing</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
