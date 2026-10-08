import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { FileText, Sparkles, CheckCircle2, Zap } from "lucide-react";

export const metadata = {
  title: "Resume AI & ATS Parser Telemetry | JobsGhuru Admin",
};

export default async function AdminResumeAiPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Resume Intelligence Engine
          </span>
          <h1 className="text-2xl font-bold tracking-tight">AI Resume Parser & Optimizer Monitor</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Inspect the performance of the ATS scanner, PDF/DOCX entity extraction accuracy, and personalized candidate pitch generation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Parsing Accuracy</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">99.1%</div>
          <p className="text-xs text-slate-500 mt-1">Multi-column layout & optical OCR support</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Avg Processing Time</span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">1.24s</div>
          <p className="text-xs text-slate-500 mt-1">Parallel streaming with Gemini 1.5 Flash</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Daily Resumes Processed</span>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">4,810</div>
          <p className="text-xs text-slate-500 mt-1">Automatic skill tagging into candidate graph</p>
        </div>
      </div>
    </div>
  );
}
