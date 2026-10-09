"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFillDemo = () => {
    setEmail("admin@careerbridge.com");
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

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-white font-display">Platform Admin Portal</h1>
          <p className="text-xs text-slate-400">JobsGhuru / CareerBridge Core Administration</p>
        </div>

        {/* Quick Demo Fill Pill */}
        <div className="rounded-2xl border border-blue-900/60 bg-blue-950/40 p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
            <span>Testing? Fill demo admin account</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs transition active:scale-95 shrink-0"
          >
            Autofill
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Admin Work Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jobsghuru.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-60"
          >
            {loading ? <span>Authenticating...</span> : (
              <>
                <span>Sign In to Admin Workspace</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center text-xs">
          <Link href="/employer/login" className="text-slate-400 hover:text-white transition">
            Switch to Employer Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
