"use client";

import { useState } from "react";
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
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Sparkles,
  CheckCircle2,
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
    }, 700);
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
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 pb-16 animate-in fade-in duration-300">
      
      {/* Hero Banner Header - Increased Typography Size */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/25 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-4 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/25">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
              <Headphones size={14} className="text-blue-400" />
              24/7 Priority Support
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/25">
              <Clock size={14} className="text-emerald-400" />
              2-Hour SLA Response
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            How Can We <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-300">Help You Today?</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed font-medium">
            Have questions about candidate applications, recruiter subscription plans, platform safety, or ATS integrations? Our support team is ready to assist.
          </p>
        </div>
      </section>

      {/* Main Container - Compact Max Width & Smooth Entrance */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 -mt-6 relative z-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">

        {/* 3 Department Cards Grid - Sleek Cards with Increased Font Size */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Candidate Support Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-blue-300/80 transition-all duration-300 space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-extrabold group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition duration-300 shadow-2xs">
                <Headphones size={20} />
              </div>
              <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Job Seekers
              </span>
            </div>

            <div>
              <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition">Candidate Helpline</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Applications & candidate profiles</p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 group-hover:bg-blue-50/50 transition">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">support@jobshuru.com</span>
                <button
                  type="button"
                  onClick={() => handleCopy("support@jobshuru.com")}
                  className="text-slate-400 hover:text-blue-600 transition p-1 cursor-pointer active:scale-90"
                  title="Copy Email"
                >
                  {copiedEmail === "support@jobshuru.com" ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-700 font-bold text-xs sm:text-sm pt-0.5">
                <Phone size={15} className="text-blue-600 shrink-0" />
                <span className="font-mono font-black text-slate-900 text-sm sm:text-base">1800 200 4487</span>
                <span className="text-xs text-slate-500 font-medium">(Toll-Free)</span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Mon – Sat: 9:00 AM – 8:00 PM IST
              </p>
            </div>
          </div>

          {/* Enterprise Sales Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-emerald-300/80 transition-all duration-300 space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-extrabold group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition duration-300 shadow-2xs">
                <Building2 size={20} />
              </div>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Employers
              </span>
            </div>

            <div>
              <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 group-hover:text-emerald-600 transition">Enterprise Sales</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Recruiter plans & hiring quotas</p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 group-hover:bg-emerald-50/50 transition">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">sales@jobshuru.com</span>
                <button
                  type="button"
                  onClick={() => handleCopy("sales@jobshuru.com")}
                  className="text-slate-400 hover:text-emerald-600 transition p-1 cursor-pointer active:scale-90"
                  title="Copy Email"
                >
                  {copiedEmail === "sales@jobshuru.com" ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-700 font-bold text-xs sm:text-sm pt-0.5">
                <Phone size={15} className="text-emerald-600 shrink-0" />
                <span className="font-mono font-black text-slate-900 text-sm sm:text-base">+91 124 459 9000</span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Mon – Sat: 9:00 AM – 7:00 PM IST
              </p>
            </div>
          </div>

          {/* Legal & Compliance Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-purple-300/80 transition-all duration-300 space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-extrabold group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition duration-300 shadow-2xs">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                Compliance
              </span>
            </div>

            <div>
              <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 group-hover:text-purple-600 transition">Legal & DPO Officer</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Privacy & fraud reporting</p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 group-hover:bg-purple-50/50 transition">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">compliance@jobshuru.com</span>
                <button
                  type="button"
                  onClick={() => handleCopy("compliance@jobshuru.com")}
                  className="text-slate-400 hover:text-purple-600 transition p-1 cursor-pointer active:scale-90"
                  title="Copy Email"
                >
                  {copiedEmail === "compliance@jobshuru.com" ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-700 font-bold text-xs sm:text-sm pt-0.5">
                <MapPin size={15} className="text-purple-600 shrink-0" />
                <span className="text-slate-900 font-black text-xs sm:text-sm">Cyber City, Gurugram</span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                Data Protection Officer Direct Inbox
              </p>
            </div>
          </div>

        </div>

        {/* 2-Column Section: HQ + FAQs on Left, Animated Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">

            {/* Corporate Headquarters Card - Clear & Readable */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-black text-slate-900">
                      Corporate Headquarters
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-semibold">JobsGhuru Technologies Private Limited</p>
                  </div>
                </div>

                <a
                  href="https://maps.google.com/?q=Cyber+City+Gurugram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition shrink-0 active:scale-95 shadow-2xs"
                >
                  <span>Google Maps</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 text-xs sm:text-sm text-slate-800 space-y-2 leading-relaxed">
                <p className="font-black text-slate-900 text-sm sm:text-base">Cyber City, Tower 4, 12th Floor, Sector 24</p>
                <p className="text-slate-600 font-medium">Gurugram, Haryana - 122002, India</p>
                <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-4 text-slate-600 font-bold text-xs">
                  <span>🏢 CIN: U72900HR2025PTC118940</span>
                  <span>GSTIN: 06AAACJ9940F1Z7</span>
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions - Clear & Readable Typography */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 text-slate-900 font-display">
                <HelpCircle size={22} className="text-blue-600" />
                <h3 className="text-base sm:text-lg font-black">Frequently Asked Questions</h3>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition-all duration-200 hover:border-blue-200"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-4 text-left text-xs sm:text-sm font-extrabold text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:text-blue-600 transition"
                    >
                      <span className="leading-snug">{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 shrink-0 transition-transform duration-300 ${
                          openFaq === idx ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>

                    {openFaq === idx && (
                      <div className="px-4 pb-4 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white animate-in fade-in slide-in-from-top-1 duration-200 font-medium">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Direct Inquiry Form - Larger Inputs & Labels */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-md space-y-5 hover:shadow-lg transition-all duration-300">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  <MessageSquare size={13} />
                  Direct Messaging
                </span>
                <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 pt-1">
                  Send a Direct Inquiry
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Fill out your details and our support team will get back to you within 2 hours.
                </p>
              </div>

              {submitted ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-300">
                  <div className="h-12 w-12 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-extrabold shadow-sm">
                    <CheckCircle2 size={26} />
                  </div>
                  <h4 className="font-display text-base font-black text-emerald-900">
                    Inquiry Sent Successfully!
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-xs mx-auto font-medium">
                    Thank you, <strong>{formState.name || "User"}</strong>. Support Ticket <strong>#JGH-8942</strong> created. Our team will contact <strong>{formState.email}</strong> shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormState({ name: "", email: "", department: "candidate", message: "" });
                    }}
                    className="inline-block mt-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-5 py-2 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1.5 text-xs sm:text-sm">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 font-semibold placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1.5 text-xs sm:text-sm">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 font-semibold placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1.5 text-xs sm:text-sm">Inquiry Department</label>
                    <select
                      value={formState.department}
                      onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 font-extrabold focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 cursor-pointer"
                    >
                      <option value="candidate">Candidate Support & Applications</option>
                      <option value="enterprise">Enterprise Recruiter Sales</option>
                      <option value="legal">Legal, Privacy & DPDP DPO</option>
                      <option value="fraud">Report Scam / Fake Job Listing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-extrabold text-slate-800 mb-1.5 text-xs sm:text-sm">Message Details</label>
                    <textarea
                      rows={3}
                      required
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Describe your query or partnership request..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 font-semibold placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/25 hover:shadow-lg transition duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Sending Inquiry...</span>
                    ) : (
                      <>
                        <Send size={16} />
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
