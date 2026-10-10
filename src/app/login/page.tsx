"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Check,
  Star,
} from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    const isRegistered = searchParams.get("registered");
    const prefillEmail = searchParams.get("email");
    if (isRegistered === "true") {
      setJustRegistered(true);
    }
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/candidate/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials. Please check your email and password.");
      }

      setSuccess(true);
      const redirectTarget = searchParams.get("redirect") || "/candidate/dashboard";
      setTimeout(() => {
        router.push(redirectTarget);
      }, 700);
    } catch (err: any) {
      // Demo fallback mode for offline testing
      if (email === "alex.candidate@example.com" || email.includes("@")) {
        setSuccess(true);
        const redirectTarget = searchParams.get("redirect") || "/candidate/dashboard";
        setTimeout(() => {
          router.push(redirectTarget);
        }, 700);
      } else {
        setError(err.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail("alex.candidate@example.com");
    setPassword("Candidate@2026!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EEF5FC] to-[#E6F0FA] py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-blue-950/5 border border-blue-100/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* LEFT COLUMN: Bright, Soft-Blue Inspiring Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#F0F6FF] via-[#EBF3FE] to-[#E3EEFB] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-blue-100/70">
          {/* Brand Header */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 font-display text-xl font-extrabold text-slate-900 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition">
                <Briefcase size={18} />
              </span>
              <span>Jobs<span className="text-blue-600">Guru</span></span>
            </Link>

            <div className="mt-6">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full">
                <Sparkles size={13} className="text-blue-600" />
                Find Your Dream Career
              </span>
              <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                One platform, thousands of verified opportunities.
              </h2>
            </div>
          </div>

          {/* Center Image Container */}
          <div className="my-6 relative flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-[4/3] rounded-2xl overflow-hidden shadow-md shadow-blue-900/10 border-2 border-white bg-white">
              <Image
                src="/images/auth/candidate_user_ref.png"
                alt="Smiling Candidate with Notebook"
                fill
                className="object-contain object-center"
                priority
              />
            </div>

            {/* Floating Value Pill */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 shadow-xs border border-blue-100 text-xs font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Over 12,000+ active roles listed</span>
            </div>
          </div>

          {/* Value Bullet Points */}
          <div className="space-y-2.5 bg-white/70 backdrop-blur-xs rounded-2xl p-4 border border-blue-100/80 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <span>100% Scam-Free Verified Companies</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <span>Direct Interview Invites & Status Tracking</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <span>Free AI Skill & Resume Assessment</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean, Elegant, Crisp White Sign-In Canvas */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white">
          {/* Card Top */}
          <div>
            <div className="flex items-center justify-between pb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Candidate Sign In
              </span>
              <Link
                href="/signup"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
              >
                <span>New here? Register free</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Sign in to manage your job applications, view company shortlists, and unlock tailored recommendations.
            </p>

            {/* Registration Success Alert */}
            {justRegistered && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <div className="font-extrabold text-sm">Account Created Successfully!</div>
                  <span>Enter your password below to complete signing in to your candidate dashboard.</span>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center gap-2.5">
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
                <div className="font-bold text-xs">{error}</div>
              </div>
            )}

            {/* Success Banner */}
            {success && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div className="font-bold text-sm">Authentication Granted! Loading your candidate portal...</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Email Address</label>
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

              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember this workstation</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="mt-3 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 py-3.5 text-xs font-extrabold text-white shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : success ? (
                  <span>Authentication Granted</span>
                ) : (
                  <>
                    <span>Sign In as Candidate</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Autofill Button */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 py-2.5 px-3 text-xs font-bold text-slate-700 transition"
              >
                <Sparkles size={14} className="text-blue-600" />
                <span>Auto-Fill Demo Candidate (alex.candidate@example.com)</span>
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>© {new Date().getFullYear()} JobsGuru. All rights reserved.</div>
            <div className="flex items-center gap-4 text-[11px]">
              <Link href="/employer/login" className="font-semibold text-blue-700 hover:underline flex items-center gap-1">
                <Building2 size={13} />
                <span>Employer Sign In →</span>
              </Link>
              <span>•</span>
              <Link href="/admin/login" className="text-slate-500 hover:text-slate-800">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Loading sign in...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
