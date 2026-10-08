"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

export default function EmployerTeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("RECRUITER");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/team");
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/employer/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role }),
      });
      const data = await res.json();
      if (data.success) {
        setEmail("");
        setName("");
        setShowInviteModal(false);
        fetchTeamMembers();
      } else {
        alert(data.error || "Failed to invite member");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (userId: string) => {
    // LAST ADMIN PROTECTION CHECK
    const adminCount = members.filter((m) => m.role === "COMPANY_ADMIN" && m.status === "ACTIVE").length;
    const target = members.find((m) => m.id === userId);

    if (target?.role === "COMPANY_ADMIN" && adminCount <= 1) {
      alert("LAST ADMIN PROTECTION: Cannot deactivate the only active Company Admin.");
      return;
    }

    if (!confirm(`Deactivate ${target?.name}?`)) return;

    try {
      const res = await fetch(`/api/employer/team?userId=${userId}`, { method: "DELETE" });
      if (res.ok) fetchTeamMembers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Team Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage recruiter seats, hiring managers, interviewers, and role permissions.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus size={14} /> Invite Team Member
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading team members...</div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Member</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-bold text-slate-900">{m.name}</td>
                  <td className="p-4 text-slate-600">{m.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                      {m.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${m.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeactivate(m.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Deactivate Member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h2 className="font-bold text-base text-slate-900">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@company.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                >
                  <option value="RECRUITER">Recruiter</option>
                  <option value="HIRING_MANAGER">Hiring Manager</option>
                  <option value="INTERVIEWER">Interviewer</option>
                  <option value="COMPANY_ADMIN">Company Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
