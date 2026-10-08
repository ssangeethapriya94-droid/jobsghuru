"use client";

import { useState } from "react";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";
import AdminKpiCard from "./AdminKpiCard";

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
  plans,
  subscriptions,
  payments,
  initialTab = "subscriptions",
}: {
  plans: PlanItem[];
  subscriptions: SubscriptionItem[];
  payments: PaymentItem[];
  initialTab?: "subscriptions" | "payments" | "plans";
}) {
  const [tab, setTab] = useState<"subscriptions" | "payments" | "plans">(initialTab);
  const [search, setSearch] = useState("");

  const activeSubscriptions = subscriptions.filter((s) => s.status === "ACTIVE");
  const totalMrrInr = activeSubscriptions.reduce((acc, curr) => acc + curr.priceInr, 0);
  const totalRevenueInr = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((acc, curr) => acc + curr.amountInr, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 mb-2">
              <CreditCard className="w-3.5 h-3.5" />
              Monetization & Invoicing Hub
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Subscriptions & Financial Ledgers</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Track employer subscription tiers, monthly recurring revenue (MRR), GST compliant invoices, and gateway settlements across India.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-center">
              <div className="text-xs text-slate-300">Live MRR</div>
              <div className="text-xl font-bold text-emerald-400">
                ₹{totalMrrInr.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <AdminKpiCard
          title="Monthly Recurring Rev"
          value={`₹${(totalMrrInr / 1000).toFixed(1)}k`}
          change="+24% vs last mo"
          trend="up"
          subtitle="Contracted ARR ~₹{((totalMrrInr * 12) / 100000).toFixed(2)}L"
          icon={<IndianRupee className="w-5 h-5 text-emerald-600" />}
        />
        <AdminKpiCard
          title="Active Paid Subscriptions"
          value={activeSubscriptions.length}
          change="98.2% retention"
          trend="up"
          subtitle="Enterprise & Growth Tiers"
          icon={<Building2 className="w-5 h-5 text-blue-600" />}
        />
        <AdminKpiCard
          title="Gross Billed Collections"
          value={`₹${(totalRevenueInr / 1000).toFixed(1)}k`}
          change="All-time gross receipts"
          trend="neutral"
          subtitle="100% UPI & Razorpay Settled"
          icon={<DollarSign className="w-5 h-5 text-purple-600" />}
        />
        <AdminKpiCard
          title="Payment Success Rate"
          value="99.4%"
          change="0 chargebacks"
          trend="up"
          subtitle="Instant webhook sync"
          icon={<ShieldCheck className="w-5 h-5 text-teal-600" />}
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none">
        <button
          onClick={() => setTab("subscriptions")}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-1 shrink-0 ${
            tab === "subscriptions"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Active Subscriptions ({subscriptions.length})
        </button>
        <button
          onClick={() => setTab("payments")}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-1 shrink-0 ${
            tab === "payments"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Transactions & Invoices ({payments.length})
        </button>
        <button
          onClick={() => setTab("plans")}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-1 shrink-0 ${
            tab === "plans"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Pricing Plans ({plans.length})
        </button>
      </div>

      {/* Subscriptions Tab */}
      {tab === "subscriptions" && (
        <>
          {/* Mobile Cards (< 768px) */}
          <div className="block md:hidden space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {sub.companyName || "Candidate Subscriber"}
                    </h3>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 text-[11px] inline-block mt-0.5">
                      {sub.planName}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    {sub.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ₹{sub.priceInr.toLocaleString("en-IN")} / mo
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Renewal</span>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(sub.currentEnd).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono text-[10px] text-slate-400 pt-1">
                  ID: {sub.id}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 768px) */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Subscriber</th>
                    <th className="px-5 py-3.5">Plan Level</th>
                    <th className="px-5 py-3.5">Rate / Billing</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Renewal Date</th>
                    <th className="px-5 py-3.5 text-right">Subscription ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {sub.companyName || "Candidate Subscriber"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60">
                          {sub.planName}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">
                        ₹{sub.priceInr.toLocaleString("en-IN")} / mo
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          {sub.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(sub.currentEnd).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-xs text-slate-400">
                        {sub.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Payments Tab */}
      {tab === "payments" && (
        <>
          {/* Mobile Cards (< 768px) */}
          <div className="block md:hidden space-y-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-xs font-mono block">
                      {p.invoiceNumber}
                    </span>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                      {p.companyName || "Platform User"}
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ₹{p.amountInr.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Method</span>
                    <span className="text-slate-500 text-[11px]">{p.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                  <span>Plan: {p.planName}</span>
                  <span>
                    {new Date(p.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 768px) */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
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
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                  {payments.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-bold text-blue-600 dark:text-blue-400">
                        {p.invoiceNumber}
                      </td>

                      <td className="px-5 py-3.5 font-sans font-semibold text-slate-900 dark:text-slate-100">
                        {p.companyName || "Platform User"}
                      </td>

                      <td className="px-5 py-3.5 font-sans text-slate-600 dark:text-slate-400">
                        {p.planName}
                      </td>

                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                        ₹{p.amountInr.toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-3.5 font-sans text-slate-500">
                        {p.paymentMethod}
                      </td>

                      <td className="px-5 py-3.5 font-sans">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
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
        </>
      )}

      {/* Plans Tab */}
      {tab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    {plan.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Active
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {plan.name}
                </h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                    ₹{plan.priceInr.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-500">/ {plan.billingCycle.toLowerCase()}</span>
                </div>

                <ul className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-slate-400">
                    <span>Limit: {plan.jobLimit} Active Job Postings</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <span>Limit: {plan.resumeLimit} Resume Downloads / mo</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors">
                  Edit Plan Parameters
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
