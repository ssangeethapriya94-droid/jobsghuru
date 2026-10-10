"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Server,
  Building2,
  UserCheck,
} from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFillDemo = (adminEmail: string = "admin@careerbridge.com") => {
    setEmail(adminEmail);
    setPassword("Admin@CareerBridge2026");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid administrative credentials.");
      }

      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Dynamic Cyber Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Multi-layered Ambient Color Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[350px] bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-sky-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card Container */}
      <div className="relative z-10 w-full max-w-md my-auto">
        {/* Glowing Border Wrapper */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 opacity-40 blur-md transition duration-500 group-hover:opacity-75" />

        <div className="relative w-full rounded-2xl sm:rounded-3xl border border-slate-800/90 bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col space-y-6">
          {/* Header Brand Badge */}
          <div className="text-center flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-blue-500/30 blur-md" />
              <div className="relative inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30">
                <ShieldCheck size={26} />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 px-3 py-0.5 text-[11px] font-semibold text-blue-300 mb-1.5">
                <Server size={12} className="text-blue-400 animate-pulse" />
                <span>Enterprise Core Admin</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                Platform Admin Portal
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                JobsGhuru / CareerBridge Core Administration
              </p>
            </div>
          </div>

          {/* Quick Demo Autofill Banner */}
          <div className="rounded-2xl border border-blue-900/60 bg-slate-950/60 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-blue-300">
              <Sparkles size={16} className="text-amber-400 shrink-0 animate-pulse" />
              <span>Testing? Fill demo admin account</span>
            </div>
            <button
              type="button"
              onClick={() => handleFillDemo("admin@careerbridge.com")}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 py-1.5 px-3.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition hover:scale-[1.03] active:scale-[0.97] shrink-0"
            >
              Autofill
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-3.5 text-xs font-medium text-rose-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Work Email
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@careerbridge.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-10 pr-4 text-xs sm:text-sm font-medium text-white placeholder:text-slate-600 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-10 pr-11 text-xs sm:text-sm font-medium text-white placeholder:text-slate-600 focus:border-blue-500 focus:bg-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 py-3.5 px-5 text-xs sm:text-sm font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign In to Admin Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Portal Links & Trust Shield */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col items-center gap-3 text-center">
            <Link
              href="/employer/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-400 transition group"
            >
              <Building2 size={14} className="text-slate-500 group-hover:text-blue-400 transition" />
              <span>Switch to Employer Portal</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              <span>256-bit AES Encrypted • Zero-Trust Platform Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500">Loading Admin Portal...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

