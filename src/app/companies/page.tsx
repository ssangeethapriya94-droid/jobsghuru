import Link from "next/link";
import { Building2, BadgeCheck, MapPin, Users, Globe, Briefcase, ArrowRight, Search } from "lucide-react";
import { db } from "@/lib/db";

export const metadata = {
  title: "Verified Companies",
  description: "Explore accredited employers with verified response windows and transparent hiring.",
};

export const revalidate = 60;

interface SearchParams {
  q?: string;
  industry?: string;
}

export default async function CompaniesPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, industry } = searchParams;

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (industry) {
    where.industry = { equals: industry, mode: "insensitive" };
  }

  const companies = await db.company.findMany({
    where,
    include: {
      jobs: {
        where: { status: "PUBLISHED", expiresAt: { gt: new Date() } },
        select: { id: true, title: true, salaryMinLpa: true, salaryMaxLpa: true },
      },
    },
    orderBy: { verified: "desc" },
  }).catch(() => []);

  const allIndustries = ["Software", "Fintech", "Healthtech", "E-commerce", "Data & AI", "Logistics"];

  return (
    <div className="container-x py-10">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white p-8 md:p-12 shadow-xs">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <Building2 size={14} className="text-blue-600" /> Employer Directory
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Verified Partner Companies
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Every company is vetted for legitimate business credentials, committed recruiter reply SLAs, and upfront salary disclosures.
          </p>

          {/* Search Bar */}
          <form className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center" role="search">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search by company name, location, or keywords..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              Search
            </button>
          </form>

          {/* Industry Filter Pills */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="font-semibold text-slate-500 py-1">Industry:</span>
            <Link
              href="/companies"
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                !industry
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              All
            </Link>
            {allIndustries.map((ind) => (
              <Link
                key={ind}
                href={`/companies?industry=${ind}`}
                className={`rounded-lg px-3 py-1 font-semibold transition ${
                  industry?.toLowerCase() === ind.toLowerCase()
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {ind}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-slate-600">
            {companies.length} {companies.length === 1 ? "Company" : "Companies"} Hiring Actively
          </p>
        </div>

        {companies.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-4 4xl:grid-cols-5">
            {companies.map((c) => {
              const initials = c.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("");

              return (
                <div
                  key={c.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div>
                    {/* Top Row: Avatar + Name + Verified */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-900 font-display font-bold text-white shadow-xs">
                          {initials}
                        </div>
                        <div>
                          <h2 className="font-display text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {c.name}
                          </h2>
                          <span className="text-xs font-medium text-slate-500">{c.industry}</span>
                        </div>
                      </div>
                      {c.verified && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                          <BadgeCheck size={14} className="text-emerald-600" /> Verified
                        </span>
                      )}
                    </div>

                    {/* Metadata: Location, Size */}
                    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
                      <li className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{c.location}</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <Users size={13} className="text-slate-400" />
                        <span>{c.size} employees</span>
                      </li>
                      {c.website && (
                        <li className="flex items-center gap-1">
                          <Globe size={13} className="text-slate-400" />
                          <span className="text-blue-600 truncate max-w-[120px]">
                            {c.website.replace("https://", "")}
                          </span>
                        </li>
                      )}
                    </ul>

                    {/* Description */}
                    <p className="mt-3.5 text-xs leading-relaxed text-slate-500 line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  {/* Footer: Open positions + Action */}
                  <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800">
                      <Briefcase size={14} className="text-blue-600" />
                      {c.jobs.length} open {c.jobs.length === 1 ? "role" : "roles"}
                    </span>
                    <Link
                      href={`/jobs?q=${encodeURIComponent(c.name)}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      View Jobs <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Building2 className="mx-auto text-slate-400" size={32} />
            <p className="mt-3 font-display font-bold text-slate-800">No companies found</p>
            <p className="mt-1 text-xs text-slate-500">Try clearing your search query or industry filter.</p>
            <Link href="/companies" className="btn-ghost mt-4 inline-block text-xs">
              Clear Filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
