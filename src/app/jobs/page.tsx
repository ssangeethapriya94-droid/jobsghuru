import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { SlidersHorizontal, SearchX, MapPin, Globe, CheckCircle2, X } from "lucide-react";
import { db } from "@/lib/db";
import JobCard from "@/components/JobCard";

export const metadata = { title: "Search verified jobs by location" };
const PAGE = 12;

type SP = {
  q?: string;
  location?: string;
  mode?: string;
  type?: string;
  salary?: string;
  verified?: string;
  sort?: string;
  page?: string;
  remote?: string;
};

const popularCities = [
  { label: "All Locations", count: 24, value: "" },
  { label: "Chennai", count: 8, value: "Chennai" },
  { label: "Bengaluru", count: 4, value: "Bengaluru" },
  { label: "Hyderabad", count: 4, value: "Hyderabad" },
  { label: "Mumbai", count: 4, value: "Mumbai" },
  { label: "Pune", count: 4, value: "Pune" },
  { label: "Remote / Pan-India", count: 8, value: "Remote", isRemote: true },
];

export default async function JobsPage({ searchParams }: { searchParams: SP }) {
  const { q, location, mode, type, salary, verified, sort, remote } = searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const and: Prisma.JobWhereInput[] = [
    { status: "PUBLISHED" },
    { expiresAt: { gt: new Date() } },
  ];

  // 1. Keyword search (Title, Department, Company, Skills, and Location)
  if (q && q.trim()) {
    const term = q.trim();
    and.push({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { department: { contains: term, mode: "insensitive" } },
        { company: { name: { contains: term, mode: "insensitive" } } },
        { location: { contains: term, mode: "insensitive" } },
        { skills: { hasSome: [term, term.toLowerCase(), term[0].toUpperCase() + term.slice(1)] } },
      ],
    });
  }

  // 2. Location-based strict filtering
  if (location && location.trim() && location !== "All Locations") {
    const loc = location.trim();
    const isRemoteSearch = loc.toLowerCase() === "remote";

    if (isRemoteSearch) {
      // Show only remote jobs open to any location
      and.push({
        OR: [
          { workMode: "REMOTE" },
          { location: { contains: "remote", mode: "insensitive" } },
        ],
      });
    } else {
      // Specific city search (e.g. Chennai, Bengaluru, Mumbai, Pune, Hyderabad)
      const cityMatches: Prisma.JobWhereInput[] = [
        { location: { contains: loc, mode: "insensitive" } },
      ];

      // Handle common Bangalore/Bengaluru variations
      if (loc.toLowerCase().includes("bangalore") || loc.toLowerCase().includes("bengaluru")) {
        cityMatches.push(
          { location: { contains: "Bengaluru", mode: "insensitive" } },
          { location: { contains: "Bangalore", mode: "insensitive" } }
        );
      }

      // If user also wants to include remote roles open to candidates anywhere
      if (remote === "1") {
        cityMatches.push({ workMode: "REMOTE" });
      }

      and.push({ OR: cityMatches });
    }
  }

  // 3. Work mode filter
  if (mode && ["REMOTE", "HYBRID", "ONSITE"].includes(mode)) {
    and.push({ workMode: mode as never });
  }

  // 4. Job type filter
  if (type && ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"].includes(type)) {
    and.push({ jobType: type as never });
  }

  // 5. Salary disclosed
  if (salary) and.push({ salaryMinLpa: { not: null } });

  // 6. Verified company only
  if (verified) and.push({ company: { verified: true } });

  const where: Prisma.JobWhereInput = { AND: and };
  const orderBy: Prisma.JobOrderByWithRelationInput =
    sort === "salary"
      ? { salaryMaxLpa: { sort: "desc", nulls: "last" } }
      : { postedAt: "desc" };

  let jobs: Awaited<ReturnType<typeof fetchJobs>> = [];
  let total = 0;
  let failed = false;

  async function fetchJobs() {
    return db.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE,
      take: PAGE,
      include: { company: true },
    });
  }

  try {
    [jobs, total] = await Promise.all([fetchJobs(), db.job.count({ where })]);
  } catch {
    failed = true;
  }

  const pages = Math.max(1, Math.ceil(total / PAGE));

  const buildUrl = (updates: Partial<SP>) => {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...updates };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "All Locations" && v !== "") {
        params.set(k, String(v));
      }
    });
    return `/jobs?${params.toString()}`;
  };

  const activeCity = location || "";

  return (
    <div className="container-x py-8">
      {/* Page Heading & Location Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Explore Verified Jobs by Location
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Find roles in your preferred city or explore nationwide remote opportunities open to applicants everywhere.
          </p>
        </div>

        {/* Quick Clear Filter if any filter is set */}
        {(location || q || mode || type || salary || verified) && (
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs self-start"
          >
            <X size={14} /> Clear all filters
          </Link>
        )}
      </div>

      {/* Location Bar: Quick City Pills */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-2.5">
          <MapPin size={15} className="text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Filter by City / Location:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {popularCities.map((city) => {
            const isSelected =
              city.value === ""
                ? !activeCity || activeCity === "All Locations"
                : activeCity.toLowerCase() === city.value.toLowerCase();

            return (
              <Link
                key={city.label}
                href={buildUrl({ location: city.value, page: "1" })}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs scale-102"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {city.isRemote ? <Globe size={13} className={isSelected ? "text-blue-400" : "text-blue-600"} /> : null}
                <span>{city.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {city.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Search & Filter Form */}
      <form
        className="mt-6 grid gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm md:grid-cols-6 xl:gap-4 xl:p-5"
        role="search"
      >
        <input
          name="q"
          defaultValue={q}
          className="field md:col-span-2"
          placeholder="Title, skill (React), or company"
          aria-label="Search"
        />

        {/* Location Dropdown with All Available Cities */}
        <select
          name="location"
          defaultValue={location ?? ""}
          className="field font-medium text-slate-800"
          aria-label="Location"
        >
          <option value="">All Locations</option>
          <option value="Bengaluru">Bengaluru (Karnataka)</option>
          <option value="Chennai">Chennai (Tamil Nadu)</option>
          <option value="Hyderabad">Hyderabad (Telangana)</option>
          <option value="Mumbai">Mumbai (Maharashtra)</option>
          <option value="Pune">Pune (Maharashtra)</option>
          <option value="Remote">🌐 Remote (Work from anywhere)</option>
        </select>

        <select
          name="mode"
          defaultValue={mode ?? ""}
          className="field"
          aria-label="Work mode"
        >
          <option value="">Any work mode</option>
          <option value="REMOTE">Remote Only</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ONSITE">On-site</option>
        </select>

        <select
          name="type"
          defaultValue={type ?? ""}
          className="field"
          aria-label="Job type"
        >
          <option value="">Any job type</option>
          <option value="FULL_TIME">Full-time</option>
          <option value="PART_TIME">Part-time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
        </select>

        <select
          name="sort"
          defaultValue={sort ?? ""}
          className="field"
          aria-label="Sort"
        >
          <option value="">Latest postings</option>
          <option value="salary">Highest salary</option>
        </select>

        <div className="flex flex-wrap items-center gap-5 text-xs text-slate-700 md:col-span-5 pt-1">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              name="remote"
              value="1"
              defaultChecked={remote === "1"}
              className="h-4 w-4 accent-blue-600 rounded"
            />
            <span>Include Remote roles (Open to candidates across all locations)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              name="verified"
              value="1"
              defaultChecked={!!verified}
              className="h-4 w-4 accent-blue-600 rounded"
            />
            Verified employers only
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              name="salary"
              value="1"
              defaultChecked={!!salary}
              className="h-4 w-4 accent-blue-600 rounded"
            />
            Salary disclosed only
          </label>
        </div>

        <button
          type="submit"
          className="btn-primary col-span-full md:col-span-1 shadow-sm"
        >
          <SlidersHorizontal size={16} />
          Apply filters
        </button>
      </form>

      {/* Active Filter Summary Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="font-semibold text-slate-700" aria-live="polite">
          {failed
            ? ""
            : activeCity
            ? `Showing ${total} job${total === 1 ? "" : "s"} in ${activeCity}`
            : `${total} verified job${total === 1 ? "" : "s"} found`}
        </p>

        {activeCity && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
            <MapPin size={12} className="text-blue-600" />
            Filtered by: {activeCity}
            <Link
              href={buildUrl({ location: "", page: "1" })}
              className="ml-1 text-blue-600 hover:text-blue-900"
              title="Remove location filter"
            >
              ×
            </Link>
          </span>
        )}
      </div>

      {/* Jobs Listing Grid */}
      {failed ? (
        <div className="mt-4 rounded-xl border border-line bg-white p-10 text-center">
          <p className="font-semibold">We can't reach the database</p>
          <p className="mt-1 text-sm text-muted">
            Check DATABASE_URL in .env, then run <code>npm run db:push</code> and <code>npm run db:seed</code>.
          </p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <SearchX className="mx-auto text-slate-400" size={32} />
          <p className="mt-3 font-display font-bold text-slate-900">
            No jobs found for {activeCity || "selected criteria"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try checking "Include Remote roles" or click another city above to explore openings.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/jobs" className="btn-ghost text-xs">
              Clear all filters
            </Link>
            <Link href="/jobs?location=Remote" className="btn-primary text-xs">
              Browse Pan-India Remote Roles
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-4 4xl:grid-cols-5">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-8 flex items-center justify-center gap-3 text-sm"
        >
          {page > 1 && (
            <Link className="btn-ghost" href={buildUrl({ page: String(page - 1) })}>
              Previous
            </Link>
          )}
          <span className="text-slate-500 font-medium">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link className="btn-ghost" href={buildUrl({ page: String(page + 1) })}>
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

