import { CandidateProfile } from "../candidates/candidateProfileService";
import { JobSearchFilters, AIMatchedJob } from "@/lib/ai/schemas";

type DBJob = {
  id: string;
  title: string;
  department: string;
  location: string;
  workMode: string;
  jobType: string;
  minExp: number;
  maxExp: number;
  salaryMinLpa: number | null;
  salaryMaxLpa: number | null;
  skills: string[];
  preferredSkills: string[];
  postedAt: Date;
  responseRatePct: number;
  company: {
    name: string;
    verified: boolean;
    industry?: string;
  };
};

export function evaluateJobMatches(
  jobs: DBJob[],
  profile: CandidateProfile,
  filters: JobSearchFilters
): AIMatchedJob[] {
  return jobs.map((job) => {
    const reasons: AIMatchedJob["reasons"] = [];
    const skillGaps: string[] = [];

    // 1. Skill evaluation
    const userSkillsSet = new Set(
      (filters.skills.length > 0 ? filters.skills : profile.skills).map((s) =>
        s.toLowerCase().trim()
      )
    );

    const matchedSkills = job.skills.filter((s) =>
      userSkillsSet.has(s.toLowerCase().trim())
    );
    const missingSkills = job.skills.filter(
      (s) => !userSkillsSet.has(s.toLowerCase().trim())
    );

    skillGaps.push(...missingSkills);

    if (matchedSkills.length > 0) {
      reasons.push({
        label: "Required Skills",
        status: "MATCH",
        detail: `${matchedSkills.join(", ")} — Matched required skills`,
      });
    }

    if (missingSkills.length > 0) {
      reasons.push({
        label: "Skill Gap",
        status: "GAP",
        detail: `${missingSkills.slice(0, 2).join(", ")} — Missing in profile`,
      });
    }

    // 2. Experience evaluation
    const userYears =
      filters.experienceMin !== undefined
        ? filters.experienceMin
        : profile.yearsOfExperience;

    if (userYears >= job.minExp) {
      reasons.push({
        label: "Experience",
        status: "MATCH",
        detail: `${userYears} yrs experience meets the ${job.minExp}+ yrs requirement`,
      });
    } else {
      reasons.push({
        label: "Experience",
        status: "GAP",
        detail: `${job.minExp} yrs needed (profile has ${userYears} yrs)`,
      });
    }

    // 3. Location / Work Mode evaluation
    const targetLoc = filters.location[0] || profile.preferredLocations[0];
    const isRemoteMatch =
      job.workMode === "REMOTE" ||
      (filters.workMode === "REMOTE" && job.workMode === "REMOTE");

    if (isRemoteMatch) {
      reasons.push({
        label: "Work Mode",
        status: "MATCH",
        detail: "Remote role — Open to applicants nationwide",
      });
    } else if (
      targetLoc &&
      job.location.toLowerCase().includes(targetLoc.toLowerCase())
    ) {
      reasons.push({
        label: "Location",
        status: "MATCH",
        detail: `${job.location} (${job.workMode.toLowerCase()}) — Matches location search`,
      });
    } else {
      reasons.push({
        label: "Location",
        status: "NEUTRAL",
        detail: `${job.location} · ${job.workMode.toLowerCase()}`,
      });
    }

    // 4. Compensation evaluation
    const targetSalary = filters.salaryMinLpa || profile.minSalaryLpa;
    if (job.salaryMaxLpa && job.salaryMaxLpa >= targetSalary) {
      reasons.push({
        label: "Compensation",
        status: "MATCH",
        detail: `₹${job.salaryMinLpa || 6}–${job.salaryMaxLpa} LPA — Meets your ₹${targetSalary}L target`,
      });
    } else if (job.salaryMaxLpa) {
      reasons.push({
        label: "Compensation",
        status: "NEUTRAL",
        detail: `₹${job.salaryMinLpa || 6}–${job.salaryMaxLpa} LPA`,
      });
    }

    // Match score computation
    const totalRequiredSkills = job.skills.length || 1;
    const skillScore = (matchedSkills.length / totalRequiredSkills) * 50;
    const expScore = userYears >= job.minExp ? 25 : Math.max(0, (userYears / (job.minExp || 1)) * 20);
    const modeScore = job.workMode === "REMOTE" || (targetLoc && job.location.toLowerCase().includes(targetLoc.toLowerCase())) ? 15 : 5;
    const salaryScore = !job.salaryMaxLpa || job.salaryMaxLpa >= targetSalary ? 10 : 5;

    const matchScore = Math.min(98, Math.max(35, Math.round(skillScore + expScore + modeScore + salaryScore)));

    return {
      id: job.id,
      title: job.title,
      department: job.department,
      company: {
        name: job.company.name,
        verified: job.company.verified,
        industry: job.company.industry,
      },
      location: job.location,
      workMode: job.workMode,
      jobType: job.jobType,
      minExp: job.minExp,
      maxExp: job.maxExp,
      salaryMinLpa: job.salaryMinLpa,
      salaryMaxLpa: job.salaryMaxLpa,
      skills: job.skills,
      postedAt: job.postedAt.toISOString(),
      responseRatePct: job.responseRatePct,
      matchScore,
      reasons,
      skillGaps: Array.from(new Set(skillGaps)),
    };
  });
}
