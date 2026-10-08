"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Check,
  UserCheck,
} from "lucide-react";

export default function CandidateLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/candidate/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to log in.");
        if (data.requiresVerification) {
          setRequiresVerification(true);
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/candidate/dashboard");
      }, 700);
    } catch (err: any) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setResending(true);
    try {
      const res = await fetch("/api/candidate/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResendMsg(data.message || "Verification link sent to your email.");
    } catch {
      setResendMsg("Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EEF5FC] to-[#E6F0FA] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-blue-950/5 border border-blue-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* LEFT COLUMN: Candidate Brand Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#F0F6FF] via-[#EBF3FE] to-[#E3EEFB] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-blue-100">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 font-display text-xl font-extrabold text-slate-900 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition">
                <Briefcase size={18} />
              </span>
              <span>Jobs<span className="text-blue-600">Guru</span></span>
            </Link>

            <div className="mt-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full">
                <Sparkles size={13} className="text-blue-600" />
                Candidate Portal
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Track your job applications and interview invites.
              </h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Log in to access your synchronized ATS application status, interactive interviews, assessments, and verified candidate profile.
              </p>
            </div>
          </div>

          <div className="my-8 space-y-3 bg-white/80 backdrop-blur-xs rounded-2xl p-5 border border-blue-100 text-xs text-slate-700">
            <div className="flex items-center gap-2.5 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <span>Real-time application pipeline tracking</span>
            </div>
            <div className="flex items-center gap-2.5 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 shrink-0">
                <UserCheck size={12} strokeWidth={2.5} />
              </div>
              <span>Direct interview schedules & secure meeting rooms</span>
            </div>
            <div className="flex items-center gap-2.5 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 shrink-0">
                <ShieldCheck size={12} strokeWidth={2.5} />
              </div>
              <span>Privacy-first consent controls & visibility settings</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>© 2026 JobsGuru India</span>
            <Link href="/employer/login" className="text-blue-600 hover:underline font-semibold">
              Employer Login →
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Candidate Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Candidate Sign In</h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter your registered credentials to access your candidate dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  {requiresVerification && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="text-blue-600 hover:underline font-bold text-xs"
                      >
                        {resending ? "Sending link..." : "Resend Verification Email →"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {resendMsg && (
              <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 size={16} className="shrink-0 text-blue-600 mt-0.5" />
                <span>{resendMsg}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="font-semibold">Authentication successful! Redirecting to dashboard...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/candidate/forgot-password"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Candidate Portal</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don't have a candidate account yet?{" "}
                <Link href="/candidate/signup" className="font-bold text-blue-600 hover:underline">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
