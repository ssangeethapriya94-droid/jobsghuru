import Link from "next/link";
import { Code2, BarChart3, Palette, Megaphone, Compass, ShieldCheck, ArrowUpRight, Cpu } from "lucide-react";

interface CategoryProps {
  counts?: Record<string, number>;
}

export default function CategoryGrid({ counts = {} }: CategoryProps) {
  const categories = [
    {
      name: "Engineering",
      query: "Engineering",
      count: counts["Engineering"] || 16,
      skills: "React, Node, TypeScript, Docker",
      icon: Code2,
    },
    {
      name: "Data & AI",
      query: "Data",
      count: counts["Data"] || 3,
      skills: "SQL, Python, Power BI, Statistics",
      icon: BarChart3,
    },
    {
      name: "Design & UX",
      query: "Design",
      count: counts["Design"] || 3,
      skills: "Figma, UX Research, Design Systems",
      icon: Palette,
    },
    {
      name: "Growth & Marketing",
      query: "Marketing",
      count: counts["Marketing"] || 2,
      skills: "SEO, Meta Ads, Google Analytics",
      icon: Megaphone,
    },
    {
      name: "DevOps & Cloud",
      query: "DevOps",
      count: 4,
      skills: "AWS, Kubernetes, Terraform, CI/CD",
      icon: Cpu,
    },
    {
      name: "QA & Testing",
      query: "QA",
      count: 3,
      skills: "Cypress, Selenium, Test Automation",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="container-x mt-20">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            Specializations
          </span>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Explore by Field
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Find roles tailored to your exact stack with transparent compensation.
          </p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          View all 24 openings <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.name}
              href={`/jobs?q=${encodeURIComponent(c.query)}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-800 transition duration-200 group-hover:bg-slate-900 group-hover:text-white">
                    <Icon size={20} />
                  </div>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {c.count} roles
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {c.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {c.skills}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Browse roles <ArrowUpRight size={13} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
