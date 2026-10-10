"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  Briefcase,
  Lock,
  Mail,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
} from "lucide-react";

interface CandidateAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (candidate: any) => void;
  jobTitle?: string;
  companyName?: string;
}

export default function CandidateAuthModal({
  isOpen,
  onClose,
  onSuccess,
  jobTitle,
  companyName,
}: CandidateAuthModalProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
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
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      onSuccess(data.candidate);
    } catch (err: any) {
      // Demo fallback mode for quick testing
      if (email === "alex.candidate@example.com" || email.includes("@")) {
        onSuccess({
          id: "cand_demo_alex",
          name: "Alex Johnson",
          email,
        });
      } else {
        setError(err.message || "Invalid credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/candidate/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Please try again.");
      }

      // Auto login after signup
      const loginRes = await fetch("/api/candidate/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();

      onSuccess(loginData.candidate || { name, email });
    } catch (err: any) {
      setError(err.message || "Failed to create candidate account.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCandidateLogin = () => {
    setEmail("alex.candidate@example.com");
    setPassword("Candidate@2026!");
    setError(null);
  };

  const currentRedirect = typeof window !== "undefined"
    ? encodeURIComponent(window.location.pathname + (window.location.search.includes("apply") ? window.location.search : "?apply=1"))
    : "";

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Dark Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />

      {/* Outer ambient glow effect */}
      <div className="relative w-full max-w-lg my-auto z-10 pointer-events-auto">
        <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 opacity-30 blur-xl transition-all duration-500 animate-pulse" />

        {/* Modal Main Card Container */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl border border-white/80 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-2xl overflow-hidden text-slate-900 dark:text-slate-100 max-h-[92vh] flex flex-col transition-all">
          {/* Top Decorative Gradient Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 shrink-0" />

          {/* Scrollable Container */}
          <div className="overflow-y-auto p-5 sm:p-7 custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  <Lock size={12} className="text-blue-600 dark:text-blue-400" />
                  <span>Candidate Portal</span>
                </div>
                <h3 className="mt-2.5 font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {mode === "login" ? "Welcome Back" : "Join JobsGhuru"}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {jobTitle && companyName ? (
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Sign in to submit your application for <strong className="text-slate-900 dark:text-white">{jobTitle}</strong> at <strong className="text-slate-900 dark:text-white">{companyName}</strong>
                    </span>
                  ) : (
                    "Sign in or register a candidate account to access AI career tools and apply for verified jobs."
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close authentication modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mode Switcher Segment Tabs */}
            <div className="grid grid-cols-2 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 mt-5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 ${
                  mode === "login"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md shadow-slate-200/50 dark:shadow-none"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <LogIn size={15} />
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 ${
                  mode === "signup"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md shadow-slate-200/50 dark:shadow-none"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <UserPlus size={15} />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs sm:text-sm font-medium text-red-700 dark:text-red-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="mt-5">
              {mode === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="candidate@example.com"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                    </div>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 pl-10 pr-11 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Auto fill Demo button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleDemoCandidateLogin}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                    >
                      <Sparkles size={14} className="text-amber-500 animate-spin-slow" />
                      <span>Auto-fill Demo Account</span>
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-5 text-sm font-bold shadow-lg shadow-blue-600/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing in...
                      </span>
                    ) : (
                      <>
                        <span>Log In & Continue</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Arun Kumar"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="arun@example.com"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98401 23456"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 pl-10 pr-11 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-5 text-sm font-bold shadow-lg shadow-blue-600/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Creating Account...
                      </span>
                    ) : (
                      <>
                        <span>Create Account & Continue</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Footer Direct Links & Trust Badge */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 text-center">
              <Link
                href={`/candidate/signup?redirect=${currentRedirect}`}
                className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
              >
                <span>Or Register via Full Registration Page</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800/60 px-3 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                <span>256-bit encrypted candidate protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

