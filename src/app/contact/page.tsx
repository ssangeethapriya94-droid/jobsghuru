"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Headphones,
  Mail,
  Phone,
  MapPin,
  Send,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  ChevronDown,
  Building2,
  Sparkles,
  ExternalLink,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

export default function ContactPage() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    department: "candidate",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const faqs = [
    {
      q: "Is candidate registration and applying for jobs 100% free?",
      a: "Yes! JobsGhuru is completely free for all job seekers. We strictly enforce a Zero Candidate Fee Guarantee. Neither JobsGhuru nor our verified employers will ever charge candidates placement fees, interview deposits, or laptop costs.",
    },
    {
      q: "What is the response SLA for corporate recruiter inquiries?",
      a: "All enterprise sales and account management tickets submitted during business hours (Mon–Sat, 9:00 AM – 8:00 PM IST) receive a response within 2 hours. Priority support is provided for active hiring subscription plans.",
    },
    {
      q: "How do I report a suspicious or fraudulent job requisition?",
      a: "If you encounter any job listing requesting money or personal banking details, click the 'Report Job' button on the job details page or email compliance@jobshuru.com immediately. Our safety team audits reported accounts within 30 minutes.",
    },
    {
      q: "Can I request custom enterprise recruitment & ATS API integration?",
      a: "Absolutely! Our enterprise team offers custom job syndication, Workday/Greenhouse ATS connectors, and bulk candidate talent pool access. Contact sales@jobshuru.com or fill out the inquiry form.",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-16">
      {/* Hero Banner Header */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white py-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/20">
              <Headphones size={13} className="text-blue-400" />
              24/7 Corporate & Candidate Support
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
              <Clock size={13} className="text-emerald-400" />
              2-Hour Guaranteed Response SLA
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            How Can We <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Help You Today?</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Have questions about candidate applications, recruiter subscription plans, platform safety, or ATS integrations? Our dedicated support team is ready to assist.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 pb-16 space-y-10">

        {/* 3 Department Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Candidate Support Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-extrabold group-hover:scale-105 transition">
                <Headphones size={22} />
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Job Seekers
              </span>
            </div>

            <div>
              <h3 className="font-display text-lg font-extrabold text-slate-900">Candidate Helpline</h3>
              <p className="text-xs text-slate-500 mt-0.5">Assistance for job seekers & applications</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800">support@jobshuru.com</span>
                <button
                  type="button"
                  onClick={() => handleCopy("support@jobshuru.com")}
                  className="text-slate-400 hover:text-blue-600 transition p-1 cursor-pointer"
                  title="Copy Email"
                >
                  {copiedEmail === "support@jobshuru.com" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-700 font-semibold pt-1">
                <Phone size={14} className="text-blue-600 shrink-0" />
                <span className="font-mono font-bold text-slate-900">1800 200 4487</span>
                <span className="text-[10px] text-slate-500 font-medium">(Toll-Free)</span>
              </div>
              <p className="text-[11px] text-slate-400">Mon – Sat: 9:00 AM – 8:00 PM IST</p>
            </div>
          </div>

          {/* Enterprise Sales Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-extrabold group-hover:scale-105 transition">
                <Building2 size={22} />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Employers
              </span>
            </div>

            <div>
              <h3 className="font-display text-lg font-extrabold text-slate-900">Enterprise Sales</h3>
              <p className="text-xs text-slate-500 mt-0.5">Employer subscriptions & custom plans</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800">sales@jobshuru.com</span>
                <button
                  type="button"
                  onClick={() => handleCopy("sales@jobshuru.com")}
                  className="text-slate-400 hover:text-emerald-600 transition p-1 cursor-pointer"
                  title="Copy Email"
                >
                  {copiedEmail === "sales@jobshuru.com" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-700 font-semibold pt-1">
                <Phone size={14} className="text-emerald-600 shrink-0" />
                <span className="font-mono font-bold text-slate-900">+91 124 459 9000</span>
              </div>
              <p className="text-[11px] text-slate-400">Mon – Sat: 9:00 AM – 7:00 PM IST</p>
            </div>
          </div>

          {/* Legal & Compliance Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-extrabold group-hover:scale-105 transition">
                <ShieldCheck size={22} />
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                Compliance
              </span>
            </div>

            <div>
              <h3 className="font-display text-lg font-extrabold text-slate-900">Legal & DPO Officer</h3>
              <p className="text-xs text-slate-500 mt-0.5">Privacy, DPDP & fraud reporting</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800">compliance@jobshuru.com</span>
                <button
                  type="button"
                  onClick={() => handleCopy("compliance@jobshuru.com")}
                  className="text-slate-400 hover:text-purple-600 transition p-1 cursor-pointer"
                  title="Copy Email"
                >
                  {copiedEmail === "compliance@jobshuru.com" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-700 font-semibold pt-1">
                <MapPin size={14} className="text-purple-600 shrink-0" />
                <span className="text-slate-900 font-bold">Cyber City, Gurugram</span>
              </div>
              <p className="text-[11px] text-slate-400">Data Protection Officer Direct Inbox</p>
            </div>
          </div>

        </div>

        {/* 2-Column Main Section: HQ & FAQ on Left, Interactive Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Office Address & FAQs */}
          <div className="lg:col-span-7 space-y-6">

            {/* Corporate Headquarters Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Corporate Headquarters
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">JobsGhuru Technologies Private Limited</p>
                  </div>
                </div>

                <a
                  href="https://maps.google.com/?q=Cyber+City+Gurugram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition shrink-0"
                >
                  <span>Google Maps</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 text-xs text-slate-700 space-y-2 leading-relaxed">
                <p className="font-bold text-slate-900">Cyber City, Tower 4, 12th Floor, Sector 24</p>
                <p className="text-slate-600">Gurugram, Haryana - 122002, India</p>
                <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-4 text-slate-500 font-medium text-[11px]">
                  <span>🏢 Corporate ID: U72900HR2025PTC118940</span>
                  <span>GSTIN: 06AAACJ9940F1Z7</span>
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-slate-900 font-display">
                <HelpCircle size={20} className="text-blue-600" />
                <h3 className="text-lg font-extrabold">Frequently Asked Questions</h3>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-4 text-left text-xs sm:text-sm font-extrabold text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:text-blue-600 transition"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                          openFaq === idx ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>

                    {openFaq === idx && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Direct Inquiry Form */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl space-y-6">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <MessageSquare size={13} />
                  Direct Messaging
                </span>
                <h3 className="font-display text-xl font-extrabold text-slate-900 pt-1">
                  Send a Direct Inquiry
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Fill out your details and our team will get back to you within 2 hours.
                </p>
              </div>

              {submitted ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="h-12 w-12 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-extrabold shadow-md">
                    <Check size={24} />
                  </div>
                  <h4 className="font-display text-base font-extrabold text-emerald-900">
                    Inquiry Received Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 leading-relaxed max-w-xs mx-auto">
                    Thank you, <strong>{formState.name || "User"}</strong>. Ticket <strong>#JGH-8942</strong> has been logged. Our support specialist will reach out to <strong>{formState.email}</strong> within 2 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormState({ name: "", email: "", department: "candidate", message: "" });
                    }}
                    className="inline-block mt-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-5 py-2 transition shadow-sm cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Work or Personal Email</label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Inquiry Department</label>
                    <select
                      value={formState.department}
                      onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 font-bold focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition cursor-pointer"
                    >
                      <option value="candidate">Candidate Support & Application Helpline</option>
                      <option value="enterprise">Enterprise Recruiter & Subscriptions</option>
                      <option value="legal">Legal, Privacy & DPDP DPO Inquiry</option>
                      <option value="fraud">Report Scam / Fraudulent Job Listing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Message Details</label>
                    <textarea
                      rows={4}
                      required
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Describe your issue or requested partnership details..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Sending Inquiry...</span>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Send Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
