"use me";
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Globe,
  ArrowRight,
  Building,
  Laptop,
  Compass,
  CheckCircle2,
  Sparkles,
  Cloud,
  Code2,
  Briefcase,
  Navigation,
} from "lucide-react";

interface CityLocation {
  id: string;
  name: string;
  query: string;
  state: string;
  jobsCount: number;
  highlight: string;
  mode: string;
  isRemote?: boolean;
  category: "remote" | "south" | "west";
  tag: string;
  gradient: string;
  icon: any;
  accentBg: string;
}

const featuredLocations: CityLocation[] = [
  {
    id: "remote",
    name: "Remote / Pan-India",
    query: "Remote",
    state: "Apply from any city in India",
    jobsCount: 8,
    highlight: "100% remote flexibility with verified home-office equipment stipends & flexible hours.",
    mode: "Work From Anywhere",
    isRemote: true,
    category: "remote",
    tag: "🌐 100% Remote",
    gradient: "from-blue-600 to-indigo-600",
    icon: Globe,
    accentBg: "bg-blue-500/10 border-blue-200 text-blue-700",
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    query: "Bengaluru",
    state: "Karnataka",
    jobsCount: 4,
    highlight: "India's Silicon Valley. AI Research, Fintech, SaaS Unicorns & DeepTech Engineering.",
    mode: "On-site & Hybrid",
    category: "south",
    tag: "⚡ Tech Capital",
    gradient: "from-violet-600 to-purple-600",
    icon: Sparkles,
    accentBg: "bg-purple-500/10 border-purple-200 text-purple-700",
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    query: "Hyderabad",
    state: "Telangana",
    jobsCount: 4,
    highlight: "Cyberabad Cloud Hub. Cloud Infrastructure, DevOps & Global Tech Captives.",
    mode: "On-site & Hybrid",
    category: "south",
    tag: "☁️ Cloud & DevOps",
    gradient: "from-cyan-600 to-blue-600",
    icon: Cloud,
    accentBg: "bg-cyan-500/10 border-cyan-200 text-cyan-700",
  },
  {
    id: "chennai",
    name: "Chennai",
    query: "Chennai",
    state: "Tamil Nadu",
    jobsCount: 8,
    highlight: "SaaS Capital of India. Global Enterprise Product Hubs & Core Engineering.",
    mode: "On-site & Hybrid",
    category: "south",
    tag: "💻 SaaS & Product",
    gradient: "from-emerald-600 to-teal-600",
    icon: Code2,
    accentBg: "bg-emerald-500/10 border-emerald-200 text-emerald-700",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    query: "Mumbai",
    state: "Maharashtra",
    jobsCount: 4,
    highlight: "Financial & Commercial Center. BFSI, Fintech, Enterprise Platforms & Logistics.",
    mode: "On-site & Hybrid",
    category: "west",
    tag: "🏢 BFSI & Fintech",
    gradient: "from-amber-600 to-orange-600",
    icon: Briefcase,
    accentBg: "bg-amber-500/10 border-amber-200 text-amber-800",
  },
  {
    id: "pune",
    name: "Pune",
    query: "Pune",
    state: "Maharashtra",
    jobsCount: 4,
    highlight: "Automotive & Data Analytics Capital. AI Modelling, Product Design & Engineering.",
    mode: "On-site & Hybrid",
    category: "west",
    tag: "📊 Data & AI Hub",
    gradient: "from-rose-600 to-pink-600",
    icon: Compass,
    accentBg: "bg-rose-500/10 border-rose-200 text-rose-700",
  },
];

export default function LocationExplorer({ title, subtitle }: { title?: string; subtitle?: string }) {
  const [activeTab, setActiveTab] = useState<"all" | "remote" | "south" | "west">("all");

  const filteredLocations = featuredLocations.filter((loc) => {
    if (activeTab === "all") return true;
    return loc.category === activeTab;
  });

  return (
    <section className="container-x my-16 scroll-mt-24 font-sans">
      {/* Header with Glass Gradient Accent */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl overflow-hidden mb-8">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 h-40 w-40 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-300 backdrop-blur-md">
              <Navigation size={13} className="text-blue-400 animate-pulse" />
              <span>Pan-India Career Locations</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {title || "Explore Jobs by Location & City"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {subtitle || "Candidates from all locations across India can apply to verified roles in tech capitals or work 100% remotely."}
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 text-xs sm:text-sm font-extrabold text-white backdrop-blur-md transition shadow-md hover:scale-105 shrink-0"
          >
            <span>View all 24 openings</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Interactive Filter Pills */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Career Hubs", count: 32 },
            { id: "remote", label: "🌐 100% Remote Roles", count: 8 },
            { id: "south", label: "⚡ South Tech Hubs (BLR, HYD, MAA)", count: 16 },
            { id: "west", label: "🏢 West Enterprise Hubs (BOM, PNQ)", count: 8 },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-400/30 font-extrabold"
                  : "bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cities - 6 Columns on XL */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {filteredLocations.map((loc) => {
          const LocIcon = loc.icon;
          return (
            <Link
              key={loc.name}
              href={`/jobs?location=${encodeURIComponent(loc.query)}`}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                loc.isRemote
                  ? "border-blue-300 bg-gradient-to-b from-blue-50/90 via-white to-white hover:border-blue-600 hover:shadow-blue-600/15 ring-1 ring-blue-500/20"
                  : "border-slate-200/90 bg-white hover:border-blue-500 hover:shadow-slate-900/10"
              }`}
            >
              <div>
                {/* Header Icon + Jobs Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${loc.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110 shrink-0`}
                  >
                    <LocIcon size={22} />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold shrink-0 ${
                      loc.isRemote
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-800 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors"
                    }`}
                  >
                    {loc.isRemote && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />}
                    <span>{loc.jobsCount} Jobs</span>
                  </span>
                </div>

                {/* City Title & State */}
                <div className="mt-4">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mb-1.5 ${loc.accentBg}`}>
                    {loc.tag}
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{loc.state}</p>
                </div>

                {/* Description Highlight */}
                <p className="mt-3 text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
                  {loc.highlight}
                </p>
              </div>

              {/* Bottom Mode Pill & Arrow */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5 text-[11px]">
                  {loc.isRemote ? (
                    <Laptop size={13} className="text-blue-600" />
                  ) : (
                    <Building size={13} className="text-slate-400" />
                  )}
                  <span>{loc.mode}</span>
                </span>

                <span className="inline-flex items-center gap-1 font-extrabold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Cross-city Application Notice Banner */}
      <div className="mt-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-indigo-900/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            <strong className="text-white font-extrabold">Applying from another city?</strong> All 8 Remote roles accept candidates nationwide. Hybrid and on-site employers offer relocation support where marked.
          </p>
        </div>

        <Link
          href="/jobs?location=Remote"
          className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs px-5 py-3 shadow-md shadow-emerald-500/20 hover:scale-105 transition active:scale-95 shrink-0 whitespace-nowrap"
        >
          See All Pan-India Remote Roles
        </Link>
      </div>
    </section>
  );
}
