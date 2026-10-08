import {
  IntentType,
  JobSearchFilters,
  Clarification,
  CareerGuidance,
  SkillGapDetail,
} from "./schemas";
import { CandidateProfile } from "@/services/candidates/candidateProfileService";

const KNOWN_SKILLS = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "PostgreSQL",
  "SQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Figma",
  "CSS",
  "HTML",
  "Next.js",
  "Selenium",
  "Power BI",
  "Excel",
  "SEO",
  "Meta Ads",
  "Google Ads",
  "Git",
  "REST APIs",
];

const KNOWN_ROLES = [
  "Frontend Developer",
  "Full Stack Developer",
  "Backend Engineer",
  "Data Analyst",
  "Product Designer",
  "QA Engineer",
  "DevOps Engineer",
  "Digital Marketing Executive",
  "Software Engineering Intern",
];

const KNOWN_CITIES = [
  "Chennai",
  "Bengaluru",
  "Bangalore",
  "Hyderabad",
  "Mumbai",
  "Pune",
  "Delhi",
  "Kolkata",
];

export interface ParsedIntentResult {
  intent: IntentType;
  filters: JobSearchFilters;
  summary: string;
  clarification?: Clarification;
  careerGuidance?: CareerGuidance;
}

export function parseNaturalLanguageQuery(
  rawQuery: string,
  previousFilters?: JobSearchFilters,
  profile?: CandidateProfile
): ParsedIntentResult {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();

  // Initialize filters starting from previous filters (conversational memory)
  const filters: JobSearchFilters = previousFilters
    ? {
        role: previousFilters.role,
        skills: [...(previousFilters.skills || [])],
        location: [...(previousFilters.location || [])],
        workMode: previousFilters.workMode,
        jobType: previousFilters.jobType,
        experienceMin: previousFilters.experienceMin,
        experienceMax: previousFilters.experienceMax,
        salaryMinLpa: previousFilters.salaryMinLpa,
        verifiedOnly: previousFilters.verifiedOnly,
      }
    : {
        skills: [],
        location: [],
        verifiedOnly: false,
      };

  // 1. Check for Ambiguous Request needing Clarification
  const ambiguousDevPatterns = [
    /^find (developer|software|engineering|tech) jobs\.?$/i,
    /^(developer|software developer|engineer) jobs\.?$/i,
    /^find jobs\.?$/i,
    /^show me jobs\.?$/i,
  ];

  for (const pattern of ambiguousDevPatterns) {
    if (pattern.test(query.trim())) {
      return {
        intent: "CLARIFICATION_NEEDED",
        filters,
        summary: "I'd love to help! Could you specify what type of developer role you are targeting?",
        clarification: {
          needed: true,
          question: "What type of developer role are you looking for?",
          options: [
            "Frontend Developer",
            "Backend Engineer",
            "Full Stack Developer",
            "DevOps Engineer",
            "Data Analyst",
          ],
        },
      };
    }
  }

  // 2. Check for Career Guidance / "What should I learn next?"
  if (
    lower.includes("what should i learn") ||
    lower.includes("how to become") ||
    lower.includes("career growth") ||
    lower.includes("skill gap") ||
    lower.includes("learning path")
  ) {
    const isTargetingFullStack = lower.includes("full stack");
    const targetRole = isTargetingFullStack
      ? "Full Stack Developer"
      : profile?.targetRole || "Senior Full Stack Developer";

    const currentSkills = profile?.skills || ["React", "TypeScript", "JavaScript"];
    const gaps: SkillGapDetail[] = [
      {
        skill: "AWS & Cloud Deployment",
        priority: "HIGH",
        reason: "Required in 70% of modern full-stack and backend roles with ₹14+ LPA compensation.",
        learningResource: "AWS Certified Cloud Practitioner & Serverless Architecture on ECS/Lambda.",
        matchingJobsCount: 8,
      },
      {
        skill: "Docker & Containerization",
        priority: "HIGH",
        reason: "Essential for packaging microservices and modern CI/CD deployment pipelines.",
        learningResource: "Docker for Web Developers & Kubernetes Fundamentals.",
        matchingJobsCount: 6,
      },
      {
        skill: "System Design & Caching",
        priority: "MEDIUM",
        reason: "Drives interview success for mid-to-senior levels and unlocks ₹20+ LPA packages.",
        learningResource: "Scalable System Architecture & Redis distributed caching patterns.",
        matchingJobsCount: 12,
      },
    ];

    return {
      intent: "CAREER_GUIDANCE",
      filters: {
        role: "Full Stack Developer",
        skills: ["React", "Node.js"],
        location: ["Remote"],
        verifiedOnly: true,
      },
      summary: `Career Guidance Blueprint for ${targetRole}`,
      careerGuidance: {
        currentRole: profile?.currentRole || "Frontend Developer",
        targetRole,
        readinessScorePct: 75,
        matchedSkills: currentSkills,
        skillGaps: gaps,
        recommendedNextSteps: [
          "Complete Docker containerization project and deploy to AWS.",
          "Review SQL index optimization and connection pooling in PostgreSQL.",
          "Target Full Stack openings offering ₹14–24 LPA with upfront verified pay.",
        ],
      },
    };
  }

  // 3. Check for Profile Match ("Jobs matching my profile", "What am I qualified for")
  if (
    lower.includes("my profile") ||
    lower.includes("qualified for") ||
    lower.includes("matching me") ||
    lower.includes("match my skills")
  ) {
    if (profile) {
      filters.skills = [...profile.skills];
      filters.experienceMin = profile.yearsOfExperience;
      filters.salaryMinLpa = profile.minSalaryLpa;
      filters.location = [...profile.preferredLocations];
      filters.workMode = profile.preferredWorkMode;
    } else {
      filters.skills = ["React", "TypeScript", "Node.js"];
      filters.experienceMin = 3;
      filters.salaryMinLpa = 10;
    }

    return {
      intent: "PROFILE_MATCH",
      filters,
      summary: "Found roles aligned with your verified experience and skill profile.",
    };
  }

  // 4. Intent: Conversational Job Search Extraction

  // Extract Work Mode
  if (lower.includes("remote") || lower.includes("work from home") || lower.includes("wfh")) {
    filters.workMode = "REMOTE";
  } else if (lower.includes("hybrid")) {
    filters.workMode = "HYBRID";
  } else if (lower.includes("onsite") || lower.includes("on-site") || lower.includes("in-office")) {
    filters.workMode = "ONSITE";
  }

  // Extract Role
  for (const r of KNOWN_ROLES) {
    if (lower.includes(r.toLowerCase())) {
      filters.role = r;
      break;
    }
  }

  if (!filters.role) {
    if (lower.includes("frontend")) filters.role = "Frontend Developer";
    else if (lower.includes("backend")) filters.role = "Backend Engineer";
    else if (lower.includes("full stack") || lower.includes("fullstack")) filters.role = "Full Stack Developer";
    else if (lower.includes("devops")) filters.role = "DevOps Engineer";
    else if (lower.includes("data analyst") || lower.includes("analyst")) filters.role = "Data Analyst";
    else if (lower.includes("designer") || lower.includes("ui/ux") || lower.includes("product design")) filters.role = "Product Designer";
    else if (lower.includes("qa") || lower.includes("test")) filters.role = "QA Engineer";
    else if (lower.includes("intern")) filters.role = "Software Engineering Intern";
  }

  // Extract Skills
  for (const s of KNOWN_SKILLS) {
    const sLower = s.toLowerCase();
    // Use word boundary check
    const regex = new RegExp(`\\b${sLower.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    if (regex.test(lower)) {
      if (!filters.skills.includes(s)) {
        filters.skills.push(s);
      }
    }
  }

  // Extract Location
  for (const city of KNOWN_CITIES) {
    if (lower.includes(city.toLowerCase())) {
      const canonicalCity = city.toLowerCase() === "bangalore" ? "Bengaluru" : city;
      if (!filters.location.includes(canonicalCity)) {
        filters.location = [canonicalCity]; // Replace or set primary location
      }
      break;
    }
  }

  if (filters.workMode === "REMOTE" && filters.location.length === 0) {
    filters.location = ["Remote"];
  }

  // Extract Experience (e.g. "3+ years", "3 years", "5 yrs", "fresher")
  const expMatch = lower.match(/(\d+)\+?\s*(years?|yrs?)/);
  if (expMatch) {
    filters.experienceMin = parseInt(expMatch[1], 10);
  } else if (lower.includes("fresher") || lower.includes("entry level")) {
    filters.experienceMin = 0;
    filters.experienceMax = 1;
  }

  // Extract Salary (e.g. "above 10 LPA", "above ₹10 LPA", "12 LPA", "10L+", ">15 LPA")
  const salaryMatch = lower.match(/(?:above|>|at least|minimum|min)?\s*(?:₹|rs\.?)?\s*(\d+)\s*(?:lpa|lakh|lakhs|l\+?)/);
  if (salaryMatch) {
    filters.salaryMinLpa = parseInt(salaryMatch[1], 10);
  }

  // Check verified only
  if (lower.includes("verified only") || lower.includes("verified employer")) {
    filters.verifiedOnly = true;
  }

  // Generate friendly interpretation summary
  const summaryParts: string[] = [];
  if (filters.role) summaryParts.push(filters.role);
  if (filters.skills.length > 0) summaryParts.push(`with ${filters.skills.join(", ")}`);
  if (filters.location.length > 0) summaryParts.push(`in ${filters.location.join(", ")}`);
  if (filters.workMode && filters.workMode !== "ANY") summaryParts.push(`(${filters.workMode.toLowerCase()})`);
  if (filters.experienceMin !== undefined) summaryParts.push(`${filters.experienceMin}+ yrs experience`);
  if (filters.salaryMinLpa !== undefined) summaryParts.push(`₹${filters.salaryMinLpa}L+ compensation`);

  const summary = summaryParts.length > 0
    ? `Searching verified roles for ${summaryParts.join(" · ")}`
    : `Searching all published opportunities on CareerBridge`;

  return {
    intent: "JOB_SEARCH",
    filters,
    summary,
  };
}
