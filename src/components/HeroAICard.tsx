"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Bot, Zap, MessageSquareCode } from "lucide-react";
import CandidateAuthModal from "./CandidateAuthModal";

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingText, setPendingText] = useState("");

  const checkAuthAndExecute = async (text: string) => {
    try {
      const res = await fetch("/api/candidate/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.candidate) {
          router.push(`/career-ai?q=${encodeURIComponent(text)}`);
          return;
        }
      }
    } catch (err) {
      // Unauthenticated
    }
    setPendingText(text);
    setIsAuthModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = query.trim() || "Remote React Jobs";
    checkAuthAndExecute(text);
  };

  const handlePromptClick = (prompt: string) => {
    checkAuthAndExecute(prompt);
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-[28px] border border-blue-200/80 bg-gradient-to-b from-white via-white/95 to-blue-50/50 p-6 shadow-[0_20px_50px_-10px_rgba(37,99,235,0.12),0_6px_20px_-2px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_25px_60px_-10px_rgba(37,99,235,0.18)] hover:border-blue-300">
      {/* Decorative Gradient Glow Corner */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-transparent blur-2xl" />

      {/* Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Vibrant Blue Rounded Robot Avatar with Pulsing Online Badge */}
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-600/30 shrink-0">
            <Bot size={24} className="text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                AI Career Assistant
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-2xs leading-tight">
                <Zap size={9} className="fill-white" />
                BETA
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Your 24/7 personal career copilot
            </p>
          </div>
        </div>

        {/* Top-Right Sparkle Badge */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-200/80 shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
          <Sparkles size={17} />
        </div>
      </div>

      {/* Description */}
      <p className="mt-3.5 text-xs font-medium leading-relaxed text-slate-600">
        Get real-time job recommendations, instant skill match insights, and customized career path advice.
      </p>

      {/* Prompt Input Box */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="relative flex items-center rounded-xl border border-slate-200/90 bg-white p-1.5 pl-3.5 shadow-2xs transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:shadow-sm">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find me remote React jobs in India..."
            className="w-full border-0 bg-transparent pr-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            aria-label="Ask Career AI"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:shadow-blue-600/30 active:scale-95 shrink-0"
          >
            <span>Ask AI</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </form>

      {/* Quick Prompts */}
      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-600 uppercase">
          <MessageSquareCode size={13} className="text-blue-600" />
          Try these quick prompts:
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className="rounded-full border border-blue-100 bg-white px-3.5 py-1.5 font-semibold text-blue-600 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* CANDIDATE LOGIN MODAL FOR AI FEATURE ACCESS */}
      <CandidateAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          router.push(`/career-ai?q=${encodeURIComponent(pendingText || "Remote React Jobs")}`);
        }}
      />
    </div>
  );
}
