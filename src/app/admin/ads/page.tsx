import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { Megaphone, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Advertising Campaigns & Banners | JobsGhuru Admin",
};

export default async function AdminAdsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const ads = [
    { id: "ad_1", client: "Google Cloud India", title: "Cloud Architect Certification Drive", placement: "Candidate Dashboard Top Banner", impressions: "142,500", clicks: "6,240", ctr: "4.38%", status: "Active" },
    { id: "ad_2", client: "Infosys Wingspan", title: "Full Stack Reskilling Fellowship", placement: "Job Search Sticky Sidebar", impressions: "98,200", clicks: "3,110", ctr: "3.16%", status: "Active" },
    { id: "ad_3", client: "Scaler Academy", title: "DSA & System Design Masterclass", placement: "Career Copilot Footer", impressions: "64,800", clicks: "2,890", ctr: "4.45%", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 mb-2">
            <Megaphone className="w-3.5 h-3.5" />
            Ad Network & Monetization
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Sponsor Banners & Upskill Partners</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Audit high-yield sponsored placements, click-through performance, and advertiser contract compliance.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Campaign & Client</th>
                <th className="px-5 py-3.5">Placement Slot</th>
                <th className="px-5 py-3.5">Impressions</th>
                <th className="px-5 py-3.5">Clicks</th>
                <th className="px-5 py-3.5">CTR</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {ad.title}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">{ad.client}</div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">{ad.placement}</td>
                  <td className="px-5 py-4 font-mono font-medium text-slate-800 dark:text-slate-200">{ad.impressions}</td>
                  <td className="px-5 py-4 font-mono font-medium text-slate-800 dark:text-slate-200">{ad.clicks}</td>
                  <td className="px-5 py-4 font-semibold text-emerald-600">{ad.ctr}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      {ad.status}
                    </span>
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
