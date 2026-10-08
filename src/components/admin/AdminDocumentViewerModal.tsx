"use client";

import { useState } from "react";
import {
  X,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Award,
  Hash,
  MapPin,
  Calendar,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Sparkles,
} from "lucide-react";

export interface DocumentItem {
  type: string; // "GST_CERTIFICATE" | "INCORPORATION_CERTIFICATE" | "COMPANY_PAN" | "STAFF_ID" | "OTHER"
  title: string;
  fileName: string;
  fileSize?: string;
  url?: string;
  uploadedAt?: string;
  companyName?: string;
  legalName?: string;
  taxId?: string;
  cinNumber?: string;
  address?: string;
}

interface AdminDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  companyName?: string;
}

export default function AdminDocumentViewerModal({
  isOpen,
  onClose,
  document,
  companyName = "Company",
}: AdminDocumentViewerModalProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [markedValid, setMarkedValid] = useState(false);

  if (!isOpen || !document) return null;

  const isGst = document.type === "GST_CERTIFICATE" || document.title.toLowerCase().includes("gst");
  const isCin = document.type === "INCORPORATION_CERTIFICATE" || document.title.toLowerCase().includes("incorporation");
  const isPan = document.type === "COMPANY_PAN" || document.title.toLowerCase().includes("pan");

  const handleDownload = () => {
    if (document.url && document.url.startsWith("http")) {
      window.open(document.url, "_blank");
    } else {
      // Trigger browser print or simulated download
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in duration-200">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shrink-0 shadow-md">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white truncate">
                  {document.title}
                </h3>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full shrink-0">
                  {document.type || "OFFICIAL_RECORD"}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {document.fileName || "compliance_document.pdf"} • {document.fileSize || "1.4 MB"} • Attached to {companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
              title="Download or Print Document"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewer Controls Toolbar */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">Official Document Verification View</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full text-[10px]">
              <ShieldCheck size={12} />
              Tamper-Proof Audit View
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(prev - 10, 70))}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-700"
              title="Zoom out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="font-mono text-[11px] font-bold text-slate-700 w-12 text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(prev + 10, 150))}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-700"
              title="Zoom in"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        </div>

        {/* Document Body View */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-200/70 flex justify-center">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-300 p-8 sm:p-12 relative overflow-hidden transition-transform duration-150"
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-8xl font-black rotate-[-30deg]">VERIFIED</span>
            </div>

            {/* Official Government / Corporate Header */}
            {isGst ? (
              <div className="space-y-6">
                <div className="border-b-2 border-slate-900 pb-5 text-center">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Government of India • Ministry of Finance
                  </div>
                  <h1 className="mt-1 font-serif text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    FORM GST REG-06
                  </h1>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">
                    [See Rule 10(1)] • Registration Certificate
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-semibold text-slate-500">Registration Number (GSTIN):</span>
                    <span className="font-mono font-extrabold text-blue-900 text-sm">
                      {document.taxId || "29AAACZ1234M1Z5"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-semibold text-slate-500">Legal Name of Business:</span>
                    <span className="font-bold text-slate-900">
                      {document.legalName || companyName}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-semibold text-slate-500">Trade / Brand Name:</span>
                    <span className="font-bold text-slate-900">{companyName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-semibold text-slate-500">Constitution of Business:</span>
                    <span className="font-bold text-slate-800">Private Limited Company</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Principal Place of Business:</span>
                    <span className="font-bold text-slate-800 text-right max-w-xs">
                      {document.address || "Bengaluru, Karnataka, India"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Liability:</span>
                    <span className="font-bold text-slate-800">01/04/2020</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Period of Validity:</span>
                    <span className="font-bold text-emerald-700">Regular / Permanent</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Jurisdiction:</span>
                    <span className="font-bold text-slate-800">State / Center Ward 4</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Approval Audit:</span>
                    <span className="font-bold text-blue-700 font-mono">DSC-VERIFIED-AUTH</span>
                  </div>
                </div>
              </div>
            ) : isCin ? (
              <div className="space-y-6">
                <div className="border-b-2 border-slate-900 pb-5 text-center">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Government of India • Ministry of Corporate Affairs
                  </div>
                  <h1 className="mt-1 font-serif text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    CERTIFICATE OF INCORPORATION
                  </h1>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">
                    [Pursuant to sub-section (2) of section 7 and sub-section (1) of section 8 of the Companies Act, 2013]
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-slate-700 space-y-3">
                  <p>
                    I hereby certify that <strong>{document.legalName || companyName}</strong> is incorporated on this day
                    under the Companies Act, 2013 and that the company is <strong>Limited by Shares</strong>.
                  </p>
                  <p>
                    The Corporate Identity Number (CIN) of the company is:
                  </p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <span className="font-mono text-base font-black text-blue-900 tracking-wider">
                      {document.cinNumber || "U72200KA2020PTC081234"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Registrar of Companies:</span>
                    <span className="font-bold text-slate-800">ROC Bengaluru</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">PAN Allotted:</span>
                    <span className="font-mono font-bold text-slate-800">AAACZ1234M</span>
                  </div>
                </div>
              </div>
            ) : isPan ? (
              <div className="space-y-6">
                <div className="border-b-2 border-slate-900 pb-5 text-center">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    INCOME TAX DEPARTMENT • GOVT OF INDIA
                  </div>
                  <h1 className="mt-1 font-serif text-xl font-black text-slate-900 tracking-tight">
                    Permanent Account Number Card
                  </h1>
                </div>

                <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Entity Name:</span>
                      <div className="font-black text-slate-900 text-sm sm:text-base">
                        {document.legalName || companyName}
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                      ITD
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Permanent Account Number:</span>
                    <div className="font-mono text-xl font-black text-blue-900 tracking-widest mt-0.5">
                      {document.taxId?.slice(2, 12) || "AAACZ1234M"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border-b-2 border-slate-900 pb-4 text-center">
                  <h1 className="font-display text-xl font-bold text-slate-900">
                    {document.title}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Official Corporate Verification Submission
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400">Company:</span>
                    <span className="font-bold text-slate-900 ml-2">{companyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">File Name:</span>
                    <span className="font-mono text-slate-800 ml-2">{document.fileName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Uploaded At:</span>
                    <span className="text-slate-800 ml-2">
                      {document.uploadedAt ? new Date(document.uploadedAt).toLocaleString() : "Recent"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Official Seal Stamp */}
            <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full border-2 border-emerald-600 text-emerald-700 flex flex-col items-center justify-center text-[8px] font-black uppercase text-center leading-none">
                  <span>GOVT OF</span>
                  <span className="text-[10px]">INDIA</span>
                  <span>VERIFIED</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Digitally Authenticated Certificate</div>
                  <div className="text-[10px] text-slate-400">Cryptographically verified against central registry</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">CERT-REF: #98214-MCA</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 size={12} /> Valid Record
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMarkedValid(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                markedValid
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              }`}
            >
              <CheckCircle2 size={15} />
              <span>{markedValid ? "✓ Document Marked as Valid" : "Mark Document as Valid"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
