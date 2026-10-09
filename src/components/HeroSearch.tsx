"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, X, ChevronDown, ArrowRight, Sparkles } from "lucide-react";

const popularQueries = [
  { label: "Bengaluru", location: "Bengaluru" },
  { label: "Chennai", location: "Chennai" },
  { label: "Remote", location: "Remote" },
  { label: "React Developer", query: "react" },
  { label: "Full Stack", query: "full stack" },
  { label: "High Pay (>10 LPA)", salary: "10" },
];

const locations = [
  "All Locations",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Mumbai",
  "Delhi NCR",
  "Remote",
];

export default function HeroSearch({ totalJobs = 24 }: { totalJobs?: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (location && location !== "All Locations" && location !== "Location") {
      params.set("location", location);
    }
    router.push(`/jobs?${params.toString()}`);
  };

  const handleChipClick = (chip: { label: string; query?: string; mode?: string; type?: string; salary?: string; verified?: string; location?: string }) => {
    setActiveChip(chip.label);
    const params = new URLSearchParams();
    if (chip.query) params.set("q", chip.query);
    if (chip.location) params.set("location", chip.location);
    if (chip.mode) params.set("mode", chip.mode);
    if (chip.type) params.set("type", chip.type);
    if (chip.salary) params.set("salary", chip.salary);
    if (chip.verified) params.set("verified", chip.verified);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSearch}
        className="group relative flex flex-col gap-2.5 rounded-2xl border border-blue-100/90 bg-white/95 p-2.5 shadow-[0_14px_35px_-8px_rgba(37,99,235,0.12),0_4px_12px_-2px_rgba(15,23,42,0.04)] backdrop-blur-md transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:shadow-[0_18px_40px_-8px_rgba(37,99,235,0.2)] sm:flex-row sm:items-center sm:gap-0"
      >
        {/* Keyword Search */}
        <div className="relative flex flex-1 items-center px-3 py-1.5 sm:py-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-focus-within:bg-blue-600 group-focus-within:text-white shrink-0">
            <Search size={18} />
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Job title, skill, or company..."
            className="w-full border-0 bg-transparent px-3.5 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            aria-label="Job title, skill, or company"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition mr-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="hidden h-9 w-[1px] bg-slate-200/90 sm:block" />

        {/* Location Dropdown */}
        <div className="relative flex items-center px-3 py-1.5 sm:py-0 min-w-[140px] sm:min-w-[160px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-focus-within:bg-blue-50 group-focus-within:text-blue-600 shrink-0">
            <MapPin size={17} />
          </div>
          <div className="relative w-full">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full appearance-none border-0 bg-transparent py-2 pl-2.5 pr-7 text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
              aria-label="Select location"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" />
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shrink-0"
        >
          <span>Find Jobs</span>
          <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      {/* Popular Searches */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="flex items-center gap-1 font-bold text-slate-500 uppercase tracking-wider text-[11px] mr-1">
          <Sparkles size={13} className="text-blue-600" />
          Popular:
        </span>
        {popularQueries.map((chip) => {
          const isActive = activeChip === chip.label;
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleChipClick(chip)}
              className={`rounded-full border px-3.5 py-1.5 font-semibold text-xs transition-all duration-200 ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "border-slate-200/90 bg-white/90 text-slate-700 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 shadow-2xs"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
