"use me";
"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  X,
  Copy,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
  IndianRupee,
  Eye,
} from "lucide-react";

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planCode: string;
  priceInr: number;
  onSuccess?: () => void;
}

export function SubscriptionPaymentModal({
  isOpen,
  onClose,
  planName,
  planCode,
  priceInr,
  onSuccess,
}: SubscriptionPaymentModalProps) {
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrInput, setUtrInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/payments/checkout?amount=${priceInr}&planName=${encodeURIComponent(planName)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setCheckoutData(data);
          }
        })
        .catch((e) => console.error("Checkout config fetch error", e))
        .finally(() => setLoading(false));
    }
  }, [isOpen, priceInr, planName]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    if (checkoutData?.upiId) {
      navigator.clipboard.writeText(checkoutData.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleConfirmUpiPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput.trim()) {
      setStatusMsg({ type: "error", text: "Please enter your 12-digit UPI Reference / UTR Number." });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/employer/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode,
          paymentMethod: "UPI_QR",
          utrNumber: utrInput,
          amountInr: checkoutData?.totalAmount || priceInr,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment verification failed");

      setStatusMsg({
        type: "success",
        text: "Payment received! Your subscription plan has been activated successfully.",
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "Failed to confirm payment. Please check your UTR number.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">
            <Sparkles size={14} />
            <span>JobsGhuru Employer Subscription</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 font-display">
            Subscribe to {planName}
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Loader2 size={28} className="animate-spin mx-auto text-blue-600" />
            <p className="text-xs font-bold">Loading Live Payment Gateway & UPI QR...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Price Breakdown Card */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Plan Price</span>
                <span className="font-mono font-bold">₹{checkoutData?.baseAmount?.toLocaleString() || priceInr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST ({checkoutData?.gstTaxRate || 18}%)</span>
                <span className="font-mono font-bold">₹{checkoutData?.gstAmount?.toLocaleString() || 0}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 font-extrabold text-sm">
                <span>Total Payable Amount</span>
                <span className="font-mono text-blue-600 text-base">₹{checkoutData?.totalAmount?.toLocaleString() || priceInr}</span>
              </div>
            </div>

            {/* Notification Feedback */}
            {statusMsg && (
              <div
                className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                  statusMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Dynamic UPI QR Code Section (Image 1 Design) */}
            {checkoutData?.enableUpiQr && (
              <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-b from-white to-emerald-50/30 p-5 sm:p-6 shadow-sm text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Eye size={14} className="text-emerald-600" />
                  <span>Live Generated QR Code Preview</span>
                </div>

                {/* Live QR Image */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-inner">
                  <img
                    src={checkoutData?.qrCodeUrl}
                    alt="Scan UPI QR Code to Pay"
                    className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain rounded-xl"
                  />
                </div>

                {/* Business UPI ID with Copy Button */}
                <div className="space-y-1">
                  <div className="text-sm font-extrabold text-slate-800 flex items-center justify-center gap-2 flex-wrap">
                    <span>UPI ID:</span>
                    <span className="font-mono text-amber-700 font-black text-sm sm:text-base">
                      {checkoutData?.upiId || "manishmadhava91@okicici"}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1 text-slate-400 hover:text-blue-600 transition shrink-0 cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Scan with GPay or PhonePe to test. When saved, this QR will be generated live with <strong>auto-prefilled checkout amounts</strong> on both websites!
                  </p>
                </div>

                {/* UTR Entry Form */}
                <form onSubmit={handleConfirmUpiPayment} className="space-y-3 pt-2 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Transaction UTR / Reference ID (12 Digits) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="e.g. 428901928374"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying Payment...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Confirm Payment & Activate Subscription</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
