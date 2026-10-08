"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  Users,
  Check,
  Briefcase,
} from "lucide-react";

export default function EmployerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [pendingCompany, setPendingCompany] = useState("");
  const [adminRedirect, setAdminRedirect] = useState<{ url: string; msg: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [existingUser, setExistingUser] = useState<{ companyName?: string; email?: string } | null>(null);

  // If already logged in, show status or redirect to dashboard
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const res = await fetch("/api/employer/auth/session", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.authenticated && data.employer) {
            setExistingUser({
              companyName: data.employer.companyName,
              email: data.employer.email,
            });
            if (!searchParams.get("switch")) {
              router.push("/employer/dashboard");
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
    checkExistingSession();
  }, [router, searchParams]);

  const handleQuickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError(null);
    setAdminRedirect(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingApproval(false);
    setAdminRedirect(null);
    setLoading(true);

    try {
      const res = await fetch("/api/employer/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isAdminAccount) {
          setAdminRedirect({
            url: "/admin/login",
            msg: data.error || "This is a JobsGhuru Platform Admin account.",
          });
        }
        if (data.pendingApproval) {
          setPendingApproval(true);
          setPendingCompany(data.companyName || "Your Company");
          setError(data.error);
        } else {
          setError(data.error || "Failed to sign in. Please verify your company credentials.");
        }
        return;
      }

      setSuccess(true);
      setSuccessMessage(
        `Welcome back to ${data.companyName || "your workspace"}! Redirecting to company dashboard...`
      );

      setTimeout(() => {
        router.push(data.redirectUrl || "/employer/dashboard");
      }, 700);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FC] via-[#EEF5FC] to-[#E6F0FA] py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-blue-950/5 border border-blue-100/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* LEFT COLUMN: Bright, Soft-Blue Corporate Recruiter Showcase (Exact Style of User Image 4) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#F0F6FF] via-[#EBF3FE] to-[#E3EEFB] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-blue-100/70">
          {/* Brand Header */}
          <div>
            <Link href="/employers" className="inline-flex items-center gap-2.5 font-display text-xl font-extrabold text-slate-900 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition">
                <Building2 size={18} />
              </span>
              <span>Career<span className="text-blue-600">Bridge</span></span>
            </Link>

            <div className="mt-6">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full">
                <Users size={13} className="text-blue-600" />
                Employer & Recruiter Portal
              </span>
              <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Hire qualified, verified talent faster.
              </h2>
            </div>
          </div>

          {/* Center Image Container: Matching User Image 4 */}
          <div className="my-6 relative flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-[4/3] rounded-2xl overflow-hidden shadow-md shadow-blue-900/10 border-2 border-white bg-white">
              <Image
                src="/images/auth/employer_user_ref.png"
                alt="Corporate Hiring Team Collaborating"
                fill
                className="object-cover object-center"
                priority
              />
            </div>

            {/* Floating Value Pill */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 shadow-xs border border-blue-100 text-xs font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Trusted by 1,200+ Verified Companies</span>
            </div>
          </div>

          {/* Value Bullet Points */}
          <div className="space-y-2.5 bg-white/70 backdrop-blur-xs rounded-2xl p-4 border border-blue-100/80 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <span>1-Click Company Approval Workflow</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <span>Live Application Kanban & Interview Scheduler</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <span>100% Isolated Company Tenant Database</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Crisp, Clean White Corporate Sign In Canvas */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white">
          {/* Card Top */}
          <div>
            <div className="flex items-center justify-between pb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Employer Sign In
              </span>
              <Link
                href="/employers/register"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
              >
                <span>New company? Register</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Company Recruiter Sign In
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Enter your official corporate credentials to access your company&apos;s isolated hiring dashboard.
            </p>

            {/* Active Session Notification */}
            {existingUser && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-emerald-950">
                      Active Session: {existingUser.companyName}
                    </div>
                    <div className="text-slate-600 text-[11px] truncate">
                      {existingUser.email}
                    </div>
                  </div>
                </div>
                <Link
                  href="/employer/dashboard"
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 font-bold text-xs text-white hover:bg-emerald-700 transition shadow-xs shrink-0"
                >
                  <span>Enter Dashboard</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}

            {/* Platform Admin Account Redirect Notice */}
            {adminRedirect && (
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 shadow-xs">
                <div className="font-bold flex items-center gap-2 text-sm mb-1.5">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span>Platform Admin Account Detected</span>
                </div>
                <p className="text-[12px] text-slate-600 leading-relaxed mb-3">
                  {adminRedirect.msg}
                </p>
                <Link
                  href={adminRedirect.url}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white transition shadow-xs"
                >
                  <span>Go to Platform Admin Sign In</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* Error Banner */}
            {error && !adminRedirect && (
              <div
                className={`mt-4 rounded-2xl border p-4 text-xs flex items-start gap-3 ${
                  pendingApproval
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {pendingApproval ? (
                  <Clock size={18} className="shrink-0 text-amber-600 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold text-sm">
                    {pendingApproval ? `Verification Pending for ${pendingCompany}` : "Authentication Notice"}
                  </div>
                  <div className="leading-relaxed">{error}</div>
                </div>
              </div>
            )}

            {/* Success Banner */}
            {success && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div className="font-bold text-sm">{successMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Official Work Email</label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="recruiter@yourcompany.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-10 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <span className="text-[11px] text-slate-400">From official approval email</span>
                </div>
                <div className="relative mt-1.5">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your company password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-10 pr-10 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
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

                <Link href="/employers/contact-sales" className="text-xs font-semibold text-blue-600 hover:underline">
                  Need Help?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="mt-3 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 py-3.5 text-xs font-extrabold text-white shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span>Verifying credentials...</span>
                ) : success ? (
                  <span>Authentication Granted</span>
                ) : (
                  <>
                    <span>Sign In to Company Dashboard</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Test Demo Credentials */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2.5">
                Quick Test Company Accounts
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill("recruiter@northwindlabs.com", "Recruiter@123")}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-left hover:border-blue-400 hover:bg-white transition"
                >
                  <div className="font-bold text-[11px] text-slate-800 flex items-center gap-1.5">
                    <Building2 size={13} className="text-blue-600" /> Northwind Labs
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">recruiter@northwindlabs.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("hr.admin@bluepeak.com", "Employer@123")}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-left hover:border-blue-400 hover:bg-white transition"
                >
                  <div className="font-bold text-[11px] text-slate-800 flex items-center gap-1.5">
                    <Building2 size={13} className="text-blue-600" /> Bluepeak Systems
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">hr.admin@bluepeak.com</div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>© {new Date().getFullYear()} JobsGhuru. All rights reserved.</div>
            <div className="flex items-center gap-4 text-[11px]">
              <Link href="/login" className="hover:text-blue-600 transition">
                Candidate Sign In
              </Link>
              <span>•</span>
              <Link href="/admin/login" className="hover:text-slate-800 transition font-medium">
                JobsGhuru Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
