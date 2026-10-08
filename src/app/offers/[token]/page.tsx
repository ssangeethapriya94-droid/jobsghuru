"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  AlertCircle,
  Building,
  Calendar,
  DollarSign,
} from "lucide-react";

export default function GuestOfferPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterNote, setCounterNote] = useState("");

  useEffect(() => {
    fetchGuestOffer();
  }, [token]);

  const fetchGuestOffer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/offers/${token}`);
      const data = await res.json();
      if (data.success) {
        setOffer(data.offer);
      } else {
        setError(data.error || "Invalid or expired offer link");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (endpoint: string, payload: any = {}) => {
    if (endpoint === "accept" && !confirm("Are you sure you want to accept this employment offer? This action is binding and confirms your employment.")) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/offers/${token}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectModal(false);
        setShowCounterModal(false);
        fetchGuestOffer();
      } else {
        alert(data.error || "Failed to process request");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 min-h-screen flex items-center justify-center">Loading offer letter...</div>;
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="p-8 text-center text-rose-600 bg-white border border-rose-100 rounded-3xl shadow-lg max-w-md w-full">
          <AlertCircle className="mx-auto mb-3 text-rose-500" size={40} />
          <h2 className="font-bold text-lg text-slate-900 mb-1">{error || "Offer Not Found"}</h2>
          <p className="text-xs text-slate-500">This link may have expired or been superseded by a newer version.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              Formal Employment Offer
            </span>
            <h1 className="text-3xl font-extrabold">{offer.roleTitle}</h1>
            <p className="text-blue-200 text-sm mt-1">{offer.companyName} • Extended to {offer.candidateName}</p>
          </div>

          <a
            href={`/api/employer/offers/${offer.id}/pdf?token=${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white text-blue-900 font-bold rounded-xl text-xs hover:bg-blue-50 transition flex items-center gap-1.5 shadow-md"
          >
            <Download size={14} /> Download Official PDF
          </a>
        </div>

        {/* Status Notice */}
        {offer.status === "ACCEPTED" ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span>You have accepted this offer! Congratulations on your new role at {offer.companyName}.</span>
          </div>
        ) : offer.status === "REJECTED" ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 text-xs font-bold">
            <XCircle size={20} className="text-rose-600" />
            <span>You have declined this offer.</span>
          </div>
        ) : offer.status === "COUNTERED" ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-xs font-bold">
            <Clock size={20} className="text-amber-600" />
            <span>Your counter-note has been submitted to the hiring team.</span>
          </div>
        ) : null}

        {/* Offer Details */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b pb-3">Compensation & Structure</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold block">Fixed CTC</span>
              <span className="text-xl font-black text-slate-900">{offer.currency} {offer.fixedCtc} LPA</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold block">Variable Component</span>
              <span className="text-xl font-black text-slate-900">{offer.currency} {offer.variableCtc || 0} LPA</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold block">Proposed Start Date</span>
              <span className="text-base font-extrabold text-slate-900">{new Date(offer.startDate).toLocaleDateString("en-IN")}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Terms & Conditions</h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{offer.terms}</p>
          </div>
        </div>

        {/* Action Bar */}
        {(offer.status === "SENT" || offer.status === "VIEWED" || offer.status === "COUNTERED") && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              <span className="font-bold text-slate-900 block">Valid Until: {new Date(offer.expiryDate).toLocaleDateString("en-IN")}</span>
              Respond using the actions on the right.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowCounterModal(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 font-bold text-xs text-slate-700 rounded-xl hover:bg-slate-50"
              >
                Counter Note
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-rose-200 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-100"
              >
                Decline
              </button>
              <button
                onClick={() => handleAction("accept")}
                disabled={actionLoading}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-md"
              >
                {actionLoading ? "Processing..." : "Accept Offer"}
              </button>
            </div>
          </div>
        )}

        {/* MODALS */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <h2 className="font-bold text-base text-slate-900">Decline Employment Offer</h2>
              <div className="space-y-3 text-xs">
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Optional reason for declining"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                ></textarea>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                  <button
                    onClick={() => handleAction("reject", { reason: rejectReason })}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl"
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCounterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <h2 className="font-bold text-base text-slate-900">Submit Counter Note</h2>
              <div className="space-y-3 text-xs">
                <textarea
                  rows={3}
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder="Enter details of your request or counter note"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                ></textarea>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowCounterModal(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                  <button
                    onClick={() => handleAction("counter", { note: counterNote })}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl"
                  >
                    Submit Counter Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
