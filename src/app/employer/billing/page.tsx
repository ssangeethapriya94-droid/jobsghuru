"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function EmployerBillingPage() {
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employer/billing")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setBilling(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const payments = billing?.payments || [];
  const subscription = billing?.subscription || {
    planName: "Growth Scale Partnership",
    status: "ACTIVE",
    currentEnd: new Date(Date.now() + 24 * 86400000),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Billing & Invoices</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View subscription renewal dates, payment methods, and GST-compliant tax invoices.
        </p>
      </div>

      {/* Subscription Status Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-slate-400">Current Subscription</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
              {subscription.planName}
              <span className="rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5">
                {subscription.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/employers/plans"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              Change Plan
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Next Renewal Date</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {new Date(subscription.currentEnd).toLocaleDateString("en-IN", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Payment Method</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              UPI / NetBanking Corporate Auto-Debit
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Billing Support</span>
            <span className="font-bold text-blue-600 text-sm mt-0.5 block">
              billing@jobsghuru.com
            </span>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <h2 className="font-display text-base font-bold text-slate-900 mb-4">
          Invoice & Payment History
        </h2>

        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Plan / Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-700">{p.planName}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{p.amountInr.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Receipt ${p.invoiceNumber} generated for ₹${p.amountInr}.`)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition inline-flex items-center gap-1 font-semibold"
                      >
                        <Download size={12} /> Tax Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No past invoices on file. Initial registration invoice will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
