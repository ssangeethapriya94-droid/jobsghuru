"use client";

import { useState, useEffect } from "react";
import { Building, Upload, Palette, CheckCircle2 } from "lucide-react";

export default function EmployerBrandingPage() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    address: "",
    website: "",
    logo: "",
    culture: "",
    signatoryName: "Director of Talent",
    signatoryTitle: "Authorized Signatory",
  });

  useEffect(() => {
    fetchCompanyBranding();
  }, []);

  const fetchCompanyBranding = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/company");
      const data = await res.json();
      if (data.company) {
        setCompany(data.company);
        setForm({
          displayName: data.company.displayName || data.company.name || "",
          address: data.company.address || "",
          website: data.company.website || "",
          logo: data.company.logo || "",
          culture: data.company.culture || "",
          signatoryName: "Director of Human Resources",
          signatoryTitle: "Authorized Offer Signatory",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/employer/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("Employer branding and signatory information updated.");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading company branding...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Employer Branding & Offer Setup</h1>
        <p className="text-xs text-slate-500 mt-1">Configure company logo, corporate address, and offer letter signatories used in formal PDF contracts.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6 text-xs">
        <div className="space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b pb-2">Corporate Identity</h2>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Company Display Name</label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Corporate Address (Printed on Offer PDFs)</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            ></textarea>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Logo Image URL</label>
            <input
              type="text"
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="font-bold text-sm text-slate-900 border-b pb-2">Offer Letter Signatory Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Signatory Name</label>
              <input
                type="text"
                value={form.signatoryName}
                onChange={(e) => setForm({ ...form, signatoryName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Signatory Title</label>
              <input
                type="text"
                value={form.signatoryTitle}
                onChange={(e) => setForm({ ...form, signatoryTitle: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
            {saving ? "Saving..." : "Save Branding Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
