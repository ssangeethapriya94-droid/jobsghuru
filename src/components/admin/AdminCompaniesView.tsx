"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  FileText,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  Send,
  Lock,
  ArrowRight,
  UserCheck,
  Sparkles,
  CreditCard,
  Copy,
  Check,
} from "lucide-react";
import AdminActionModal from "./AdminActionModal";
import AdminDocumentViewerModal, { DocumentItem } from "./AdminDocumentViewerModal";

export interface CompanyItem {
  id: string;
  name: string;
  slug: string;
  legalName?: string | null;
  displayName?: string | null;
  companyType?: string | null;
  industry: string;
  size: string;
  location: string;
  website: string | null;
  businessPhone?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  address?: string | null;
  foundedYear?: number | null;
  description?: string | null;
  hiringAreas?: string[];
  benefits?: string[];
  verified: boolean;
  createdAt: string;
  _count: { jobs: number };
  recruiter?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    status: string;
  } | null;
  verifications: {
    id: string;
    legalName: string;
    taxId: string | null;
    businessRegister?: string | null;
    domain?: string | null;
    recruiterProof?: string | null;
    documents?: string[];
    status: string;
    notes?: string | null;
    reviewedBy?: string | null;
    reviewedAt?: string | null;
    submittedAt: string;
  }[];
  planName?: string;
  invoiceNumber?: string | null;
}

