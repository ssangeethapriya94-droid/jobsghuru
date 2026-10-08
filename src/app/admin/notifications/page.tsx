import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { Bell, Mail, Smartphone, Edit3, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Notification & Template Governance | JobsGhuru Admin",
};

export default async function AdminNotificationsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const templates = await db.notificationTemplate.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/20 mb-2">
              <Bell className="w-3.5 h-3.5" />
              Omnichannel Messaging
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Notification & Email Templates</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Standardized email notifications, SMS alerts, and in-app updates dispatched to candidates and hiring managers during application milestones.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    {tpl.channel}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{tpl.key}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mt-1">
                  {tpl.title}
                </h3>
              </div>

              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-xs space-y-2">
              <div>
                <span className="text-slate-400 block font-medium">Subject Line:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {tpl.subject}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Template Body Preview:</span>
                <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] mt-0.5 line-clamp-3">
                  {tpl.body}
                </p>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                Interpolated Variables:
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {tpl.variables.map((v) => (
                  <span
                    key={v}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
