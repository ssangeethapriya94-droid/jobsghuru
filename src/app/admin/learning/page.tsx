import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { BookOpen, ExternalLink, Award, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Learning & Upskilling Catalog | JobsGhuru Admin",
};

export default async function AdminLearningPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const courses = [
    { id: "c1", title: "Full-Stack Next.js 15 & PostgreSQL Architecture", provider: "JobsGhuru Academy", level: "Intermediate", enrollments: 1420, rating: "4.9", status: "Published" },
    { id: "c2", title: "AI Prompt Engineering with Gemini 1.5 Pro", provider: "Google Cloud", level: "All Levels", enrollments: 3200, rating: "4.8", status: "Published" },
    { id: "c3", title: "Corporate Financial Analysis & DCF Modeling", provider: "NSE Academy", level: "Advanced", enrollments: 890, rating: "4.7", status: "Published" },
    { id: "c4", title: "Modern System Design for High-Concurrence Microservices", provider: "JobsGhuru Tech", level: "Advanced", enrollments: 2100, rating: "4.9", status: "Published" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Candidate Career Acceleration
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Learning Hub & Course Partnerships</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Curate verified upskilling programs directly recommended by the AI Career Copilot when candidate skill gaps are detected.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Course & Syllabus</th>
                <th className="px-5 py-3.5">Accreditation Partner</th>
                <th className="px-5 py-3.5">Level</th>
                <th className="px-5 py-3.5">Candidate Enrollments</th>
                <th className="px-5 py-3.5">Satisfaction</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
                    {c.title}
                  </td>
                  <td className="px-5 py-4 text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {c.provider}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">{c.level}</td>
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">{c.enrollments.toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-amber-500">★ {c.rating}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
