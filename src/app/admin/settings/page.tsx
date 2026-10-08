import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminSettingsView from "@/components/admin/AdminSettingsView";

export const metadata = {
  title: "System Settings & Parameters | JobsGhuru Admin",
};

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const settings = await db.systemSetting.findMany({
    orderBy: [{ category: "asc" }, { key: "asc" }],
  });

  const serialized = settings.map((s) => ({
    id: s.id,
    category: s.category,
    key: s.key,
    value: s.value,
    updatedBy: s.updatedBy,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <AdminSettingsView initialSettings={serialized} />;
}
