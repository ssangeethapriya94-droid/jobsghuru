"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Folder, Plus, Users, Trash2, ArrowRight } from "lucide-react";

export default function TalentPoolsListPage() {
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/talent-pools");
      const data = await res.json();
      if (data.success) {
        setPools(data.pools || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/employer/talent-pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (data.success) {
        setName("");
        setDescription("");
        setShowCreateModal(false);
        fetchPools();
      } else {
        alert(data.error || "Failed to create pool");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (poolId: string) => {
    if (!confirm("Are you sure you want to delete this talent pool?")) return;
    try {
      const res = await fetch(`/api/employer/talent-pools/${poolId}`, { method: "DELETE" });
      if (res.ok) fetchPools();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Talent Pools</h1>
          <p className="text-xs text-slate-500 mt-1">Organize shortlisted candidates and future prospects into reusable company pools.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={14} /> Create Talent Pool
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading talent pools...</div>
      ) : pools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {pools.map((p) => (
            <div key={p.id} className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 inline-block">
                    <Folder size={20} />
                  </div>
                  <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-rose-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="font-bold text-base text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{p.description || "No description provided."}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Users size={14} /> {p._count?.members || 0} Members
                </span>
                <Link href={`/employer/talent-pools/${p.id}`} className="font-bold text-blue-600 hover:underline flex items-center gap-1">
                  View Pool <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Folder size={40} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-base text-slate-900">No Talent Pools Created Yet</h3>
          <p className="text-xs text-slate-500 mt-1">Create pools to categorize candidates by skill, seniority, or department.</p>
        </div>
      )}

      {/* CREATE POOL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h2 className="font-bold text-base text-slate-900">Create New Talent Pool</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pool Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Senior React Developers"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Pre-vetted frontend engineers for Q4 hiring pipeline"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">Save Pool</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
