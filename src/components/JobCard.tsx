import Link from "next/link";
import { BadgeCheck, MapPin, Clock, Wallet, Activity, ArrowRight, Globe } from "lucide-react";
import { ago, salary, modeLabel, typeLabel } from "@/lib/format";

type J = {
  id: string;
  title: string;
  location: string;
  workMode: keyof typeof modeLabel;
  jobType: keyof typeof typeLabel;
  minExp: number;
  maxExp: number;
  salaryMinLpa: number | null;
  salaryMaxLpa: number | null;
  skills: string[];
  department?: string;
  postedAt: Date;
  lastActivityAt: Date;
  responseRatePct: number;
  company: { name: string; verified: boolean };
};

// Deterministic vibrant gradient generator for company logos
const avatarGradients = [
  "from-blue-600 to-indigo-600",
  "from-emerald-500 to-teal-700",
  "from-purple-600 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-cyan-600 to-blue-700",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

export default function JobCard({ job }: { job: J }) {
  const initials = job.company.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  const gradient = getGradient(job.company.name);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-950/5"
    >
      {/* Top colorful accent bar on hover */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div>
        {/* Header: Avatar + Title + Company */}
        <div className="flex items-start gap-3.5">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-tr ${gradient} font-display font-bold text-white shadow-md shadow-indigo-900/10`}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {job.title}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="truncate">{job.company.name}</span>
              {job.company.verified && (
                <span
                  className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[11px] font-bold text-emerald-700"
                  title="Verified employer"
                >
                  <BadgeCheck size={13} className="text-emerald-600" /> Verified
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Location, Pay, Experience */}
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
          <li className="flex items-center gap-1.5">
            <MapPin size={14} className={job.workMode === "REMOTE" ? "text-blue-600" : "text-slate-400"} />
            <span className="font-bold text-slate-900">{job.location}</span>
            <span className="text-slate-300">·</span>
            {job.workMode === "REMOTE" ? (
              <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                <Globe size={11} /> Remote (Any Location)
              </span>
            ) : (
              <span className="font-semibold text-slate-600">{modeLabel[job.workMode]}</span>
            )}
          </li>
          <li className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <Wallet size={13} className="text-emerald-600" />
            <span>{salary(job.salaryMinLpa, job.salaryMaxLpa)}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            <span>{job.minExp}–{job.maxExp} yrs</span> · <span>{typeLabel[job.jobType]}</span>
          </li>
        </ul>

        {/* Skill Badges */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-md border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 transition group-hover:border-indigo-200 group-hover:bg-indigo-50/40 group-hover:text-indigo-700"
            >
              {s}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-500">
              +{job.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Posted time + Recruiter response rate with live pulse + Quick Apply CTA */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>Posted {ago(job.postedAt)}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {job.responseRatePct}% response rate
          </span>
          <span className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-xs opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
            <span>Apply</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
