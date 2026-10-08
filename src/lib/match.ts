// Deterministic, rule-based match explanation (NOT an AI model).
// Real AI matching plugs in later behind src/lib/ai. Every result carries its evidence.
export type Fit = "Strong" | "Partial" | "Gap" | "Match" | "No match";
export interface Profile { skills: string[]; years: number; minLpa: number; mode?: string }
export interface Job { skills: string[]; minExp: number; maxExp: number; salaryMaxLpa: number | null; workMode: string }

export function explainMatch(job: Job, p: Profile) {
  const have = new Set(p.skills.map((s) => s.toLowerCase()));
  const covered = job.skills.filter((s) => have.has(s.toLowerCase()));
  const missing = job.skills.filter((s) => !have.has(s.toLowerCase()));
  const ratio = job.skills.length ? covered.length / job.skills.length : 1;
  const skills: Fit = ratio >= 0.75 ? "Strong" : ratio >= 0.4 ? "Partial" : "Gap";
  const experience: Fit = p.years >= job.minExp ? "Strong" : p.years >= job.minExp - 1 ? "Partial" : "Gap";
  const salaryFit: Fit | "Not disclosed" = job.salaryMaxLpa == null ? "Not disclosed" : job.salaryMaxLpa >= p.minLpa ? "Match" : "No match";
  const workMode: Fit = !p.mode || p.mode === job.workMode ? "Match" : "No match";
  return { covered, missing, rows: [
    { label: "Skills", fit: skills, note: `${covered.length} of ${job.skills.length} required skills` },
    { label: "Experience", fit: experience, note: `You: ${p.years} yrs · Needs: ${job.minExp}+ yrs` },
    { label: "Salary", fit: salaryFit, note: job.salaryMaxLpa == null ? "Employer has not disclosed pay" : `Up to ₹${job.salaryMaxLpa} LPA vs your ₹${p.minLpa} LPA` },
    { label: "Work mode", fit: workMode, note: p.mode ? `You prefer ${p.mode.toLowerCase()}` : "No preference set" },
  ]};
}
