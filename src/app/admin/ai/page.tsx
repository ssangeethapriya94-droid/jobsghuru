import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminAiUsageView from "@/components/admin/AdminAiUsageView";

export const metadata = {
  title: "AI & Telemetry Operations | JobsGhuru Admin",
};

export default async function AdminAiPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const logs = await db.aIUsageLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalTokens = logs.reduce((acc, curr) => acc + curr.totalTokens, 0);
  const totalCostUsd = logs.reduce((acc, curr) => acc + curr.estimatedCostUsd, 0);
  const avgLatencyMs =
    logs.length > 0
      ? Math.round(logs.reduce((acc, curr) => acc + curr.latencyMs, 0) / logs.length)
      : 0;

  const serialized = logs.map((l) => ({
    id: l.id,
    feature: l.feature,
    modelName: l.modelName,
    promptTokens: l.promptTokens,
    completionTokens: l.completionTokens,
    totalTokens: l.totalTokens,
    latencyMs: l.latencyMs,
    estimatedCostUsd: l.estimatedCostUsd,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <AdminAiUsageView
      logs={serialized}
      totalTokens={totalTokens}
      totalCostUsd={totalCostUsd}
      avgLatencyMs={avgLatencyMs}
    />
  );
}
