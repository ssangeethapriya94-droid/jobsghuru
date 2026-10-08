"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Mail,
  RefreshCw,
} from "lucide-react";

export default function CandidateVerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [linkedCount, setLinkedCount] = useState(0);

  const [emailInput, setEmailInput] = useState(emailParam);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!tokenParam || !emailParam) {
      setLoading(false);
      setError("Missing token or email parameter. Please click the link in your email.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/candidate/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenParam, email: emailParam }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to verify email.");
          setLoading(false);
          return;
        }

        setSuccess(true);
        setLinkedCount(data.applicationsLinked || 0);
        setLoading(false);

        setTimeout(() => {
          router.push("/candidate/dashboard");
        }, 2000);
      } catch {
        setError("Network error occurred during verification.");
        setLoading(false);
      }
    };

    verify();
  }, [tokenParam, emailParam, router]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setResending(true);
    setResendMessage("");
    try {
      const res = await fetch("/api/candidate/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();
      setResendMessage(data.message || "A new verification email has been dispatched.");
    } catch {
      setResendMessage("Failed to send verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EEF5FC] to-[#E6F0FA] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-blue-950/5 border border-blue-100 p-8 sm:p-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-display text-xl font-extrabold text-slate-900 group mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Briefcase size={18} />
          </span>
          <span>Jobs<span className="text-blue-600">Guru</span></span>
        </Link>

        {loading && (
          <div className="py-10">
            <div className="h-12 w-12 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-800">Verifying your email...</h2>
            <p className="text-xs text-slate-500 mt-1">Linking your candidate record and applications.</p>
          </div>
        )}

        {!loading && success && (
          <div className="py-4">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 size={32} />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full mb-3">
              <Sparkles size={13} className="text-emerald-600" />
              Account Activated
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Email Verified Successfully!</h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Your candidate account is now fully active.
              {linkedCount > 0 && (
                <span className="block mt-1 font-semibold text-blue-600">
                  {linkedCount} past {linkedCount === 1 ? "application was" : "applications were"} automatically linked to your account!
                </span>
              )}
            </p>
            <div className="mt-8">
              <Link
                href="/candidate/dashboard"
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="py-4">
            <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Verification Incomplete</h1>
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-xl mt-3">
              {error}
            </p>

            {/* Resend Form */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Request a new verification link
              </h3>
              {resendMessage && (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg mb-3">
                  {resendMessage}
                </p>
              )}
              <form onSubmit={handleResend} className="space-y-3">
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  {resending ? <RefreshCw size={14} className="animate-spin" /> : <Mail size={14} />}
                  <span>Resend Verification Email</span>
                </button>
              </form>
            </div>

            <div className="mt-6">
              <Link href="/candidate/login" className="text-xs font-semibold text-blue-600 hover:underline">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
