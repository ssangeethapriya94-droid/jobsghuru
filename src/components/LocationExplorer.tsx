import Link from "next/link";
import { MapPin, Globe, ArrowRight, Building, Laptop, Compass, CheckCircle2 } from "lucide-react";

interface CityLocation {
  name: string;
  query: string;
  state: string;
  jobsCount: number;
  highlight: string;
  mode: string;
  isRemote?: boolean;
}

const featuredLocations: CityLocation[] = [
  {
    name: "Remote / Pan-India",
    query: "Remote",
    state: "Apply from any city",
    jobsCount: 8,
    highlight: "100% remote flexibility with verified equipment stipends",
    mode: "Work From Anywhere",
    isRemote: true,
  },
  {
    name: "Chennai",
    query: "Chennai",
    state: "Tamil Nadu",
    jobsCount: 8,
    highlight: "SaaS hub, Fintech, Healthtech & Core Engineering",
    mode: "On-site & Hybrid",
  },
  {
    name: "Bengaluru",
    query: "Bengaluru",
    state: "Karnataka",
    jobsCount: 4,
    highlight: "Fintech, AI Research & High-Growth Startups",
    mode: "On-site & Hybrid",
  },
  {
    name: "Hyderabad",
    query: "Hyderabad",
    state: "Telangana",
    jobsCount: 4,
    highlight: "Cloud infrastructure, DevOps & Enterprise E-commerce",
    mode: "On-site & Hybrid",
  },
  {
    name: "Mumbai",
    query: "Mumbai",
    state: "Maharashtra",
    jobsCount: 4,
    highlight: "Logistics, Supply Chain & Enterprise Platforms",
    mode: "On-site & Hybrid",
  },
  {
    name: "Pune",
    query: "Pune",
    state: "Maharashtra",
    jobsCount: 4,
    highlight: "Data Analytics, AI Modelling & Product Design",
    mode: "On-site & Hybrid",
  },
];

export default function LocationExplorer({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="container-x my-16 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-bold text-blue-700">
            <Compass size={13} className="text-blue-600" />
            <span>Multi-Location Career Hub</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {title || "Explore Jobs by Location & City"}
          </h2>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
            {subtitle || "Candidates from all locations across India can apply to verified roles in tech capitals or work 100% remotely."}
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition"
        >
          View all 24 openings <ArrowRight size={15} />
        </Link>
      </div>

      {/* Grid of Cities */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 3xl:grid-cols-6">
        {featuredLocations.map((loc) => {
          return (
            <Link
              key={loc.name}
              href={`/jobs?location=${encodeURIComponent(loc.query)}`}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                loc.isRemote
                  ? "border-blue-300 bg-gradient-to-br from-blue-50/80 via-white to-white hover:border-blue-500 hover:shadow-blue-500/10"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-slate-900/5"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-11 w-11 place-items-center rounded-xl text-white shadow-xs ${
                        loc.isRemote
                          ? "bg-blue-600"
                          : "bg-slate-900 group-hover:bg-blue-600 transition-colors"
                      }`}
                    >
                      {loc.isRemote ? <Globe size={20} /> : <MapPin size={20} />}
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {loc.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{loc.state}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold shrink-0 ${
                      loc.isRemote
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors"
                    }`}
                  >
                    {loc.jobsCount} Jobs
                  </span>
                </div>

                <p className="mt-4 text-xs text-slate-600 leading-relaxed font-medium">
                  {loc.highlight}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  {loc.isRemote ? <Laptop size={13} className="text-blue-600" /> : <Building size={13} className="text-slate-400" />}
                  {loc.mode}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  Explore <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Cross-city Application Notice */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 text-xs text-slate-700">
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>
            <b>Applying from another city?</b> All 8 Remote roles accept candidates nationwide. Hybrid and on-site employers offer relocation support where marked.
          </span>
        </div>
        <Link
          href="/jobs?location=Remote"
          className="rounded-lg bg-slate-900 px-3.5 py-1.5 font-bold text-white shadow-xs hover:bg-slate-800 shrink-0 transition"
        >
          See All Pan-India Remote Roles
        </Link>
      </div>
    </section>
  );
}
