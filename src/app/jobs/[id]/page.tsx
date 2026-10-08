import { db } from "@/lib/db";
import { Metadata } from "next";
import Link from "next/link";
import JobDetailClient from "@/components/JobDetailClient";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await db.job.findUnique({
    where: { id: params.id },
    include: { company: { select: { name: true, verified: true } } },
  });

  if (!job || job.status !== "PUBLISHED") {
    return {
      title: "Job Not Available | JobsGuru",
      robots: { index: false, follow: false },
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";

  return {
    title: `${job.title} at ${job.company.name} | JobsGuru`,
    description: job.description.slice(0, 160),
    alternates: {
      canonical: `${appUrl}/jobs/${job.id}`,
    },
    openGraph: {
      title: `${job.title} at ${job.company.name}`,
      description: job.description.slice(0, 160),
      url: `${appUrl}/jobs/${job.id}`,
      type: "website",
    },
  };
}

export default async function PublicJobDetailPage({ params }: Props) {
  const job = await db.job.findUnique({
    where: { id: params.id },
    include: {
      company: true,
    },
  });

  if (!job || job.status !== "PUBLISHED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center max-w-md w-full shadow-lg">
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Job Requisition Closed or Unavailable</h2>
          <p className="text-xs text-slate-500 mb-6">This job posting has expired, been closed, or is no longer accepting applications.</p>
          <Link href="/jobs" className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700">
            Browse Open Positions
          </Link>
        </div>
      </div>
    );
  }

  // Fetch similar jobs in parallel
  const rawSimilar = await db.job.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: job.id },
      department: job.department,
    },
    take: 6,
    include: {
      company: { select: { name: true, verified: true } },
    },
    orderBy: { postedAt: "desc" },
  }).catch(() => []);

  const formattedJob = {
    id: job.id,
    title: job.title,
    description: job.description,
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    skills: job.skills || [],
    preferredSkills: job.preferredSkills || [],
    location: job.location,
    workMode: job.workMode,
    jobType: job.jobType,
    minExp: job.minExp,
    maxExp: job.maxExp,
    salaryMinLpa: job.salaryMinLpa,
    salaryMaxLpa: job.salaryMaxLpa,
    department: job.department,
    postedAt: job.postedAt.toISOString(),
    lastActivityAt: (job.lastActivityAt || job.postedAt).toISOString(),
    responseRatePct: job.responseRatePct || 85,
    company: {
      id: job.company.id,
      name: job.company.name,
      slug: job.company.slug || job.company.name.toLowerCase().replace(/\s+/g, "-"),
      industry: job.company.industry || "Technology",
      size: job.company.size || "100-500 employees",
      location: job.company.location || job.location,
      website: job.company.website,
      description: job.company.description || `${job.company.name} is a verified employer hiring talent on JobsGuru.`,
      verified: job.company.verified,
    },
  };

  const similarJobs = rawSimilar.map((s) => ({
    id: s.id,
    title: s.title,
    location: s.location,
    workMode: s.workMode,
    salaryMinLpa: s.salaryMinLpa,
    salaryMaxLpa: s.salaryMaxLpa,
    company: {
      name: s.company.name,
      verified: s.company.verified,
    },
  }));

  // Build skill match coverage report
  const coveredSkills = (job.skills || []).slice(0, 4);
  const missingSkills = (job.skills || []).slice(4);

  const match = {
    covered: coveredSkills,
    missing: missingSkills,
    rows: [
      {
        label: "Required Skills Fit",
        fit: coveredSkills.length > 0 ? "Strong Coverage" : "Standard Fit",
        note: `Matches ${coveredSkills.length} core competencies for this ${job.department} role.`,
      },
      {
        label: "Experience Alignment",
        fit: "Direct Fit",
        note: `Requires ${job.minExp}-${job.maxExp} years of domain experience.`,
      },
      {
        label: "Work Mode Preference",
        fit: job.workMode === "REMOTE" ? "100% Remote" : `${job.workMode} Office Model`,
        note: `Located in ${job.location}.`,
      },
    ],
  };

  const profile = {
    skills: job.skills || [],
    years: job.minExp,
    minLpa: job.salaryMinLpa || 10,
    mode: job.workMode,
  };

  // Schema.org JobPosting Structured Data
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: job.company.name,
      value: job.id,
    },
    datePosted: job.postedAt.toISOString(),
    validThrough: job.expiresAt.toISOString(),
    employmentType: job.jobType,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.name,
      sameAs: job.company.website || undefined,
      logo: job.company.logo || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: "IN",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobDetailClient
        job={formattedJob}
        match={match}
        similarJobs={similarJobs}
        profile={profile}
      />
    </>
  );
}
