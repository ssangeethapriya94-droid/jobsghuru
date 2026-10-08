import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminSkillsView from "@/components/admin/AdminSkillsView";

export const metadata = {
  title: "Skills & Taxonomy Management | JobsGhuru Admin",
};

export default async function AdminSkillsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const skills = await db.skill.findMany({
    orderBy: [{ verified: "desc" }, { jobCount: "desc" }, { name: "asc" }],
  });

  const serialized = skills.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    description: s.description,
    verified: s.verified,
    jobCount: s.jobCount,
    createdAt: s.createdAt.toISOString(),
  }));

  return <AdminSkillsView initialSkills={serialized} />;
}
