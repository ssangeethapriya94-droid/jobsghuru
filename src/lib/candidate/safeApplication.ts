/**
 * Candidate-safe status mapping and allowlist serializer.
 * Enforces strict information boundaries so candidates never receive
 * recruiter notes, internal feedbacks, interviewer ratings, or internal pipeline details.
 */

export type CandidateFacingStatus =
  | "Applied"
  | "In Review"
  | "Shortlisted"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Not Selected"
  | "Withdrawn";

export function mapInternalStatusToCandidateStatus(
  internalStatus: string,
  stageType?: string | null
): CandidateFacingStatus {
  const status = (internalStatus || "").toUpperCase();
  const stage = (stageType || "").toUpperCase();

  if (status === "REJECTED") return "Not Selected";
  if (status === "WITHDRAWN") return "Withdrawn";
  if (status === "HIRED") return "Hired";
  if (status === "OFFER_EXTENDED" || stage === "OFFER") return "Offer";
  if (status === "INTERVIEW_SCHEDULED" || stage === "INTERVIEW" || stage === "PHONE_SCREEN" || stage === "ASSESSMENT") {
    return "Interview";
  }
  if (status === "SHORTLISTED") return "Shortlisted";
  if (status === "UNDER_REVIEW" || stage === "SCREENING") return "In Review";

  return "Applied";
}

export interface CandidateSafeInterview {
  id: string;
  title: string;
  interviewType: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  mode: string;
  meetingLink?: string | null;
  location?: string | null;
  secureToken?: string | null;
  secureLink?: string | null;
  candidateAttendance?: string | null;
}

export interface CandidateSafeApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companySlug?: string | null;
  companyLogo?: string | null;
  location: string;
  workMode: string;
  appliedAt: string;
  status: CandidateFacingStatus;
  statusNotes?: string | null; // Only shared if intended for candidate
  resumeFileName?: string | null;
  resumeUrl?: string | null;
  currentCompany?: string | null;
  currentRole?: string | null;
  experienceYears?: number;
  noticePeriod?: string | null;
  interviews: CandidateSafeInterview[];
}

export function serializeCandidateSafeApplication(app: any): CandidateSafeApplication {
  const status = mapInternalStatusToCandidateStatus(
    app.status,
    app.currentStage?.stageType || app.currentStage?.name
  );

  const candidateInterviews: CandidateSafeInterview[] = (app.interviews || []).map((inv: any) => ({
    id: inv.id,
    title: inv.title,
    interviewType: inv.interviewType,
    status: inv.status,
    scheduledAt: inv.scheduledAt ? new Date(inv.scheduledAt).toISOString() : "",
    durationMinutes: inv.durationMinutes || 45,
    mode: inv.mode || "VIDEO",
    meetingLink: inv.meetingLink || null,
    location: inv.location || null,
    secureToken: inv.secureToken || null,
    secureLink: inv.secureToken ? `/candidate/interviews/${inv.secureToken}` : null,
    candidateAttendance: inv.candidateAttendance || null,
  }));

  // Rejection note is only exposed if it's explicitly user-facing (not internal admin soft-delete tag)
  const isInternalArchiveNote =
    app.statusNotes?.toLowerCase().includes("archived") ||
    app.statusNotes?.toLowerCase().includes("admin");
  const publicRejectionNote =
    app.status === "REJECTED" && !isInternalArchiveNote ? app.statusNotes : null;

  return {
    id: app.id,
    jobId: app.jobId,
    jobTitle: app.job?.title || "Role",
    companyName: app.job?.company?.name || "Company",
    companySlug: app.job?.company?.slug || null,
    companyLogo: app.job?.company?.logo || null,
    location: app.job?.location || "Remote",
    workMode: app.job?.workMode || "REMOTE",
    appliedAt: app.appliedAt ? new Date(app.appliedAt).toISOString() : new Date().toISOString(),
    status,
    statusNotes: publicRejectionNote,
    resumeFileName: app.resumeFileName || null,
    resumeUrl: app.resumeUrl || null,
    currentCompany: app.currentCompany || null,
    currentRole: app.currentRole || null,
    experienceYears: app.experienceYears || 0,
    noticePeriod: app.noticePeriod || null,
    interviews: candidateInterviews,
  };
}
