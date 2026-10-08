import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import {
  UserCheck,
  Shield,
  Briefcase,
  FileText,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Lock,
  Search,
} from "lucide-react";

export const metadata = {
  title: "Candidate Directory & Privacy | JobsGhuru Admin",
};

export default async function AdminCandidatesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const candidates = await db.user.findMany({
    where: { role: "CANDIDATE" },
    orderBy: { createdAt: "desc" },
    include: {
      applications: {
        select: {
          id: true,
          status: true,
          matchScore: true,
          appliedAt: true,
          job: { select: { title: true, company: { select: { name: true } } } },
        },
        take: 3,
      },
      _count: { select: { applications: true } },
    },
    take: 50,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
              Candidate Pool & Privacy Governance
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              DPDP Privacy Compliant
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Platform-level oversight of registered job seekers with data-protection safeguards.
          </p>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="rounded-3xl border border-blue-200/90 bg-blue-50/60 p-5 text-xs text-blue-900">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
            <Lock size={16} />
          </div>
          <div>
            <h4 className="font-bold text-blue-950">Candidate Privacy Shield Enforced</h4>
            <p className="mt-0.5 text-blue-800 leading-relaxed">
              In accordance with Section 6 & 29, candidate contact data and resumes are protected. Platform Administrators must not casually modify candidate credentials without explicit support ticket authorization.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Card List (< 768px) */}
      <div className="block md:hidden space-y-3">
        {candidates.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
            No candidates found in database.
          </div>
        ) : (
          candidates.map((cand) => (
            <div
              key={cand.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm shrink-0">
                    {cand.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {cand.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      ID: {cand.id.slice(0, 10)}...
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{cand.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact</span>
                  <span className="text-slate-800 font-medium truncate block">{cand.email}</span>
                  <span className="text-[11px] text-slate-400 block">{cand.phone || "Not set"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Applications</span>
                  <span className="inline-block mt-0.5 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    {cand._count.applications} Applied
                  </span>
                </div>
              </div>

              {cand.applications[0] && (
                <div className="rounded-xl bg-slate-50 p-2.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Recent Activity</span>
                  <p className="font-semibold text-slate-800 truncate">{cand.applications[0].job.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    at {cand.applications[0].job.company.name} ({cand.applications[0].status})
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                  Open to Verified
                </span>
                <span className="font-mono">{new Date(cand.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Candidates Table (>= 768px) */}
      <div className="hidden md:block rounded-3xl border border-slate-200/90 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Candidate</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Applications</th>
                <th className="py-3.5 px-4">Recent Activity</th>
                <th className="py-3.5 px-4">Privacy Tier</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No candidates found in database.
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0">
                          {cand.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">
                            {cand.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: {cand.id.slice(0, 10)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{cand.email}</div>
                      <div className="text-[11px] text-slate-400">{cand.phone || "Not set"}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                        {cand._count.applications} Applied
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {cand.applications[0] ? (
                        <div>
                          <span className="font-semibold text-slate-800">
                            {cand.applications[0].job.title}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            at {cand.applications[0].job.company.name} ({cand.applications[0].status})
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                        Open to Verified
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>{cand.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(cand.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
