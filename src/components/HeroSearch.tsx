"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, X, ChevronDown, ArrowRight } from "lucide-react";

const popularQueries = [
  { label: "Bengaluru", location: "Bengaluru" },
  { label: "Chennai", location: "Chennai" },
  { label: "Remote", location: "Remote" },
  { label: "React", query: "react" },
  { label: "Full Stack", query: "full stack" },
  { label: "High Pay", salary: "1" },
];

const locations = [
  "Location",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Mumbai",
  "Remote",
];

export default function HeroSearch({ totalJobs = 24 }: { totalJobs?: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("Location");
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (location && location !== "Location" && location !== "All Locations") {
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
        className="group relative flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06),0_4px_12px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-[0_12px_30px_-5px_rgba(37,99,235,0.15)] focus-within:ring-4 focus-within:ring-blue-100 sm:flex-row sm:items-center sm:gap-0"
      >
        {/* Keyword Search */}
        <div className="relative flex flex-1 items-center px-3">
          <Search size={19} className="text-slate-400 transition-colors group-focus-within:text-blue-600 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Job title, skill, or company..."
            className="w-full border-0 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
            aria-label="Job title, skill, or company"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition mr-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="hidden h-8 w-[1px] bg-slate-200 sm:block" />

        {/* Location Dropdown */}
        <div className="relative flex items-center px-3 py-1 sm:py-0 min-w-[130px] sm:min-w-[150px]">
          <MapPin size={17} className="text-slate-400 shrink-0 group-focus-within:text-blue-600 transition-colors" />
          <div className="relative w-full">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full appearance-none border-0 bg-transparent py-2 pl-2 pr-6 text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
              aria-label="Select location"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          className="relative inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-blue-600/25 active:scale-[0.98] shrink-0"
        >
          <span>Find Jobs</span>
          <ArrowRight size={16} />
        </button>
      </form>

      {/* Popular Searches */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-700">Popular searches:</span>
        {popularQueries.map((chip) => {
          const isActive = activeChip === chip.label;
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleChipClick(chip)}
              className={`rounded-full border px-3 py-1 font-medium transition-all duration-150 ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
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
