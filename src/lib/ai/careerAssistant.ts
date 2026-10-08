import {
  CareerAssistantResponse,
  CareerAssistantResponseSchema,
  JobSearchFilters,
} from "./schemas";
import { parseNaturalLanguageQuery } from "./intentParser";
import { searchJobsInDatabase } from "@/services/jobs/jobSearchService";
import { evaluateJobMatches } from "@/services/jobs/jobMatchingService";
import { getCandidateProfile } from "@/services/candidates/candidateProfileService";
import { logAIUsage } from "./usage";

export interface ProcessQueryOptions {
  query: string;
  previousFilters?: JobSearchFilters;
  userId?: string;
  clientIp?: string;
}

export async function processCareerCopilotQuery(
  options: ProcessQueryOptions
): Promise<CareerAssistantResponse> {
  const { query, previousFilters, userId, clientIp } = options;

  // 1. Fetch Candidate Profile (for personalized matching)
  const candidateProfile = await getCandidateProfile(userId);

  // 2. Parse Natural Language Query into Structured Intent & Filters
  const parsed = parseNaturalLanguageQuery(query, previousFilters, candidateProfile);

  // 3. Handle Clarification if ambiguous
  if (parsed.intent === "CLARIFICATION_NEEDED" && parsed.clarification?.needed) {
    const response: CareerAssistantResponse = {
      success: true,
      intent: "CLARIFICATION_NEEDED",
      userQuery: query,
      summary: parsed.summary,
      understoodFilters: parsed.filters,
      clarification: parsed.clarification,
      jobs: [],
      totalFound: 0,
    };

    logAIUsage({
      timestamp: new Date(),
      userId,
      ip: clientIp,
      query,
      intent: parsed.intent,
      resultsCount: 0,
    });

    return CareerAssistantResponseSchema.parse(response);
  }

  // 4. Query Real Database (Neon PostgreSQL via Prisma)
  // Strictly status = "PUBLISHED"
  const { jobs: rawJobs, totalCount } = await searchJobsInDatabase(parsed.filters, 12);

  // 5. Run Explainable Match Engine
  const matchedJobs = evaluateJobMatches(rawJobs as any, candidateProfile, parsed.filters);

  // 6. Assemble Verified Response
  const responsePayload: CareerAssistantResponse = {
    success: true,
    intent: parsed.intent,
    userQuery: query,
    summary: parsed.summary,
    understoodFilters: parsed.filters,
    clarification: parsed.clarification,
    careerGuidance: parsed.careerGuidance,
    jobs: matchedJobs,
    totalFound: totalCount,
  };

  // 7. Validate through Zod before returning to ensure schema integrity
  const validated = CareerAssistantResponseSchema.parse(responsePayload);

  // 8. Log AI Usage & telemetry
  logAIUsage({
    timestamp: new Date(),
    userId,
    ip: clientIp,
    query,
    intent: parsed.intent,
    resultsCount: totalCount,
  });

  return validated;
}
