"use client";

import { useState } from "react";
import {
  Settings,
  Shield,
  Key,
  Cpu,
  CreditCard,
  Globe,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
} from "lucide-react";
import AdminActionModal from "./AdminActionModal";

interface SettingItem {
  id: string;
  category: string;
  key: string;
  value: string;
  updatedBy: string;
  updatedAt: string;
}

export default function AdminSettingsView({
  initialSettings,
}: {
  initialSettings: SettingItem[];
}) {
  const [settings, setSettings] = useState<SettingItem[]>(initialSettings);
  const [activeTab, setActiveTab] = useState("GENERAL");
  const [localValues, setLocalValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialSettings.forEach((s) => {
      map[s.key] = s.value;
    });
    return map;
  });

  // Action modal for saving setting
  const [pendingSave, setPendingSave] = useState<{
    key: string;
    value: string;
    category: string;
  } | null>(null);

  const tabs = [
    { id: "GENERAL", label: "General & Branding", icon: Globe },
    { id: "AUTH", label: "Authentication & 2FA", icon: Key },
    { id: "SECURITY", label: "Security & Retention", icon: Shield },
    { id: "AI", label: "AI Models & Gateways", icon: Cpu },
    { id: "BILLING", label: "Billing & Invoicing", icon: CreditCard },
  ];

  const currentSettings = settings.filter((s) => s.category === activeTab);

  const handleConfirmSave = async (reason: string) => {
    if (!pendingSave) return;

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: pendingSave.key,
        value: pendingSave.value,
        category: pendingSave.category,
        reason,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to update configuration parameter");
    }

    setSettings((prev) =>
      prev.map((s) => (s.key === data.setting.key ? { ...s, ...data.setting } : s))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/20 mb-2">
              <Settings className="w-3.5 h-3.5" />
              Platform Configuration Console
            </span>
            <h1 className="text-2xl font-bold tracking-tight">System Parameters & Security Policies</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Fine-tune global platform controls, 2FA enforcement, Gemini API quotas, and financial compliance parameters. Changes require Super Admin authorization and generate immutable audit logs.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage runtime environment configuration parameters in PostgreSQL.
            </p>
          </div>

          <div className="space-y-5">
            {currentSettings.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No system parameters configured under this category yet.
              </div>
            ) : (
              currentSettings.map((s) => {
                const isModified = localValues[s.key] !== s.value;

                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          {s.key}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          Last adjusted by {s.updatedBy} ·{" "}
                          {new Date(s.updatedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {isModified && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                          Unsaved Changes
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={localValues[s.key] ?? s.value}
                        onChange={(e) =>
                          setLocalValues({
                            ...localValues,
                            [s.key]: e.target.value,
                          })
                        }
                        className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />

                      <button
                        onClick={() =>
                          setPendingSave({
                            key: s.key,
                            value: localValues[s.key] ?? s.value,
                            category: s.category,
                          })
                        }
                        disabled={!isModified}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Apply
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Reason Modal for Configuration Change */}
      {pendingSave && (
        <AdminActionModal
          isOpen={true}
          title={`Save System Parameter [${pendingSave.key}]`}
          description={`You are about to mutate the global runtime value of "${pendingSave.key}" to "${pendingSave.value}". This takes effect immediately across all application instances.`}
          actionLabel="Commit Configuration"
          variant="primary"
          onConfirm={handleConfirmSave}
          onClose={() => setPendingSave(null)}
        />
      )}
    </div>
  );
}
