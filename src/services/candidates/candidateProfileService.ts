export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  currentRole: string;
  targetRole: string;
  yearsOfExperience: number;
  skills: string[];
  preferredLocations: string[];
  preferredWorkMode: "REMOTE" | "HYBRID" | "ONSITE" | "ANY";
  minSalaryLpa: number;
  education: string;
  savedJobIds: string[];
}

// Default active candidate profile (can be customized or linked to session user)
export const DEFAULT_CANDIDATE_PROFILE: CandidateProfile = {
  id: "cand_alex_01",
  name: "Alex Candidate",
  email: "alex.candidate@example.com",
  currentRole: "Frontend Developer",
  targetRole: "Full Stack Developer",
  yearsOfExperience: 3,
  skills: ["React", "TypeScript", "JavaScript", "CSS", "HTML", "Node.js"],
  preferredLocations: ["Chennai", "Bengaluru", "Remote"],
  preferredWorkMode: "REMOTE",
  minSalaryLpa: 10,
  education: "B.Tech Computer Science",
  savedJobIds: [],
};

export async function getCandidateProfile(userId?: string): Promise<CandidateProfile> {
  // In Phase 1, return the rich candidate profile baseline
  return DEFAULT_CANDIDATE_PROFILE;
}
