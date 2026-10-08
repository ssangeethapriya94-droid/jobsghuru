import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { CheckSquare, Award, Clock, Users, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Candidate Skill Assessments | JobsGhuru Admin",
};

export default async function AdminAssessmentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const tests = [
    { id: "t1", title: "React & Modern TypeScript Proficiency", duration: "45 mins", questions: 30, passScore: "75%", completions: 3400, passRate: "68%" },
    { id: "t2", title: "PostgreSQL Schema Design & Query Optimization", duration: "40 mins", questions: 25, passScore: "70%", completions: 1820, passRate: "59%" },
    { id: "t3", title: "Product Thinking & Metric Prioritization", duration: "60 mins", questions: 20, passScore: "80%", completions: 940, passRate: "52%" },
    { id: "t4", title: "Data Structures & Algorithmic Problem Solving", duration: "90 mins", questions: 4, passScore: "65%", completions: 4200, passRate: "44%" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            Verified Skill Badges
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Technical Assessments & Testing Suites</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Automated evaluation benchmarks. Verified scores affix verified talent badges to candidate profiles, increasing recruiter response rates by 3.2x.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Assessment Title</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Benchmark Passing Bar</th>
                <th className="px-5 py-3.5">Candidates Evaluated</th>
                <th className="px-5 py-3.5">Pass Rate</th>
                <th className="px-5 py-3.5 text-right">Integrity Engine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
                    {t.title}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">{t.duration}</td>
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">{t.passScore}</td>
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">{t.completions.toLocaleString()}</td>
                  <td className="px-5 py-4 font-semibold text-emerald-600">{t.passRate}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      <CheckCircle2 className="w-3 h-3" />
                      AI Proctored
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
