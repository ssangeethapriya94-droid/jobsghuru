export interface CompletenessInput {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  headline?: string | null;
  summary?: string | null;
  location?: string | null;
  skills?: string[] | null;
  totalExperienceYears?: number | null;
  currentCompany?: string | null;
  currentRole?: string | null;
  resumeUrl?: string | null;
  education?: any;
  experience?: any;
}

/**
 * Computes profile completeness percentage (0 to 100).
 */
export function calculateProfileCompleteness(input: CompletenessInput): number {
  let score = 0;

  // Basic Info (25%)
  if (input.name && input.name.trim().length > 0) score += 10;
  if (input.email && input.email.includes("@")) score += 5;
  if (input.phone && input.phone.trim().length >= 8) score += 10;

  // Professional Summary & Headline (20%)
  if (input.headline && input.headline.trim().length >= 5) score += 10;
  if (input.summary && input.summary.trim().length >= 20) score += 10;

  // Location & Experience details (25%)
  if (input.location && input.location.trim().length > 0) score += 5;
  if (input.skills && input.skills.length > 0) score += 10;
  if (input.totalExperienceYears !== undefined && input.totalExperienceYears !== null) score += 5;
  if (input.currentRole || input.currentCompany) score += 5;

  // Resume Document (20%)
  if (input.resumeUrl && input.resumeUrl.trim().length > 0) score += 20;

  // Education / Structured data (10%)
  if (input.education) {
    if (Array.isArray(input.education) && input.education.length > 0) score += 10;
    else if (typeof input.education === "string" && input.education.trim().length > 0) score += 10;
    else if (typeof input.education === "object" && Object.keys(input.education).length > 0) score += 10;
  }

  return Math.min(100, Math.max(0, score));
}
