import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminReportsView from "@/components/admin/AdminReportsView";
import Link from "next/link";
import { ShieldCheck, Building2, AlertTriangle, FileCheck } from "lucide-react";

export const metadata = {
  title: "Trust & Safety Command | JobsGhuru Admin",
};

export default async function AdminSafetyPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const [reports, pendingVerificationsCount, pausedJobsCount] = await Promise.all([
    db.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.companyVerification.count({
      where: { status: { in: ["PENDING", "UNDER_REVIEW"] } },
    }),
    db.job.count({
      where: { status: { in: ["PAUSED", "PENDING_REVIEW"] } },
    }),
  ]);

  const serializedReports = reports.map((r) => ({
    id: r.id,
    reporterEmail: r.reporterEmail,
    targetType: r.targetType,
    targetId: r.targetId,
    targetTitle: r.targetTitle,
    reason: r.reason,
    description: r.description,
    evidenceUrl: r.evidenceUrl,
    status: r.status,
    resolutionNote: r.resolutionNote,
    actionTaken: r.actionTaken,
    resolvedBy: r.resolvedBy,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Quick Action Matrix for Safety Officers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/verifications"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <Building2 className="w-5 h-5" />
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {pendingVerificationsCount}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
              Pending Employer Verifications
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review GSTIN / MCA corporate documents for unverified companies.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/moderation"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {pausedJobsCount}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors">
              Job Listings Under Review
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Check paused or flagged postings before they appear in search.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/reports"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-500/50 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {reports.filter((r) => r.status === "OPEN").length}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-red-600 transition-colors">
              Open Policy Complaints
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Urgent candidate reports requiring immediate administrative triage.
            </p>
          </div>
        </Link>
      </div>

      <AdminReportsView initialReports={serializedReports} />
    </div>
  );
}
