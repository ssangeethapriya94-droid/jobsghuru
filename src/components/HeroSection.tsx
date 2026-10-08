import { ShieldCheck, Brain, Zap, CheckCircle2, Briefcase, TrendingUp, Star, Sparkles } from "lucide-react";
import HeroSearch from "@/components/HeroSearch";
import HeroAICard from "@/components/HeroAICard";

interface HeroSectionProps {
  totalJobs?: number;
}

export default function HeroSection({ totalJobs = 24 }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-[#EBF3FE] via-[#F4F9FF] to-white pb-12 pt-8 md:pb-16 md:pt-12">
      {/* 1. Subtle High-Tech Grid Pattern with Radial Mask */}
      <div 
        className="tech-grid-pattern pointer-events-none absolute inset-0 opacity-40" 
        style={{ maskImage: "radial-gradient(ellipse 85% 65% at 50% 25%, black 20%, transparent 85%)" }} 
      />

      {/* 2. Vibrant Atmospheric Glowing Orbs */}
      <div className="pointer-events-none absolute -top-32 -left-28 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-blue-400/25 via-sky-300/15 to-transparent blur-3xl animate-pulse-subtle" />
      <div className="pointer-events-none absolute top-1/4 left-1/3 h-[450px] w-[450px] rounded-full bg-indigo-400/15 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -top-24 right-0 h-[620px] w-[620px] rounded-full bg-gradient-to-tr from-blue-600/25 via-sky-400/20 to-indigo-500/15 blur-3xl" />

      {/* 3. Modern Ambient Dynamic Wave Curves */}
      <svg 
        className="pointer-events-none absolute bottom-0 left-0 right-0 w-full opacity-60 overflow-visible" 
        viewBox="0 0 1440 280" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M0 160C320 230 480 90 720 150C960 210 1120 70 1440 130V280H0V160Z" 
          fill="url(#hero-wave-grad)" 
          opacity="0.45"
        />
        <path 
          d="M0 190C360 120 520 220 800 170C1080 120 1240 210 1440 180V280H0V190Z" 
          fill="url(#hero-wave-grad-2)" 
          opacity="0.25"
        />
        <defs>
          <linearGradient id="hero-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="hero-wave-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      <div className="container-x relative z-10">
        {/* Unified 2-Wing Layout: Solves empty middle space & connects AI card directly with the Corner Girl */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1.25fr] xl:grid-cols-[1.05fr_1.3fr] 2xl:grid-cols-[1fr_1.25fr]">
          {/* Wing 1 (Left): Headline, Search & Balanced 2x2 Trust Grid */}
          <div className="rise max-w-xl lg:max-w-none">
            {/* Trusted by 500K+ job seekers Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/95 px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Trusted by 500K+ job seekers</span>
            </div>

            {/* Headline */}
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[40px] xl:text-5xl leading-[1.12]">
              Find the right job.
              <span className="block text-blue-600 mt-1">
                Hear back on every application.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Search verified roles, get AI-powered recommendations, understand your fit, and close your skill gaps before you apply.
            </p>

            {/* Search Bar */}
            <div className="mt-6 max-w-xl">
              <HeroSearch totalJobs={totalJobs} />
            </div>

            {/* Bottom 4 Feature Trust Highlights - Perfectly Balanced 2x2 Grid (No Orphan Line) */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              {/* Verified employers & real jobs */}
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-2.5 shadow-2xs hover:border-blue-200 transition">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-xs font-semibold text-slate-700 leading-tight">
                  Verified employers & real jobs
                </span>
              </div>

              {/* AI-powered matching */}
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-2.5 shadow-2xs hover:border-blue-200 transition">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 shrink-0">
                  <Brain size={16} />
                </div>
                <span className="text-xs font-semibold text-slate-700 leading-tight">
                  AI-powered matching
                </span>
              </div>

              {/* Track applications & get updates */}
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-2.5 shadow-2xs hover:border-blue-200 transition">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-xs font-semibold text-slate-700 leading-tight">
                  Track applications & get updates
                </span>
              </div>

              {/* Faster hiring process */}
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-2.5 shadow-2xs hover:border-blue-200 transition">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 shrink-0">
                  <Zap size={16} />
                </div>
                <span className="text-xs font-semibold text-slate-700 leading-tight">
                  Faster hiring process
                </span>
              </div>
            </div>
          </div>

          {/* Wing 2 (Right): Unified AI Copilot + Corner Girl Visual Hub (Eliminates Empty Middle Void) */}
          <div className="relative flex flex-col md:flex-row items-center lg:items-end justify-end gap-8 lg:gap-10 xl:gap-14 rise [animation-delay:.15s]">
            {/* AI Career Assistant Card — Perfectly proportioned with breathing room */}
            <div className="w-full max-w-[380px] lg:max-w-[360px] xl:max-w-[390px] shrink-0">
              <HeroAICard />
            </div>

            {/* Cutout Professional Woman anchored in the FAR RIGHT CORNER with Geometric Circles */}
            <div className="relative flex w-full max-w-[330px] sm:max-w-[360px] lg:max-w-[370px] xl:max-w-[400px] items-end justify-end shrink-0 pt-6">
              {/* Graphic Background Art - Intersecting Vivid Blue Circles & Rings (Clean, NO AI READY badge) */}
              <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
                {/* Primary Deep Royal Blue Graphic Disc */}
                <div className="h-[290px] w-[290px] sm:h-[350px] sm:w-[350px] lg:h-[380px] lg:w-[380px] rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 opacity-95 shadow-[0_25px_65px_-12px_rgba(29,78,216,0.55)]" />

                {/* Intersecting Thin White Geometric Ring */}
                <div className="absolute h-[320px] w-[320px] sm:h-[390px] sm:w-[390px] lg:h-[420px] lg:w-[420px] rounded-full border-2 border-white/80 -translate-x-6 -translate-y-4" />

                {/* Secondary Accent Cyan Dash Ring */}
                <div className="absolute h-[350px] w-[350px] sm:h-[420px] sm:w-[420px] lg:h-[450px] lg:w-[450px] rounded-full border border-sky-300/40 translate-x-4 translate-y-3" />

                {/* Radiant Ambient Core Glow */}
                <div className="absolute h-[250px] w-[250px] sm:h-[320px] sm:w-[320px] rounded-full bg-sky-300/40 blur-3xl -translate-y-8 translate-x-6" />
              </div>

              {/* Cutout Image of Woman — Breaking out of circle boundary into right corner */}
              <div className="relative z-10 select-none pointer-events-none drop-shadow-[0_20px_35px_rgba(15,23,42,0.22)]">
                <img
                  src="/hero-woman.png"
                  alt="Smiling Indian professional woman with laptop in the corner"
                  className="h-[410px] sm:h-[470px] lg:h-[500px] xl:h-[520px] w-auto max-w-none object-contain"
                />
              </div>

              {/* Floating Badge 1: Better Jobs — Placed neatly on the woman's shoulder without invading AI card space */}
              <div className="absolute top-10 left-1 sm:left-3 z-20 flex items-center gap-2.5 rounded-2xl border border-white/95 bg-white/95 px-3 py-1.5 shadow-[0_12px_28px_-4px_rgba(15,23,42,0.12),0_4px_8px_-2px_rgba(15,23,42,0.06)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-blue-200 animate-float pointer-events-auto cursor-pointer">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xs shrink-0">
                  <Briefcase size={14} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 tracking-tight leading-tight">Better Jobs</div>
                  <div className="text-[10px] font-semibold text-blue-600">Top Tier Verified</div>
                </div>
              </div>

              {/* Floating Badge 2: Career Growth — Placed on the open RIGHT side of the woman, completely separated from AI card */}
              <div className="absolute top-[42%] -right-2 sm:-right-4 z-20 flex items-center gap-2.5 rounded-2xl border border-white/95 bg-white/95 px-3 py-1.5 shadow-[0_12px_28px_-4px_rgba(15,23,42,0.12),0_4px_8px_-2px_rgba(15,23,42,0.06)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-emerald-200 animate-float-delayed pointer-events-auto cursor-pointer">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xs shrink-0">
                  <TrendingUp size={14} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 tracking-tight leading-tight">Career Growth</div>
                  <div className="text-[10px] font-semibold text-emerald-600">+45% Salary Jump</div>
                </div>
              </div>

              {/* Floating Badge 3: More Opportunities — Placed neatly on lower left */}
              <div className="absolute bottom-10 left-1 sm:left-3 z-20 flex items-center gap-2.5 rounded-2xl border border-white/95 bg-white/95 px-3 py-1.5 shadow-[0_12px_28px_-4px_rgba(15,23,42,0.12),0_4px_8px_-2px_rgba(15,23,42,0.06)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-amber-200 animate-float pointer-events-auto cursor-pointer">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-xs shrink-0">
                  <Star size={14} className="fill-white text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 tracking-tight leading-tight">More Opportunities</div>
                  <div className="text-[10px] font-semibold text-amber-600">500+ New Roles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

