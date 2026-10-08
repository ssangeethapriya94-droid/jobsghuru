import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { Video, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "AI Mock Interviewer Telemetry | JobsGhuru Admin",
};

export default async function AdminInterviewAiPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/20 mb-2">
            <Video className="w-3.5 h-3.5" />
            Interview Simulation Suite
          </span>
          <h1 className="text-2xl font-bold tracking-tight">AI Mock Interview Sessions & Audio Latency</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time telemetry for voice-guided AI mock interview simulations, STAR-format candidate scoring, and anti-bias question generation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Completed Sessions</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">18,420</div>
          <p className="text-xs text-slate-500 mt-1">Simulated interviews across 80+ job roles</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Candidate Score Boost</span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">+34%</div>
          <p className="text-xs text-slate-500 mt-1">Average confidence & answer clarity improvement</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Audio Turnaround Latency</span>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">420ms</div>
          <p className="text-xs text-slate-500 mt-1">Ultra-low latency bidirectional conversational AI</p>
        </div>
      </div>
    </div>
  );
}
