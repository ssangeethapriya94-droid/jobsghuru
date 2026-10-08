"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Users,
  Briefcase,
  FileText,
  Globe,
  MapPin,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  Mail,
} from "lucide-react";

export default function AdminCompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, [params.id]);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/companies/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setCompany(data.company);
      } else {
        router.push("/admin/companies");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAction = async (action: "APPROVE" | "REJECT") => {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this company verification?`)) return;
    setVerifying(true);
    try {
      const res = await fetch(`/api/admin/companies/${params.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: `Admin decision: ${action}` }),
      });
      if (res.ok) {
        fetchCompany();
      } else {
        alert("Action failed.");
      }
    } catch (e) {
      alert("An error occurred.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-10 w-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/companies"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          <span>Back to All Companies</span>
        </Link>

        <div className="flex items-center gap-2">
          {company.verified ? (
            <button
              onClick={() => handleVerifyAction("REJECT")}
              disabled={verifying}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition"
            >
              Revoke Verification
            </button>
          ) : (
            <button
              onClick={() => handleVerifyAction("APPROVE")}
              disabled={verifying}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>Verify Company</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-2xl">
              {company.name ? company.name[0].toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{company.name}</h1>
                {company.verified ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    Pending Verification
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1"><Building2 size={13} /> {company.industry || "Technology"}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={13} /> {company.location || "Unspecified"}</span>
                {company.website && (
                  <>
                    <span>•</span>
                    <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <Globe size={13} /> {company.website}
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-lg font-black text-slate-900 block">{company._count.jobs}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Jobs Posted</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-lg font-black text-slate-900 block">{company._count.applications}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Applications</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-lg font-black text-slate-900 block">{company._count.users}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Team Members</span>
            </div>
          </div>
        </div>

        {company.description && (
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-800 mb-1">Company Description</h4>
            <p>{company.description}</p>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Users size={16} className="text-blue-600" />
          <span>Team Members ({company.users?.length || 0})</span>
        </h3>
        <div className="divide-y divide-slate-100">
          {company.users?.map((u: any) => (
            <div key={u.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{u.name}</span>
                <span className="text-slate-400 text-[11px] flex items-center gap-1"><Mail size={11} /> {u.email}</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Posted Jobs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Briefcase size={16} className="text-blue-600" />
          <span>Recent Job Postings</span>
        </h3>
        {company.jobs?.length === 0 ? (
          <p className="text-xs text-slate-400">No jobs posted yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {company.jobs?.map((j: any) => (
              <div key={j.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{j.title}</span>
                  <span className="text-slate-400 text-[11px]">
                    {j.location} • Posted {new Date(j.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {j._count.applications} Applicants
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      j.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {j.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
