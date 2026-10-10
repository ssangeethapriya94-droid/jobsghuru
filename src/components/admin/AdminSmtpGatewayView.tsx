"use me";
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Server,
  ShieldCheck,
  Bell,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
  ExternalLink,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

export interface SmtpConfigState {
  smtpHost: string;
  smtpPort: string;
  useSslTls: boolean;
  smtpUsername: string;
  smtpPassword?: string;
  fromDisplayName: string;
  fromEmailAddress: string;
  adminNotificationEmail: string;
  triggerJobApplications: boolean;
  triggerEmployerPostings: boolean;
  triggerSubscriptions: boolean;
  triggerCampaigns: boolean;
}

export default function AdminSmtpGatewayView({
  initialConfig,
}: {
  initialConfig?: SmtpConfigState;
}) {
  const [config, setConfig] = useState<SmtpConfigState>(() => ({
    smtpHost: initialConfig?.smtpHost || "smtp.hostinger.com",
    smtpPort: initialConfig?.smtpPort || "465",
    useSslTls: initialConfig?.useSslTls !== undefined ? initialConfig.useSslTls : true,
    smtpUsername: initialConfig?.smtpUsername || "info@jobshuru.com",
    smtpPassword: initialConfig?.smtpPassword || "••••••••••••",
    fromDisplayName: initialConfig?.fromDisplayName || "JobsGhuru",
    fromEmailAddress: initialConfig?.fromEmailAddress || "info@jobshuru.com",
    adminNotificationEmail: initialConfig?.adminNotificationEmail || "info@jobshuru.com",
    triggerJobApplications: initialConfig?.triggerJobApplications !== undefined ? initialConfig.triggerJobApplications : true,
    triggerEmployerPostings: initialConfig?.triggerEmployerPostings !== undefined ? initialConfig.triggerEmployerPostings : true,
    triggerSubscriptions: initialConfig?.triggerSubscriptions !== undefined ? initialConfig.triggerSubscriptions : true,
    triggerCampaigns: initialConfig?.triggerCampaigns !== undefined ? initialConfig.triggerCampaigns : true,
  }));

  const [showPassword, setShowPassword] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState(initialConfig?.smtpUsername || "info@jobshuru.com");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save SMTP settings");

      setStatusMessage({
        type: "success",
        text: "SMTP & Email Gateway settings saved successfully!",
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to save settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailInput.trim()) {
      setStatusMessage({ type: "error", text: "Please enter a target email address for the test." });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/smtp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: testEmailInput,
          ...config,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to deliver test message");

      setStatusMessage({
        type: "success",
        text: data.message || `Test email dispatched to ${testEmailInput}!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "SMTP connection test failed. Check host, port, and password.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12">
      
      {/* Top Console Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-600 uppercase tracking-wider">
            <span>ADMIN CONSOLE</span>
            <span>›</span>
            <span>EMAIL & SMTP GATEWAY</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2.5">
              <Mail className="w-7 h-7 text-emerald-600" />
              <span>Email & SMTP Gateway Controls</span>
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              JobsGhuru Mailer Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure SMTP credentials, sender identities, and automated notification triggers for JobsGhuru.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE SYSTEM
          </span>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <span>View Site</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* Alert / Notification Feedback Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold animate-in fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: Outgoing SMTP Server Configuration */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                <Server size={18} />
              </span>
              <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                1. Outgoing SMTP Server Configuration
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Host & Port
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">
            {/* SMTP Host */}
            <div className="md:col-span-8 space-y-1.5">
              <label className="block font-bold text-slate-700">
                SMTP Server Host <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={config.smtpHost}
                onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                placeholder="smtp.hostinger.com or smtp.gmail.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Port */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="block font-bold text-slate-700">
                Port <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={config.smtpPort}
                onChange={(e) => setConfig({ ...config, smtpPort: e.target.value })}
                placeholder="465"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* SSL/TLS Checkbox */}
            <div className="md:col-span-12 pt-1">
              <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={config.useSslTls}
                  onChange={(e) => setConfig({ ...config, useSslTls: e.target.checked })}
                  className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  Use SSL / TLS Encryption (Recommended <code className="text-emerald-700 font-mono">true</code> for Port 465, <code className="text-slate-600 font-mono">false</code> for Port 587/STARTTLS)
                </span>
              </label>
            </div>

            {/* Username / Sender Email */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="block font-bold text-slate-700">
                SMTP Username / Sender Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={config.smtpUsername}
                onChange={(e) => setConfig({ ...config, smtpUsername: e.target.value })}
                placeholder="info@jobshuru.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Password */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="block font-bold text-slate-700">
                SMTP Password / Google App Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={config.smtpPassword}
                  onChange={(e) => setConfig({ ...config, smtpPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pr-10 rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Setup Guide Box */}
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-4 flex items-start gap-3 text-xs text-emerald-900">
            <Info size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Quick Setup Guide:</span>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                <strong>Gmail users:</strong> Generate a 16-character <em>App Password</em> from your Google Account (Security &gt; 2-Step Verification &gt; App Passwords).<br />
                <strong>Hostinger / Zoho / cPanel:</strong> Set Host to your SMTP address, port to 465 (SSL checked) or 587, and use your regular inbox password.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Sender Identity & Commercial Alert Inbox */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center h-8 w-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
                <ShieldCheck size={18} />
              </span>
              <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                2. Sender Identity & Commercial Alert Inbox
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Branding
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* From Display Name */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">From Display Name</label>
              <input
                type="text"
                value={config.fromDisplayName}
                onChange={(e) => setConfig({ ...config, fromDisplayName: e.target.value })}
                placeholder="JobsGhuru"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* From Email Address */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">From Email Address</label>
              <input
                type="email"
                value={config.fromEmailAddress}
                onChange={(e) => setConfig({ ...config, fromEmailAddress: e.target.value })}
                placeholder="info@jobshuru.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Admin Notification Alert Email */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block font-bold text-slate-700">
                Admin Notification Alert Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={config.adminNotificationEmail}
                onChange={(e) => setConfig({ ...config, adminNotificationEmail: e.target.value })}
                placeholder="info@jobshuru.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
              <p className="text-[11px] text-slate-400">
                Where alerts for new candidate applications, employer job requisitions, ad campaigns, and paid subscribers are sent.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: Automated Email Notification Triggers */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center h-8 w-8 rounded-xl bg-purple-50 border border-purple-100 text-purple-700">
                <Bell size={18} />
              </span>
              <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                3. Automated Email Notification Triggers
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Toggles
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Trigger 1 */}
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={config.triggerJobApplications}
                onChange={(e) => setConfig({ ...config, triggerJobApplications: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-slate-900 block">
                  Job Application & Candidate Inquiries (/jobs/apply)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Sends candidate confirmation receipt and notifies recruiter desk with application details.
                </span>
              </div>
            </label>

            {/* Trigger 2 */}
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={config.triggerEmployerPostings}
                onChange={(e) => setConfig({ ...config, triggerEmployerPostings: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-slate-900 block">
                  Employer Job Posting & Requisitions (/employer/jobs/create)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Sends employer posting acknowledgment and notifies admin moderation desk.
                </span>
              </div>
            </label>

            {/* Trigger 3 */}
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={config.triggerSubscriptions}
                onChange={(e) => setConfig({ ...config, triggerSubscriptions: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-slate-900 block">
                  Member Subscriptions & Billing (/employer/pricing)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Sends member welcome email with plan receipt and benefits overview.
                </span>
              </div>
            </label>

            {/* Trigger 4 */}
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={config.triggerCampaigns}
                onChange={(e) => setConfig({ ...config, triggerCampaigns: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-slate-900 block">
                  Advertisement Campaign Submissions (/advertise)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Sends advertiser booking acknowledgment and notifies ad operations desk.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 4: Live SMTP Connection Diagnostic */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center h-8 w-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-700">
                <Send size={18} />
              </span>
              <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                4. Live SMTP Connection Diagnostic
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              1-Click Test
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Send a live test message to verify that your SMTP host, port, username, and password connect without delivery errors.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="email"
              value={testEmailInput}
              onChange={(e) => setTestEmailInput(e.target.value)}
              placeholder="info@jobshuru.com"
              className="w-full sm:flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isTesting}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isTesting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Send Test Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving Configuration...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Save Email & SMTP Settings</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
