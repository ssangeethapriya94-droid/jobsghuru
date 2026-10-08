"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  UserX,
  CheckCircle2,
  Clock,
  MoreVertical,
  Building2,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import AdminActionModal from "./AdminActionModal";

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  company?: { id?: string; name: string; verified?: boolean } | null;
  _count?: { applications: number };
}

export default function AdminUsersView({
  initialUsers,
  adminRole = "SUPER_ADMIN",
  filterOnlyRole,
  initialSearch = "",
}: {
  initialUsers: UserItem[];
  adminRole?: string;
  filterOnlyRole?: string;
  initialSearch?: string;
}) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [selectedTab, setSelectedTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Modals
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState("CANDIDATE");
  const [targetUser, setTargetUser] = useState<UserItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredUsers = users.filter((u) => {
    // Tab filter
    if (selectedTab === "CANDIDATE" && u.role !== "CANDIDATE") return false;
    if (selectedTab === "RECRUITER" && u.role !== "RECRUITER") return false;
    if (selectedTab === "COMPANY_ADMIN" && u.role !== "COMPANY_ADMIN") return false;
    if (selectedTab === "ADMINS" && !u.role.includes("ADMIN")) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone;
    }

    return true;
  });

  const handleSuspendAction = async (reason: string) => {
    if (!targetUser) return;
    const newStatus = targetUser.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: targetUser.id,
        status: newStatus,
        reason,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update account status");

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
    );
    showToast(`User ${targetUser.name} has been ${newStatus.toLowerCase()} successfully.`);
  };

  const handleRoleChangeAction = async (reason: string) => {
    if (!targetUser) return;

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: targetUser.id,
        role: targetRole,
        reason,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update role");

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: targetRole } : u))
    );
    showToast(`Role updated to ${targetRole} for ${targetUser.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
            User Accounts & Directory
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            RBAC governance, account statuses, and activity tracking across all platform users.
          </p>
        </div>

        {/* Role Tab Navigation - Scrollable on Mobile */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 text-xs font-semibold text-slate-600 shadow-2xs w-full sm:w-auto overflow-x-auto max-w-full scrollbar-none shrink-0">
          {[
            { label: "All Users", value: "ALL" },
            { label: "Candidates", value: "CANDIDATE" },
            { label: "Recruiters", value: "RECRUITER" },
            { label: "Company Admins", value: "COMPANY_ADMIN" },
            { label: "Platform Admins", value: "ADMINS" },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelectedTab(t.value)}
              className={`rounded-xl px-3 py-1.5 transition whitespace-nowrap shrink-0 ${
                selectedTab === t.value
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold shrink-0">
          Showing {filteredUsers.length} users
        </span>
      </div>

      {/* MOBILE STACKED CARDS VIEW (< 768px) */}
      <div className="block md:hidden space-y-3.5">
        {filteredUsers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 text-center text-xs text-slate-400">
            No users matching criteria found.
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div key={`mob-${u.id}`} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{u.email}</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                    u.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${u.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <span>{u.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Role</span>
                  <span className="font-bold text-blue-700 text-[11px]">{u.role.replace(/_/g, " ")}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Company</span>
                  <span className="font-semibold text-slate-800 text-[11px] truncate block">{u.company ? u.company.name : "—"}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Security</span>
                  <span className={`text-[11px] font-semibold ${u.twoFactorEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                    {u.twoFactorEnabled ? "2FA Enabled" : "Standard"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Created</span>
                  <span className="text-[11px] font-mono text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetUser(u);
                    setTargetRole(u.role);
                    setRoleModalOpen(true);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Change Role
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetUser(u);
                    setSuspendModalOpen(true);
                  }}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    u.status === "ACTIVE"
                      ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {u.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP DATA TABLE (>= 768px) */}
      <div className="hidden md:block rounded-3xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Security</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    {/* User Info */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          u.role === "SUPER_ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : u.role.includes("ADMIN")
                            ? "bg-blue-100 text-blue-800"
                            : u.role === "RECRUITER"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      {u.company ? (
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 size={13} className="text-slate-400" />
                          <span>{u.company.name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        <span>{u.status}</span>
                      </span>
                    </td>

                    {/* 2FA */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold ${
                          u.twoFactorEnabled ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {u.twoFactorEnabled ? "2FA Enabled" : "Standard"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setTargetUser(u);
                            setTargetRole(u.role);
                            setRoleModalOpen(true);
                          }}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Role
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTargetUser(u);
                            setSuspendModalOpen(true);
                          }}
                          className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                            u.status === "ACTIVE"
                              ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend / Reactivate Modal */}
      <AdminActionModal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title={targetUser?.status === "ACTIVE" ? "Suspend User Account" : "Reactivate User Account"}
        description={`You are modifying status for ${targetUser?.name} (${targetUser?.email}). Suspended accounts cannot log in or apply for jobs.`}
        confirmLabel={targetUser?.status === "ACTIVE" ? "Confirm Suspension" : "Reactivate Account"}
        confirmVariant={targetUser?.status === "ACTIVE" ? "danger" : "success"}
        requireReason={true}
        onConfirm={handleSuspendAction}
      />

      {/* Role Change Modal */}
      {roleModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setRoleModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl my-auto">
            <h3 className="font-display text-base font-bold text-slate-900">
              Change Role for {targetUser.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Modifying roles grants or revokes administrative and recruitment privileges.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Select New Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900"
                >
                  <option value="CANDIDATE">Candidate</option>
                  <option value="RECRUITER">Recruiter</option>
                  <option value="COMPANY_ADMIN">Company Admin</option>
                  <option value="MODERATION_ADMIN">Moderation Admin</option>
                  <option value="SUPPORT_ADMIN">Support Admin</option>
                  <option value="FINANCE_ADMIN">Finance Admin</option>
                  <option value="PLATFORM_ADMIN">Platform Admin</option>
                  {adminRole === "SUPER_ADMIN" && (
                    <option value="SUPER_ADMIN">Super Admin</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Audit Rationale <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="role-reason"
                  rows={2}
                  placeholder="e.g. Approved team promotion to Company Admin"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const el = document.getElementById("role-reason") as HTMLTextAreaElement;
                  const reason = el?.value || "";
                  if (!reason.trim() || reason.trim().length < 5) {
                    alert("Please provide a valid reason (min 5 chars).");
                    return;
                  }
                  await handleRoleChangeAction(reason);
                  setRoleModalOpen(false);
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs"
              >
                Apply Role Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
