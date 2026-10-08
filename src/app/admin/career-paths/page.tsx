import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminCareerPathsView from "@/components/admin/AdminCareerPathsView";

export const metadata = {
  title: "Career Paths & Ladders | JobsGhuru Admin",
};

export default async function AdminCareerPathsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const paths = await db.careerPath.findMany({
    orderBy: { title: "asc" },
  });

  const serialized = paths.map((p) => ({
    id: p.id,
    title: p.title,
    department: p.department,
    level: p.level,
    skills: p.skills,
    nextRoles: p.nextRoles,
    avgSalary: p.avgSalary,
    createdAt: p.createdAt.toISOString(),
  }));

  return <AdminCareerPathsView initialPaths={serialized} />;
}
