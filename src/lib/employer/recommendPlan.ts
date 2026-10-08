import { PlanRecommendationInput, PlanRecommendationResult } from "./types";

export function recommendEmployerPlan(input: PlanRecommendationInput): PlanRecommendationResult {
  const reasons: string[] = [];

  // Enterprise check
  if (
    input.hiringVolume === "100+" ||
    input.recruiterCount > 15 ||
    input.activeJobsNeeded > 30 ||
    input.industry === "Enterprise"
  ) {
    if (input.hiringVolume === "100+") {
      reasons.push("High-volume hiring quota (100+ positions) requires enterprise capacity");
    }
    if (input.recruiterCount > 15) {
      reasons.push(`Accommodates your recruitment team of ${input.recruiterCount}+ hiring members`);
    }
    if (input.activeJobsNeeded > 30) {
      reasons.push(`Includes 100+ concurrent active job slots for multi-department scale`);
    }
    reasons.push("Custom ATS integration and dedicated recruitment manager support included");

    return {
      recommendedCode: "ENTERPRISE",
      recommendedName: "Enterprise Partnership",
      reasons,
      estimatedMonthlyCostInr: 39999,
      estimatedJobsLimit: 100,
      estimatedCredits: 5000,
    };
  }

  // Professional check
  if (
    input.hiringVolume === "21-50" ||
    input.hiringVolume === "51-100" ||
    input.hiringFrequency === "continuous" ||
    input.recruiterCount > 5 ||
    input.activeJobsNeeded > 10
  ) {
    if (input.hiringFrequency === "continuous") {
      reasons.push("Ideal for ongoing, month-over-month tech and non-tech recruitment drives");
    }
    if (input.recruiterCount > 5) {
      reasons.push(`Supports up to 15 recruiter seats with custom role delegation`);
    }
    if (input.activeJobsNeeded > 10) {
      reasons.push(`Provides 30 concurrent active job listings with prioritized discovery`);
    }
    if (input.aiRequirement) {
      reasons.push("Includes complete Recruiter AI suite with automated candidate screening");
    }
    reasons.push("Integrated interview scheduler, feedback scorecards, and offer letter generation");

    return {
      recommendedCode: "PROFESSIONAL",
      recommendedName: "Professional Partnership",
      reasons,
      estimatedMonthlyCostInr: 14999,
      estimatedJobsLimit: 30,
      estimatedCredits: 1000,
    };
  }

  // Growth check
  if (
    input.hiringVolume === "6-20" ||
    input.hiringFrequency === "monthly" ||
    input.candidateSearchNeed ||
    input.aiRequirement ||
    input.recruiterCount > 1
  ) {
    if (input.hiringVolume === "6-20") {
      reasons.push(`Fits your planned hiring volume of ${input.hiringVolume} roles`);
    }
    if (input.candidateSearchNeed) {
      reasons.push("Includes 250 monthly candidate search credits to proactively source talent");
    }
    if (input.aiRequirement) {
      reasons.push("Evidence-based AI skill matching highlights exact candidate coverage & gaps");
    }
    if (input.recruiterCount > 1) {
      reasons.push(`Includes up to 5 recruiter team seats`);
    }
    reasons.push("Accredited employer branding & verified company profile badge");

    return {
      recommendedCode: "GROWTH",
      recommendedName: "Growth Partnership",
      reasons,
      estimatedMonthlyCostInr: 6999,
      estimatedJobsLimit: 10,
      estimatedCredits: 250,
    };
  }

  // Starter default
  reasons.push("Designed for lean businesses testing verified talent hiring");
  reasons.push("Allows up to 3 active job postings with verified response tracking");
  reasons.push("Includes 50 candidate search credits / month");

  return {
    recommendedCode: "STARTER",
    recommendedName: "Starter Partnership",
    reasons,
    estimatedMonthlyCostInr: 2499,
    estimatedJobsLimit: 3,
    estimatedCredits: 50,
  };
}
