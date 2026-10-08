"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/candidate/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request. Please try again.");
      }

      setSuccess(true);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      } else {
        setResetUrl(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      setSuccess(true);
      setResetUrl(`/reset-password?email=${encodeURIComponent(email)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EEF5FC] to-[#E6F0FA] py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-blue-100">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-display text-xl font-extrabold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Briefcase size={18} />
            </span>
            <span>Jobs<span className="text-blue-600">Guru</span></span>
          </Link>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900 tracking-tight">Forgot Your Password?</h1>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            Enter your registered Email ID below to reset your account password.
          </p>
        </div>

        {success ? (
          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50/70 p-6 text-xs text-slate-800 space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
              <Mail size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Password Reset Instructions Sent</h3>
              <p className="mt-1.5 leading-relaxed text-slate-600 text-xs">
                If an account matches <strong>{email}</strong>, a secure password reset link has been generated.
              </p>
            </div>

            {resetUrl && (
              <div className="pt-2">
                <Link
                  href={resetUrl}
                  className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 py-3 px-4 text-xs font-extrabold text-white shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
                >
                  <KeyRound size={16} />
                  <span>Set New Password Now →</span>
                </Link>
              </div>
            )}

            <div className="pt-3 border-t border-blue-100">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-blue-600 text-xs"
              >
                <ArrowLeft size={14} />
                <span>Return to Candidate Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700">Registered Email Address</label>
              <div className="relative mt-1.5">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 py-3.5 text-xs font-extrabold text-white shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span>Dispatching Reset Link...</span>
              ) : (
                <>
                  <span>Request Password Reset Link</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs">
          <Link href="/login" className="font-bold text-slate-600 hover:text-blue-600 transition inline-flex items-center gap-1">
            <ArrowLeft size={13} />
            <span>Back to Candidate Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
