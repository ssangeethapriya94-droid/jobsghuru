"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";

export default function EmployerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/employer/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process password reset request.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-b from-[#F0F5FE] via-[#F8FAFC] to-white px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-[450px] w-[450px] rounded-full bg-indigo-400/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rise">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/90 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-2xs backdrop-blur-md mb-4">
            <Building2 size={14} className="text-blue-600" />
            <span>Employer Account Recovery</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            Reset Password
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Enter your official company email address to receive password reset instructions.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-[0_20px_50px_-10px_rgba(37,99,235,0.10)] backdrop-blur-xl">
          {submitted ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                <Mail size={26} />
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Reset Instructions Sent
                </h3>
                <p className="mt-2 text-xs font-medium text-slate-600 leading-relaxed">
                  If an authorized employer account exists for <span className="font-bold text-slate-900">{email}</span>, an official password reset email has been dispatched.
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 text-left text-xs text-blue-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span>Security Notice:</span>
                </div>
                <p className="text-[11px] leading-normal text-blue-800">
                  Password reset links are valid for 60 minutes and can only be used once. Please check your spam folder if you do not see it in your inbox.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/employer/login"
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-3 px-4 text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <ArrowLeft size={15} />
                  <span>Return to Employer Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
                  <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Official Work Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="recruiter@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 py-3.5 text-xs font-extrabold text-white shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span>Sending Instructions...</span>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-100 text-center">
                <Link
                  href="/employer/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Employer Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
