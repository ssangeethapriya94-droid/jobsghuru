"use client";

import { useState } from "react";
import { X, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

export interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  actionLabel?: string;
  confirmVariant?: "danger" | "warning" | "primary" | "success" | string;
  variant?: "danger" | "warning" | "primary" | "success" | string;
  requireReason?: boolean;
  onConfirm: (reason: string, notes?: string) => Promise<void>;
}

export default function AdminActionModal({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel,
  actionLabel,
  confirmVariant,
  variant,
  requireReason = true,
  onConfirm,
}: AdminActionModalProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const label = confirmLabel || actionLabel || "Confirm";
  const activeVariant = confirmVariant || variant || "primary";

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireReason && (!reason.trim() || reason.trim().length < 5)) {
      setError("Please specify a valid audit reason (minimum 5 characters).");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await onConfirm(reason.trim() || "Approved by JobsGuru Admin", notes.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Action failed to execute");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonStyles = () => {
    switch (activeVariant) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                activeVariant === "danger"
                  ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/50 dark:border-rose-900"
                  : activeVariant === "warning"
                  ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/50 dark:border-amber-900"
                  : activeVariant === "success"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/50 dark:border-emerald-900"
                  : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/50 dark:border-blue-900"
              }`}
            >
              {activeVariant === "danger" || activeVariant === "warning" ? (
                <AlertTriangle size={18} />
              ) : activeVariant === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <ShieldCheck size={18} />
              )}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit-enforced administrative action
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Description */}
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
          {description}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason / Justification {requireReason && <span className="text-rose-500">*</span>}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a specific rationale (e.g. 'Failed GSTIN physical address verification', 'Violates section 4 anti-ghosting policies')."
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              This reason will be immutably recorded in the platform Audit Log with your ID.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Internal Moderator Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional investigation ticket #, escalation ref, or notes"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-2xl px-5 py-2.5 text-xs font-bold shadow-sm transition hover:opacity-95 disabled:opacity-50 ${getButtonStyles()}`}
            >
              {isSubmitting ? "Executing..." : label}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
