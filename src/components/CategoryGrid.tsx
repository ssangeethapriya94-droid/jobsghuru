"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, BarChart3, Palette, Megaphone, ShieldCheck, ArrowUpRight, Cpu, Sparkles, Layers } from "lucide-react";

interface CategoryProps {
  counts?: Record<string, number>;
}

export default function CategoryGrid({ counts: initialCounts = {} }: CategoryProps) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [totalOpenings, setTotalOpenings] = useState<number>(24);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          if (data.departmentCounts) {
            setCounts(data.departmentCounts);
          }
          if (data.totalJobs) {
            setTotalOpenings(data.totalJobs);
          }
        }
      })
      .catch((err) => console.error("Failed to load category stats:", err));
  }, []);

  const categories = [
    {
      name: "Engineering",
      query: "Engineering",
      count: counts["Engineering"] || counts["Software Engineering"] || 16,
      skills: ["React", "Node", "TypeScript", "Docker"],
      icon: Code2,
      gradient: "from-blue-600 to-indigo-600",
      lightBg: "bg-blue-50/70 text-blue-700 border-blue-100",
      hoverBorder: "hover:border-blue-300 hover:shadow-blue-600/15",
    },
    {
      name: "Data & AI",
      query: "Data",
      count: counts["Data"] || counts["Data & AI"] || 3,
      skills: ["SQL", "Python", "Power BI", "AI/ML"],
      icon: BarChart3,
      gradient: "from-indigo-600 to-purple-600",
      lightBg: "bg-indigo-50/70 text-indigo-700 border-indigo-100",
      hoverBorder: "hover:border-indigo-300 hover:shadow-indigo-600/15",
    },
    {
      name: "Design & UX",
      query: "Design",
      count: counts["Design"] || counts["Design & UX"] || 3,
      skills: ["Figma", "UX Research", "Design Systems"],
      icon: Palette,
      gradient: "from-pink-600 to-rose-500",
      lightBg: "bg-pink-50/70 text-pink-700 border-pink-100",
      hoverBorder: "hover:border-pink-300 hover:shadow-pink-600/15",
    },
    {
      name: "Growth & Marketing",
      query: "Marketing",
      count: counts["Marketing"] || counts["Growth & Marketing"] || 2,
      skills: ["SEO", "Meta Ads", "Google Analytics"],
      icon: Megaphone,
      gradient: "from-emerald-600 to-teal-500",
      lightBg: "bg-emerald-50/70 text-emerald-700 border-emerald-100",
      hoverBorder: "hover:border-emerald-300 hover:shadow-emerald-600/15",
    },
    {
      name: "DevOps & Cloud",
      query: "DevOps",
      count: counts["DevOps"] || counts["Cloud"] || 4,
      skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"],
      icon: Cpu,
      gradient: "from-sky-600 to-cyan-500",
      lightBg: "bg-sky-50/70 text-sky-700 border-sky-100",
      hoverBorder: "hover:border-sky-300 hover:shadow-sky-600/15",
    },
    {
      name: "QA & Testing",
      query: "QA",
      count: counts["QA"] || counts["Testing"] || 3,
      skills: ["Cypress", "Selenium", "Automation"],
      icon: ShieldCheck,
      gradient: "from-amber-500 to-orange-500",
      lightBg: "bg-amber-50/70 text-amber-700 border-amber-100",
      hoverBorder: "hover:border-amber-300 hover:shadow-amber-600/15",
    },
  ];

  const handleSkillClick = (e: React.MouseEvent, skill: string) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/jobs?q=${encodeURIComponent(skill)}`);
  };

  return (
    <section className="container-x mt-16 sm:mt-24">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-700 shadow-2xs backdrop-blur-xs">
            <Layers size={13} className="text-blue-600" />
            Specializations
          </span>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Explore by Field
          </h2>
          <p className="mt-1.5 text-sm font-medium text-slate-500 max-w-xl">
            Find roles tailored to your exact stack with transparent compensation and direct recruiter connection.
          </p>
        </div>

        <Link
          href="/jobs"
          className="group inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-2xs transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 hover:shadow-sm shrink-0"
        >
          <span>View all {totalOpenings} openings</span>
          <ArrowUpRight size={17} className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600" />
        </Link>
      </div>

      {/* Responsive Grid Layout */}
      <div className="mt-8 grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.name}
              href={`/jobs?q=${encodeURIComponent(c.query)}`}
              className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-2xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${c.hoverBorder}`}
            >
              <div>
                {/* Top Icon Avatar + Role Badge */}
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${c.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={22} />
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${c.lightBg}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {c.count} {c.count === 1 ? "role" : "roles"}
                  </span>
                </div>

                {/* Field Name */}
                <h3 className="mt-4 font-display text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {c.name}
                </h3>

                {/* Interactive Skill Chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={(e) => handleSkillClick(e, skill)}
                      className="rounded-md border border-slate-200/80 bg-slate-50/80 px-2 py-0.5 text-[11px] font-semibold text-slate-600 transition-all duration-150 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Link Footer */}
              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-blue-600 transition-colors group-hover:text-blue-700">
                <span>Browse roles</span>
                <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
