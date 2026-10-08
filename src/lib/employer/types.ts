import { UserRole } from "@prisma/client";

export interface EmployerSessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  companyId: string;
  companyName: string;
  companySlug: string;
  companyVerified: boolean;
  companyLogo?: string | null;
  industry: string;
}

export interface PlanRecommendationInput {
  industry: string;
  companySize: string;
  hiringVolume: "1-5" | "6-20" | "21-50" | "51-100" | "100+";
  hiringFrequency: "one-time" | "occasional" | "monthly" | "continuous" | "high-volume";
  activeJobsNeeded: number;
  candidateSearchNeed: boolean;
  aiRequirement: boolean;
  recruiterCount: number;
}

export interface PlanRecommendationResult {
  recommendedCode: "STARTER" | "GROWTH" | "PROFESSIONAL" | "ENTERPRISE";
  recommendedName: string;
  reasons: string[];
  estimatedMonthlyCostInr: number;
  estimatedJobsLimit: number;
  estimatedCredits: number;
}

export interface CompanyRegistrationPayload {
  companyType: string;
  industry: string;
  legalName: string;
  displayName: string;
  website?: string;
  businessEmail: string;
  businessPhone: string;
  country: string;
  state: string;
  city: string;
  address?: string;
  size: string;
  yearFounded?: number;
  description: string;
  taxId?: string;
  recruiterName: string;
  recruiterDesignation: string;
  recruiterPhone?: string;
  linkedinUrl?: string;
  department?: string;
  hiringRoles: string[];
  expectedHires: string;
  hiringUrgency: string;
  workMode: "REMOTE" | "HYBRID" | "ONSITE" | "FLEXIBLE";
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  hiringVolume: "1-5" | "6-20" | "21-50" | "51-100" | "100+";
  hiringFrequency: "one-time" | "occasional" | "monthly" | "continuous" | "high-volume";
  selectedPlanCode: string;
  billingCycle: "MONTHLY" | "ANNUAL";
  password: string;
}
