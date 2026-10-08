"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Bot } from "lucide-react";

const QUICK_PROMPTS = [
  "Remote React Jobs",
  "Jobs in Chennai",
  "Jobs above ₹10 LPA",
  "What should I learn next?",
  "Find jobs matching my profile",
];

export default function HeroAICard() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = query.trim() || "Remote React Jobs";
    router.push(`/career-ai?q=${encodeURIComponent(text)}`);
  };

  const handlePromptClick = (prompt: string) => {
    router.push(`/career-ai?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="relative w-full rounded-[28px] border border-blue-100/90 bg-white/98 p-6 shadow-[0_18px_40px_-8px_rgba(37,99,235,0.10),0_4px_16px_-2px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_24px_48px_-10px_rgba(37,99,235,0.15)] hover:border-blue-200">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Vibrant Blue Rounded Robot Avatar (exact to reference) */}
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 shrink-0">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                AI Career Assistant
              </h3>
              <span className="rounded-full bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold text-blue-700 leading-tight">
                Beta
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400">
              Your personal career copilot
            </p>
          </div>
        </div>

        {/* Top-Right Sparkle in Soft Circle Badge */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100/60 shrink-0">
          <Sparkles size={16} />
        </div>
      </div>

      {/* Description */}
      <p className="mt-3.5 text-xs font-normal leading-relaxed text-slate-600">
        Get personalized job recommendations, skill insights and career guidance.
      </p>

      {/* Prompt Input Box */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="relative flex items-center rounded-xl border border-slate-200/90 bg-white p-1 pl-3.5 shadow-2xs transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find me remote React jobs in India."
            className="w-full border-0 bg-transparent pr-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            aria-label="Ask Career AI"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 shrink-0"
          >
            <span>Ask AI</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </form>

      {/* Quick Prompts */}
      <div className="mt-4">
        <p className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
          TRY THESE QUICK PROMPTS:
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className="rounded-full border border-blue-100 bg-white px-3 py-1 font-semibold text-blue-600 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50 active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
