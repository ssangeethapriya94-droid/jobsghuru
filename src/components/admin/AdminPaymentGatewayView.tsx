"use me";
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  QrCode,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Upload,
  RefreshCw,
} from "lucide-react";

export interface PaymentConfigState {
  enableRazorpay: boolean;
  enableUpiQr: boolean;
  upiId: string;
  qrImageUrl?: string;
  razorpayKeyId: string;
  razorpayKeySecret?: string;
  gstTaxRate: number;
}

export default function AdminPaymentGatewayView({
  initialConfig,
}: {
  initialConfig?: PaymentConfigState;
}) {
  const [config, setConfig] = useState<PaymentConfigState>(() => ({
    enableRazorpay: initialConfig?.enableRazorpay ?? false,
    enableUpiQr: initialConfig?.enableUpiQr ?? true,
    upiId: initialConfig?.upiId || "manishmadhava91@okicici",
    qrImageUrl: initialConfig?.qrImageUrl || "",
    razorpayKeyId: initialConfig?.razorpayKeyId || "",
    razorpayKeySecret: initialConfig?.razorpayKeySecret || "",
    gstTaxRate: initialConfig?.gstTaxRate ?? 18,
  }));

  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Generate QR Code URL dynamically based on UPI ID or custom QR Image
  const generateQrUrl = (upiId: string, customUrl?: string) => {
    if (customUrl && customUrl.trim().length > 5) {
      return customUrl.trim();
    }
    const upiString = `upi://pay?pa=${encodeURIComponent(upiId || "manishmadhava91@okicici")}&pn=JobsGhuru&cu=INR`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
  };

  const currentQrUrl = generateQrUrl(config.upiId, config.qrImageUrl);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save payment gateway configuration");

      setStatusMessage({
        type: "success",
        text: "Payment Gateway & Business UPI settings saved successfully!",
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to save payment settings.",
      });
    } finally {
      setIsSaving(false);
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
            <span>PAYMENT GATEWAY & UPI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-emerald-600" />
            <span>Payment Gateway & UPI Controls</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
            Manage visible payment methods (Razorpay & Dynamic UPI QR Code), set your business UPI ID, and configure tax rates.
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
        
        {/* CARD 1: Payment Method Visibility Controls */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="space-y-1">
            <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" />
              <span>Payment Method Visibility Controls</span>
            </h2>
            <p className="text-xs text-slate-500">
              Enable or hide payment options displayed to readers across Subscriptions, Advertisements, and Sponsorships checkouts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Option 1: Razorpay Gateway */}
            <label
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                config.enableRazorpay
                  ? "border-emerald-500 bg-emerald-50/20 shadow-2xs"
                  : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/50"
              }`}
            >
              <input
                type="checkbox"
                checked={config.enableRazorpay}
                onChange={(e) => setConfig({ ...config, enableRazorpay: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-900 text-sm block">
                  Razorpay Gateway
                </span>
                <span className="text-xs text-slate-500">
                  Credit/Debit Cards, Netbanking
                </span>
              </div>
            </label>

            {/* Option 2: Dynamic UPI QR Code */}
            <label
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                config.enableUpiQr
                  ? "border-emerald-500 bg-emerald-50/20 shadow-2xs"
                  : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/50"
              }`}
            >
              <input
                type="checkbox"
                checked={config.enableUpiQr}
                onChange={(e) => setConfig({ ...config, enableUpiQr: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-900 text-sm block">
                  Dynamic UPI QR Code
                </span>
                <span className="text-xs text-slate-500">
                  GPay, PhonePe, Paytm, Navi, BHIM
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* CARD 2: Business UPI ID & Live QR Preview */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <QrCode size={18} className="text-emerald-600" />
              <span>Business UPI ID & Live QR Preview</span>
            </h2>
            <p className="text-xs text-slate-500">
              Enter your business UPI ID (VPA). A Dynamic QR Code with <strong>exact auto-prefilled checkout amounts</strong> will be generated and previewed live below!
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* UPI ID Field */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                Business UPI ID (VPA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={config.upiId}
                onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                placeholder="manishmadhava91@okicici"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
              />
              <p className="text-[11px] text-slate-400">
                Payments sent to this UPI ID will go directly to your linked business bank account.
              </p>
            </div>

            {/* Custom QR Image URL / Upload Field */}
            <div className="space-y-1.5 pt-1">
              <label className="block font-bold text-slate-700 flex items-center justify-between">
                <span>Custom QR Code Image URL (Optional Override)</span>
                <span className="text-[10px] text-slate-400 font-normal">Leave blank for auto-generated live QR</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.qrImageUrl || ""}
                  onChange={(e) => setConfig({ ...config, qrImageUrl: e.target.value })}
                  placeholder="https://example.com/qr-code.png or upload image"
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
                />
                {config.qrImageUrl && (
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, qrImageUrl: "" })}
                    className="px-3 py-2 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition shrink-0"
                  >
                    Reset Auto
                  </button>
                )}
              </div>
            </div>

            {/* Live Generated QR Code Preview Box */}
            <div className="pt-2">
              <div className="max-w-md mx-auto rounded-3xl border-2 border-emerald-400/80 bg-white p-6 shadow-sm text-center space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span>👁</span>
                  <span>Live Generated QR Code Preview</span>
                </span>

                {/* QR Image */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-inner">
                  <img
                    src={currentQrUrl}
                    alt="Live UPI QR Code Preview"
                    className="w-56 h-56 mx-auto object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-slate-900">
                    UPI ID: <span className="text-orange-600 font-extrabold">{config.upiId}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Scan with GPay or PhonePe to test. When saved, this QR will be generated live with <strong>auto-prefilled checkout amounts</strong> on both websites!
                  </p>
                </div>
              </div>
            </div>

            {/* Automated Dynamic QR Active Callout Banner */}
            <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/90 p-4 flex items-start gap-3 text-xs text-emerald-900">
              <Sparkles size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-extrabold block text-slate-900">
                  Automated Dynamic QR Generation Active
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Scanning the generated QR code in GPay, PhonePe, Paytm, Navi, or BHIM automatically prefills the exact payable amount for subscriptions, ads, and sponsorships.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Razorpay API Keys & GST Tax Rate */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" />
              <span>Razorpay API Keys & GST Tax Rate</span>
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Razorpay Key ID */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Razorpay Key ID</label>
              <input
                type="text"
                value={config.razorpayKeyId}
                onChange={(e) => setConfig({ ...config, razorpayKeyId: e.target.value })}
                placeholder="rzp_live_xxx or rzp_test_xxx"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Razorpay Key Secret */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Razorpay Key Secret</label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={config.razorpayKeySecret || ""}
                  onChange={(e) => setConfig({ ...config, razorpayKeySecret: e.target.value })}
                  placeholder="Enter secret key"
                  className="w-full pr-10 rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* GST Tax Rate */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">GST Tax Rate (%)</label>
              <input
                type="number"
                value={config.gstTaxRate}
                onChange={(e) => setConfig({ ...config, gstTaxRate: parseFloat(e.target.value) || 0 })}
                placeholder="18"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
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
                <span>Saving Payment Settings...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Save Payment Settings</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
