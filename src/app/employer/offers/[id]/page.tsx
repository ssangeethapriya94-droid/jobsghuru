"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Download,
  AlertTriangle,
  RefreshCw,
  User,
  Building,
  Calendar,
  DollarSign,
  ShieldAlert,
} from "lucide-react";

export default function EmployerOfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;

  const [offer, setOffer] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fixedCtc: "",
    variableCtc: "",
    joiningBonus: "",
    roleTitle: "",
    terms: "",
    internalNotes: "",
  });

  useEffect(() => {
    fetchOfferDetail();
  }, [offerId]);

  const fetchOfferDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employer/offers/${offerId}`);
      const data = await res.json();
      if (data.success) {
        setOffer(data.offer);
        setVersions(data.versions || []);
        setEditForm({
          fixedCtc: data.offer.fixedCtc || data.offer.baseSalaryLpa || "",
          variableCtc: data.offer.variableCtc || "",
          joiningBonus: data.offer.joiningBonus || "",
          roleTitle: data.offer.roleTitle || "",
          terms: data.offer.terms || "",
          internalNotes: data.offer.internalNotes || "",
        });
      } else {
        setError(data.error || "Failed to load offer");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/employer/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOfferDetail();
      } else {
        alert(data.error || "Failed to approve offer");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSend = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/employer/offers/${offerId}/send`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        fetchOfferDetail();
      } else {
        alert(data.error || "Failed to send offer");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/employer/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "WITHDRAW", withdrawalReason: withdrawReason }),
      });
      const data = await res.json();
      if (data.success) {
        setWithdrawModal(false);
        fetchOfferDetail();
      } else {
        alert(data.error || "Failed to withdraw offer");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/employer/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setEditModal(false);
        if (data.offer?.id && data.offer.id !== offerId) {
          router.push(`/employer/offers/${data.offer.id}`);
        } else {
          fetchOfferDetail();
        }
      } else {
        alert(data.error || "Failed to update offer");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <RefreshCw className="animate-spin mx-auto mb-2" size={24} /> Loading offer details...
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl">
        <AlertTriangle className="mx-auto mb-2" size={24} /> {error || "Offer not found"}
        <div className="mt-4">
          <Link href="/employer/offers" className="text-xs font-bold underline text-blue-600">Back to Offers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top nav */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/employer/offers" className="hover:text-slate-900 flex items-center gap-1 font-bold">
          <ArrowLeft size={14} /> Offers
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">Offer v{offer.version}</span>
      </div>

      {/* Main card header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-extrabold text-slate-900">{offer.candidateName}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              offer.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-800" :
              offer.status === "SENT" || offer.status === "VIEWED" ? "bg-blue-100 text-blue-800" :
              offer.status === "PENDING_APPROVAL" ? "bg-amber-100 text-amber-800" :
              offer.status === "REJECTED" || offer.status === "WITHDRAWN" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-700"
            }`}>
              {offer.status}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-600 mt-1">{offer.roleTitle} • Candidate: {offer.candidateEmail}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
            <span>Version: v{offer.version}</span>
            <span>•</span>
            <span>Expiry: {new Date(offer.expiryDate).toLocaleDateString("en-IN")}</span>
            <span>•</span>
            <span>Approval: <strong className="text-slate-700">{offer.approvalStatus}</strong></span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {offer.status === "PENDING_APPROVAL" && (
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition"
            >
              Approve Offer
            </button>
          )}

          {(offer.status === "DRAFT" || offer.status === "APPROVED") && (
            <button
              onClick={handleSend}
              disabled={actionLoading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              <Send size={14} /> Dispatch Offer Email
            </button>
          )}

          <a
            href={`/api/employer/offers/${offer.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            <Download size={14} /> View / Download PDF
          </a>

          {(offer.status === "SENT" || offer.status === "VIEWED" || offer.status === "DRAFT" || offer.status === "COUNTERED") && (
            <button
              onClick={() => setEditModal(true)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              {offer.status === "SENT" || offer.status === "VIEWED" ? "Edit (Creates v" + (offer.version + 1) + ")" : "Edit Details"}
            </button>
          )}

          {offer.status !== "WITHDRAWN" && offer.status !== "ACCEPTED" && (
            <button
              onClick={() => setWithdrawModal(true)}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
            >
              Withdraw
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (Offer Breakdown & Letter) */}
        <div className="md:col-span-2 space-y-6">
          {/* CTC Breakdown Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Compensation Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block">Fixed CTC</span>
                <span className="text-base font-extrabold text-slate-900">{offer.currency} {offer.fixedCtc || offer.baseSalaryLpa} LPA</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block">Variable Pay</span>
                <span className="text-base font-extrabold text-slate-900">{offer.currency} {offer.variableCtc || 0} LPA</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block">Joining Bonus</span>
                <span className="text-base font-extrabold text-slate-900">{offer.joiningBonus ? `${offer.currency} ${offer.joiningBonus}` : "N/A"}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block">Joining Date</span>
                <span className="text-sm font-bold text-slate-900">{new Date(offer.startDate).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block">Employment Type</span>
                <span className="text-sm font-bold text-slate-900">{offer.employmentType}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block">Probation</span>
                <span className="text-sm font-bold text-slate-900">{offer.probation || "6 Months"}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Terms & Benefits</h2>
            <div className="text-xs text-slate-700 whitespace-pre-wrap space-y-2">
              <p><strong>Benefits:</strong> {offer.benefits || "Standard Health Insurance and Benefits package."}</p>
              <p><strong>Terms:</strong> {offer.terms || "Standard employment agreement."}</p>
            </div>
          </div>

          {/* Internal Notes Card - Strictly Internal */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <ShieldAlert size={16} /> INTERNAL RECRUITER NOTES (Never shown to candidate or PDF)
            </div>
            <p className="text-xs text-slate-700 italic">{offer.internalNotes || "No internal notes recorded."}</p>
          </div>
        </div>

        {/* Right Column (Candidate Feedback, Counter Note, Versions) */}
        <div className="space-y-6">
          {/* Candidate Response / Counter Note */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Candidate Response</h2>
            {offer.status === "ACCEPTED" ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <div className="font-bold text-sm flex items-center gap-1.5"><CheckCircle2 size={16} /> Offer Accepted</div>
                <p>Candidate officially accepted on {offer.acceptedAt ? new Date(offer.acceptedAt).toLocaleDateString("en-IN") : "N/A"}.</p>
              </div>
            ) : offer.status === "REJECTED" ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <div className="font-bold text-sm flex items-center gap-1.5"><XCircle size={16} /> Offer Rejected</div>
                <p>Reason: {offer.rejectionReason || "No reason provided."}</p>
              </div>
            ) : offer.status === "COUNTERED" ? (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                <div className="font-bold text-sm">Counter-Request Note Received</div>
                <p className="italic font-medium">"{offer.counterNote}"</p>
                <button onClick={() => setEditModal(true)} className="w-full mt-2 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-center">
                  Update Offer (Create v{offer.version + 1})
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No formal response yet. Current status: {offer.status}</p>
            )}
          </div>

          {/* Version History */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Version History</h2>
            <div className="space-y-2 text-xs">
              {versions.map((v) => (
                <div key={v.id} className={`p-3 rounded-xl border flex items-center justify-between ${v.id === offer.id ? "bg-blue-50 border-blue-200 font-bold text-blue-900" : "bg-slate-50 border-slate-100 text-slate-600"}`}>
                  <div>
                    <span>Version v{v.version} ({v.status})</span>
                    <span className="block text-[10px] text-slate-400">{v.fixedCtc} LPA</span>
                  </div>
                  {v.id !== offer.id && (
                    <Link href={`/employer/offers/${v.id}`} className="text-blue-600 font-bold underline">View</Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* WITHDRAW MODAL */}
      {withdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900">Withdraw Offer v{offer.version}</h2>
            <form onSubmit={handleWithdraw} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Withdrawal *</label>
                <textarea
                  required
                  rows={3}
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  placeholder="e.g. Position cancelled or candidate uncontactable"
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-rose-600 focus:outline-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setWithdrawModal(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl">Confirm Withdraw</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900">Edit / Revise Offer</h2>
            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              Note: Updating a SENT or VIEWED offer will generate a new version (v{offer.version + 1}) and supersede this version.
            </p>
            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Title</label>
                <input
                  type="text"
                  value={editForm.roleTitle}
                  onChange={(e) => setEditForm({ ...editForm, roleTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fixed CTC (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editForm.fixedCtc}
                    onChange={(e) => setEditForm({ ...editForm, fixedCtc: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Variable CTC (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editForm.variableCtc}
                    onChange={(e) => setEditForm({ ...editForm, variableCtc: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Recruiter Notes (Strictly Hidden from Candidate)</label>
                <textarea
                  rows={2}
                  value={editForm.internalNotes}
                  onChange={(e) => setEditForm({ ...editForm, internalNotes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditModal(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
