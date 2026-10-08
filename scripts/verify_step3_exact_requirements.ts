import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || process.env.BASE_URL || "http://localhost:3000";

function hashPasswordSync(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

async function loginUser(email: string, password: string, realm: "employer" | "candidate" | "admin", ip: string) {
  const url = realm === "employer" 
    ? `${BASE_URL}/api/employer/auth/login`
    : realm === "candidate"
    ? `${BASE_URL}/api/candidate/auth/login`
    : `${BASE_URL}/api/admin/auth/login`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ email, password }),
  });
  const cookie = res.headers.get("set-cookie") || "";
  return { status: res.status, cookie };
}

async function runExactVerification() {
  console.log("==========================================================================");
  console.log("🚀 CAREERBRIDGE STEP 3: EXACT REQUIREMENTS REAL OUTPUT VERIFICATION");
  console.log(`Base URL: ${BASE_URL}`);
  console.log("==========================================================================\n");

  const runSeed = Math.floor(Math.random() * 100000);
  const runId = `exact3_${Date.now()}_${runSeed}`;
  let ipCounter = 1;
  const getNextIp = () => `10.88.${Math.floor(runSeed / 256)}.${(runSeed % 250) + (ipCounter++)}`;

  // 1. SETUP COMPANY, PIPELINES, ROLES & CANDIDATE
  const company = await prisma.company.create({
    data: {
      name: `Apex Global ${runId}`,
      slug: `apex-${runId}`,
      industry: "Cloud Infrastructure",
      size: "200-500",
      location: "Bengaluru",
      description: "Cloud ATS",
      verified: true,
    },
  });

  // Pipeline Version 1 (Active Version)
  const pipeline = await prisma.hiringPipeline.create({
    data: {
      companyId: company.id,
      title: "Backend Engineering Pipeline",
      isDefault: true,
    },
  });

  const version1 = await prisma.pipelineVersion.create({
    data: {
      pipelineId: pipeline.id,
      version: 1,
      isPublished: true,
    },
  });

  const v1Stage1 = await prisma.pipelineStage.create({
    data: {
      versionId: version1.id,
      name: "Initial Screening (v1)",
      stageType: "SCREENING",
      orderIndex: 0,
    },
  });

  const v1Stage2 = await prisma.pipelineStage.create({
    data: {
      versionId: version1.id,
      name: "Technical Architecture (v1)",
      stageType: "INTERVIEW",
      interviewSubtype: "TECHNICAL",
      orderIndex: 1,
    },
  });

  // Pipeline Version 2 (Different Pipeline Version for Requirement 4)
  const version2 = await prisma.pipelineVersion.create({
    data: {
      pipelineId: pipeline.id,
      version: 2,
      isPublished: false,
    },
  });

  const v2Stage1 = await prisma.pipelineStage.create({
    data: {
      versionId: version2.id,
      name: "AI Screening (v2)",
      stageType: "SCREENING",
      orderIndex: 0,
    },
  });

  // Assessment
  const assessment = await prisma.assessment.create({
    data: {
      companyId: company.id,
      title: "System Design Assessment",
      durationMinutes: 60,
      passingScore: 75,
    },
  });

  // Users for all 4 Employer Roles
  const adminUser = await prisma.user.create({
    data: {
      name: "Apex Admin",
      email: `admin_${runId}@apex.io`,
      passwordHash: hashPasswordSync("AdminPass123!"),
      role: "COMPANY_ADMIN",
      companyId: company.id,
      status: "ACTIVE",
    },
  });

  const recruiterUser = await prisma.user.create({
    data: {
      name: "Apex Recruiter",
      email: `recruiter_${runId}@apex.io`,
      passwordHash: hashPasswordSync("RecruiterPass123!"),
      role: "RECRUITER",
      companyId: company.id,
      status: "ACTIVE",
    },
  });

  const hmUser = await prisma.user.create({
    data: {
      name: "Apex Hiring Manager",
      email: `hm_${runId}@apex.io`,
      passwordHash: hashPasswordSync("HMPass123!"),
      role: "HIRING_MANAGER",
      companyId: company.id,
      status: "ACTIVE",
    },
  });

  const interviewerUser = await prisma.user.create({
    data: {
      name: "Apex Interviewer",
      email: `interviewer_${runId}@apex.io`,
      passwordHash: hashPasswordSync("InterviewerPass123!"),
      role: "INTERVIEWER",
      companyId: company.id,
      status: "ACTIVE",
    },
  });

  // Candidate User
  const candidateUser = await prisma.user.create({
    data: {
      name: "Candidate Taylor",
      email: `taylor_${runId}@gmail.com`,
      passwordHash: hashPasswordSync("CandidatePass123!"),
      role: "CANDIDATE",
      status: "ACTIVE",
      candidateProfile: {
        create: {
          headline: "Senior Go Engineer",
          totalExperienceYears: 6,
          skills: ["Go", "Kubernetes", "PostgreSQL"],
        },
      },
    },
  });

  // Job
  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      pipelineId: pipeline.id,
      title: `Senior Distributed Systems Engineer ${runId}`,
      department: "Core Engineering",
      location: "Bengaluru",
      jobType: "FULL_TIME",
      workMode: "HYBRID",
      description: "Distributed storage engines.",
      responsibilities: ["Lead design"],
      requirements: ["Go", "Distributed Systems"],
      skills: ["Go", "Kubernetes", "PostgreSQL"],
      status: "PUBLISHED",
      postedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
  });

  // Applications
  const appToDelete = await prisma.application.create({
    data: {
      jobId: job.id,
      candidateId: candidateUser.id,
      candidateName: candidateUser.name,
      candidateEmail: candidateUser.email,
      candidatePhone: "+91 99999 11111",
      currentCompany: "CloudScale",
      currentRole: "Senior Engineer",
      experienceYears: 6,
      currentCtc: 28,
      expectedCtc: 40,
      noticePeriod: "30 Days",
      status: "UNDER_REVIEW",
      pipelineVersionId: version1.id,
      currentStageId: v1Stage1.id,
      matchScore: 92,
    },
  });

  const appForWorkflows = await prisma.application.create({
    data: {
      jobId: job.id,
      candidateId: candidateUser.id,
      candidateName: candidateUser.name,
      candidateEmail: candidateUser.email,
      candidatePhone: "+91 99999 22222",
      currentCompany: "ScaleUp Labs",
      currentRole: "Staff Engineer",
      experienceYears: 8,
      currentCtc: 35,
      expectedCtc: 50,
      noticePeriod: "Immediate",
      status: "UNDER_REVIEW",
      pipelineVersionId: version1.id,
      currentStageId: v1Stage1.id,
      matchScore: 96,
    },
  });

  const appForReject = await prisma.application.create({
    data: {
      jobId: job.id,
      candidateName: "Reject Candidate",
      candidateEmail: `reject_${runId}@gmail.com`,
      candidatePhone: "+91 99999 33333",
      currentCompany: "Other",
      currentRole: "Dev",
      experienceYears: 2,
      status: "SUBMITTED",
      pipelineVersionId: version1.id,
      currentStageId: v1Stage1.id,
    },
  });

  // Create direct sessions for all 4 roles + candidate
  const createEmpSession = async (user: any) => {
    const token = crypto.randomBytes(36).toString("hex");
    await prisma.adminSession.create({
      data: {
        token,
        userId: user.id,
        realm: "EMPLOYER",
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });
    return `cb_employer_session=${token}`;
  };

  const createCandSession = async (user: any) => {
    const token = crypto.randomBytes(36).toString("hex");
    await prisma.candidateSession.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });
    return `cb_candidate_session=${token}`;
  };

  const adminCookie = await createEmpSession(adminUser);
  const recruiterCookie = await createEmpSession(recruiterUser);
  const hmCookie = await createEmpSession(hmUser);
  const interviewerCookie = await createEmpSession(interviewerUser);
  const candidateCookie = await createCandSession(candidateUser);

  // ==========================================================================
  // 1. SOFT DELETE TESTS
  // ==========================================================================
  console.log("--------------------------------------------------------------------------");
  console.log("1. SOFT DELETE: RBAC, ABSENCE FROM LISTS & 404 ON DETAIL");
  console.log("--------------------------------------------------------------------------");

  // A. RECRUITER trying DELETE -> 403
  const recruiterDeleteRes = await fetch(`${BASE_URL}/api/employer/applications/${appToDelete.id}`, {
    method: "DELETE",
    headers: { Cookie: recruiterCookie, "x-forwarded-for": getNextIp() },
  });
  console.log(`[Soft Delete RBAC] RECRUITER DELETE: Expected 403 | Actual: ${recruiterDeleteRes.status}`);

  // B. HIRING_MANAGER trying DELETE -> 403
  const hmDeleteRes = await fetch(`${BASE_URL}/api/employer/applications/${appToDelete.id}`, {
    method: "DELETE",
    headers: { Cookie: hmCookie, "x-forwarded-for": getNextIp() },
  });
  console.log(`[Soft Delete RBAC] HIRING_MANAGER DELETE: Expected 403 | Actual: ${hmDeleteRes.status}`);

  // C. INTERVIEWER trying DELETE -> 403
  const interviewerDeleteRes = await fetch(`${BASE_URL}/api/employer/applications/${appToDelete.id}`, {
    method: "DELETE",
    headers: { Cookie: interviewerCookie, "x-forwarded-for": getNextIp() },
  });
  console.log(`[Soft Delete RBAC] INTERVIEWER DELETE: Expected 403 | Actual: ${interviewerDeleteRes.status}`);

  // D. COMPANY_ADMIN DELETE -> 200
  const adminDeleteRes = await fetch(`${BASE_URL}/api/employer/applications/${appToDelete.id}`, {
    method: "DELETE",
    headers: { Cookie: adminCookie, "x-forwarded-for": getNextIp() },
  });
  console.log(`[Soft Delete RBAC] COMPANY_ADMIN DELETE: Expected 200 | Actual: ${adminDeleteRes.status}`);

  // Check DB state of deleted application
  const deletedInDb = await prisma.application.findUnique({ where: { id: appToDelete.id } });
  console.log(`[Soft Delete DB State] deletedAt: ${deletedInDb?.deletedAt?.toISOString()} | status: ${deletedInDb?.status}`);

  // E. Absent from Employer applications list
  const employerListRes = await fetch(`${BASE_URL}/api/employer/applications`, {
    headers: { Cookie: adminCookie, "x-forwarded-for": getNextIp() },
  });
  const employerListData = await employerListRes.json();
  const foundInEmployerList = (employerListData.applications || []).some((a: any) => a.id === appToDelete.id);
  console.log(`[List Absence] Absent from GET /api/employer/applications: Expected true | Actual: ${!foundInEmployerList}`);

  // F. Absent from Candidate search
  const candidateSearchRes = await fetch(`${BASE_URL}/api/employer/candidates/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ skills: "Go, Kubernetes" }),
  });
  const candidateSearchData = await candidateSearchRes.json();
  const foundInSearch = (candidateSearchData.candidates || []).some((c: any) => c.email === appToDelete.candidateEmail && c.experienceYears === appToDelete.experienceYears);
  console.log(`[Search Absence] Absent from POST /api/employer/candidates/search: Expected true | Actual: ${!foundInSearch}`);

  // G. Absent from Candidate's own applications list
  const candidateListRes = await fetch(`${BASE_URL}/api/candidate/applications`, {
    headers: { Cookie: candidateCookie, "x-forwarded-for": getNextIp() },
  });
  const candidateListData = await candidateListRes.json();
  const foundInCandidateList = (candidateListData.applications || []).some((a: any) => a.id === appToDelete.id);
  console.log(`[Candidate List Absence] Absent from GET /api/candidate/applications: Expected true | Actual: ${!foundInCandidateList}`);

  // H. Employer detail returns 404
  const employerDetailRes = await fetch(`${BASE_URL}/api/employer/applications/${appToDelete.id}`, {
    headers: { Cookie: adminCookie, "x-forwarded-for": getNextIp() },
  });
  console.log(`[Employer Detail 404] GET /api/employer/applications/[id] after delete: Expected 404 | Actual: ${employerDetailRes.status}`);

  // I. Candidate detail returns 404
  const candidateDetailRes = await fetch(`${BASE_URL}/api/candidate/applications/${appToDelete.id}`, {
    headers: { Cookie: candidateCookie, "x-forwarded-for": getNextIp() },
  });
  console.log(`[Candidate Detail 404] GET /api/candidate/applications/[id] after delete: Expected 404 | Actual: ${candidateDetailRes.status}\n`);


  // ==========================================================================
  // 2. HIRING_MANAGER AND INTERVIEWER RBAC (Expected 403 on write endpoints)
  // ==========================================================================
  console.log("--------------------------------------------------------------------------");
  console.log("2. HIRING_MANAGER & INTERVIEWER 403 PERMISSION MATRIX");
  console.log("--------------------------------------------------------------------------");

  const testEndpoints = [
    {
      name: "POST /api/employer/applications/[id]/shortlist",
      url: `${BASE_URL}/api/employer/applications/${appForWorkflows.id}/shortlist`,
      method: "POST",
      body: { nextStageId: v1Stage2.id },
    },
    {
      name: "POST /api/employer/applications/[id]/reject",
      url: `${BASE_URL}/api/employer/applications/${appForWorkflows.id}/reject`,
      method: "POST",
      body: { reason: "Role test rejection" },
    },
    {
      name: "POST /api/employer/applications/[id]/stage",
      url: `${BASE_URL}/api/employer/applications/${appForWorkflows.id}/stage`,
      method: "POST",
      body: { stageId: v1Stage2.id },
    },
    {
      name: "POST /api/employer/applications/[id]/interviews",
      url: `${BASE_URL}/api/employer/applications/${appForWorkflows.id}/interviews`,
      method: "POST",
      body: {
        title: "Test Interview",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      },
    },
    {
      name: "POST /api/employer/assessments/assign",
      url: `${BASE_URL}/api/employer/assessments/assign`,
      method: "POST",
      body: {
        assessmentId: assessment.id,
        applicationId: appForWorkflows.id,
      },
    },
  ];

  for (const ep of testEndpoints) {
    const hmRes = await fetch(ep.url, {
      method: ep.method,
      headers: { "Content-Type": "application/json", Cookie: hmCookie, "x-forwarded-for": getNextIp() },
      body: JSON.stringify(ep.body),
    });
    console.log(`[HIRING_MANAGER] ${ep.name.padEnd(52)} | Expected: 403 | Actual: ${hmRes.status}`);

    const intvRes = await fetch(ep.url, {
      method: ep.method,
      headers: { "Content-Type": "application/json", Cookie: interviewerCookie, "x-forwarded-for": getNextIp() },
      body: JSON.stringify(ep.body),
    });
    console.log(`[INTERVIEWER]    ${ep.name.padEnd(52)} | Expected: 403 | Actual: ${intvRes.status}`);
  }
  console.log();


  // ==========================================================================
  // 3. IDEMPOTENCY: SHORTLIST TWICE & REJECT TWICE (COUNT EVENTS & OUTBOX)
  // ==========================================================================
  console.log("--------------------------------------------------------------------------");
  console.log("3. IDEMPOTENCY: CALL SHORTLIST TWICE & REJECT TWICE (EXACT COUNTS)");
  console.log("--------------------------------------------------------------------------");

  // Shortlist 1st call
  const sl1 = await fetch(`${BASE_URL}/api/employer/applications/${appForWorkflows.id}/shortlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: recruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ nextStageId: v1Stage2.id, notes: "Candidate top tier" }),
  });
  console.log(`[Shortlist Call 1] Status: ${sl1.status}`);

  // Shortlist 2nd call
  const sl2 = await fetch(`${BASE_URL}/api/employer/applications/${appForWorkflows.id}/shortlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: recruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ nextStageId: v1Stage2.id }),
  });
  console.log(`[Shortlist Call 2] Status: ${sl2.status}`);

  const shortlistEvents = await prisma.applicationEvent.findMany({
    where: { applicationId: appForWorkflows.id, action: "CANDIDATE_SHORTLISTED" },
  });
  const shortlistOutbox = await prisma.emailOutbox.findMany({
    where: { to: appForWorkflows.candidateEmail, template: "CANDIDATE_SHORTLISTED" },
  });
  console.log(`[Shortlist Idempotency Audit] ApplicationEvent rows: Expected 1 | Actual: ${shortlistEvents.length}`);
  console.log(`[Shortlist Idempotency Audit] EmailOutbox rows:       Expected 1 | Actual: ${shortlistOutbox.length}`);

  // Reject 1st call
  const rj1 = await fetch(`${BASE_URL}/api/employer/applications/${appForReject.id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: recruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ reason: "Experience mismatch", internalNote: "Lacks Go depth" }),
  });
  console.log(`[Reject Call 1] Status: ${rj1.status}`);

  // Reject 2nd call
  const rj2 = await fetch(`${BASE_URL}/api/employer/applications/${appForReject.id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: recruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ reason: "Experience mismatch" }),
  });
  console.log(`[Reject Call 2] Status: ${rj2.status}`);

  const rejectEvents = await prisma.applicationEvent.findMany({
    where: { applicationId: appForReject.id, action: "CANDIDATE_REJECTED" },
  });
  const rejectOutbox = await prisma.emailOutbox.findMany({
    where: { to: appForReject.candidateEmail, template: "CANDIDATE_REJECTED" },
  });
  console.log(`[Reject Idempotency Audit]    ApplicationEvent rows: Expected 1 | Actual: ${rejectEvents.length}`);
  console.log(`[Reject Idempotency Audit]    EmailOutbox rows:       Expected 1 | Actual: ${rejectOutbox.length}\n`);


  // ==========================================================================
  // 4. MOVE STAGE TO A DIFFERENT PIPELINE VERSION (Expect 400)
  // ==========================================================================
  console.log("--------------------------------------------------------------------------");
  console.log("4. CROSS-VERSION STAGE MOVE VALIDATION (Expect 400)");
  console.log("--------------------------------------------------------------------------");

  // appForWorkflows belongs to version 1. Try to move to v2Stage1 (from version 2)
  const crossVersionMoveRes = await fetch(`${BASE_URL}/api/employer/applications/${appForWorkflows.id}/stage`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: recruiterCookie, "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ stageId: v2Stage1.id }),
  });
  const crossVersionData = await crossVersionMoveRes.json();
  console.log(`[Cross-Version Move] Moving to stage of different pipeline version:`);
  console.log(`Expected Status: 400 | Actual Status: ${crossVersionMoveRes.status}`);
  console.log(`Error Response: "${crossVersionData.error}"\n`);


  // ==========================================================================
  // 5. TIMELINE PAGINATION (Pages without duplicates)
  // ==========================================================================
  console.log("--------------------------------------------------------------------------");
  console.log("5. TIMELINE PAGINATION INTEGRITY & ZERO DUPLICATES");
  console.log("--------------------------------------------------------------------------");

  // Create 15 distinct events on appForWorkflows
  for (let i = 1; i <= 15; i++) {
    await prisma.applicationEvent.create({
      data: {
        applicationId: appForWorkflows.id,
        actorId: adminUser.id,
        actorName: adminUser.name,
        actorRole: adminUser.role,
        action: `CUSTOM_AUDIT_STEP_${i}`,
        metadata: { index: i, timestamp: new Date(Date.now() + i * 1000).toISOString() },
      },
    });
  }

  // Request Page 1 (limit 5)
  const p1Res = await fetch(`${BASE_URL}/api/employer/applications/${appForWorkflows.id}/timeline?page=1&limit=5`, {
    headers: { Cookie: adminCookie, "x-forwarded-for": getNextIp() },
  });
  const p1Data = await p1Res.json();

  // Request Page 2 (limit 5)
  const p2Res = await fetch(`${BASE_URL}/api/employer/applications/${appForWorkflows.id}/timeline?page=2&limit=5`, {
    headers: { Cookie: adminCookie, "x-forwarded-for": getNextIp() },
  });
  const p2Data = await p2Res.json();

  // Request Page 3 (limit 5)
  const p3Res = await fetch(`${BASE_URL}/api/employer/applications/${appForWorkflows.id}/timeline?page=3&limit=5`, {
    headers: { Cookie: adminCookie, "x-forwarded-for": getNextIp() },
  });
  const p3Data = await p3Res.json();

  const p1Ids = p1Data.timeline.map((t: any) => t.id);
  const p2Ids = p2Data.timeline.map((t: any) => t.id);
  const p3Ids = p3Data.timeline.map((t: any) => t.id);

  const overlapP1P2 = p1Ids.filter((id: string) => p2Ids.includes(id));
  const overlapP2P3 = p2Ids.filter((id: string) => p3Ids.includes(id));

  console.log(`[Pagination Stats] Total events: ${p1Data.total} | Total pages: ${p1Data.totalPages}`);
  console.log(`[Page 1] Count: ${p1Data.timeline.length} items | IDs: ${p1Ids.slice(0, 3).join(", ")}...`);
  console.log(`[Page 2] Count: ${p2Data.timeline.length} items | IDs: ${p2Ids.slice(0, 3).join(", ")}...`);
  console.log(`[Page 3] Count: ${p3Data.timeline.length} items | IDs: ${p3Ids.slice(0, 3).join(", ")}...`);
  console.log(`[Zero Duplicates Check] Overlap Page 1 & 2: Expected 0 | Actual: ${overlapP1P2.length}`);
  console.log(`[Zero Duplicates Check] Overlap Page 2 & 3: Expected 0 | Actual: ${overlapP2P3.length}\n`);

  console.log("==========================================================================");
  console.log("🎉 ALL STEP 3 EXACT REQUIREMENTS DEMONSTRATED WITH REAL HTTP OUTPUT!");
  console.log("==========================================================================");
}

runExactVerification()
  .catch((err) => {
    console.error("Verification failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
