"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Save,
  AlertCircle,
  Globe,
  Phone,
  MapPin,
  Users,
} from "lucide-react";

export default function EmployerCompanyProfilePage() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/employer/company")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setCompany(d.company);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/employer/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });
      if (res.ok) {
        setMsg("Company profile updated successfully.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-3xl bg-slate-200 animate-pulse"></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Company Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your legal entity records, public display info, and accreditation credentials.
          </p>
        </div>

        {company?.slug && (
          <Link
            href={`/companies/${company.slug}`}
            target="_blank"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs flex items-center gap-1.5"
          >
            <span>Public Profile</span>
            <ExternalLink size={13} />
          </Link>
        )}
      </div>

      {msg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} /> {msg}
        </div>
      )}

      {/* Verification Badge Status */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">JobsGhuru Accreditation Status</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Verified businesses display the blue badge and committed response SLA guarantee.
            </div>
          </div>
        </div>

        <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold border border-emerald-200">
          {company?.verified ? "✓ Verified Partner" : "Under Review"}
        </span>
      </div>

      {/* Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-8 shadow-xs">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Display Name</label>
              <input
                type="text"
                value={company?.name || ""}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Legal Registered Name</label>
              <input
                type="text"
                value={company?.legalName || company?.name || ""}
                onChange={(e) => setCompany({ ...company, legalName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Website URL</label>
              <input
                type="url"
                value={company?.website || ""}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Contact Phone</label>
              <input
                type="tel"
                value={company?.businessPhone || ""}
                onChange={(e) => setCompany({ ...company, businessPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Office Location</label>
              <input
                type="text"
                value={company?.location || ""}
                onChange={(e) => setCompany({ ...company, location: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Headcount Size</label>
              <select
                value={company?.size || "51-200"}
                onChange={(e) => setCompany({ ...company, size: e.target.value })}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
              >
                <option value="1-50">1-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Company Bio / Overview</label>
            <textarea
              rows={4}
              value={company?.description || ""}
              onChange={(e) => setCompany({ ...company, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-blue-600 focus:outline-none"
            ></textarea>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-98 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
