import { db } from "@/lib/db";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Briefcase, Calendar, DollarSign, Building, CheckCircle2, ShieldCheck } from "lucide-react";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await db.job.findUnique({
    where: { id: params.id },
    include: { company: { select: { name: true, verified: true } } },
  });

  if (!job || job.status !== "PUBLISHED" || !job.company.verified) {
    return {
      title: "Job Not Available | JobsGhuru",
      robots: { index: false, follow: false },
    };
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";

  return {
    title: `${job.title} at ${job.company.name} | JobsGhuru`,
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
      company: { select: { id: true, name: true, logo: true, verified: true, location: true, website: true, description: true } },
    },
  });

  if (!job || job.status !== "PUBLISHED" || !job.company.verified) {
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

  const appUrl = process.env.APP_URL || "http://localhost:3000";

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
    baseSalary: job.salaryMaxLpa
      ? {
          "@type": "MonetaryAmount",
          currency: "INR",
          value: {
            "@type": "QuantitativeValue",
            minValue: job.salaryMinLpa ? job.salaryMinLpa * 100000 : undefined,
            maxValue: job.salaryMaxLpa * 100000,
            unitText: "YEAR",
          },
        }
      : undefined,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900">{job.company.name}</span>
              {job.company.verified && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck size={12} /> Verified Company
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">{job.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 font-medium"><MapPin size={14} /> {job.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium"><Briefcase size={14} /> {job.jobType.replace("_", " ")}</span>
              <span>•</span>
              <span className="font-bold text-slate-900">
                ₹{job.salaryMinLpa || 0} - ₹{job.salaryMaxLpa || 0} LPA
              </span>
            </div>
          </div>

          <Link
            href={`/candidate/apply/${job.id}`}
            className="px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md self-start sm:self-auto"
          >
            Apply for this Role
          </Link>
        </div>

        {/* Content Details */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
          <div>
            <h2 className="font-bold text-sm text-slate-900 border-b pb-2 mb-3">Position Description</h2>
            <p className="whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.responsibilities?.length > 0 && (
            <div>
              <h2 className="font-bold text-sm text-slate-900 border-b pb-2 mb-3">Key Responsibilities</h2>
              <ul className="list-disc list-inside space-y-1">
                {job.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {job.requirements?.length > 0 && (
            <div>
              <h2 className="font-bold text-sm text-slate-900 border-b pb-2 mb-3">Requirements & Qualifications</h2>
              <ul className="list-disc list-inside space-y-1">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
