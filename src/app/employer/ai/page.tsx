"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  Send,
  CheckCircle2,
  Users,
  Search,
  ArrowRight,
  TrendingUp,
  Briefcase,
  AlertCircle,
} from "lucide-react";

export default function EmployerAIPage() {
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string; highlights?: any[] }>
  >([
    {
      sender: "ai",
      text: "Hello! I am your JobsGhuru Recruiter AI Copilot. I analyze your live company requisitions, candidate match coverage, and applicant pipeline in real-time. How can I assist your hiring workflow today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedQueries = [
    "Which candidates should I review first?",
    "What are the biggest hiring bottlenecks in my pipeline?",
    "Which skills are most common among my applicants?",
    "Summarize current candidate applications",
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg = { sender: "user" as const, text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/employer/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to query AI copilot");
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.response,
          highlights: data.dataHighlights,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Notice: ${err.message || "Unable to process query."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 mb-2">
          <Sparkles size={13} className="text-blue-600" />
          Recruiter AI Copilot
        </div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">
          Intelligent Hiring Assistance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ask questions grounded strictly in your live applicant data, candidate match explanations, and job requisitions.
        </p>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {suggestedQueries.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 transition shadow-2xs text-left"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {m.sender === "user" ? "You" : <Bot size={16} />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs max-w-xl leading-relaxed ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 border border-slate-100 text-slate-800"
                }`}
              >
                <div>{m.text}</div>

                {m.highlights && m.highlights.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                    {m.highlights.map((h: any, hIdx: number) => (
                      <div key={hIdx} className="rounded-xl bg-white p-2.5 border border-slate-200/80">
                        <div className="font-bold text-slate-900">{h.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{h.desc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
              <Bot size={14} className="animate-spin text-blue-600" />
              <span>Analyzing live database applications...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Recruiter AI about your jobs, candidates, or pipeline..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-300 py-3 px-4 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-98 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Ask</span>
              <Send size={14} />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 mt-1 text-center">
            JobsGhuru AI assists recruiters. AI never independently makes final hiring decisions.
          </div>
        </div>
      </div>
    </div>
  );
}
