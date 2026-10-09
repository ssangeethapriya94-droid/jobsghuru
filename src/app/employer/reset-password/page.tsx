"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset token is missing from the URL. Please use the link provided in your email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/employer/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/employer/login?reset=true");
      }, 2000);
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
            <span>Employer Account Security</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            Set New Password
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Create a strong, unique password for your employer account.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-[0_20px_50px_-10px_rgba(37,99,235,0.10)] backdrop-blur-xl">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs">
                <CheckCircle2 size={28} />
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Password Updated!
                </h3>
                <p className="mt-1.5 text-xs font-medium text-slate-600">
                  Your password has been changed successfully. Redirecting to login...
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/employer/login"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 px-4 text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Go to Employer Login</span>
                  <ArrowRight size={15} />
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

              {/* Security Token Input (Readonly / Pre-filled) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Reset Security Token
                </label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter security token"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-xs font-mono font-semibold text-slate-800 placeholder-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm font-semibold text-slate-800 placeholder-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm font-semibold text-slate-800 placeholder-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 py-3.5 text-xs font-extrabold text-white shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <span>Reset Password & Update Account</span>
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

export default function EmployerResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Loading reset portal...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
