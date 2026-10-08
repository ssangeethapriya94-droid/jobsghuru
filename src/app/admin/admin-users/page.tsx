import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminUsersView from "@/components/admin/AdminUsersView";

export const metadata = {
  title: "Administrative Staff & RBAC | JobsGhuru Admin",
};

export default async function AdminUsersDirectoryPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const adminRoles = [
    "SUPER_ADMIN",
    "PLATFORM_ADMIN",
    "MODERATION_ADMIN",
    "SUPPORT_ADMIN",
    "FINANCE_ADMIN",
    "AI_ADMIN",
    "ANALYTICS_ADMIN",
  ] as const;

  const users = await db.user.findMany({
    where: {
      role: {
        in: adminRoles as any,
      },
    },
    orderBy: { role: "asc" },
    include: {
      company: { select: { id: true, name: true } },
      _count: { select: { applications: true, sessions: true } },
    },
  });

  const serialized = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    phone: u.phone,
    twoFactorEnabled: u.twoFactorEnabled,
    suspensionReason: u.suspensionReason,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
    company: u.company,
    _count: u._count,
  }));

  return (
    <div>
      <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-blue-900 dark:text-blue-300">
            Platform Operator & Security Personnel Directory
          </h2>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
            Internal operators with scoped platform administrative permissions, 2FA credentials, and audit logging.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shrink-0 whitespace-nowrap self-start sm:self-auto">
          {serialized.length} Admin Seats
        </span>
      </div>
      <AdminUsersView initialUsers={serialized} filterOnlyRole={undefined} />
    </div>
  );
}
