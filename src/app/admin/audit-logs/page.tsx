import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminAuditLogsView from "@/components/admin/AdminAuditLogsView";

export const metadata = {
  title: "Audit Logs & Compliance Ledger | JobsGhuru Admin",
};

export default async function AdminAuditLogsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
  });

  const serialized = logs.map((l) => ({
    id: l.id,
    actorEmail: l.actorEmail,
    actorRole: l.actorRole,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    beforeJson: l.beforeJson,
    afterJson: l.afterJson,
    reason: l.reason,
    ipAddress: l.ipAddress,
    createdAt: l.createdAt.toISOString(),
  }));

  return <AdminAuditLogsView initialLogs={serialized} />;
}
