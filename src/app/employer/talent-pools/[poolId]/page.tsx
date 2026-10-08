"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Trash2, Mail, ExternalLink, AlertCircle } from "lucide-react";

export default function TalentPoolDetailPage() {
  const params = useParams();
  const poolId = params.poolId as string;

  const [pool, setPool] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoolDetail();
  }, [poolId]);

  const fetchPoolDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employer/talent-pools/${poolId}`);
      const data = await res.json();
      if (data.success) {
        setPool(data.pool);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member from the talent pool?")) return;
    try {
      const res = await fetch(`/api/employer/talent-pools/${poolId}/members?memberId=${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchPoolDetail();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading pool details...</div>;
  if (!pool) return <div className="p-8 text-center text-rose-600">Talent Pool Not Found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/employer/talent-pools" className="hover:text-slate-900 font-bold flex items-center gap-1">
          <ArrowLeft size={14} /> Talent Pools
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{pool.name}</span>
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">{pool.name}</h1>
          <p className="text-xs text-slate-500 mt-1">{pool.description || "No description provided."}</p>
        </div>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full self-start sm:self-auto">
          {pool.members?.length || 0} Members
        </span>
      </div>

      <div className="space-y-3">
        {pool.members?.length > 0 ? (
          pool.members.map((m: any) => (
            <div key={m.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm text-slate-900">{m.candidateName}</div>
                <div className="text-slate-500">Email: {m.candidateEmail}</div>
                {m.application?.job?.title && (
                  <div className="text-slate-400">Application: {m.application.job.title} ({m.application.status})</div>
                )}
                {m.addedBy && <div className="text-[10px] text-slate-400">Added by {m.addedBy} on {new Date(m.createdAt).toLocaleDateString("en-IN")}</div>}
              </div>

              <button
                onClick={() => handleRemoveMember(m.id)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                title="Remove Member"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
            No candidates added to this talent pool yet. Use Candidate Search to add members.
          </div>
        )}
      </div>
    </div>
  );
}
