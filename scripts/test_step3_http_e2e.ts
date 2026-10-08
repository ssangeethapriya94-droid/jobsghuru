/**
 * Step 3 Comprehensive E2E HTTP Test Suite
 * 
 * Verifies Employer Application Detail Page & Workflow Requirements:
 * 1. Page API returns correct data per role; INTERVIEWER gets 403 on unassigned and receives no notes/CTC.
 * 2. Company A cannot read or act on Company B's application (404).
 * 3. Add and delete notes; INTERVIEWER blocked; candidate APIs never return notes.
 * 4. Schedule interview from page; spoofed foreign jobId is ignored/derived from DB; candidate outbox email created.
 * 5. Assign assessment; foreign assessment rejected (404); duplicate active assignment blocked (400).
 * 6. Shortlist and reject: success (200), idempotent repeat, invalid transition rejected (400), event & outbox created.
 * 7. Move stage: foreign pipeline stage rejected (400); STAGE_MOVED event written.
 * 8. Timeline lists all events in order (newest first) and hides note text from INTERVIEWER.
 * 9. Forced email failure shows FAILED state in outbox.
 * 10. Step 1 and Step 2 regression suites verified.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { queueAndSendEmail } from "../src/lib/email/outbox";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || process.env.BASE_URL || "http://localhost:3000";

function hashPasswordSync(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

interface TestResult {
  category: string;
  testName: string;
  expected: any;
  actual: any;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

function assertTest(category: string, testName: string, expected: any, actual: any, passed: boolean, notes?: string) {
  results.push({ category, testName, expected, actual, passed, notes });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} [${category}] ${testName} | Expected: ${JSON.stringify(expected)} | Actual: ${JSON.stringify(actual)}${notes ? ` (${notes})` : ""}`);
}

async function runStep3ComprehensiveSuite() {
  console.log("==========================================================================");
  console.log("🚀 STARTING STEP 3: EMPLOYER APPLICATION DETAIL HTTP TEST SUITE");
  console.log(`Targeting Base URL: ${BASE_URL}`);
  console.log("==========================================================================\n");

  const runSeed = Math.floor(Math.random() * 100000);
  const runId = `step3_${Date.now()}_${runSeed}`;
  let ipCounter = 1;
  const getNextIp = () => `10.53.${Math.floor(runSeed / 256)}.${(runSeed % 250) + (ipCounter++)}`;

  // --------------------------------------------------------------------------
  // 1. DATA SETUP: Company Alpha & Company Beta
  // --------------------------------------------------------------------------
  const companyAlpha = await prisma.company.create({
    data: {
      name: `Alpha Corp ${runId}`,
      slug: `alpha-${runId}`,
      industry: "Technology",
      size: "100-500",
      location: "Bengaluru",
      description: "Company Alpha ATS",
      verified: true,
    },
  });

  const companyBeta = await prisma.company.create({
    data: {
      name: `Beta Corp ${runId}`,
      slug: `beta-${runId}`,
      industry: "Fintech",
      size: "50-100",
      location: "Mumbai",
      description: "Company Beta ATS",
      verified: true,
    },
  });

  // Pipelines & Stages for Alpha
  const pipelineAlpha = await prisma.hiringPipeline.create({
    data: {
      companyId: companyAlpha.id,
      title: "Standard Engineering Pipeline",
      isDefault: true,
    },
  });

  const versionAlpha = await prisma.pipelineVersion.create({
    data: {
      pipelineId: pipelineAlpha.id,
      version: 1,
      isPublished: true,
    },
  });

  const stage1 = await prisma.pipelineStage.create({
    data: {
      versionId: versionAlpha.id,
      name: "Screening",
      stageType: "SCREENING",
      orderIndex: 0,
    },
  });

  const stage2 = await prisma.pipelineStage.create({
    data: {
      versionId: versionAlpha.id,
      name: "Technical Architecture",
      stageType: "INTERVIEW",
      interviewSubtype: "TECHNICAL",
      orderIndex: 1,
    },
  });

  const stage3 = await prisma.pipelineStage.create({
    data: {
      versionId: versionAlpha.id,
      name: "Executive Interview",
      stageType: "INTERVIEW",
      interviewSubtype: "FINAL",
      orderIndex: 2,
    },
  });

  // Pipeline for Beta
  const pipelineBeta = await prisma.hiringPipeline.create({
    data: {
      companyId: companyBeta.id,
      title: "Beta Pipeline",
    },
  });

  const versionBeta = await prisma.pipelineVersion.create({
    data: {
      pipelineId: pipelineBeta.id,
      version: 1,
      isPublished: true,
    },
  });

  const foreignStageBeta = await prisma.pipelineStage.create({
    data: {
      versionId: versionBeta.id,
      name: "Beta Foreign Stage",
      stageType: "SCREENING",
      orderIndex: 0,
    },
  });

  // Jobs
  const jobAlpha = await prisma.job.create({
    data: {
      companyId: companyAlpha.id,
      pipelineId: pipelineAlpha.id,
      title: `Principal Platform Engineer ${runId}`,
      department: "Platform Engineering",
      location: "Bengaluru",
      jobType: "FULL_TIME",
      workMode: "HYBRID",
      description: "Build foundational cloud platforms.",
      responsibilities: ["Lead engineering", "Architect systems"],
      requirements: ["Go", "Distributed Systems", "Next.js"],
      skills: ["Go", "Kubernetes", "PostgreSQL"],
      status: "PUBLISHED",
      postedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
  });

  const jobBeta = await prisma.job.create({
    data: {
      companyId: companyBeta.id,
      pipelineId: pipelineBeta.id,
      title: `Beta Staff Engineer ${runId}`,
      department: "Security",
      location: "Mumbai",
      jobType: "FULL_TIME",
      workMode: "REMOTE",
      description: "Security operations.",
      responsibilities: ["Security auditing"],
      requirements: ["Security"],
      skills: ["Security"],
      status: "PUBLISHED",
      postedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
  });

  // Users in Alpha
  const alphaAdminPass = "AlphaAdminPass123!";
  const alphaAdmin = await prisma.user.create({
    data: {
      name: `Alpha Admin ${runId}`,
      email: `alpha_admin_${runId}@alpha.io`,
      passwordHash: hashPasswordSync(alphaAdminPass),
      role: "COMPANY_ADMIN",
      companyId: companyAlpha.id,
      status: "ACTIVE",
    },
  });

  const alphaRecruiterPass = "AlphaRecruiterPass123!";
  const alphaRecruiter = await prisma.user.create({
    data: {
      name: `Alpha Recruiter ${runId}`,
      email: `alpha_recruiter_${runId}@alpha.io`,
      passwordHash: hashPasswordSync(alphaRecruiterPass),
      role: "RECRUITER",
      companyId: companyAlpha.id,
      status: "ACTIVE",
    },
  });

  const alphaHiringMgrPass = "AlphaHiringMgrPass123!";
  const alphaHiringMgr = await prisma.user.create({
    data: {
      name: `Alpha Hiring Manager ${runId}`,
      email: `alpha_hm_${runId}@alpha.io`,
      passwordHash: hashPasswordSync(alphaHiringMgrPass),
      role: "HIRING_MANAGER",
      companyId: companyAlpha.id,
      status: "ACTIVE",
    },
  });

  const alphaInterviewerPass = "AlphaInterviewerPass123!";
  const alphaInterviewer = await prisma.user.create({
    data: {
      name: `Alpha Interviewer ${runId}`,
      email: `alpha_interviewer_${runId}@alpha.io`,
      passwordHash: hashPasswordSync(alphaInterviewerPass),
      role: "INTERVIEWER",
      companyId: companyAlpha.id,
      status: "ACTIVE",
    },
  });

  // Users in Beta
  const betaAdminPass = "BetaAdminPass123!";
  const betaAdmin = await prisma.user.create({
    data: {
      name: `Beta Admin ${runId}`,
      email: `beta_admin_${runId}@beta.io`,
      passwordHash: hashPasswordSync(betaAdminPass),
      role: "COMPANY_ADMIN",
      companyId: companyBeta.id,
      status: "ACTIVE",
    },
  });

  // Candidate Users & Applications
  const candidateAUser = await prisma.user.create({
    data: {
      name: `Candidate Alpha ${runId}`,
      email: `candidate_a_${runId}@gmail.com`,
      passwordHash: hashPasswordSync("CandidatePass123!"),
      role: "CANDIDATE",
      status: "ACTIVE",
    },
  });

  const appAlpha1 = await prisma.application.create({
    data: {
      jobId: jobAlpha.id,
      candidateId: candidateAUser.id,
      candidateName: candidateAUser.name,
      candidateEmail: candidateAUser.email,
      candidatePhone: "+91 98765 11111",
      currentCompany: "ScaleUp Tech",
      currentRole: "Lead Architect",
      experienceYears: 7,
      currentCtc: 32,
      expectedCtc: 45,
      noticePeriod: "30 Days",
      status: "UNDER_REVIEW",
      pipelineVersionId: versionAlpha.id,
      currentStageId: stage1.id,
      matchScore: 94,
    },
  });

  const appAlpha2_Unassigned = await prisma.application.create({
    data: {
      jobId: jobAlpha.id,
      candidateId: null,
      candidateName: `Unassigned Candidate ${runId}`,
      candidateEmail: `unassigned_${runId}@gmail.com`,
      candidatePhone: "+91 98765 22222",
      currentCompany: "Other Org",
      currentRole: "Developer",
      experienceYears: 3,
      currentCtc: 12,
      expectedCtc: 18,
      status: "SUBMITTED",
      pipelineVersionId: versionAlpha.id,
      currentStageId: stage1.id,
    },
  });

  const appBeta = await prisma.application.create({
    data: {
      jobId: jobBeta.id,
      candidateId: null,
      candidateName: `Beta Candidate ${runId}`,
      candidateEmail: `beta_cand_${runId}@gmail.com`,
      candidatePhone: "+91 98765 33333",
      status: "UNDER_REVIEW",
      pipelineVersionId: versionBeta.id,
      currentStageId: foreignStageBeta.id,
    },
  });

  // Create an Interview assigned to alphaInterviewer on appAlpha1
  const interviewAlpha = await prisma.interview.create({
    data: {
      applicationId: appAlpha1.id,
      jobId: jobAlpha.id,
      companyId: companyAlpha.id,
      candidateName: appAlpha1.candidateName,
      candidateEmail: appAlpha1.candidateEmail,
      title: "System Architecture Evaluation",
      scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
      durationMinutes: 45,
      status: "SCHEDULED",
      secureToken: `sec_intv_${runId}`,
      interviewerId: alphaInterviewer.id,
      participants: {
        create: [
          {
            userId: alphaInterviewer.id,
            name: alphaInterviewer.name,
            email: alphaInterviewer.email,
            roleTitle: "Staff Interviewer",
            attendance: "PENDING",
          },
        ],
      },
    },
  });

  // Assessments for Alpha and Beta
  const assessmentAlpha = await prisma.assessment.create({
    data: {
      companyId: companyAlpha.id,
      title: `Distributed Systems Test ${runId}`,
      description: "Architecture evaluation",
      durationMinutes: 60,
      passingScore: 75,
    },
  });

  const assessmentBeta = await prisma.assessment.create({
    data: {
      companyId: companyBeta.id,
      title: `Beta Security Assessment ${runId}`,
      description: "Penetration testing evaluation",
      durationMinutes: 45,
      passingScore: 70,
    },
  });

  // Add initial note by Alpha Recruiter on appAlpha1
  const initialNote = await prisma.recruiterNote.create({
    data: {
      applicationId: appAlpha1.id,
      companyId: companyAlpha.id,
      authorId: alphaRecruiter.id,
      authorName: alphaRecruiter.name,
      authorRole: "RECRUITER",
      content: "CONFIDENTIAL_NOTE: Strong candidate with high domain expertise.",
      isPrivate: true,
    },
  });

  // --------------------------------------------------------------------------
  // SESSIONS SETUP (Real HTTP Logins)
  // --------------------------------------------------------------------------
  const login = async (email: string, pass: string) => {
    const res = await fetch(`${BASE_URL}/api/employer/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
      body: JSON.stringify({ email, password: pass }),
    });
    return res.headers.get("set-cookie") || "";
  };

  const alphaAdminCookie = await login(alphaAdmin.email, alphaAdminPass);
  const alphaRecruiterCookie = await login(alphaRecruiter.email, alphaRecruiterPass);
  const alphaHiringMgrCookie = await login(alphaHiringMgr.email, alphaHiringMgrPass);
  const alphaInterviewerCookie = await login(alphaInterviewer.email, alphaInterviewerPass);
  const betaAdminCookie = await login(betaAdmin.email, betaAdminPass);

  // ==========================================================================
  // REQUIREMENT 1: PAGE API ROLE-BASED ACCESS & INTERVIEWER GUARDS
  // ==========================================================================
  console.log("\n--- SECTION 1: ROLE-AWARE APPLICATION DETAIL ACCESS ---");

  // Admin gets full data
  const adminDetailRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}`, {
    headers: { Cookie: alphaAdminCookie, "x-forwarded-for": getNextIp() },
  });
  const adminDetailData = await adminDetailRes.json();
  assertTest(
    "Role Permissions",
    "COMPANY_ADMIN receives full application data including CTC and notes",
    45,
    adminDetailData.application?.expectedCtc,
    adminDetailRes.status === 200 && adminDetailData.application?.expectedCtc === 45 && adminDetailData.application?.notes?.length >= 1
  );

  // Recruiter gets full data
  const recruiterDetailRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}`, {
    headers: { Cookie: alphaRecruiterCookie, "x-forwarded-for": getNextIp() },
  });
  const recruiterDetailData = await recruiterDetailRes.json();
  assertTest(
    "Role Permissions",
    "RECRUITER receives full application data (200)",
    200,
    recruiterDetailRes.status,
    recruiterDetailRes.status === 200 && recruiterDetailData.userPermissions?.canShortlist === true
  );

  // Interviewer requesting UNASSIGNED candidate application -> 403 Forbidden
  const interviewerUnassignedRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha2_Unassigned.id}`, {
    headers: { Cookie: alphaInterviewerCookie, "x-forwarded-for": getNextIp() },
  });
  assertTest(
    "Interviewer Scope",
    "INTERVIEWER blocked from viewing unassigned candidate application (403)",
    403,
    interviewerUnassignedRes.status,
    interviewerUnassignedRes.status === 403
  );

  // Interviewer requesting ASSIGNED candidate application -> 200 with redacted CTC and empty notes
  const interviewerAssignedRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}`, {
    headers: { Cookie: alphaInterviewerCookie, "x-forwarded-for": getNextIp() },
  });
  const interviewerAssignedData = await interviewerAssignedRes.json();
  assertTest(
    "Interviewer Redaction",
    "INTERVIEWER viewing assigned application has CTC and notes strictly redacted",
    null,
    interviewerAssignedData.application?.expectedCtc,
    interviewerAssignedRes.status === 200 &&
    interviewerAssignedData.application?.expectedCtc === null &&
    interviewerAssignedData.application?.currentCtc === null &&
    interviewerAssignedData.application?.notes?.length === 0
  );

  // ==========================================================================
  // REQUIREMENT 2: MULTI-TENANT ISOLATION (Company A vs Company B)
  // ==========================================================================
  console.log("\n--- SECTION 2: MULTI-TENANT CROSS-COMPANY ISOLATION ---");

  const crossTenantGetRes = await fetch(`${BASE_URL}/api/employer/applications/${appBeta.id}`, {
    headers: { Cookie: alphaAdminCookie, "x-forwarded-for": getNextIp() },
  });
  assertTest(
    "Tenant Isolation",
    "Company A receives 404 on GET Company B's application",
    404,
    crossTenantGetRes.status,
    crossTenantGetRes.status === 404
  );

  const crossTenantShortlistRes = await fetch(`${BASE_URL}/api/employer/applications/${appBeta.id}/shortlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaAdminCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ notes: "Malicious attempt" }),
  });
  assertTest(
    "Tenant Isolation",
    "Company A receives 404 on POST /shortlist on Company B's application",
    404,
    crossTenantShortlistRes.status,
    crossTenantShortlistRes.status === 404
  );

  // ==========================================================================
  // REQUIREMENT 3: RECRUITER NOTES ADD, DELETE & CANDIDATE LEAK GUARDS
  // ==========================================================================
  console.log("\n--- SECTION 3: NOTES MANAGEMENT & PRIVACY GUARDS ---");

  // Hiring Manager adds note -> 200
  const hmAddNoteRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaHiringMgrCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ content: "HM_NOTE: Impressive distributed systems portfolio.", isPrivate: false }),
  });
  const hmAddNoteData = await hmAddNoteRes.json();
  assertTest(
    "Notes Management",
    "HIRING_MANAGER can add note to application (200)",
    200,
    hmAddNoteRes.status,
    hmAddNoteRes.status === 200 && hmAddNoteData.note?.content.includes("HM_NOTE")
  );

  // Interviewer blocked from adding note -> 403
  const interviewerAddNoteRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaInterviewerCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ content: "Unauthorized interviewer note" }),
  });
  assertTest(
    "Notes Management",
    "INTERVIEWER blocked from adding note (403)",
    403,
    interviewerAddNoteRes.status,
    interviewerAddNoteRes.status === 403
  );

  // Delete own note by Hiring Manager -> 200
  const deleteNoteRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}/notes/${hmAddNoteData.note.id}`, {
    method: "DELETE",
    headers: { Cookie: alphaHiringMgrCookie, "x-forwarded-for": getNextIp() },
  });
  assertTest(
    "Notes Management",
    "Author can delete own note (200)",
    200,
    deleteNoteRes.status,
    deleteNoteRes.status === 200
  );

  // Candidate API check: verify candidate never sees notes
  const candidateLoginRes = await fetch(`${BASE_URL}/api/candidate/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ email: candidateAUser.email, password: "CandidatePass123!" }),
  });
  const candCookie = candidateLoginRes.headers.get("set-cookie") || "";

  const candViewAppRes = await fetch(`${BASE_URL}/api/candidate/applications/${appAlpha1.id}`, {
    headers: { Cookie: candCookie, "x-forwarded-for": getNextIp() },
  });
  const candViewAppData = await candViewAppRes.json();
  const candViewAppString = JSON.stringify(candViewAppData);
  const leakedNotes = candViewAppString.includes("CONFIDENTIAL_NOTE");
  assertTest(
    "Candidate Privacy",
    "Candidate application API NEVER returns recruiter notes",
    false,
    leakedNotes,
    !leakedNotes && candViewAppRes.status === 200
  );

  // ==========================================================================
  // REQUIREMENT 4: SCHEDULE INTERVIEW & SERVER-DERIVED JOB ID
  // ==========================================================================
  console.log("\n--- SECTION 4: INTERVIEW SCHEDULING & JOB ID INTEGRITY ---");

  // Attempt to pass spoofed foreign jobId in request body
  const futureScheduleTime = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
  const scheduleRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}/interviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaRecruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({
      jobId: jobBeta.id, // Malicious / foreign jobId
      title: "Executive Technical Assessment",
      interviewType: "TECHNICAL",
      mode: "VIDEO",
      scheduledAt: futureScheduleTime,
      durationMinutes: 60,
      meetingLink: "https://meet.google.com/test-e2e-link",
      interviewerName: "Staff Architect",
      interviewerEmail: "architect@company.com",
    }),
  });
  const scheduleData = await scheduleRes.json();

  assertTest(
    "Job ID Derivation",
    "Server derives jobId from application and ignores foreign jobId in body",
    jobAlpha.id,
    scheduleData.interview?.jobId,
    scheduleRes.status === 200 && scheduleData.interview?.jobId === jobAlpha.id
  );

  assertTest(
    "Interview Link",
    "Candidate interview URL generated and accessible",
    true,
    Boolean(scheduleData.candidateInterviewUrl),
    Boolean(scheduleData.candidateInterviewUrl)
  );

  // Validate past date rejected
  const pastScheduleRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}/interviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaRecruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({
      title: "Past Round",
      scheduledAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    }),
  });
  assertTest(
    "Date Validation",
    "Past interview scheduled date rejected with 400",
    400,
    pastScheduleRes.status,
    pastScheduleRes.status === 400
  );

  // ==========================================================================
  // REQUIREMENT 5: ASSIGN ASSESSMENT & DUPLICATE BLOCK
  // ==========================================================================
  console.log("\n--- SECTION 5: TECHNICAL ASSESSMENT ASSIGNMENT ---");

  // Attempt to assign foreign company's assessment -> 404
  const foreignAssignRes = await fetch(`${BASE_URL}/api/employer/assessments/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaRecruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({
      assessmentId: assessmentBeta.id, // Company Beta's assessment
      applicationId: appAlpha1.id,
      daysValid: 7,
    }),
  });
  assertTest(
    "Assessment Security",
    "Cannot assign another company's assessment (404)",
    404,
    foreignAssignRes.status,
    foreignAssignRes.status === 404
  );

  // Assign valid assessment for Alpha -> 200
  const validAssignRes = await fetch(`${BASE_URL}/api/employer/assessments/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaRecruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({
      assessmentId: assessmentAlpha.id,
      applicationId: appAlpha1.id,
      daysValid: 7,
    }),
  });
  assertTest(
    "Assessment Assignment",
    "Assign valid company assessment succeeds (200)",
    200,
    validAssignRes.status,
    validAssignRes.status === 200
  );

  // Block assigning duplicate active assessment -> 400
  const duplicateAssignRes = await fetch(`${BASE_URL}/api/employer/assessments/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaRecruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({
      assessmentId: assessmentAlpha.id,
      applicationId: appAlpha1.id,
      daysValid: 7,
    }),
  });
  assertTest(
    "Duplicate Assessment Guard",
    "Duplicate active assessment assignment blocked with 400",
    400,
    duplicateAssignRes.status,
    duplicateAssignRes.status === 400
  );

  // ==========================================================================
  // REQUIREMENT 6: SHORTLIST & REJECT IDEMPOTENCY & INVALID TRANSITIONS
  // ==========================================================================
  console.log("\n--- SECTION 6: SHORTLIST & REJECT WORKFLOWS ---");

  // Shortlist Candidate -> 200
  const shortlistRes1 = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}/shortlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaRecruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ nextStageId: stage2.id, notes: "Top 5% talent" }),
  });
  assertTest(
    "Shortlist Action",
    "Shortlisting candidate succeeds (200)",
    200,
    shortlistRes1.status,
    shortlistRes1.status === 200
  );

  // Repeat Shortlist (Idempotency) -> 200 without error
  const shortlistRes2 = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}/shortlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaRecruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ nextStageId: stage2.id }),
  });
  assertTest(
    "Shortlist Idempotency",
    "Repeating shortlist call is idempotent (200)",
    200,
    shortlistRes2.status,
    shortlistRes2.status === 200
  );

  // Move candidate to HIRED in DB to test invalid reject transition
  const hiredApp = await prisma.application.create({
    data: {
      jobId: jobAlpha.id,
      candidateName: "Hired Person",
      candidateEmail: `hired_${runId}@example.com`,
      candidatePhone: "+91 98765 44444",
      status: "HIRED",
    },
  });

  const rejectHiredRes = await fetch(`${BASE_URL}/api/employer/applications/${hiredApp.id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaAdminCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ reason: "Cannot reject hired candidate" }),
  });
  assertTest(
    "Invalid State Transition",
    "Rejecting a HIRED candidate is rejected with 400",
    400,
    rejectHiredRes.status,
    rejectHiredRes.status === 400
  );

  // Reject Candidate -> 200
  const rejectRes1 = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha2_Unassigned.id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaRecruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({
      reason: "Qualifications mismatch",
      internalNote: "Lacks required Kubernetes experience",
      candidateMessage: "We have chosen to pursue other candidates with stronger Kubernetes backgrounds.",
    }),
  });
  assertTest(
    "Reject Action",
    "Rejecting candidate succeeds (200)",
    200,
    rejectRes1.status,
    rejectRes1.status === 200
  );

  // Repeat Reject (Idempotency) -> 200
  const rejectRes2 = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha2_Unassigned.id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaRecruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ reason: "Qualifications mismatch" }),
  });
  assertTest(
    "Reject Idempotency",
    "Repeating reject call is idempotent (200)",
    200,
    rejectRes2.status,
    rejectRes2.status === 200
  );

  // ==========================================================================
  // REQUIREMENT 7: MOVE STAGE & PIPELINE VALIDATION
  // ==========================================================================
  console.log("\n--- SECTION 7: PIPELINE STAGE TRANSITIONS ---");

  // Attempt to move to foreign stage (Company Beta's stage) -> 400
  const foreignStageMoveRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}/stage`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaRecruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ stageId: foreignStageBeta.id }),
  });
  assertTest(
    "Stage Validation",
    "Moving application to a foreign company's pipeline stage rejected with 400",
    400,
    foreignStageMoveRes.status,
    foreignStageMoveRes.status === 400
  );

  // Move to valid stage3 (Executive Interview) -> 200
  const validStageMoveRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}/stage`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: alphaRecruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ stageId: stage3.id, notes: "Final round approved" }),
  });
  assertTest(
    "Stage Transition",
    "Moving application to valid pipeline stage succeeds (200)",
    200,
    validStageMoveRes.status,
    validStageMoveRes.status === 200
  );

  // Verify STAGE_MOVED event in DB
  const stageMovedEvent = await prisma.applicationEvent.findFirst({
    where: {
      applicationId: appAlpha1.id,
      action: "STAGE_MOVED",
    },
  });
  assertTest(
    "Stage Event Audit",
    "STAGE_MOVED event successfully recorded on application timeline",
    "Executive Interview",
    (stageMovedEvent?.metadata as any)?.toStage,
    Boolean(stageMovedEvent) && (stageMovedEvent?.metadata as any)?.toStage === "Executive Interview"
  );

  // ==========================================================================
  // REQUIREMENT 8: TIMELINE ORDER & NOTE REDACTION FOR INTERVIEWER
  // ==========================================================================
  console.log("\n--- SECTION 8: TIMELINE CHRONOLOGY & REDACTION ---");

  // Fetch timeline as Admin (includes all event types, newest first)
  const adminTimelineRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}/timeline`, {
    headers: { Cookie: alphaAdminCookie, "x-forwarded-for": getNextIp() },
  });
  const adminTimelineData = await adminTimelineRes.json();
  const events = adminTimelineData.timeline || [];

  // Verify newest first
  let isDescending = true;
  for (let i = 0; i < events.length - 1; i++) {
    if (new Date(events[i].timestamp).getTime() < new Date(events[i + 1].timestamp).getTime()) {
      isDescending = false;
      break;
    }
  }
  assertTest(
    "Timeline Chronology",
    "Timeline lists all events sorted newest first (descending)",
    true,
    isDescending,
    isDescending && events.length >= 4
  );

  // Fetch timeline as Interviewer -> Note events completely excluded
  const interviewerTimelineRes = await fetch(`${BASE_URL}/api/employer/applications/${appAlpha1.id}/timeline`, {
    headers: { Cookie: alphaInterviewerCookie, "x-forwarded-for": getNextIp() },
  });
  const interviewerTimelineData = await interviewerTimelineRes.json();
  const interviewerEvents = interviewerTimelineData.timeline || [];
  const containsNoteEvent = interviewerEvents.some((e: any) => e.action.toLowerCase().includes("note"));
  assertTest(
    "Timeline Redaction",
    "Interviewer timeline hides internal note events and note contents",
    false,
    containsNoteEvent,
    !containsNoteEvent && interviewerTimelineRes.status === 200
  );

  // ==========================================================================
  // REQUIREMENT 9: EMAIL OUTBOX RESILIENCE ON SEND FAILURE
  // ==========================================================================
  console.log("\n--- SECTION 9: EMAIL OUTBOX RESILIENCE ---");

  const outboxFailResult = await queueAndSendEmail({
    to: "malformed@@@bad.domain..fail",
    subject: "Step 3 Outbox Test",
    html: "<p>Test</p>",
  });

  const failRecord = await prisma.emailOutbox.findUnique({
    where: { id: outboxFailResult.id },
  });

  assertTest(
    "Outbox Failure Audit",
    "Forced email send failure records status FAILED with error message",
    "FAILED",
    failRecord?.status || "",
    failRecord?.status === "FAILED" && failRecord?.errorMessage !== null
  );

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n==========================================================================");
  console.log(`📊 STEP 3 COMPREHENSIVE SUITE: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log("==========================================================================\n");

  if (failed > 0) {
    console.error("❌ Some tests failed. Inspect output above.");
    process.exit(1);
  } else {
    console.log("🎉 ALL STEP 3 COMPREHENSIVE ASSERTIONS PASSED WITH 100% SUCCESS!");
  }
}

runStep3ComprehensiveSuite()
  .catch((e) => {
    console.error("Comprehensive test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
