"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Users,
  Briefcase,
} from "lucide-react";

function EmployerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const prefillEmail = searchParams.get("email");
    const isRegistered = searchParams.get("registered");
    const isReset = searchParams.get("reset");

    if (prefillEmail) {
      setEmail(prefillEmail);
    }
    if (isRegistered === "true") {
      setNotice("🔒 Your registration has been submitted and is pending Platform Admin approval. Login access is locked until your company is verified.");
    } else if (isReset === "true") {
      setNotice("Your password has been successfully reset. Please log in with your new password.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/employer/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid employer credentials.");
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = data.redirectUrl || "/employer/dashboard";
      }, 500);
    } catch (err: any) {
      setError(err.message || "Employer login failed. Please verify your credentials.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("recruiter@northwindlabs.com");
    setPassword("Recruiter@123");
    setError(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-b from-[#F0F5FE] via-[#F8FAFC] to-white px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-[450px] w-[450px] rounded-full bg-indigo-400/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rise">
        {/* Top Header Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/90 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-2xs backdrop-blur-md mb-4">
            <Building2 size={14} className="text-blue-600" />
            <span>Employer & Recruiter Portal</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Sign in to manage active job listings, review AI candidate matches, and connect with top talent.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-[0_20px_50px_-10px_rgba(37,99,235,0.10)] backdrop-blur-xl">
          {/* Quick Demo Fill Pill */}
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
              <Sparkles size={15} className="text-blue-600 shrink-0" />
              <span>Testing? Fill demo recruiter account</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs transition active:scale-95 shrink-0"
            >
              Autofill
            </button>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 animate-pulse">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>Login successful! Redirecting to Employer Dashboard...</span>
            </div>
          )}

          {/* Notice Alert */}
          {notice && !success && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs font-semibold text-blue-800">
              <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Work Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Official Work Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link
                  href="/employer/forgot-password"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm font-semibold text-slate-800 placeholder-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700">Keep me signed in</span>
              </label>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/35 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span>Verifying Employer Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Employer Portal</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs font-medium text-slate-600">
              New company or employer?{" "}
              <Link
                href="/employers/register"
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Register Your Enterprise Free
              </Link>
            </p>
          </div>
        </div>

        {/* Security Audit Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-500">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>256-Bit SSL Encrypted Employer Session</span>
        </div>
      </div>
    </div>
  );
}

export default function EmployerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm font-semibold text-slate-500">Loading Employer Portal...</div>}>
      <EmployerLoginForm />
    </Suspense>
  );
}