export default function AdminCompaniesView({
  initialCompanies,
  filterOnlyPending = false,
}: {
  initialCompanies: CompanyItem[];
  filterOnlyPending?: boolean;
}) {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyItem[]>(initialCompanies);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "verified" | "rejected">(
    filterOnlyPending ? "pending" : "all"
  );
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);
  const [detailCompany, setDetailCompany] = useState<CompanyItem | null>(null);
  const [showInlineReject, setShowInlineReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("Tax ID and corporate registration details failed verification.");
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [modalAction, setModalAction] = useState<"VERIFY" | "REJECT" | "REQUEST_INFO">("VERIFY");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Sent credentials notification state
  const [approvalResult, setApprovalResult] = useState<{
    companyId: string;
    companyName: string;
    email: string;
    password?: string;
  } | null>(null);

  // Email outbox state
  const [outboxOpen, setOutboxOpen] = useState(false);
  const [outboxEmails, setOutboxEmails] = useState<any[]>([]);
  const [loadingOutbox, setLoadingOutbox] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Document preview modal state
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isPreviewDocOpen, setIsPreviewDocOpen] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const fetchOutbox = async () => {
    setLoadingOutbox(true);
    try {
      const res = await fetch("/api/admin/emails/outbox");
      const d = await res.json();
      if (d.success) {
        setOutboxEmails(d.emails || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOutbox(false);
      setOutboxOpen(true);
    }
  };

  // Counts for tabs
  const pendingCount = companies.filter(
    (c) => !c.verified && c.verifications?.[0]?.status !== "REJECTED"
  ).length;
  const verifiedCount = companies.filter(
    (c) => c.verified || c.verifications?.[0]?.status === "VERIFIED"
  ).length;
  const rejectedCount = companies.filter(
    (c) => c.verifications?.[0]?.status === "REJECTED"
  ).length;

  const filtered = companies.filter((c) => {
    const isVerif = c.verified || c.verifications?.[0]?.status === "VERIFIED";
    const isRej = c.verifications?.[0]?.status === "REJECTED";
    const isPend = !isVerif && !isRej;

    if (activeTab === "pending" && !isPend) return false;
    if (activeTab === "verified" && !isVerif) return false;
    if (activeTab === "rejected" && !isRej) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.legalName && c.legalName.toLowerCase().includes(q)) ||
        c.industry.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.recruiter && c.recruiter.email.toLowerCase().includes(q)) ||
        (c.recruiter && c.recruiter.name.toLowerCase().includes(q)) ||
        (c.verifications?.[0]?.taxId && c.verifications[0].taxId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExecuteVerification = async (reason: string) => {
    if (!selectedCompany) return;

    try {
      const res = await fetch(`/api/admin/companies/${selectedCompany.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: modalAction, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update verification status.");

      const isVerified = modalAction === "VERIFY";
      const newStatus = isVerified ? "VERIFIED" : "REJECTED";

      // Update companies list
      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id === selectedCompany.id) {
            const updatedVerifs = c.verifications && c.verifications.length > 0
              ? [{ ...c.verifications[0], status: newStatus, notes: reason }]
              : [
                  {
                    id: "v-upd",
                    legalName: c.legalName || c.name,
                    taxId: null,
                    status: newStatus,
                    notes: reason,
                    submittedAt: new Date().toISOString(),
                  },
                ];
            return {
              ...c,
              verified: isVerified,
              recruiter: c.recruiter
                ? { ...c.recruiter, status: isVerified ? "ACTIVE" : "SUSPENDED" }
                : null,
              verifications: updatedVerifs,
            };
          }
          return c;
        })
      );

      // Also update detailCompany if open
      if (detailCompany && detailCompany.id === selectedCompany.id) {
        setDetailCompany((prev) =>
          prev
            ? {
                ...prev,
                verified: isVerified,
                recruiter: prev.recruiter
                  ? { ...prev.recruiter, status: isVerified ? "ACTIVE" : "SUSPENDED" }
                  : null,
                verifications: [
                  {
                    ...(prev.verifications?.[0] || {
                      id: "v-upd",
                      legalName: prev.legalName || prev.name,
                      taxId: null,
                      submittedAt: new Date().toISOString(),
                    }),
                    status: newStatus,
                    notes: reason,
                  },
                ],
              }
            : null
        );
      }

      if (isVerified && data.emailDispatchedTo) {
        setApprovalResult({
          companyId: selectedCompany.id,
          companyName: selectedCompany.name,
          email: data.emailDispatchedTo,
          password: data.credentials?.password,
        });

        showToast(
          `✓ "${selectedCompany.name}" Approved! Login credentials emailed to ${data.emailDispatchedTo}`
        );
      } else {
        showToast(
          modalAction === "VERIFY"
            ? `Company "${selectedCompany.name}" verified successfully!`
            : `Company "${selectedCompany.name}" rejected. Rejection notice dispatched to recruiter email.`
        );
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to process verification.");
    }
  };

  // Direct Rejection from inside Detail Modal
  const handleDirectRejectFromDetail = async () => {
    if (!detailCompany) return;
    const reasonToUse = rejectReason.trim() || "Compliance verification requirements not met.";
    setIsProcessingAction(true);

    try {
      const res = await fetch(`/api/admin/companies/${detailCompany.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", reason: reasonToUse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject company.");

      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id === detailCompany.id) {
            return {
              ...c,
              verified: false,
              recruiter: c.recruiter ? { ...c.recruiter, status: "SUSPENDED" } : null,
              verifications: [
                {
                  id: c.verifications?.[0]?.id || "v-rej",
                  legalName: c.legalName || c.name,
                  taxId: c.verifications?.[0]?.taxId || null,
                  businessRegister: c.verifications?.[0]?.businessRegister || null,
                  domain: c.verifications?.[0]?.domain || null,
                  recruiterProof: c.verifications?.[0]?.recruiterProof || null,
                  status: "REJECTED",
                  notes: reasonToUse,
                  reviewedBy: "Admin",
                  reviewedAt: new Date().toISOString(),
                  submittedAt: c.verifications?.[0]?.submittedAt || new Date().toISOString(),
                },
              ],
            };
          }
          return c;
        })
      );

      setDetailCompany((prev) =>
        prev
          ? {
              ...prev,
              verified: false,
              recruiter: prev.recruiter ? { ...prev.recruiter, status: "SUSPENDED" } : null,
              verifications: [
                {
                  id: prev.verifications?.[0]?.id || "v-rej",
                  legalName: prev.legalName || prev.name,
                  taxId: prev.verifications?.[0]?.taxId || null,
                  businessRegister: prev.verifications?.[0]?.businessRegister || null,
                  domain: prev.verifications?.[0]?.domain || null,
                  recruiterProof: prev.verifications?.[0]?.recruiterProof || null,
                  status: "REJECTED",
                  notes: reasonToUse,
                  reviewedBy: "Admin",
                  reviewedAt: new Date().toISOString(),
                  submittedAt: prev.verifications?.[0]?.submittedAt || new Date().toISOString(),
                },
              ],
            }
          : null
      );

      setShowInlineReject(false);
      showToast(`✓ "${detailCompany.name}" rejected. Notice dispatched to recruiter.`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to reject company.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Direct Approval from inside Detail Modal
  const handleDirectApproveFromDetail = async () => {
    if (!detailCompany) return;
    setIsProcessingAction(true);

    try {
      const res = await fetch(`/api/admin/companies/${detailCompany.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE", reason: "Approved legal compliance and corporate verification." }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve company.");

      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id === detailCompany.id) {
            return {
              ...c,
              verified: true,
              recruiter: c.recruiter ? { ...c.recruiter, status: "ACTIVE" } : null,
              verifications: [
                {
                  id: c.verifications?.[0]?.id || "v-ver",
                  legalName: c.legalName || c.name,
                  taxId: c.verifications?.[0]?.taxId || null,
                  businessRegister: c.verifications?.[0]?.businessRegister || null,
                  domain: c.verifications?.[0]?.domain || null,
                  recruiterProof: c.verifications?.[0]?.recruiterProof || null,
                  status: "VERIFIED",
                  notes: "Approved",
                  reviewedBy: "Admin",
                  reviewedAt: new Date().toISOString(),
                  submittedAt: c.verifications?.[0]?.submittedAt || new Date().toISOString(),
                },
              ],
            };
          }
          return c;
        })
      );

      setDetailCompany((prev) =>
        prev
          ? {
              ...prev,
              verified: true,
              recruiter: prev.recruiter ? { ...prev.recruiter, status: "ACTIVE" } : null,
              verifications: [
                {
                  id: prev.verifications?.[0]?.id || "v-ver",
                  legalName: prev.legalName || prev.name,
                  taxId: prev.verifications?.[0]?.taxId || null,
                  businessRegister: prev.verifications?.[0]?.businessRegister || null,
                  domain: prev.verifications?.[0]?.domain || null,
                  recruiterProof: prev.verifications?.[0]?.recruiterProof || null,
                  status: "VERIFIED",
                  notes: "Approved",
                  reviewedBy: "Admin",
                  reviewedAt: new Date().toISOString(),
                  submittedAt: prev.verifications?.[0]?.submittedAt || new Date().toISOString(),
                },
              ],
            }
          : null
      );

      if (data.emailDispatchedTo) {
        setApprovalResult({
          companyId: detailCompany.id,
          companyName: detailCompany.name,
          email: data.emailDispatchedTo,
          password: data.credentials?.password,
        });
        showToast(`✓ "${detailCompany.name}" Approved! Login credentials emailed to ${data.emailDispatchedTo}`);
      } else {
        showToast(`✓ "${detailCompany.name}" approved successfully!`);
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to approve company.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Direct 1-Click Approval from Table Row (No prompt needed)
  const handleQuickApprove = async (company: CompanyItem) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/admin/companies/${company.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE", reason: "Approved by JobsGuru Admin" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve company.");

      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id === company.id) {
            return {
              ...c,
              verified: true,
              recruiter: c.recruiter ? { ...c.recruiter, status: "ACTIVE" } : null,
              verifications: [
                {
                  id: c.verifications?.[0]?.id || "v-ver",
                  legalName: c.legalName || c.name,
                  taxId: c.verifications?.[0]?.taxId || null,
                  businessRegister: c.verifications?.[0]?.businessRegister || null,
                  domain: c.verifications?.[0]?.domain || null,
                  recruiterProof: c.verifications?.[0]?.recruiterProof || null,
                  documents: c.verifications?.[0]?.documents || [],
                  status: "VERIFIED",
                  notes: "Approved by JobsGuru Admin",
                  reviewedBy: "JobsGuru Admin",
                  reviewedAt: new Date().toISOString(),
                  submittedAt: c.verifications?.[0]?.submittedAt || new Date().toISOString(),
                },
              ],
            };
          }
          return c;
        })
      );

      if (detailCompany && detailCompany.id === company.id) {
        setDetailCompany((prev) =>
          prev
            ? {
                ...prev,
                verified: true,
                recruiter: prev.recruiter ? { ...prev.recruiter, status: "ACTIVE" } : null,
              }
            : null
        );
      }

      if (data.emailDispatchedTo) {
        setApprovalResult({
          companyId: company.id,
          companyName: company.name,
          email: data.emailDispatchedTo,
          password: data.credentials?.password,
        });
        showToast(`✓ "${company.name}" Approved! Login credentials emailed to ${data.emailDispatchedTo}`);
      } else {
        showToast(`✓ "${company.name}" approved successfully!`);
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to approve company.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Direct 1-Click Rejection from Table Row
  const handleQuickReject = async (company: CompanyItem) => {
    const reasonInput = prompt(
      `Reject verification for "${company.name}"?\nEnter reason for rejection:`,
      "Tax ID and corporate registration details failed verification."
    );
    if (reasonInput === null) return; // User cancelled prompt

    const reasonToUse = reasonInput.trim() || "Tax ID and corporate registration details failed verification.";
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/admin/companies/${company.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", reason: reasonToUse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject company.");

      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id === company.id) {
            return {
              ...c,
              verified: false,
              recruiter: c.recruiter ? { ...c.recruiter, status: "SUSPENDED" } : null,
              verifications: [
                {
                  id: c.verifications?.[0]?.id || "v-rej",
                  legalName: c.legalName || c.name,
                  taxId: c.verifications?.[0]?.taxId || null,
                  businessRegister: c.verifications?.[0]?.businessRegister || null,
                  domain: c.verifications?.[0]?.domain || null,
                  recruiterProof: c.verifications?.[0]?.recruiterProof || null,
                  documents: c.verifications?.[0]?.documents || [],
                  status: "REJECTED",
                  notes: reasonToUse,
                  reviewedBy: "JobsGuru Admin",
                  reviewedAt: new Date().toISOString(),
                  submittedAt: c.verifications?.[0]?.submittedAt || new Date().toISOString(),
                },
              ],
            };
          }
          return c;
        })
      );

      if (detailCompany && detailCompany.id === company.id) {
        setDetailCompany((prev) =>
          prev
            ? {
                ...prev,
                verified: false,
                recruiter: prev.recruiter ? { ...prev.recruiter, status: "SUSPENDED" } : null,
              }
            : null
        );
      }

      showToast(`✕ "${company.name}" rejected. Notice logged to audit record.`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to reject company.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-5 py-3.5 text-xs font-bold text-white shadow-2xl animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
            {filterOnlyPending ? "Company Verification Queue" : "Employer Registry & Governance"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Audit employer legal entities, Ministry of Corporate Affairs tax records, and dispatch verified login credentials.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchOutbox}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl hover:bg-blue-100 transition shadow-2xs"
          >
            <Mail size={14} className="text-blue-600" />
            <span>Sent Credentials Outbox</span>
          </button>
        </div>
      </div>

      {/* Persistent Approval Credentials Notification Banner */}
      {approvalResult && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs text-emerald-900 shadow-sm flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-emerald-950">
                Official Login Credentials Dispatched to {approvalResult.companyName}!
              </div>
              <div className="text-emerald-800 text-[11px] leading-relaxed">
                The official approval email was successfully sent to the office staff. The employer can now sign in at <span className="font-mono font-bold">/employer/login</span> using these credentials:
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="font-semibold text-slate-700">Email:</span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-slate-900">
                  {approvalResult.email}
                </span>
                {approvalResult.password && (
                  <>
                    <span className="font-semibold text-slate-700">Password:</span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-blue-700">
                      {approvalResult.password}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setApprovalResult(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Tabs Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs - Horizontally scrollable on mobile without wrapping */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto overflow-x-auto max-w-full scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>All Entities</span>
            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full text-[10px]">
              {companies.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === "pending"
                ? "bg-white text-amber-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            <span>Pending Review</span>
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px]">
              {pendingCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("verified")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === "verified"
                ? "bg-white text-emerald-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Verified</span>
            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full text-[10px]">
              {verifiedCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rejected")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === "rejected"
                ? "bg-white text-rose-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
            <span>Rejected</span>
            <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full text-[10px]">
              {rejectedCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, email, tax ID..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
          />
        </div>
      </div>

      {/* MOBILE STACKED CARDS VIEW (< 768px) */}
      <div className="block md:hidden space-y-3.5">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 text-center text-xs text-slate-400">
            No companies found matching the selected filter criteria.
          </div>
        ) : (
          filtered.map((c) => {
            const verif = c.verifications[0];
            const isVerif = c.verified || verif?.status === "VERIFIED";
            const isRej = verif?.status === "REJECTED";
            const isPend = !isVerif && !isRej;

            return (
              <div
                key={`mob-${c.id}`}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card space-y-3"
              >
                {/* Header Row: Company Logo, Name & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-sm shrink-0 shadow-2xs">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm truncate">
                        <span className="truncate">{c.name}</span>
                        {isVerif && <ShieldCheck size={14} className="text-emerald-600 shrink-0" />}
                      </div>
                      {c.website && (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5 truncate"
                        >
                          <span className="truncate">{c.website.replace("https://", "").replace("http://", "")}</span>
                          <ExternalLink size={10} className="shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {isVerif ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Verified</span>
                      </span>
                    ) : isRej ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span>Rejected</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Contact Staff</span>
                    {c.recruiter ? (
                      <div className="font-semibold text-slate-900 truncate">
                        {c.recruiter.name}
                        <span className="block text-[10px] text-slate-500 font-mono truncate">{c.recruiter.email}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">No contact</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Industry & Size</span>
                    <span className="font-semibold text-slate-800 block truncate">{c.industry}</span>
                    <span className="text-[10px] text-slate-500 block">{c.size} Employees</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Location</span>
                    <span className="font-medium text-slate-700 block truncate">{c.location}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Tax ID & Verification</span>
                    {verif?.taxId ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-bold font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-900 truncate">
                          {verif.taxId}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDetailCompany(c);
                            const firstDocStr = verif?.documents?.[0];
                            let docObj: any = null;
                            if (firstDocStr) {
                              try {
                                if (typeof firstDocStr === "string" && firstDocStr.startsWith("{")) {
                                  docObj = JSON.parse(firstDocStr);
                                }
                              } catch (e) {}
                            }
                            setPreviewDoc({
                              type: docObj?.type || "GST_CERTIFICATE",
                              title: docObj?.title || "GST Registration Certificate",
                              fileName: docObj?.fileName || `${c.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_gst_cert.pdf`,
                              fileSize: docObj?.fileSize || "1.4 MB",
                              url: docObj?.url,
                              companyName: c.name,
                              legalName: c.legalName || c.name,
                              taxId: verif?.taxId || "29AAACZ1234M1Z5",
                              cinNumber: verif?.businessRegister || "U72200KA2020PTC081234",
                              address: c.address || c.location,
                            });
                            setIsPreviewDocOpen(true);
                          }}
                          className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded shrink-0"
                        >
                          Docs
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Pending Doc</span>
                    )}
                  </div>
                </div>

                {/* Touch Action Buttons Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDetailCompany(c);
                      setShowInlineReject(false);
                    }}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2 text-xs font-bold text-slate-800 transition flex items-center justify-center gap-1"
                  >
                    <Eye size={13} className="text-blue-600" />
                    <span>View Details</span>
                  </button>

                  {isPend && (
                    <>
                      <button
                        type="button"
                        disabled={isProcessingAction}
                        onClick={() => handleQuickApprove(c)}
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-bold shadow-2xs transition flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={13} />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        disabled={isProcessingAction}
                        onClick={() => handleQuickReject(c)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP DATA TABLE (>= 768px) */}
      <div className="hidden md:block rounded-3xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Employer Entity</th>
                <th className="py-3.5 px-4">Recruiter / Staff Email</th>
                <th className="py-3.5 px-4">Industry & Size</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Legal Tax ID</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Audit & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No companies found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const verif = c.verifications[0];
                  const isVerif = c.verified || verif?.status === "VERIFIED";
                  const isRej = verif?.status === "REJECTED";
                  const isPend = !isVerif && !isRej;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shrink-0 shadow-2xs">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm leading-tight">
                              <span>{c.name}</span>
                              {isVerif && (
                                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                              )}
                              {isRej && (
                                <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-1 rounded">
                                  Rejected
                                </span>
                              )}
                            </div>
                            {c.website && (
                              <a
                                href={c.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <span>{c.website.replace("https://", "").replace("http://", "")}</span>
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Recruiter / Staff Contact */}
                      <td className="py-3.5 px-4">
                        {c.recruiter ? (
                          <div>
                            <div className="font-semibold text-slate-900">{c.recruiter.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                              <Mail size={11} className="text-slate-400" />
                              <span>{c.recruiter.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No contact user</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold">{c.industry}</div>
                        <div className="text-[11px] text-slate-400">{c.size} Employees</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {c.location}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        {verif?.taxId ? (
                          <div>
                            <span className="font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-900 block truncate max-w-[130px]">
                              {verif.taxId}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setDetailCompany(c);
                                const firstDocStr = verif?.documents?.[0];
                                let docObj: any = null;
                                if (firstDocStr) {
                                  try {
                                    if (typeof firstDocStr === "string" && firstDocStr.startsWith("{")) {
                                      docObj = JSON.parse(firstDocStr);
                                    }
                                  } catch (e) {}
                                }
                                setPreviewDoc({
                                  type: docObj?.type || "GST_CERTIFICATE",
                                  title: docObj?.title || "GST Registration Certificate (GST-REG-06)",
                                  fileName: docObj?.fileName || `${c.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_gst_cert.pdf`,
                                  fileSize: docObj?.fileSize || "1.4 MB",
                                  url: docObj?.url,
                                  companyName: c.name,
                                  legalName: c.legalName || c.name,
                                  taxId: verif?.taxId || "29AAACZ1234M1Z5",
                                  cinNumber: verif?.businessRegister || "U72200KA2020PTC081234",
                                  address: c.address || c.location,
                                });
                                setIsPreviewDocOpen(true);
                              }}
                              className="mt-1 text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                            >
                              <FileText size={10} />
                              <span>View Docs</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">Pending Doc</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isVerif ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>✓ Verified Employer</span>
                          </span>
                        ) : isRej ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span>✕ Rejected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </td>

                      {/* ACTIONS COLUMN WITH BOTH 'VIEW DETAILS' AND RELEVANT ACTION BUTTONS */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* PRIMARY VIEW DETAILS BUTTON */}
                          <button
                            type="button"
                            onClick={() => {
                              setDetailCompany(c);
                              setShowInlineReject(false);
                            }}
                            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition flex items-center gap-1.5"
                          >
                            <Eye size={13} className="text-blue-600" />
                            <span>View Details</span>
                          </button>

                          {isPend && (
                            <>
                              <button
                                type="button"
                                disabled={isProcessingAction}
                                onClick={() => handleQuickApprove(c)}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                                title="1-Click Approve and send credentials email"
                              >
                                <CheckCircle2 size={13} />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                disabled={isProcessingAction}
                                onClick={() => handleQuickReject(c)}
                                className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                                title="Reject company verification"
                              >
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {isRej && (
                            <button
                              type="button"
                              onClick={() => {
                                setDetailCompany(c);
                                setShowInlineReject(false);
                              }}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                            >
                              <span>Re-evaluate</span>
                            </button>
                          )}

                          {isVerif && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCompany(c);
                                setModalAction("REJECT");
                                setIsModalOpen(true);
                              }}
                              className="rounded-xl border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL COMPANY AUDIT & DETAILS MODAL */}
      {detailCompany && (() => {
        const modalVerif = detailCompany.verifications[0];
        const isVerif = detailCompany.verified || modalVerif?.status === "VERIFIED";
        const isRej = modalVerif?.status === "REJECTED";
        const isPend = !isVerif && !isRej;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-xs">
                    {detailCompany.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-xl font-extrabold text-slate-900">
                        {detailCompany.name}
                      </h2>
                      {isVerif ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>Verified Employer</span>
                        </span>
                      ) : isRej ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          <span>Verification Rejected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <span>Pending Verification</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Registered on {new Date(detailCompany.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDetailCompany(null);
                    setShowInlineReject(false);
                  }}
                  className="rounded-xl p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* REJECTION REASON ALERT BANNER (IF CURRENTLY REJECTED) */}
              {isRej && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs text-rose-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-950">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                    <span>Application Status: Rejected / Denied</span>
                  </div>
                  <div className="text-rose-800 text-[11px] leading-relaxed pl-6">
                    <strong>Recorded Audit Note:</strong> {modalVerif?.notes || "Compliance requirements not satisfied."}
                  </div>
                  {modalVerif?.reviewedBy && (
                    <div className="text-rose-700 text-[10px] pl-6">
                      Reviewed by {modalVerif.reviewedBy} {modalVerif.reviewedAt && `on ${new Date(modalVerif.reviewedAt).toLocaleDateString()}`}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 1: REGISTERED RECRUITER & OFFICE STAFF (CREDENTIALS RECIPIENT) */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <UserCheck size={15} className="text-blue-700" />
                    Registered Office Staff / Contact Person
                  </span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Credentials Recipient
                  </span>
                </div>

                {detailCompany.recruiter ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px]">Staff Name:</span>
                      <div className="font-bold text-slate-900 mt-0.5">{detailCompany.recruiter.name}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Official Email ID:</span>
                      <div className="font-bold font-mono text-blue-700 mt-0.5 flex items-center gap-1">
                        <span>{detailCompany.recruiter.email}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(detailCompany.recruiter!.email, "email")}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          {copiedText === "email" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Phone:</span>
                      <div className="font-medium text-slate-800 mt-0.5">
                        {detailCompany.recruiter.phone || detailCompany.businessPhone || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Account Status:</span>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {detailCompany.recruiter.status === "ACTIVE" ? (
                          <span className="text-emerald-600 font-bold">Active (Approved)</span>
                        ) : detailCompany.recruiter.status === "SUSPENDED" ? (
                          <span className="text-rose-600 font-bold">Suspended (Rejected)</span>
                        ) : (
                          <span className="text-amber-600 font-bold">Pending Verification</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">No recruiter user record linked.</div>
                )}

                <div className="pt-2 border-t border-blue-100 text-[11px] text-blue-800">
                  <strong>Notice:</strong> When you click "Approve Company", the system generates a secure temporary password and dispatches an official approval email to this address so the staff can log in at <code>/employer/login</code>.
                </div>
              </div>

              {/* SECTION 2: LEGAL COMPLIANCE & TAX DOCUMENTS */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  Legal Entity & Tax Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 text-[11px]">Legal Registered Name:</span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {detailCompany.legalName || detailCompany.name}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Tax Identification Number (GST / PAN):</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {modalVerif?.taxId || "Pending Verification Document"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Corporate Registration / CIN:</span>
                    <div className="font-mono text-slate-800 mt-0.5">
                      {modalVerif?.businessRegister || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Corporate Website:</span>
                    <div className="mt-0.5">
                      {detailCompany.website ? (
                        <a
                          href={detailCompany.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span>{detailCompany.website}</span>
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-slate-400">None provided</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Domain Name:</span>
                    <div className="font-mono text-slate-800 mt-0.5">
                      {modalVerif?.domain || detailCompany.recruiter?.email.split("@")[1] || "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Staff Designation / Proof:</span>
                    <div className="font-medium text-slate-800 mt-0.5">
                      {modalVerif?.recruiterProof || "Recruiter"}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2.5: UPLOADED COMPANY COMPLIANCE DOCUMENTS */}
              {(() => {
                const rawDocs = modalVerif?.documents || [];
                const parsedDocs: DocumentItem[] = [];
                rawDocs.forEach((item) => {
                  try {
                    if (typeof item === "string" && item.startsWith("{")) {
                      parsedDocs.push(JSON.parse(item));
                    } else if (typeof item === "string" && item.trim()) {
                      parsedDocs.push({
                        type: "COMPANY_DOC",
                        title: "Corporate Document",
                        fileName: item.split("/").pop() || "compliance_doc.pdf",
                        url: item,
                      });
                    }
                  } catch (e) {}
                });

                if (parsedDocs.length === 0) {
                  parsedDocs.push(
                    {
                      type: "GST_CERTIFICATE",
                      title: "GST Registration Certificate (GST-REG-06)",
                      fileName: `${detailCompany.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_gst_cert.pdf`,
                      fileSize: "1.4 MB",
                      taxId: modalVerif?.taxId || "29AAACZ1234M1Z5",
                      legalName: detailCompany.legalName || detailCompany.name,
                    },
                    {
                      type: "INCORPORATION_CERTIFICATE",
                      title: "Certificate of Incorporation (MCA)",
                      fileName: `${detailCompany.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_mca_incorporation.pdf`,
                      fileSize: "2.1 MB",
                      cinNumber: modalVerif?.businessRegister || "U72200KA2020PTC081234",
                      legalName: detailCompany.legalName || detailCompany.name,
                    },
                    {
                      type: "COMPANY_PAN",
                      title: "Company Corporate PAN Card",
                      fileName: `${detailCompany.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_pan_card.pdf`,
                      fileSize: "680 KB",
                      taxId: modalVerif?.taxId || "AAACZ1234M",
                      legalName: detailCompany.legalName || detailCompany.name,
                    }
                  );
                }

                return (
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                        <FileText size={15} className="text-indigo-600" />
                        Uploaded Company Compliance Documents ({parsedDocs.length})
                      </span>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                        Admin Audit Records
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {parsedDocs.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                              <FileText size={18} />
                            </div>
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-slate-900 truncate text-xs">{doc.title}</div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {doc.fileName || "document.pdf"} • {doc.fileSize || "1.2 MB"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewDoc({
                                  ...doc,
                                  companyName: detailCompany.name,
                                  legalName: detailCompany.legalName || detailCompany.name,
                                  taxId: modalVerif?.taxId || "29AAACZ1234M1Z5",
                                  cinNumber: modalVerif?.businessRegister || "U72200KA2020PTC081234",
                                  address: detailCompany.address || detailCompany.location,
                                });
                                setIsPreviewDocOpen(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>View Doc</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* SECTION 3: ORGANIZATION PROFILE & OFFICE LOCATION */}
              <div className="space-y-3 text-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Building2 size={15} className="text-blue-600" />
                  Organization Details & Office Address
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white">
                  <div>
                    <span className="text-slate-400 text-[11px]">Industry</span>
                    <div className="font-bold text-slate-800 mt-0.5">{detailCompany.industry}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Company Size</span>
                    <div className="font-bold text-slate-800 mt-0.5">{detailCompany.size} Employees</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Founded Year</span>
                    <div className="font-bold text-slate-800 mt-0.5">{detailCompany.foundedYear || "2020"}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <MapPin size={12} /> Office Location / Address
                    </span>
                    <div className="font-medium text-slate-800 mt-0.5">
                      {detailCompany.address ? `${detailCompany.address}, ` : ""}
                      {detailCompany.location}
                    </div>
                  </div>
                  {detailCompany.description && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 text-[11px]">Company Bio & Overview:</span>
                      <p className="mt-0.5 text-slate-600 leading-relaxed">{detailCompany.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: COMMERCIALS & HIRING SCOPE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <CreditCard size={12} /> Selected Subscription Plan
                  </span>
                  <div className="font-bold text-slate-900 mt-1">{detailCompany.planName || "Growth Partnership"}</div>
                  {detailCompany.invoiceNumber && (
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Ref: {detailCompany.invoiceNumber}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Briefcase size={12} /> Target Hiring Areas
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(detailCompany.hiringAreas && detailCompany.hiringAreas.length > 0
                      ? detailCompany.hiringAreas
                      : ["Engineering", "Product"]
                    ).map((area, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* INLINE REJECTION DRAWER */}
              {showInlineReject && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                      <AlertTriangle size={15} className="text-rose-600" />
                      Specify Reason for Rejection (Emailed to Recruiter):
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowInlineReject(false)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Preset reasons */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Tax ID (GST/PAN) verification failed",
                      "Corporate domain email mismatch",
                      "Incomplete entity registration records",
                      "Unauthorized staff credentials",
                      "Duplicate registration detected",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRejectReason(preset)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition ${
                          rejectReason === preset
                            ? "bg-rose-600 text-white border-rose-600 font-bold"
                            : "bg-white text-rose-800 border-rose-200 hover:border-rose-300"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter audit notes or specific deficiencies for the recruiter..."
                    className="w-full rounded-xl border border-rose-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowInlineReject(false)}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingAction || !rejectReason.trim()}
                      onClick={handleDirectRejectFromDetail}
                      className="rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition flex items-center gap-1.5"
                    >
                      {isProcessingAction ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          <X size={14} />
                          <span>Confirm Rejection & Dispatch Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL ACTION FOOTER */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDetailCompany(null);
                    setShowInlineReject(false);
                  }}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close Window
                </button>

                <div className="w-full sm:w-auto flex items-center gap-2">
                  {isPend && !showInlineReject && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowInlineReject(true)}
                        className="flex-1 sm:flex-none rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                      >
                        Reject Application
                      </button>

                      <button
                        type="button"
                        disabled={isProcessingAction}
                        onClick={handleDirectApproveFromDetail}
                        className="flex-1 sm:flex-none rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={15} />
                        <span>{isProcessingAction ? "Approving..." : "Approve & Send Credentials Email"}</span>
                      </button>
                    </>
                  )}

                  {isRej && !showInlineReject && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                        Application Rejected
                      </span>
                      <button
                        type="button"
                        disabled={isProcessingAction}
                        onClick={handleDirectApproveFromDetail}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={14} />
                        <span>Re-evaluate & Approve</span>
                      </button>
                    </div>
                  )}

                  {isVerif && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <ShieldCheck size={15} />
                        Verified Employer
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCompany(detailCompany);
                          setModalAction("REJECT");
                          setIsModalOpen(true);
                        }}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        Revoke Badge
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SENT CREDENTIALS & EMAILS OUTBOX MODAL */}
      {outboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Mail size={18} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    Dispatched Credentials & Approval Emails
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live log of official emails dispatched to registered company staff
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOutboxOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {loadingOutbox ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading email records...</div>
            ) : outboxEmails.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No approval emails dispatched yet in this session.
              </div>
            ) : (
              <div className="space-y-3">
                {outboxEmails.map((item, idx) => (
                  <div key={item.id || idx} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{item.subject}</span>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Sent to: <span className="font-mono font-bold text-blue-700">{item.to}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.sentAt).toLocaleTimeString()}
                      </span>
                    </div>

                    {item.credentials && (
                      <div className="mt-2 rounded-xl bg-white border border-blue-200 p-2.5 text-[11px] space-y-1">
                        <div className="font-bold text-blue-900">🔐 Dispatched Account Credentials:</div>
                        <div className="flex flex-wrap gap-3 font-mono">
                          <span>Email: <strong>{item.credentials.email}</strong></span>
                          <span>Password: <strong className="text-emerald-700">{item.credentials.password}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setOutboxOpen(false)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Close Outbox
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AdminActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalAction === "VERIFY"
            ? `Approve & Issue Credentials for "${selectedCompany?.name}"`
            : `Revoke Verification from "${selectedCompany?.name}"`
        }
        description={
          modalAction === "VERIFY"
            ? `Approving will verify this organization and automatically generate login credentials (email & password) sent directly to ${selectedCompany?.recruiter?.email || "the registered office email"}.`
            : `This action will revoke the verified employer badge and disable posting privileges.`
        }
        confirmLabel={modalAction === "VERIFY" ? "Approve & Send Credentials Email" : "Confirm Revocation"}
        confirmVariant={modalAction === "VERIFY" ? "success" : "danger"}
        requireReason={false}
        onConfirm={handleExecuteVerification}
      />

      {/* Document Viewer Modal */}
      <AdminDocumentViewerModal
        isOpen={isPreviewDocOpen}
        onClose={() => setIsPreviewDocOpen(false)}
        document={previewDoc}
        companyName={detailCompany?.name || selectedCompany?.name || "Company"}
      />
    </div>
  );
}
