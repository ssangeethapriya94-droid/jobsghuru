"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  Database,
  Send,
  Users,
  Search,
  Check,
  Building,
  Briefcase,
  Layers,
  Phone,
  MessageSquare,
  Bot,
  Zap,
  Clock,
  Award,
  ChevronRight,
  Sliders,
  DollarSign,
  TrendingUp,
  MapPin,
  Lock,
} from "lucide-react";

export default function NaukriStyleEmployerHero() {
  const router = useRouter();
  const [userType, setUserType] = useState<"new" | "existing">("new");
  const [mobileOrEmail, setMobileOrEmail] = useState("");
  const [whatsappAgree, setWhatsappAgree] = useState(true);
  const [termsAgree, setTermsAgree] = useState(true);

  // Interactive Talent Radar State
  const [selectedRole, setSelectedRole] = useState("Full Stack Developer");
  const [selectedCity, setSelectedCity] = useState("All India");

  // Pricing & Vacancy State
  const [hotVacancyQty, setHotVacancyQty] = useState(2);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  // Interactive ROI Calculator State
  const [annualHires, setAnnualHires] = useState(6);

  const sampleRoles = [
    { title: "Full Stack Developer", candidates: 48, stack: "React, Node.js, TS, Postgres" },
    { title: "React / Next.js Frontend", candidates: 64, stack: "Next.js 14, Tailwind, Redux" },
    { title: "Backend (Node / Python / Go)", candidates: 52, stack: "Go, Python, Microservices" },
    { title: "DevOps & Cloud Architect", candidates: 32, stack: "AWS, Kubernetes, Docker, CI/CD" },
    { title: "AI & ML Engineer", candidates: 29, stack: "Python, PyTorch, LLMs, LangChain" },
    { title: "B2B Sales & Growth", candidates: 36, stack: "SaaS, Enterprise BD, Pipeline Mgmt" },
  ];

  const cities = ["All India", "Bengaluru", "Chennai", "Hyderabad", "Pune", "Mumbai", "Delhi-NCR", "Remote"];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === "existing") {
      router.push(`/employer/login?email=${encodeURIComponent(mobileOrEmail)}`);
    } else {
      router.push(`/employers/register?contact=${encodeURIComponent(mobileOrEmail)}`);
    }
  };

  // Hot Vacancy Dynamic Price
  const perVacancyBase = 1499;
  const discountMultiplier =
    hotVacancyQty >= 20 ? 0.7 : hotVacancyQty >= 10 ? 0.75 : hotVacancyQty >= 5 ? 0.85 : 1.0;
  const hotVacancyPrice = Math.round(hotVacancyQty * perVacancyBase * discountMultiplier);

  // ROI Calculations
  const legacyAgencyCost = annualHires * 120000; // avg 1.2L agency fee per hire
  const platformCost = annualHires * 15000;
  const costSavings = legacyAgencyCost - platformCost;
  const daysSaved = annualHires * 18; // 18 days faster per hire

  return (
    <div className="space-y-20">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: VASTLY SUPERIOR TO NAUKRI RECRUITER (FULL-WIDTH LUXURY)  */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden border-b border-slate-200/90 bg-gradient-to-b from-blue-950/[0.04] via-slate-50/50 to-white py-14 lg:py-24">
        {/* Subtle decorative glow circles */}
        <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Value Proposition & Interactive Talent Pulse */}
            <div className="lg:col-span-7 space-y-7">
              {/* Top Tagline Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-200/80 bg-white px-4 py-1.5 shadow-xs">
                <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-950">
                  ⚡ Jobsghuru Talent Cloud · Next-Gen Enterprise Hiring
                </span>
                <span className="hidden sm:inline-block rounded-md bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 uppercase">
                  Better than Naukri
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
                  Find & hire verified talent <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                    3x faster with zero ghosting
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                  Trusted by <strong>10,000+ pre-evaluated tech professionals</strong> and <strong>500+ verified Indian enterprises</strong>. 100% verified corporate credentials, explainable AI matching, and an enforceable <strong>94.8% candidate response SLA</strong>.
                </p>
              </div>

              {/* Verified Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1 border-y border-slate-200/70">
                <div className="py-2">
                  <div className="text-2xl font-black text-slate-950">10,000+</div>
                  <div className="text-xs text-slate-500 font-medium">Pre-Evaluated Candidates</div>
                </div>
                <div className="py-2 border-l border-slate-200/70 pl-3">
                  <div className="text-2xl font-black text-blue-600">94.8%</div>
                  <div className="text-xs text-slate-500 font-medium">Candidate Response Rate</div>
                </div>
                <div className="py-2 border-l border-slate-200/70 pl-3">
                  <div className="text-2xl font-black text-emerald-600">18 Mins</div>
                  <div className="text-xs text-slate-500 font-medium">Avg. Time to 1st Applicant</div>
                </div>
                <div className="py-2 border-l border-slate-200/70 pl-3">
                  <div className="text-2xl font-black text-indigo-600">0% Fake</div>
                  <div className="text-xs text-slate-500 font-medium">MCA & GSTIN Verified</div>
                </div>
              </div>

              {/* Hero Platform Showcase PNG Image Card */}
              <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-2 sm:p-3 shadow-md hover:shadow-xl transition duration-300 overflow-hidden">
                <img
                  src="/images/employer_hero_banner.png"
                  alt="JobsGhuru Smart Enterprise Recruitment & Verified Tech Candidates Platform"
                  className="w-full h-auto rounded-2xl object-cover shadow-2xs border border-slate-100"
                />
              </div>

              {/* Interactive Talent Radar / Live Talent Pulse */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Live Pre-Screened Talent Availability</span>
                  </div>
                  {/* City Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1">
                    {cities.slice(0, 5).map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setSelectedCity(city)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition ${
                          selectedCity === city
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role Selector Chips */}
                <div className="flex flex-wrap gap-2">
                  {sampleRoles.map((role) => (
                    <button
                      key={role.title}
                      type="button"
                      onClick={() => setSelectedRole(role.title)}
                      className={`text-xs px-3.5 py-2 rounded-xl border transition flex items-center gap-2.5 ${
                        selectedRole === role.title
                          ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs scale-102"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <span>{role.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          selectedRole === role.title
                            ? "bg-blue-800 text-white"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {role.candidates} ready
                      </span>
                    </button>
                  ))}
                </div>

                {/* Selected Role Insight Summary */}
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Sparkles size={14} className="text-blue-600 shrink-0" />
                    <span>
                      Active in <strong>{selectedCity}</strong>:{" "}
                      <span className="text-slate-500">
                        {sampleRoles.find((r) => r.title === selectedRole)?.stack}
                      </span>
                    </span>
                  </div>
                  <Link
                    href={`/employers/register?role=${encodeURIComponent(selectedRole)}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 shrink-0"
                  >
                    Unlock Candidate Dossiers <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Quick Recruiter Gateway Card (Vastly Superior to Naukri's form) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl">
                {/* Header with Verified Badge */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                      CB
                    </div>
                    <div>
                      <div className="font-display text-base font-bold text-slate-900 leading-snug">
                        Recruiter Onboarding Gateway
                      </div>
                      <div className="text-[11px] text-slate-500">Official Employer Portal Access</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck size={12} /> Instant Setup
                  </span>
                </div>

                <form onSubmit={handleQuickSubmit} className="mt-6 space-y-5 text-xs">
                  {/* Mode Switch: New User vs Existing User */}
                  <div className="flex rounded-xl border border-slate-200 bg-slate-100/80 p-1 text-xs font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={() => setUserType("new")}
                      className={`flex-1 rounded-lg py-2.5 text-center transition font-bold ${
                        userType === "new"
                          ? "bg-white text-blue-700 shadow-xs border border-slate-200/70"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      New Employer (Register)
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserType("existing")}
                      className={`flex-1 rounded-lg py-2.5 text-center transition font-bold ${
                        userType === "existing"
                          ? "bg-white text-blue-700 shadow-xs border border-slate-200/70"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Existing Recruiter (Sign In)
                    </button>
                  </div>

                  {/* Input: Mobile Number or Corporate Work Email */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5 text-xs">
                      {userType === "new"
                        ? "Official Corporate Work Email or Mobile Number *"
                        : "Registered Recruiter Work Email *"}
                    </label>
                    <div className="relative flex rounded-xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 overflow-hidden bg-white transition">
                      <span className="flex items-center bg-slate-50 border-r border-slate-200 px-3.5 text-slate-700 font-semibold text-xs shrink-0">
                        +91 🇮🇳
                      </span>
                      <input
                        type="text"
                        required
                        value={mobileOrEmail}
                        onChange={(e) => setMobileOrEmail(e.target.value)}
                        placeholder={
                          userType === "new"
                            ? "98450 12345 or recruiter@company.com"
                            : "recruiter@company.com"
                        }
                        className="w-full py-3 px-3.5 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      {userType === "new"
                        ? "We cross-reference MCA & GST registries to keep Jobsghuru 100% scam-free."
                        : "Enter your registered corporate credentials to manage applications & interviews."}
                    </p>
                  </div>

                  {/* Consents */}
                  <div className="space-y-2 pt-1 text-[11px] text-slate-600">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={whatsappAgree}
                        onChange={(e) => setWhatsappAgree(e.target.checked)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Receive real-time applicant alerts & interview RSVPs on <strong>WhatsApp</strong></span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAgree}
                        onChange={(e) => setTermsAgree(e.target.checked)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>
                        I accept the{" "}
                        <Link href="/terms" className="text-blue-600 font-semibold hover:underline">
                          Privacy Policy
                        </Link>{" "}
                        and agree to the verified{" "}
                        <Link href="/terms" className="text-blue-600 font-semibold hover:underline">
                          Fair Hiring SLA
                        </Link>
                      </span>
                    </label>
                  </div>

                  {/* CTA Button */}
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-98 transition flex items-center justify-center gap-2"
                  >
                    <span>
                      {userType === "new" ? "Verify & Continue to Registration" : "Log In to Recruiter ATS"}
                    </span>
                    <ArrowRight size={15} />
                  </button>
                </form>

                {/* Footer Trust Markers */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    MCA & GST Verified
                  </span>
                  <span>SSL 256-bit Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE 3-TIER HIRING PACKAGES (OUTPERFORMING NAUKRI SCREENSHOT 2)          */}
      {/* ========================================================================= */}
      <section className="py-8">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              Transparent Corporate Pricing
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Job posting & candidate resume database packages
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Unlike legacy portals with hidden pricing and aggressive telemarketer calls, Jobsghuru offers 100% self-serve corporate packages with transparent GST invoicing and instant activation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* CARD 1: HOT VACANCY (INBOUND JOB POSTING) */}
            <div className="rounded-3xl border-2 border-blue-600 bg-white p-8 shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3.5 left-8 rounded-full bg-blue-600 px-3.5 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Flame size={13} />
                <span>Most Popular for Urgent Sourcing</span>
              </div>

              <div className="space-y-5">
                <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Inbound Talent Acquisition
                </div>
                <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-display text-2xl font-extrabold text-slate-900">Hot Vacancy</h3>
                    <p className="text-xs text-slate-500">Pinned top placement across feeds</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-slate-900">
                      ₹{hotVacancyPrice.toLocaleString("en-IN")}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">+ 18% GST Applicable</span>
                  </div>
                </div>

                {/* Quantity selector */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs">
                  <span className="font-semibold text-slate-700">Vacancies Quantity:</span>
                  <select
                    value={hotVacancyQty}
                    onChange={(e) => setHotVacancyQty(Number(e.target.value))}
                    className="rounded-lg border border-slate-300 bg-white py-1 px-3 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value={2}>02 Hot Vacancies</option>
                    <option value={5}>05 Hot Vacancies (Save 15%)</option>
                    <option value={10}>10 Hot Vacancies (Save 25%)</option>
                    <option value={20}>20 Hot Vacancies (Save 30%)</option>
                  </select>
                </div>

                {/* Key Features */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Package Features:
                  </div>
                  <ul className="space-y-2.5 text-slate-700">
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Detailed job description</strong> with full tech stack chips & compensation</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Up to 3 job locations</strong> per active posting across India</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Unlimited inbound applications</strong> with zero artificial limits</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Explainable AI Match</strong> scorecards generated for every applicant</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  href={`/employers/register?plan=GROWTH&type=hot_vacancy&qty=${hotVacancyQty}`}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 text-xs font-bold text-white shadow-xs transition flex items-center justify-center gap-2"
                >
                  <span>Purchase Hot Vacancy Slots</span>
                  <ArrowRight size={14} />
                </Link>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  Postings valid for 30 active days from publishing
                </p>
              </div>
            </div>

            {/* CARD 2: RESDEX RESUME DATABASE (PROACTIVE TALENT SEARCH) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-5">
                <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Outbound Headhunting
                </div>
                <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-display text-2xl font-extrabold text-slate-900">Jobsghuru Resdex</h3>
                    <p className="text-xs text-slate-500">Direct Candidate Resume Database</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">₹4,999</div>
                    <span className="text-[10px] text-slate-400">Monthly / 250 CVs</span>
                  </div>
                </div>

                {/* Key Features */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Database Capabilities:
                  </div>
                  <ul className="space-y-2.5 text-slate-700">
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>250 candidate CV downloads & phone unlocks</strong> included per month</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>Unlimited search queries</strong> across 10,000+ verified professionals</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>20+ fine-grained filters:</strong> notice period, tech stack, CTC range</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>Multi-seat recruiter access:</strong> collaborate with team members</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  href="/employers/plans"
                  className="w-full rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 py-3.5 text-xs font-bold text-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <span>Explore Resdex Subscriptions</span>
                  <ArrowRight size={14} />
                </Link>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  Direct candidate outreach via WhatsApp & Email
                </p>
              </div>
            </div>

            {/* CARD 3: FREE JOB POSTING (STARTER TIER) */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  For Startups & First-Time Hirers
                </div>
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="font-display text-2xl font-extrabold text-slate-900">Starter Requisition</h3>
                    <p className="text-xs text-slate-500">Zero cost for verified domains</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-emerald-600">₹0 Free</div>
                    <span className="text-[10px] text-slate-400 font-medium">Forever Starter</span>
                  </div>
                </div>

                {/* Key Features */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Starter Inclusions:
                  </div>
                  <ul className="space-y-2.5 text-slate-700">
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Up to 3 active job postings</strong> simultaneously</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Standard applicant feed distribution</strong> on public portal</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Built-in ATS pipeline</strong> & interview scheduling tool</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Verified Business Badge</strong> after MCA & GST check</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200">
                <Link
                  href="/employers/register?plan=STARTER"
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-3.5 text-xs font-bold text-white transition flex items-center justify-center gap-2"
                >
                  <span>Post a Free Requisition</span>
                  <ArrowRight size={14} />
                </Link>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  Requires official work email domain (No Gmail/Yahoo)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE ROI & SAVINGS CALCULATOR (EXCLUSIVE JOBSGHURU FEATURE)       */}
      {/* ========================================================================= */}
      <section className="py-12 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl mx-4 sm:mx-8 xl:mx-12 overflow-hidden shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 px-3 py-1 rounded-full border border-blue-700/50">
              Interactive Value Telemetry
            </span>
            <h2 className="font-display text-3xl font-extrabold text-white">
              Calculate Your Annual Hiring Savings vs. Legacy Channels
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              See how replacing manual agencies and noisy legacy job boards saves hundreds of engineering hours and lakhs in placement fees.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Slider Control */}
            <div className="lg:col-span-6 space-y-6 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Roles Your Team Hires Annually:
                  </label>
                  <span className="font-display text-2xl font-black text-blue-400">
                    {annualHires} Positions
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={annualHires}
                  onChange={(e) => setAnnualHires(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>1 Role</span>
                  <span>10 Roles</span>
                  <span>20 Roles</span>
                  <span>30+ Roles</span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Eliminates expensive 8.33%–12.5% recruitment agency contingency fees</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Cuts average engineering interview time from 42 days to 14 days</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Automated ATS scorecards & WhatsApp RSVP reminders</span>
                </div>
              </div>
            </div>

            {/* Right Projected Savings Dashboard */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-blue-500/30 bg-blue-600/20 p-6 backdrop-blur-md">
                <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                  Estimated Agency Fees Saved
                </div>
                <div className="mt-2 text-3xl font-black text-white">
                  ₹{(costSavings / 100000).toFixed(1)} Lakhs
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Compared to traditional 1-month salary agency commission.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-600/20 p-6 backdrop-blur-md">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Time-to-Hire Velocity
                </div>
                <div className="mt-2 text-3xl font-black text-white">
                  {daysSaved} Days Saved
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Cumulative engineering days reclaimed from resume screening.
                </p>
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs">
                  <div className="font-bold text-white">Ready to streamline your talent pipeline?</div>
                  <div className="text-slate-400 text-[11px]">Deploy Jobsghuru across your recruitment team today.</div>
                </div>
                <Link
                  href="/employers/register"
                  className="rounded-xl bg-blue-500 hover:bg-blue-400 px-5 py-2.5 text-xs font-bold text-slate-950 transition shrink-0"
                >
                  Start Hiring Now →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHY WE ARE BETTER THAN NAUKRI & LEGACY JOB BOARDS (FULL-WIDTH MATRIX)  */}
      {/* ========================================================================= */}
      <section className="py-8">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              The Jobsghuru Difference
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why leading enterprises switch from Naukri to Jobsghuru
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Legacy job boards were built in 2005 for keyword matching. Jobsghuru is built for 2026 with explainable AI, verified credentials, and multi-channel candidate delivery.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Hiring Capability</th>
                    <th className="py-4 px-6 font-bold text-blue-700 uppercase tracking-wider text-xs bg-blue-50/60">
                      ⚡ Jobsghuru Talent Platform
                    </th>
                    <th className="py-4 px-6 font-bold text-slate-400 uppercase tracking-wider text-xs">
                      Legacy Portals (Naukri, Monster)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      Ghost & Fraudulent Job Postings
                    </td>
                    <td className="py-4 px-6 bg-blue-50/20 font-bold text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>100% Zero-Tolerance: Mandatory MCA, GSTIN & Corporate Admin Verification</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      Plagued with expired listings, duplicate postings & unauthorized consultancy spam
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      Resume Screening & Matching
                    </td>
                    <td className="py-4 px-6 bg-blue-50/20 font-bold text-blue-700">
                      Explainable AI Skill Analysis (Code evidence, experience depth, framework coverage)
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      Primitive text regex (easily bypassed by candidate keyword copy-pasting)
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      Applicant Tracking System (ATS)
                    </td>
                    <td className="py-4 px-6 bg-blue-50/20 font-bold text-blue-700">
                      Integrated 8-Stage Kanban, Collaborative Evaluation Scorecards & Direct Scheduling
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      Manual Excel CSV downloads, lost resumes & disconnected email threads
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      Candidate Response Rate
                    </td>
                    <td className="py-4 px-6 bg-blue-50/20 font-bold text-emerald-700">
                      94.8% SLA Enforcement via Automated WhatsApp, Email & Portal Notifications
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      Over 80% ghosting rate; applicants frequently ignore recruiter inquiries
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      Pricing & Transparency
                    </td>
                    <td className="py-4 px-6 bg-blue-50/20 font-bold text-blue-700">
                      100% Self-Serve Upfront Pricing in INR with Instant Checkout & GST Invoices
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      Opaque "Contact Sales" quotes, variable pricing & aggressive telemarketing calls
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
