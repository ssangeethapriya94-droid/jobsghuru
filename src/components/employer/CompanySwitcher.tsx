"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ChevronDown, Check, Plus, ShieldCheck, Clock, Sparkles } from "lucide-react";
import { CompanySummary } from "@/lib/employer/types";

interface CompanySwitcherProps {
  currentCompany: {
    id: string;
    name: string;
    slug?: string;
    verified?: boolean;
    logo?: string | null;
    industry?: string;
  };
  availableCompanies?: CompanySummary[];
}

export default function CompanySwitcher({ currentCompany, availableCompanies = [] }: CompanySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  // Combine current company with availableCompanies to ensure current is included
  const allCompaniesList = Array.from(
    new Map(
      [
        {
          id: currentCompany.id,
          name: currentCompany.name,
          slug: currentCompany.slug || "",
          verified: !!currentCompany.verified,
          logo: currentCompany.logo,
          industry: currentCompany.industry || "Enterprise",
        },
        ...availableCompanies,
      ].map((item) => [item.id, item])
    ).values()
  );

  const handleSwitchCompany = async (targetCompanyId: string) => {
    if (targetCompanyId === currentCompany.id || switching) return;
    setSwitching(targetCompanyId);

    try {
      const res = await fetch("/api/employer/auth/switch-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: targetCompanyId }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to switch company context.");
      }
    } catch (err) {
      console.error(err);
      alert("Error switching company.");
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="relative z-30">
      {/* Active Company Switcher Card Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-3 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-blue-50/30 hover:border-blue-300 hover:bg-blue-50/40 transition-all shadow-2xs group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition">
            Active Workspace
          </span>
          <div className="flex items-center gap-1.5">
            {currentCompany.verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <ShieldCheck size={11} className="text-emerald-600" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                <Clock size={11} className="text-amber-600" /> Pending Audit
              </span>
            )}
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180 text-blue-600" : ""}`} />
          </div>
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-extrabold text-[11px] shadow-xs">
            {currentCompany.name.charAt(0)}
          </div>
          <span className="font-display text-xs font-bold text-slate-900 truncate group-hover:text-blue-700 transition">
            {currentCompany.name}
          </span>
        </div>
      </button>

      {/* Switcher Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
              <span>Your Registered Companies ({allCompaniesList.length})</span>
              <Sparkles size={11} className="text-blue-600" />
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 py-1">
              {allCompaniesList.map((comp) => {
                const isCurrent = comp.id === currentCompany.id;
                const isPending = switching === comp.id;

                return (
                  <button
                    key={comp.id}
                    type="button"
                    disabled={isCurrent || !!switching}
                    onClick={() => handleSwitchCompany(comp.id)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                      isCurrent
                        ? "bg-blue-50 text-blue-900 font-bold border border-blue-200/60"
                        : "hover:bg-slate-50 text-slate-700 font-semibold"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isCurrent
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {comp.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="truncate text-slate-900">{comp.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">{comp.industry}</div>
                      </div>
                    </div>

                    {isCurrent ? (
                      <Check size={14} className="text-blue-600 shrink-0 ml-2" />
                    ) : isPending ? (
                      <span className="text-[10px] font-bold text-blue-600 animate-pulse shrink-0 ml-2">
                        Switching...
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Register New Company CTA */}
            <div className="pt-2 mt-1 border-t border-slate-100">
              <Link
                href="/employers"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 hover:bg-blue-100/80 px-3 py-2 text-xs font-bold text-blue-700 transition"
              >
                <Plus size={14} />
                <span>+ Register Another Company</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
