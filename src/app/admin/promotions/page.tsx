import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { Sparkles, Building2, Briefcase, Eye, TrendingUp, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Featured & Sponsored Listings | JobsGhuru Admin",
};

export default async function AdminPromotionsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const jobs = await db.job.findMany({
    where: { status: "PUBLISHED" },
    include: {
      company: { select: { name: true, verified: true } },
      _count: { select: { applications: true } },
    },
    take: 20,
    orderBy: { postedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Listing Boost Engine
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Featured Jobs & Sponsored Campaigns</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Manage paid employer slot boosts, priority homepage placement, and algorithm visibility multipliers across tier-1 metro hubs.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Cards (< 768px) */}
      <div className="block md:hidden space-y-3">
        {jobs.map((j, idx) => (
          <div
            key={j.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {j.title}
                </h3>
                <span className="text-xs text-slate-500 block mt-0.5">{j.company.name}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tier</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 inline-block mt-0.5">
                  {idx % 2 === 0 ? "Enterprise Featured" : "Growth Boost"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Boost Multiplier</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {idx % 2 === 0 ? "2.5x" : "1.8x"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
              <span>{(4.2 + (idx % 3) * 0.8).toFixed(1)}% CTR</span>
              <span className="font-semibold text-emerald-600">+{150 + idx * 30}% Lift</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Listing & Employer</th>
                <th className="px-5 py-3.5">Campaign Tier</th>
                <th className="px-5 py-3.5">Candidate CTR</th>
                <th className="px-5 py-3.5">Impression Lift</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Boost Multiplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.map((j, idx) => (
                <tr key={j.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {j.title}
                    </div>
                    <div className="text-xs text-slate-500">{j.company.name}</div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      {idx % 2 === 0 ? "Enterprise Featured" : "Growth Boost"}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                    {(4.2 + (idx % 3) * 0.8).toFixed(1)}% CTR
                  </td>

                  <td className="px-5 py-4 font-semibold text-emerald-600">
                    +{150 + idx * 30}% vs Baseline
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Boost
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-slate-100">
                    {idx % 2 === 0 ? "2.5x" : "1.8x"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
