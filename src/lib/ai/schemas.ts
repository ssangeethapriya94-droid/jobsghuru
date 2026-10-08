import { z } from "zod";

export const IntentTypeSchema = z.enum([
  "JOB_SEARCH",
  "CAREER_GUIDANCE",
  "SKILL_GAP",
  "SALARY_INSIGHT",
  "PROFILE_MATCH",
  "CLARIFICATION_NEEDED",
]);
export type IntentType = z.infer<typeof IntentTypeSchema>;

export const WorkModeSchema = z.enum(["REMOTE", "HYBRID", "ONSITE", "ANY"]);
export type WorkMode = z.infer<typeof WorkModeSchema>;

export const JobTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "ANY",
]);
export type JobType = z.infer<typeof JobTypeSchema>;

export const JobSearchFiltersSchema = z.object({
  role: z.string().optional(),
  skills: z.array(z.string()).default([]),
  location: z.array(z.string()).default([]),
  workMode: WorkModeSchema.optional(),
  jobType: JobTypeSchema.optional(),
  experienceMin: z.number().min(0).max(30).optional(),
  experienceMax: z.number().min(0).max(30).optional(),
  salaryMinLpa: z.number().min(0).optional(),
  verifiedOnly: z.boolean().default(false),
});
export type JobSearchFilters = z.infer<typeof JobSearchFiltersSchema>;

export const ClarificationSchema = z.object({
  needed: z.boolean().default(false),
  question: z.string().optional(),
  options: z.array(z.string()).default([]),
});
export type Clarification = z.infer<typeof ClarificationSchema>;

export const SkillGapDetailSchema = z.object({
  skill: z.string(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  reason: z.string(),
  learningResource: z.string(),
  matchingJobsCount: z.number().default(0),
});
export type SkillGapDetail = z.infer<typeof SkillGapDetailSchema>;

export const CareerGuidanceSchema = z.object({
  currentRole: z.string().optional(),
  targetRole: z.string().optional(),
  readinessScorePct: z.number().min(0).max(100).default(70),
  matchedSkills: z.array(z.string()).default([]),
  skillGaps: z.array(SkillGapDetailSchema).default([]),
  recommendedNextSteps: z.array(z.string()).default([]),
});
export type CareerGuidance = z.infer<typeof CareerGuidanceSchema>;

export const AIExplanationRowSchema = z.object({
  label: z.string(),
  status: z.enum(["MATCH", "GAP", "NEUTRAL"]),
  detail: z.string(),
});

export const AIMatchedJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  department: z.string(),
  company: z.object({
    name: z.string(),
    verified: z.boolean(),
    industry: z.string().optional(),
  }),
  location: z.string(),
  workMode: z.string(),
  jobType: z.string(),
  minExp: z.number(),
  maxExp: z.number(),
  salaryMinLpa: z.number().nullable(),
  salaryMaxLpa: z.number().nullable(),
  skills: z.array(z.string()),
  postedAt: z.string(),
  responseRatePct: z.number(),
  matchScore: z.number().min(0).max(100),
  reasons: z.array(AIExplanationRowSchema),
  skillGaps: z.array(z.string()),
});
export type AIMatchedJob = z.infer<typeof AIMatchedJobSchema>;

export const CareerAssistantResponseSchema = z.object({
  success: z.boolean(),
  intent: IntentTypeSchema,
  userQuery: z.string(),
  summary: z.string(),
  understoodFilters: JobSearchFiltersSchema,
  clarification: ClarificationSchema.optional(),
  careerGuidance: CareerGuidanceSchema.optional(),
  jobs: z.array(AIMatchedJobSchema).default([]),
  totalFound: z.number().default(0),
});
export type CareerAssistantResponse = z.infer<typeof CareerAssistantResponseSchema>;
