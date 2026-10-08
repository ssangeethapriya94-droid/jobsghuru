import Link from "next/link";
import { Sparkles, TrendingUp, Mic, GraduationCap, CheckCircle2, ArrowRight, Bot, Target, BookOpen } from "lucide-react";
import InteractiveCareerTools from "@/components/InteractiveCareerTools";

export const metadata = {
  title: "Career Tools & Acceleration Hub",
  description: "Accelerate your tech career with AI Career Copilot, Skill Gap Visualizer, and Interview Preparation.",
};

export default function CareerPage() {
  const learningPaths = [
    {
      title: "Frontend to Full Stack Transition",
      time: "6-8 weeks",
      difficulty: "Intermediate",
      skills: ["Node.js", "PostgreSQL", "Docker", "REST API Design"],
      demand: "High Demand (+35% salary uplift)",
      href: "/jobs?q=Full+Stack",
    },
    {
      title: "Cloud Infrastructure & DevOps Mastery",
      time: "8-10 weeks",
      difficulty: "Advanced",
      skills: ["AWS", "Kubernetes", "Terraform", "CI/CD Pipelines"],
      demand: "Highest Paying (up to ₹32 LPA)",
      href: "/jobs?q=DevOps",
    },
    {
      title: "Modern React & Next.js Architecture",
      time: "4 weeks",
      difficulty: "Intermediate",
      skills: ["Server Components", "State Management", "Tailwind CSS", "Testing"],
      demand: "12+ Open Listings",
      href: "/jobs?q=React",
    },
    {
      title: "Data Analytics & Engineering",
      time: "6 weeks",
      difficulty: "Beginner to Intermediate",
      skills: ["SQL Optimization", "Python", "Power BI", "Data Modeling"],
      demand: "Growing Field (6+ LPA entry)",
      href: "/jobs?q=Data",
    },
  ];

  return (
    <div className="container-x py-10">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white p-8 md:p-12 shadow-xs">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <Sparkles size={14} className="text-blue-600" /> Career Development Hub
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Career Acceleration & Tools
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base leading-relaxed">
            Stop applying blind. Diagnose your skill gaps against real job requirements, chart your promotion roadmap, and practice company-specific interview challenges.
          </p>
        </div>
      </div>

      {/* Main Interactive Toolset Simulator */}
      <InteractiveCareerTools />

      {/* Learning Paths Tied to Real Openings */}
      <div className="mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <span className="inline-block rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              Curated Roadmaps
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Skill Paths Tied to Live Openings
            </h2>
            <p className="text-xs text-slate-500">
              Roadmaps structured around active tech stacks in our verified database.
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
          >
            Explore Matched Openings <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {learningPaths.map((path) => (
            <div
              key={path.title}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-600">{path.difficulty}</span>
                  <span className="text-slate-400 font-medium">{path.time}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-slate-900">
                  {path.title}
                </h3>
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  {path.demand}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {path.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">Structured Curriculum</span>
                <Link
                  href={path.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View Related Jobs <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
