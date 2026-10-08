"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, ShieldCheck, Mail, Lock, User, Building, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push(role === "employer" ? "/employers" : "/jobs");
      }, 800);
    }, 600);
  };

  return (
    <div className="container-x py-16 flex justify-center">
      <div className="w-full max-w-md">
        {/* Brand Logo Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 font-display text-xl font-bold text-slate-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Briefcase size={18} />
            </span>
            <span>Career<span className="text-blue-600">Bridge</span></span>
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">Create an Account</h1>
          <p className="mt-1 text-xs text-slate-500">
            {role === "candidate"
              ? "Join verified hiring with guaranteed recruiter reply SLAs"
              : "Post verified jobs and reach pre-screened talent"}
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs">
          {/* Role Toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`flex-1 rounded-lg py-2 transition ${
                role === "candidate" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
              }`}
            >
              I'm a Candidate
            </button>
            <Link
              href="/employers/register"
              className={`flex-1 rounded-lg py-2 text-center transition ${
                role === "employer" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
              }`}
            >
              I'm an Employer
            </Link>
          </div>

          {role === "employer" ? (
            <div className="mt-6 space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
                <Building size={28} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Corporate Employer & Ministry Verification
                </h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  JobsGhuru maintains a verified employer ecosystem. Companies register with official Corporate Identification (CIN), Tax ID (GST/PAN), and authorized office staff credentials.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-left text-xs text-slate-700 space-y-2">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span>Enterprise Registration Checklist:</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>Company CIN / LLPIN & GSTIN / Tax Records</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>Registered Headquarters Address & Corporate Domain</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>Authorized Office Staff ID & Corporate Email Verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>Target Tech Stack, Role Profiles & Company Perks</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/employers/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-blue-700"
              >
                <span>Continue to Enterprise Registration Wizard</span>
                <span className="text-base font-normal">→</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Full Name</label>
              <div className="relative mt-1.5">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                {role === "candidate" ? "Email Address" : "Work Email Address"}
              </label>
              <div className="relative mt-1.5">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "candidate" ? "you@example.com" : "name@company.com"}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <div className="relative mt-1.5">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="py-1">
              <ul className="space-y-1.5 text-[11px] text-slate-500">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>100% verified scam-free employers</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Guaranteed response SLA on applications</span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="mt-2 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : success ? "✓ Account Created! Welcome..." : "Create Account"}
            </button>
          </form>
        )}
        </div>

        {/* Footer link to Log in */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
