import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  MapPin,
  Users,
  Globe,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/db";

interface PageProps {
  params: { companySlug: string };
}

export async function generateMetadata({ params }: PageProps) {
  const company = await db.company.findUnique({
    where: { slug: params.companySlug },
  });
  if (!company) return { title: "Company Profile · JobsGhuru" };
  return {
    title: `${company.name} Careers · Verified Employer Profile`,
    description: company.description,
  };
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const company = await db.company.findUnique({
    where: { slug: params.companySlug },
    include: {
      jobs: {
        where: { status: "PUBLISHED", expiresAt: { gt: new Date() } },
        orderBy: { postedAt: "desc" },
      },
    },
  });

  if (!company) {
    notFound();
  }

  const benefits = company.benefits?.length
    ? company.benefits
    : [
        "Comprehensive Medical Insurance",
        "Flexible Work Arrangements",
        "Annual Learning & Conference Stipend",
        "Performance Bonus & ESOPs",
      ];

  return (
    <div className="bg-[#F8FAFC] py-12 min-h-screen">
      <div className="container-x max-w-5xl mx-auto space-y-8">
        {/* Company Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-xs">
                {company.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900">
                    {company.name}
                  </h1>
                  {company.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      <ShieldCheck size={14} /> Verified Partner
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Building2 size={13} className="text-slate-400" /> {company.industry}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" /> {company.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users size={13} className="text-slate-400" /> {company.size} employees
                  </span>
                  {company.website && (
                    <>
                      <span>•</span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Globe size={13} /> {company.website.replace("https://", "").replace("http://", "")}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-800">
                {company.jobs.length} Active Openings
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              About the Organization
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-3xl">
              {company.description}
            </p>
          </div>
        </div>

        {/* Culture & Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Culture */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
              Workplace & Values
            </span>
            <h3 className="font-display text-base font-bold text-slate-900 mt-2">
              Life at {company.name}
            </h3>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              {company.culture ||
                `${company.name} fosters an engineering-first culture focused on high velocity, open communication, and autonomous ownership.`}
            </p>
          </div>

          {/* Perks */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Perks & Stipends
            </span>
            <h3 className="font-display text-base font-bold text-slate-900 mt-2">
              Employee Benefits
            </h3>
            <div className="mt-4 space-y-2 text-xs">
              {benefits.map((b, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Open Career Opportunities ({company.jobs.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All roles commit to JobsGhuru's guaranteed 7-day recruiter response SLA.
              </p>
            </div>
          </div>

          {company.jobs.length > 0 ? (
            <div className="space-y-3.5">
              {company.jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900 hover:text-blue-600 transition">
                      <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{job.location} ({job.workMode.toLowerCase()})</span>
                      <span>•</span>
                      <span>{job.minExp}-{job.maxExp} yrs exp</span>
                      {job.salaryMinLpa && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-slate-800">
                            ₹{job.salaryMinLpa} - {job.salaryMaxLpa} LPA
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 4).map((sk) => (
                        <span key={sk} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>View Role</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No active job listings currently published by {company.name}. Check back soon!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
