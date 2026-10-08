"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Send,
  User,
  ShieldCheck,
} from "lucide-react";

export default function EmployerOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    roleTitle: "Senior Frontend Engineer",
    baseSalaryLpa: "16",
    variableLpa: "2",
    startDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    terms: "Full-time employment agreement with health coverage and annual performance appraisals.",
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = () => {
    setLoading(true);
    fetch("/api/employer/offers")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setOffers(d.offers);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/employer/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        fetchOffers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (offerId: string, status: string) => {
    try {
      const res = await fetch("/api/employer/offers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, status }),
      });
      if (res.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offerId ? { ...o, status } : o))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Offer Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate formal employment offer letters, track sign-offs, and advance candidates to Hired.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={14} /> Create Formal Offer
        </button>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : offers.length > 0 ? (
        <div className="space-y-3.5">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-display text-sm font-bold text-slate-900">{offer.candidateName}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      offer.status === "ACCEPTED"
                        ? "bg-emerald-50 text-emerald-700"
                        : offer.status === "SENT"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {offer.status}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="font-medium text-slate-800">{offer.roleTitle}</span>
                  <span>•</span>
                  <span className="font-bold text-slate-900">
                    ₹{offer.baseSalaryLpa} LPA {offer.variableLpa > 0 ? `(+ ₹${offer.variableLpa} LPA Variable)` : ""}
                  </span>
                  <span>•</span>
                  <span>Start Date: {new Date(offer.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span>•</span>
                  <span className="text-slate-400">Expires: {new Date(offer.expiryDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                </div>

                <p className="mt-2 text-xs text-slate-500 max-w-xl line-clamp-1">{offer.terms}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {offer.status === "SENT" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(offer.id, "ACCEPTED")}
                      className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                      Mark Accepted
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(offer.id, "DECLINED")}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Declined
                    </button>
                  </>
                )}

                {offer.status === "ACCEPTED" && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 size={14} /> Candidate Hired
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <FileCheck size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-display text-base font-bold text-slate-900">No Offers Extended Yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Extend formal employment contracts to shortlisted and interviewed candidates.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
            >
              <Plus size={14} /> Create First Offer
            </button>
          </div>
        </div>
      )}

      {/* CREATE OFFER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900">Generate Employment Offer</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Name *</label>
                <input
                  type="text"
                  required
                  value={form.candidateName}
                  onChange={(e) => setForm({ ...form, candidateName: e.target.value })}
                  placeholder="e.g. Anandha Krishnan"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Email</label>
                <input
                  type="email"
                  value={form.candidateEmail}
                  onChange={(e) => setForm({ ...form, candidateEmail: e.target.value })}
                  placeholder="anand@example.com"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Offered Role Title *</label>
                <input
                  type="text"
                  required
                  value={form.roleTitle}
                  onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Salary (LPA ₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form.baseSalaryLpa}
                    onChange={(e) => setForm({ ...form, baseSalaryLpa: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Variable Pay (LPA ₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.variableLpa}
                    onChange={(e) => setForm({ ...form, variableLpa: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Offer Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Generating..." : "Dispatch Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
