import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminUsersView from "@/components/admin/AdminUsersView";

export const metadata = {
  title: "Suspended & Restricted Accounts | JobsGhuru Admin",
};

export default async function AdminSuspendedPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const users = await db.user.findMany({
    where: { status: "SUSPENDED" },
    orderBy: { updatedAt: "desc" },
    include: {
      company: { select: { id: true, name: true } },
      _count: { select: { applications: true, sessions: true } },
    },
    take: 60,
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
      <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-red-900 dark:text-red-300">
            Platform Suspensions & Policy Enforcement
          </h2>
          <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
            Accounts quarantined due to malicious activity, fake job listings, or severe terms of service violations.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shrink-0 whitespace-nowrap self-start sm:self-auto">
          {serialized.length} Quarantined
        </span>
      </div>
      <AdminUsersView initialUsers={serialized} filterOnlyRole={undefined} />
    </div>
  );
}
