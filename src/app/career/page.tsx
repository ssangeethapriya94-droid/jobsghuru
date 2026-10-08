import Link from "next/link";
import { Sparkles, TrendingUp, Mic, GraduationCap, CheckCircle2, ArrowRight, Bot, Target, BookOpen, ChevronRight, Award, Zap } from "lucide-react";
import InteractiveCareerTools from "@/components/InteractiveCareerTools";

export const metadata = {
  title: "Career Tools & Acceleration Hub | JobsGhuru",
  description: "Accelerate your tech career with AI Career Copilot, Skill Gap Visualizer, and Interview Preparation.",
};

export default function CareerPage() {
  const learningPaths = [
    {
      title: "Frontend to Full Stack Transition",
      time: "6–8 weeks",
      difficulty: "Intermediate",
      skills: ["Node.js", "PostgreSQL", "Docker", "REST API Design"],
      demand: "🔥 High Demand (+35% salary uplift)",
      href: "/jobs?q=Full+Stack",
    },
    {
      title: "Cloud Infrastructure & DevOps Mastery",
      time: "8–10 weeks",
      difficulty: "Advanced",
      skills: ["AWS", "Kubernetes", "Terraform", "CI/CD Pipelines"],
      demand: "⚡ Highest Paying (up to ₹32 LPA)",
      href: "/jobs?q=DevOps",
    },
    {
      title: "Modern React & Next.js Architecture",
      time: "4 weeks",
      difficulty: "Intermediate",
      skills: ["Server Components", "State Management", "Tailwind CSS", "Testing"],
      demand: "🚀 12+ Open Listings",
      href: "/jobs?q=React",
    },
    {
      title: "Data Analytics & Engineering",
      time: "6 weeks",
      difficulty: "Beginner to Intermediate",
      skills: ["SQL Optimization", "Python", "Power BI", "Data Modeling"],
      demand: "📈 Growing Field (6+ LPA entry)",
      href: "/jobs?q=Data",
    },
  ];

  return (
    <div className="container-x py-8 sm:py-12">
      {/* Premium Dark Gradient Hero Header */}
      <div className="rounded-3xl border border-blue-200/90 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 p-6 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-300 backdrop-blur">
            <Sparkles size={14} className="text-blue-400 animate-pulse" /> Career Development Hub
          </span>
          <h1 className="mt-4 font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Career Acceleration & Tools
          </h1>
          <p className="mt-3 text-sm sm:text-base lg:text-lg text-blue-100/90 font-medium leading-relaxed">
            Stop applying blind. Diagnose your skill gaps against real job requirements, chart your promotion roadmap, and practice company-specific interview challenges.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/career-ai"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition active:scale-98"
            >
              <Sparkles size={15} /> Launch AI Copilot
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-5 py-3 text-xs font-bold text-white backdrop-blur transition"
            >
              Browse Verified Jobs <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Interactive Toolset Simulator */}
      <InteractiveCareerTools />

      {/* Learning Paths Tied to Real Openings */}
      <div className="mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="inline-block rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-700">
              Curated Roadmaps
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Skill Paths Tied to Live Openings
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Roadmaps structured around active tech stacks in our verified database.
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1.5 shrink-0"
          >
            Explore Matched Openings <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {learningPaths.map((path) => (
            <div
              key={path.title}
              className="group relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-xl transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {path.difficulty}
                  </span>
                  <span className="text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                    {path.time}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {path.title}
                </h3>
                <p className="mt-1 text-xs font-extrabold text-emerald-700">
                  {path.demand}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {path.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Structured Curriculum</span>
                <Link
                  href={path.href}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  View Related Jobs <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
