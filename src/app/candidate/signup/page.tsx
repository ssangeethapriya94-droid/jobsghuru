"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Check,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function CandidateSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/candidate/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      setSignedUp(true);
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EEF5FC] to-[#E6F0FA] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-blue-950/5 border border-blue-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* LEFT COLUMN: Candidate Pitch */}
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
                Join Free
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Unlock direct access to verified tech employers.
              </h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Create a candidate account to apply with one click, manage your interview schedules, and link past applications automatically.
              </p>
            </div>
          </div>

          <div className="my-8 space-y-3 bg-white/80 backdrop-blur-xs rounded-2xl p-5 border border-blue-100 text-xs text-slate-700">
            <div className="flex items-center gap-2.5 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <span>Automatic past application linking on email verify</span>
            </div>
            <div className="flex items-center gap-2.5 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 shrink-0">
                <Zap size={12} strokeWidth={2.5} />
              </div>
              <span>One-click applications using your candidate profile</span>
            </div>
            <div className="flex items-center gap-2.5 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 shrink-0">
                <ShieldCheck size={12} strokeWidth={2.5} />
              </div>
              <span>100% private defaults & salary privacy controls</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>© 2026 JobsGuru India</span>
            <Link href="/employer/register" className="text-blue-600 hover:underline font-semibold">
              Register as Employer →
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Candidate Signup Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {signedUp ? (
              <div className="text-center py-6">
                <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-100 shadow-sm">
                  <Mail size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verify Your Email Address</h2>
                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                  We have dispatched a verification link to <span className="font-bold text-slate-900">{email}</span>. Please click the link to activate your candidate account and link any previous applications.
                </p>
                <div className="mt-8 space-y-3">
                  <Link
                    href="/candidate/login"
                    className="block w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition"
                  >
                    Proceed to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Candidate Account</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Free forever for job seekers. Set up your candidate profile in 30 seconds.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                    <AlertCircle size={16} className="shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      />
                    </div>
                  </div>

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
                        placeholder="john.doe@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Password (min. 8 characters)
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
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
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Candidate Account</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <Link href="/candidate/login" className="font-bold text-blue-600 hover:underline">
                      Log in here
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
