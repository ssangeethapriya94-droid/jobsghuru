import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminApplicationsView from "@/components/admin/AdminApplicationsView";

export const metadata = {
  title: "Application Pipeline Monitor | JobsGhuru Admin",
};

export default async function AdminApplicationsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const applications = await db.application.findMany({
    orderBy: { appliedAt: "desc" },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          company: {
            select: {
              id: true,
              name: true,
              verified: true,
            },
          },
        },
      },
    },
    take: 100,
  });

  const serialized = applications.map((app) => ({
    id: app.id,
    candidateName: app.candidateName,
    candidateEmail: app.candidateEmail,
    candidatePhone: app.candidatePhone,
    currentRole: app.currentRole,
    currentCompany: app.currentCompany,
    experienceYears: app.experienceYears,
    expectedCtc: app.expectedCtc,
    matchScore: app.matchScore,
    status: app.status,
    appliedAt: app.appliedAt.toISOString(),
    job: {
      id: app.job.id,
      title: app.job.title,
      location: app.job.location,
      company: {
        id: app.job.company.id,
        name: app.job.company.name,
        verified: app.job.company.verified,
      },
    },
  }));

  return <AdminApplicationsView initialApplications={serialized} />;
}
