"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Building2,
  Eye,
  EyeOff,
  Check,
  Activity,
  Fingerprint,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [companyRedirect, setCompanyRedirect] = useState<{ url: string; msg: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setCompanyRedirect(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isCompanyAccount) {
          setCompanyRedirect({
            url: `/employer/login?email=${encodeURIComponent(email)}`,
            msg: data.error || "This is a registered Company / Employer account.",
          });
        }
        setErrorMessage(data.error || "Authentication failed. Please verify admin credentials.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage(`Welcome back, ${data.user.name}! Access granted...`);
      setTimeout(() => {
        router.push("/admin/dashboard");
        router.refresh();
      }, 700);
    } catch (err: any) {
      setErrorMessage("Network error during platform administration authentication.");
      setIsLoading(false);
    }
  };

  const handleAutoFillAdmin = () => {
    setEmail("admin@jobsghuru.com");
    setPassword("Admin@JobsGhuru2026");
    setErrorMessage("");
    setCompanyRedirect(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EEF5FC] to-[#E6F0FA] py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-blue-950/5 border border-blue-100/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* LEFT COLUMN: Bright, Soft-Blue Executive Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#F0F6FF] via-[#EBF3FE] to-[#E3EEFB] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-blue-100/70">
          {/* Brand Header */}
          <div>
            <div className="inline-flex items-center gap-2.5 font-display text-xl font-extrabold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
                <Shield size={18} />
              </span>
              <span>Career<span className="text-blue-600">Bridge</span> <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Admin</span></span>
            </div>

            <div className="mt-6">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full">
                <ShieldCheck size={13} className="text-blue-600" />
                Root System Administration
              </span>
              <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Platform Governance & Verification Console.
              </h2>
            </div>
          </div>

          {/* Center Visual Container: Clean modern architectural headquarters */}
          <div className="my-6 relative flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-[4/3] rounded-2xl overflow-hidden shadow-md shadow-blue-900/10 border-2 border-white bg-white">
              <Image
                src="/images/auth/admin_clean.jpg"
                alt="Modern Architecture Executive Hub"
                fill
                sizes="(max-width: 768px) 100vw, 280px"
                className="object-cover object-center"
                priority
              />
            </div>

            {/* Floating Value Pill */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 shadow-xs border border-blue-100 text-xs font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Platform Status: Operational (99.99%)</span>
            </div>
          </div>

          {/* Value Bullet Points */}
          <div className="space-y-2.5 bg-white/70 backdrop-blur-xs rounded-2xl p-4 border border-blue-100/80 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <span>1-Click Company GST & Document Verification</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <span>Automated Credentials & Login Email Dispatch</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <span>Immutable Audit Logging with IP Attribution</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean White Admin Command Console */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white">
          {/* Card Top */}
          <div>
            <div className="flex items-center justify-between pb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Admin Command Center
              </span>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full font-semibold">
                SECURE GATEWAY
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Admin Sign In
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Administrative gateway for company verifications, compliance audits, and platform management.
            </p>

            {/* Company Account Redirect Notice */}
            {companyRedirect && (
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 shadow-xs">
                <div className="font-bold flex items-center gap-2 text-sm mb-1.5">
                  <Building2 size={16} className="text-blue-600" />
                  <span>Company Account Detected</span>
                </div>
                <p className="text-[12px] text-slate-600 leading-relaxed mb-3">
                  {companyRedirect.msg}
                </p>
                <a
                  href={companyRedirect.url}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white transition shadow-xs"
                >
                  <span>Go to Company Sign In</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && !companyRedirect && (
              <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1-Click Auto Fill Admin Credentials Button */}
            <div className="mt-5">
              <button
                type="button"
                onClick={handleAutoFillAdmin}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 transition group"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition">
                    <Sparkles size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
                      Auto-Fill Platform Admin Credentials
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">admin@jobsghuru.com</div>
                  </div>
                </div>
                <ArrowRight size={15} className="text-blue-600 group-hover:translate-x-1 transition" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Admin Email Address</label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@jobsghuru.com"
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
                    placeholder="••••••••••••"
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

              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 w-full rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 py-3.5 text-xs font-extrabold text-white shadow-md shadow-slate-950/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating session...</span>
                ) : (
                  <>
                    <span>Sign In to Admin Command Center</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-800 transition">
              ← Candidate Portal
            </Link>
            <Link
              href="/employer/login"
              className="text-blue-600 hover:underline transition flex items-center gap-1 font-semibold"
            >
              <Building2 size={13} />
              <span>Company / Employer Sign In →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
