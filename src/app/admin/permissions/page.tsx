import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { ROLE_PERMISSIONS, AdminPermission } from "@/lib/admin/permissions";
import { Shield, KeyRound, Check, X, Info } from "lucide-react";

export const metadata = {
  title: "Role-Based Access Control (RBAC) Matrix | JobsGhuru Admin",
};

export default async function AdminPermissionsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const allRoles = Object.keys(ROLE_PERMISSIONS) as (keyof typeof ROLE_PERMISSIONS)[];

  const permissionsList: { key: AdminPermission; label: string; desc: string; category: string }[] = [
    { key: "users.view", label: "View User Accounts & Directory", desc: "Access user registry and review profile telemetry", category: "Core Platform" },
    { key: "users.suspend", label: "Quarantine & Suspend Accounts", desc: "Enforce policy bans and account suspension actions", category: "Core Platform" },
    { key: "companies.verify", label: "Corporate KYC & GSTIN Approval", desc: "Inspect and approve official company registration files", category: "Trust & Safety" },
    { key: "jobs.moderate", label: "Job Listing Moderation", desc: "Suspend fraudulent or scam listings from public view", category: "Trust & Safety" },
    { key: "candidates.view", label: "Candidate Directory Access", desc: "Audit candidate profiles while preserving recruiter privacy", category: "Talent Operations" },
    { key: "subscriptions.manage", label: "Billing, Plans & Invoicing", desc: "Manage subscription plans, discounts and view payments", category: "Monetization" },
    { key: "settings.manage", label: "Global System Configuration", desc: "Mutate runtime environment parameters and token quotas", category: "System & Governance" },
    { key: "audit.view", label: "Immutable Audit Log Viewer", desc: "Inspect cryptographically logged administrative diffs", category: "System & Governance" },
    { key: "ai.manage_models", label: "Gemini Model Gateway & Quotas", desc: "Tweak model parameters, prompts and observe latencies", category: "AI & Innovation" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/20 mb-2">
              <KeyRound className="w-3.5 h-3.5" />
              Enterprise RBAC Architecture
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Granular Permission Matrix</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              JobsGhuru enforces strict separation of privileges. Platform Administrators oversee global trust and compliance without interfering with company-scoped candidate evaluations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-mono text-slate-300">
              {allRoles.length} Scoped Roles Defined
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5">Strict Role Hierarchy Enforced:</strong>
          <span>Platform Admin ≠ Company Admin ≠ Recruiter ≠ Hiring Manager ≠ Interviewer ≠ Candidate. Privileges are compiled in code and evaluated on every authenticated API invocation.</span>
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4 w-72">Administrative Capability</th>
                {allRoles.slice(0, 6).map((role) => (
                  <th key={role} className="px-3 py-4 text-center">
                    <span className="text-[10px] font-bold tracking-wider text-slate-900 dark:text-slate-100 block">
                      {role.replace("_ADMIN", "").replace("_", " ")}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono normal-case">
                      {role === "SUPER_ADMIN" ? "All Access" : "Scoped"}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {permissionsList.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {perm.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {perm.desc}
                    </div>
                  </td>

                  {allRoles.slice(0, 6).map((role) => {
                    const hasPerm = ROLE_PERMISSIONS[role].includes(perm.key);
                    return (
                      <td key={role} className="px-3 py-4 text-center">
                        {hasPerm ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mx-auto">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 mx-auto">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
