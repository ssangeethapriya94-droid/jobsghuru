import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminReportsView from "@/components/admin/AdminReportsView";

export const metadata = {
  title: "Abuse & Escalation Reports | JobsGhuru Admin",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const reports = await db.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const serialized = reports.map((r) => ({
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

  return <AdminReportsView initialReports={serialized} initialSearch={searchParams?.q || ""} />;
}
