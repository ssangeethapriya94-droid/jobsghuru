import { ShieldCheck, Brain, Zap, CheckCircle2, Briefcase, TrendingUp, Star, Sparkles, Building2, Users, ArrowUpRight } from "lucide-react";
import HeroSearch from "@/components/HeroSearch";
import HeroAICard from "@/components/HeroAICard";

interface HeroSectionProps {
  totalJobs?: number;
}

export default function HeroSection({ totalJobs = 24 }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-[#EBF3FE] via-[#F4F8FF] to-white pb-14 pt-8 md:pb-20 md:pt-14">
      {/* 1. Subtle High-Tech Grid Pattern with Radial Mask */}
      <div 
        className="tech-grid-pattern pointer-events-none absolute inset-0 opacity-40" 
        style={{ maskImage: "radial-gradient(ellipse 85% 65% at 50% 25%, black 20%, transparent 85%)" }} 
      />

      {/* 2. Vibrant Atmospheric Glowing Orbs */}
      <div className="pointer-events-none absolute -top-32 -left-28 h-[580px] w-[580px] rounded-full bg-gradient-to-br from-blue-400/30 via-sky-300/20 to-transparent blur-3xl animate-pulse-subtle" />
      <div className="pointer-events-none absolute top-1/4 left-1/3 h-[480px] w-[480px] rounded-full bg-indigo-400/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -top-24 right-0 h-[650px] w-[650px] rounded-full bg-gradient-to-tr from-blue-600/30 via-sky-400/25 to-indigo-500/20 blur-3xl" />

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
        {/* Unified 2-Wing Layout: Solves empty middle space & connects AI card directly with the Corner Visual */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1.25fr] xl:grid-cols-[1.05fr_1.3fr] 2xl:grid-cols-[1fr_1.25fr]">
          {/* Wing 1 (Left): Headline, Search & Balanced 2x2 Trust Grid */}
          <div className="rise max-w-xl lg:max-w-none">
            {/* Trusted Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/90 bg-white/95 px-4 py-1.5 text-xs font-bold text-slate-800 shadow-xs backdrop-blur-md transition-transform hover:scale-[1.02]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="tracking-tight">Trusted by <strong className="text-blue-700">500K+</strong> job seekers & <strong className="text-blue-700">12K+</strong> employers</span>
            </div>

            {/* Headline */}
            <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] xl:text-5xl leading-[1.15]">
              Find the right job.
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent mt-1 pb-1">
                Hear back on every application.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
              Search verified roles, get AI-powered recommendations, understand your fit, and close your skill gaps before you apply.
            </p>

            {/* Search Bar */}
            <div className="mt-6 max-w-xl">
              <HeroSearch totalJobs={totalJobs} />
            </div>

            {/* Bottom 4 Feature Trust Highlights - Glass 2x2 Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl">
              {/* Verified employers & real jobs */}
              <div className="group flex items-center gap-3 rounded-2xl border border-blue-100/80 bg-white/90 backdrop-blur-md p-3 shadow-2xs hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    Verified Employers
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">100% genuine active jobs</span>
                </div>
              </div>

              {/* AI-powered matching */}
              <div className="group flex items-center gap-3 rounded-2xl border border-blue-100/80 bg-white/90 backdrop-blur-md p-3 shadow-2xs hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Brain size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    AI-Powered Matching
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">Instant fit score analysis</span>
                </div>
              </div>

              {/* Track applications & get updates */}
              <div className="group flex items-center gap-3 rounded-2xl border border-blue-100/80 bg-white/90 backdrop-blur-md p-3 shadow-2xs hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <CheckCircle2 size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    Guaranteed Status Updates
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">Track every application</span>
                </div>
              </div>

              {/* Faster hiring process */}
              <div className="group flex items-center gap-3 rounded-2xl border border-blue-100/80 bg-white/90 backdrop-blur-md p-3 shadow-2xs hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Zap size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    Faster Hiring Pipeline
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">Direct Recruiter reach</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wing 2 (Right): Unified AI Copilot + Corner Professional Visual Hub */}
          <div className="relative flex flex-col md:flex-row items-center lg:items-end justify-end gap-8 lg:gap-10 xl:gap-14 rise [animation-delay:.15s] mt-4 lg:mt-0">
            {/* AI Career Assistant Card — Floating glass elevation */}
            <div className="w-full max-w-[380px] lg:max-w-[360px] xl:max-w-[390px] shrink-0 z-20">
              <HeroAICard />
            </div>

            {/* Cutout Professional Woman anchored with Graphic Circles */}
            <div className="relative flex w-full max-w-[330px] sm:max-w-[360px] lg:max-w-[370px] xl:max-w-[400px] items-end justify-end shrink-0 pt-6">
              {/* Graphic Background Art - Intersecting Vivid Blue Circles & Rings */}
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
                  alt="Smiling Indian professional woman with laptop"
                  className="h-[410px] sm:h-[470px] lg:h-[500px] xl:h-[520px] w-auto max-w-none object-contain"
                />
              </div>

              {/* Floating Badge 1: Better Jobs */}
              <div className="absolute top-10 left-1 sm:left-3 z-20 flex items-center gap-3 rounded-2xl border border-white/95 bg-white/95 px-3.5 py-2 shadow-[0_12px_28px_-4px_rgba(15,23,42,0.14)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-blue-300 animate-float pointer-events-auto cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xs shrink-0">
                  <Briefcase size={15} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold text-slate-900 tracking-tight leading-tight">Better Jobs</div>
                  <div className="text-[10px] font-bold text-blue-600">Top Tier Verified</div>
                </div>
              </div>

              {/* Floating Badge 2: Career Growth */}
              <div className="absolute top-[42%] -right-2 sm:-right-4 z-20 flex items-center gap-3 rounded-2xl border border-white/95 bg-white/95 px-3.5 py-2 shadow-[0_12px_28px_-4px_rgba(15,23,42,0.14)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-emerald-300 animate-float-delayed pointer-events-auto cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xs shrink-0">
                  <TrendingUp size={15} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold text-slate-900 tracking-tight leading-tight">Career Growth</div>
                  <div className="text-[10px] font-bold text-emerald-600">+45% Salary Jump</div>
                </div>
              </div>

              {/* Floating Badge 3: More Opportunities */}
              <div className="absolute bottom-10 left-1 sm:left-3 z-20 flex items-center gap-3 rounded-2xl border border-white/95 bg-white/95 px-3.5 py-2 shadow-[0_12px_28px_-4px_rgba(15,23,42,0.14)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-amber-300 animate-float pointer-events-auto cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-xs shrink-0">
                  <Star size={15} className="fill-white text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold text-slate-900 tracking-tight leading-tight">More Opportunities</div>
                  <div className="text-[10px] font-bold text-amber-600">500+ New Roles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

