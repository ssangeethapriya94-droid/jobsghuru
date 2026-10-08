"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function CandidateForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/candidate/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to process request.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EEF5FC] to-[#E6F0FA] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-950/5 border border-blue-100 p-8 sm:p-10">
        <Link href="/" className="inline-flex items-center gap-2 font-display text-xl font-extrabold text-slate-900 mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Briefcase size={18} />
          </span>
          <span>Jobs<span className="text-blue-600">Guru</span></span>
        </Link>

        {submitted ? (
          <div className="text-center py-4">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Mail size={32} />
            </div>
            <h1 className="text-xl font-black text-slate-900">Check Your Inbox</h1>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              If a candidate account matches <span className="font-bold text-slate-900">{email}</span>, a secure password reset link has been dispatched.
            </p>
            <div className="mt-6">
              <Link
                href="/candidate/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
              >
                <ArrowLeft size={14} />
                <span>Return to Candidate Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password</h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter your registered candidate email address and we will send you a reset link.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <Link href="/candidate/login" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                ← Back to Candidate Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
