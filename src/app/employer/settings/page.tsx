"use client";

import { useState, useEffect } from "react";
import { Settings, ShieldCheck, Mail, ToggleLeft, ToggleRight, Save } from "lucide-react";

export default function EmployerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [offerApprovalRequired, setOfferApprovalRequired] = useState(false);
  const [autoRejectOnFail, setAutoRejectOnFail] = useState(false);
  const [emailSignature, setEmailSignature] = useState("Best regards,\nJobsGhuru Hiring Team");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/company");
      const data = await res.json();
      if (data.company) {
        setOfferApprovalRequired(data.company.offerApprovalRequired || false);
        setAutoRejectOnFail(data.company.autoRejectOnFail || false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/employer/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerApprovalRequired,
          autoRejectOnFail,
        }),
      });
      if (res.ok) {
        alert("Settings saved successfully.");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Company Recruitment Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure offer approval requirements, automated candidate rejection rules, and communication preferences.</p>
      </div>

      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6 text-xs">
        {/* Offer Approval Policy */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <span className="font-bold text-sm text-slate-900 block">Require Offer Approval Before Dispatch</span>
            <span className="text-slate-500 text-xs">When enabled, created offers must be approved by a Company Admin or Hiring Manager before dispatching to candidates.</span>
          </div>
          <button
            onClick={() => setOfferApprovalRequired(!offerApprovalRequired)}
            className="text-blue-600 focus:outline-none p-1"
          >
            {offerApprovalRequired ? <ToggleRight size={36} className="text-blue-600" /> : <ToggleLeft size={36} className="text-slate-300" />}
          </button>
        </div>

        {/* Auto Reject Assessment Failures */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <span className="font-bold text-sm text-slate-900 block">Auto-Reject Candidates on Assessment Failure</span>
            <span className="text-slate-500 text-xs">Off by default. When enabled, candidates who score below passing thresholds are automatically rejected.</span>
          </div>
          <button
            onClick={() => setAutoRejectOnFail(!autoRejectOnFail)}
            className="text-blue-600 focus:outline-none p-1"
          >
            {autoRejectOnFail ? <ToggleRight size={36} className="text-blue-600" /> : <ToggleLeft size={36} className="text-slate-300" />}
          </button>
        </div>

        {/* Default Email Signature */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Company Email Signature</label>
          <textarea
            rows={3}
            value={emailSignature}
            onChange={(e) => setEmailSignature(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs"
          ></textarea>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-1.5"
          >
            <Save size={14} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
