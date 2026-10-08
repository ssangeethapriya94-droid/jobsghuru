import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminCompaniesView from "@/components/admin/AdminCompaniesView";

export const metadata = {
  title: "Company Verifications Queue | JobsGhuru Admin",
};

export default async function AdminVerificationsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const companies = await db.company.findMany({
    orderBy: [{ verified: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { jobs: true } },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      verifications: {
        select: {
          id: true,
          legalName: true,
          taxId: true,
          businessRegister: true,
          domain: true,
          recruiterProof: true,
          documents: true,
          status: true,
          notes: true,
          reviewedBy: true,
          reviewedAt: true,
          submittedAt: true,
        },
        orderBy: { submittedAt: "desc" },
      },
      subscriptions: {
        include: { plan: true },
        take: 1,
      },
      payments: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const serialized = companies.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    legalName: c.legalName || c.name,
    displayName: c.displayName || c.name,
    companyType: c.companyType || "Corporate",
    industry: c.industry,
    size: c.size,
    location: c.location,
    website: c.website,
    businessPhone: c.businessPhone,
    country: c.country,
    state: c.state,
    city: c.city,
    address: c.address,
    foundedYear: c.foundedYear,
    description: c.description,
    hiringAreas: c.hiringAreas,
    benefits: c.benefits,
    verified: c.verified,
    createdAt: c.createdAt.toISOString(),
    _count: c._count,
    recruiter: c.users[0]
      ? {
          id: c.users[0].id,
          name: c.users[0].name,
          email: c.users[0].email,
          phone: c.users[0].phone,
          role: c.users[0].role,
          status: c.users[0].status,
        }
      : null,
    verifications: c.verifications.map((v) => ({
      id: v.id,
      legalName: v.legalName,
      taxId: v.taxId,
      businessRegister: v.businessRegister,
      domain: v.domain,
      recruiterProof: v.recruiterProof,
      documents: v.documents || [],
      status: v.status,
      notes: v.notes,
      reviewedBy: v.reviewedBy,
      reviewedAt: v.reviewedAt ? v.reviewedAt.toISOString() : null,
      submittedAt: v.submittedAt.toISOString(),
    })),
    planName: c.subscriptions[0]?.plan?.name || "Growth Partnership",
    invoiceNumber: c.payments[0]?.invoiceNumber || null,
  }));

  return <AdminCompaniesView initialCompanies={serialized} filterOnlyPending={true} />;
}
