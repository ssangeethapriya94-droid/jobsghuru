import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminUsersView from "@/components/admin/AdminUsersView";

export const metadata = {
  title: "User Management | JobsGhuru Admin",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true, verified: true } },
      _count: { select: { applications: true } },
    },
    take: 60,
  });

  const serializedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    twoFactorEnabled: u.twoFactorEnabled,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    company: u.company,
    _count: u._count,
  }));

  return (
    <AdminUsersView
      initialUsers={serializedUsers}
      adminRole={admin.role}
      initialSearch={searchParams?.q || ""}
    />
  );
}
