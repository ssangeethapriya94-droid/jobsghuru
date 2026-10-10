"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Check,
  X,
  Sparkles,
  Building2,
  Receipt,
  Layers,
  IndianRupee,
  ShieldCheck,
  Clock,
  Search,
} from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  type: string;
  priceInr: number;
  billingCycle: string;
  features: string[];
  jobLimit: number;
  resumeLimit: number;
  active: boolean;
  durationMonths?: number;
  recommended?: boolean;
}

interface SubscriptionItem {
  id: string;
  companyName: string | null;
  planName: string;
  priceInr: number;
  status: string;
  currentStart: string;
  currentEnd: string;
  createdAt: string;
}

interface PaymentItem {
  id: string;
  invoiceNumber: string;
  companyName: string | null;
  planName: string;
  amountInr: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminBillingView({
  plans: initialPlans,
  subscriptions,
  payments,
  initialTab = "plans",
}: {
  plans: PlanItem[];
  subscriptions: SubscriptionItem[];
  payments: PaymentItem[];
  initialTab?: "subscriptions" | "payments" | "plans";
}) {
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
  const [activeTab, setActiveTab] = useState<"plans" | "subscriptions" | "payments">(initialTab);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState<string>("");
  const [formDurationLabel, setFormDurationLabel] = useState("");
  const [formDurationMonths, setFormDurationMonths] = useState<string>("1");
  const [formRecommended, setFormRecommended] = useState(false);
  const [benefitInput, setBenefitInput] = useState("");
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddBenefit = () => {
    if (!benefitInput.trim()) return;
    setBenefitsList((prev) => [...prev, benefitInput.trim()]);
    setBenefitInput("");
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefitsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartEdit = (plan: PlanItem) => {
    setEditingPlanId(plan.id);
    setFormName(plan.name);
    setFormPrice(plan.priceInr.toString());
    setFormDurationLabel(plan.billingCycle);
    setFormDurationMonths((plan.durationMonths || 1).toString());
    setFormRecommended(plan.recommended || false);
    setBenefitsList([...plan.features]);
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
    setFormName("");
    setFormPrice("");
    setFormDurationLabel("");
    setFormDurationMonths("1");
    setFormRecommended(false);
    setBenefitsList([]);
    setBenefitInput("");
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice.trim()) {
      alert("Please provide a plan name and price.");
      return;
    }

    setIsSubmitting(true);
    const priceNum = parseInt(formPrice, 10) || 0;
    const monthsNum = parseInt(formDurationMonths, 10) || 1;

    try {
      if (editingPlanId) {
        // UPDATE PLAN
        const res = await fetch("/api/admin/plans", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingPlanId,
            name: formName.trim(),
            priceInr: priceNum,
            billingCycle: formDurationLabel.trim() || `${monthsNum} Month`,
            features: benefitsList,
            jobLimit: monthsNum > 6 ? 20 : 5,
            resumeLimit: monthsNum > 6 ? 500 : 100,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update plan");

        setPlans((prev) =>
          prev.map((p) =>
            p.id === editingPlanId
              ? {
                  ...p,
                  name: formName.trim(),
                  priceInr: priceNum,
                  billingCycle: formDurationLabel.trim() || `${monthsNum} Month`,
                  features: benefitsList,
                  durationMonths: monthsNum,
                  recommended: formRecommended,
                }
              : p
          )
        );
        showToast("Subscription plan updated successfully!");
        handleCancelEdit();
      } else {
        // CREATE NEW PLAN
        const res = await fetch("/api/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            priceInr: priceNum,
            billingCycle: formDurationLabel.trim() || `${monthsNum} Month`,
            features: benefitsList,
            jobLimit: monthsNum > 6 ? 20 : 5,
            resumeLimit: monthsNum > 6 ? 500 : 100,
            type: "EMPLOYER",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create plan");

        if (data.plan) {
          setPlans((prev) => [
            ...prev,
            {
              id: data.plan.id,
              name: data.plan.name,
              type: data.plan.type,
              priceInr: data.plan.priceInr,
              billingCycle: data.plan.billingCycle,
              features: data.plan.features,
              jobLimit: data.plan.jobLimit,
              resumeLimit: data.plan.resumeLimit,
              active: true,
              durationMonths: monthsNum,
              recommended: formRecommended,
            },
          ]);
        }
        showToast("New subscription plan created successfully!");
        handleCancelEdit();
      }
    } catch (err: any) {
      alert(err.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the plan "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/plans?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete plan");

      setPlans((prev) => prev.filter((p) => p.id !== id));
      showToast(`Plan "${name}" has been deleted.`);
      if (editingPlanId === id) handleCancelEdit();
    } catch (err: any) {
      alert(err.message || "Failed to delete plan.");
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
            Subscription Plans & Monetization
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Configure employer pricing tiers, subscription duration perks, and corporate billing features dynamically.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 text-xs font-semibold text-slate-600 shadow-2xs overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("plans")}
            className={`rounded-xl px-4 py-2 transition whitespace-nowrap ${
              activeTab === "plans"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Subscription Plans ({plans.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("subscriptions")}
            className={`rounded-xl px-4 py-2 transition whitespace-nowrap ${
              activeTab === "subscriptions"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Active Subscriptions ({subscriptions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`rounded-xl px-4 py-2 transition whitespace-nowrap ${
              activeTab === "payments"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Invoices & Payments ({payments.length})
          </button>
        </div>
      </div>

      {activeTab === "plans" && (
        <>
          {/* Subscription Plans Manager Hero Banner (JobsGhuru Royal Blue Theme) */}
          <div className="rounded-3xl border border-blue-200/90 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white p-5 sm:p-6 shadow-2xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
              <CreditCard size={22} />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-slate-900 tracking-tight">
                Subscription Plans Manager
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Configure and manage subscription plans, member perks, and pricing dynamically for JobsGhuru employers.
              </p>
            </div>
          </div>

          {/* Main Grid Layout: Left Cards (2 Cols) & Right Add/Edit Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* LEFT & CENTER: PLAN CARDS GRID (2 Columns) */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-3xl border bg-white p-6 shadow-xs flex flex-col justify-between transition-all ${
                    editingPlanId === plan.id
                      ? "border-blue-600 ring-2 ring-blue-500/20 shadow-md"
                      : "border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  <div>
                    {/* Plan Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-extrabold text-slate-900 tracking-tight">
                        {plan.name}
                      </h3>
                      {plan.recommended && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200">
                          Recommended
                        </span>
                      )}
                    </div>

                    {/* Price Display */}
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-blue-600 font-display">
                        ₹{plan.priceInr.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        / {plan.billingCycle || "MONTHLY"}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-slate-400 font-medium">
                      Duration: {plan.durationMonths || 1} Month(s)
                    </div>

                    <hr className="my-4 border-slate-100" />

                    {/* Benefits List */}
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                        BENEFITS:
                      </div>

                      <ul className="space-y-2 text-xs text-slate-600 font-medium">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <Check size={15} className="text-blue-600 shrink-0 mt-0.5 stroke-[3]" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Buttons: Edit & Delete */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(plan)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <Edit3 size={14} className="text-slate-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan.id, plan.name)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                    >
                      <Trash2 size={14} className="text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: ADD / EDIT PLAN FORM PANEL */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sticky top-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-display text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  {editingPlanId ? (
                    <>
                      <Edit3 className="w-4 h-4 text-blue-600" />
                      <span>Edit Plan</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-blue-600 stroke-[3]" />
                      <span>Add Plan</span>
                    </>
                  )}
                </h3>

                {editingPlanId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSavePlan} className="mt-5 space-y-4 text-xs">
                {/* Plan Name */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[11px] mb-1">
                    PLAN NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. 1 Month, 1 Year, Annual VIP"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                {/* Price (INR) */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[11px] mb-1">
                    PRICE (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. 129, 999"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                {/* Duration Label */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[11px] mb-1">
                    DURATION LABEL *
                  </label>
                  <input
                    type="text"
                    required
                    value={formDurationLabel}
                    onChange={(e) => setFormDurationLabel(e.target.value)}
                    placeholder="e.g. 2 Month, 6 Months, 1 Year"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                {/* Duration (Months) */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[11px] mb-1">
                    DURATION (MONTHS) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formDurationMonths}
                    onChange={(e) => setFormDurationMonths(e.target.value)}
                    placeholder="e.g. 1, 6, 12"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                {/* Checkbox: Recommended */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="recCheck"
                    checked={formRecommended}
                    onChange={(e) => setFormRecommended(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="recCheck" className="font-semibold text-slate-700 cursor-pointer select-none">
                    Mark as Recommended Plan
                  </label>
                </div>

                {/* Subscription Benefits */}
                <div className="pt-2">
                  <label className="block font-bold text-slate-700 uppercase text-[11px] mb-1">
                    SUBSCRIPTION BENEFITS
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddBenefit();
                        }
                      }}
                      placeholder="Type a benefit..."
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddBenefit}
                      className="h-10 w-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20 transition cursor-pointer"
                    >
                      <Plus size={18} className="stroke-[3]" />
                    </button>
                  </div>

                  {/* Tag Pill List of Added Benefits */}
                  <div className="mt-3 space-y-2">
                    {benefitsList.map((b, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-blue-50/80 border border-blue-200/80 px-3 py-2 text-xs font-semibold text-blue-950"
                      >
                        <span className="truncate pr-2">{b}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(idx)}
                          className="text-slate-400 hover:text-rose-600 transition p-0.5 rounded-lg shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingPlanId
                      ? "Update Plan"
                      : "Create Plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ACTIVE SUBSCRIPTIONS TAB */}
      {activeTab === "subscriptions" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Subscriber / Company</th>
                  <th className="px-5 py-3.5">Plan Level</th>
                  <th className="px-5 py-3.5">Billing Rate</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Renewal Date</th>
                  <th className="px-5 py-3.5 text-right">Subscription ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {sub.companyName || "Candidate Subscriber"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-blue-700 text-xs px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100">
                        {sub.planName}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-slate-900">
                      ₹{sub.priceInr.toLocaleString("en-IN")} / mo
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(sub.currentEnd).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-slate-400">
                      {sub.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSACTIONS & PAYMENTS TAB */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Company</th>
                  <th className="px-5 py-3.5">Plan Item</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Settled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-blue-600">
                      {p.invoiceNumber}
                    </td>
                    <td className="px-5 py-3.5 font-sans font-semibold text-slate-900">
                      {p.companyName || "Platform User"}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-slate-600">
                      {p.planName}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      ₹{p.amountInr.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-slate-500">
                      {p.paymentMethod}
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-sans text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
