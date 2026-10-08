import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, label: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✅ ${label}${detail ? ` | ${detail}` : ""}`);
  } else {
    failedCount++;
    console.error(`  ❌ FAIL: ${label}${detail ? ` | ${detail}` : ""}`);
  }
}

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw.trim()).digest("hex");
}

async function loginEmployer(email: string, password: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/employer/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return null;
  const match = setCookie.match(/(?:^|,\s*)(cb_employer_session=[^;]+)/);
  return match ? match[1] : null;
}

async function loginCandidate(email: string, password: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/candidate/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return null;
  const match = setCookie.match(/(?:^|,\s*)(\w[^=]+=[^;]+)/);
  return match ? match[1] : null;
}

async function main() {
  console.log("================================================================================");
  console.log("             STEP 5 ASSESSMENTS & SCREENING HTTP E2E VERIFICATION SUITE         ");
  console.log("================================================================================");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Setup Companies A & B
  let companyA = await prisma.company.findFirst({ where: { name: "TechCorp Alpha Assessments" } });
  if (!companyA) {
    companyA = await prisma.company.create({
      data: {
        name: "TechCorp Alpha Assessments",
        slug: "techcorp-alpha-assessments",
        website: "https://alpha.example.com",
        industry: "Technology",
        size: "50-200",
        location: "Bengaluru",
        description: "Leading enterprise cloud provider",
        verified: true,
        autoRejectOnFail: false,
      },
    });
  }

  let companyB = await prisma.company.findFirst({ where: { name: "Beta Solutions Assessments" } });
  if (!companyB) {
    companyB = await prisma.company.create({
      data: {
        name: "Beta Solutions Assessments",
        slug: "beta-solutions-assessments",
        website: "https://beta.example.com",
        industry: "Consulting",
        size: "20-50",
        location: "Mumbai",
        description: "Digital consulting",
        verified: true,
        autoRejectOnFail: false,
      },
    });
  }

  // Reset any login rate limits
  await prisma.rateLimitBucket.deleteMany({
    where: { key: { contains: "login:" } },
  });

  // Company A Users
  const adminA = await prisma.user.upsert({
    where: { email: "admin.alpha_assess@example.com" },
    update: { company: { connect: { id: companyA.id } }, role: UserRole.COMPANY_ADMIN, passwordHash, status: "ACTIVE" },
    create: {
      email: "admin.alpha_assess@example.com",
      name: "Admin Alpha",
      passwordHash,
      role: UserRole.COMPANY_ADMIN,
      status: "ACTIVE",
      company: { connect: { id: companyA.id } },
    },
  });

  const recruiterA = await prisma.user.upsert({
    where: { email: "recruiter.alpha_assess@example.com" },
    update: { company: { connect: { id: companyA.id } }, role: UserRole.RECRUITER, passwordHash, status: "ACTIVE" },
    create: {
      email: "recruiter.alpha_assess@example.com",
      name: "Recruiter Alpha",
      passwordHash,
      role: UserRole.RECRUITER,
      status: "ACTIVE",
      company: { connect: { id: companyA.id } },
    },
  });

  const hmA = await prisma.user.upsert({
    where: { email: "hm.alpha_assess@example.com" },
    update: { company: { connect: { id: companyA.id } }, role: UserRole.HIRING_MANAGER, passwordHash, status: "ACTIVE" },
    create: {
      email: "hm.alpha_assess@example.com",
      name: "HM Alpha",
      passwordHash,
      role: UserRole.HIRING_MANAGER,
      status: "ACTIVE",
      company: { connect: { id: companyA.id } },
    },
  });

  const interviewerA = await prisma.user.upsert({
    where: { email: "interviewer.alpha_assess@example.com" },
    update: { company: { connect: { id: companyA.id } }, role: UserRole.INTERVIEWER, passwordHash, status: "ACTIVE" },
    create: {
      email: "interviewer.alpha_assess@example.com",
      name: "Interviewer Alpha",
      passwordHash,
      role: UserRole.INTERVIEWER,
      status: "ACTIVE",
      company: { connect: { id: companyA.id } },
    },
  });

  // Company B Users
  const adminB = await prisma.user.upsert({
    where: { email: "admin.beta_assess@example.com" },
    update: { company: { connect: { id: companyB.id } }, role: UserRole.COMPANY_ADMIN, passwordHash, status: "ACTIVE" },
    create: {
      email: "admin.beta_assess@example.com",
      name: "Admin Beta",
      passwordHash,
      role: UserRole.COMPANY_ADMIN,
      status: "ACTIVE",
      company: { connect: { id: companyB.id } },
    },
  });

  // Candidate User
  const candidateUser = await prisma.user.upsert({
    where: { email: "candidate.assess5@example.com" },
    update: { role: UserRole.CANDIDATE, passwordHash, status: "ACTIVE" },
    create: { email: "candidate.assess5@example.com", name: "Aakash Candidate", passwordHash, role: UserRole.CANDIDATE, status: "ACTIVE" },
  });

  await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.id },
    update: {
      resumeFileName: "Aakash_Resume.pdf",
      resumeUrl: "/api/candidate/profile/resume",
    },
    create: {
      userId: candidateUser.id,
      headline: "Senior Fullstack Developer",
      resumeFileName: "Aakash_Resume.pdf",
      resumeUrl: "/api/candidate/profile/resume",
    },
  });

  let jobA = await prisma.job.findFirst({ where: { companyId: companyA.id } });
  if (!jobA) {
    jobA = await prisma.job.create({
      data: {
        companyId: companyA.id,
        title: "Full-Stack Software Engineer",
        description: "Core platform development",
        department: "Engineering",
        location: "Bengaluru",
        workMode: "HYBRID",
        jobType: "FULL_TIME",
        status: "PUBLISHED",
        responsibilities: ["Develop fullstack apps"],
        requirements: ["React, Node"],
        skills: ["React", "TypeScript", "Node.js"],
        preferredSkills: [],
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });
  }

  // Application
  const appA = await prisma.application.upsert({
    where: { id: "cmuwgmphb000bno1fmubi5h2a" },
    update: {
      candidateId: candidateUser.id,
      candidateEmail: candidateUser.email,
      candidateName: candidateUser.name,
      jobId: jobA.id,
      status: "UNDER_REVIEW",
      resumeFileName: "Aakash_Resume.pdf",
      resumeUrl: "/api/employer/applications/cmuwgmphb000bno1fmubi5h2a/resume",
    },
    create: {
      id: "cmuwgmphb000bno1fmubi5h2a",
      jobId: jobA.id,
      candidateId: candidateUser.id,
      candidateName: "Aakash Candidate",
      candidateEmail: "candidate.assess5@example.com",
      candidatePhone: "+91 9876543210",
      status: "UNDER_REVIEW",
      resumeFileName: "Aakash_Resume.pdf",
      resumeUrl: "/api/employer/applications/cmuwgmphb000bno1fmubi5h2a/resume",
    },
  });

  // Login cookies
  const cookieAdminA = await loginEmployer("admin.alpha_assess@example.com", "Password123!");
  const cookieRecruiterA = await loginEmployer("recruiter.alpha_assess@example.com", "Password123!");
  const cookieHmA = await loginEmployer("hm.alpha_assess@example.com", "Password123!");
  const cookieInterviewerA = await loginEmployer("interviewer.alpha_assess@example.com", "Password123!");
  const cookieAdminB = await loginEmployer("admin.beta_assess@example.com", "Password123!");
  const cookieCand = await loginCandidate("candidate.assess5@example.com", "Password123!");

  console.log("Setup complete. Cookies acquired.");

  // ============================================================================
  // CHECK 1: RESUME STORAGE, PERMISSIONS & MISSING FILE 404
  // ============================================================================
  console.log("\n--- [CHECK 1] Resume Storage Proof & Missing File Handling ---");
  const storageDir = path.join(process.cwd(), "storage", "resumes");
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
  fs.writeFileSync(path.join(storageDir, "Aakash_Resume.pdf"), "PDF-PROTECTED-CONTENT-STEP5");

  const r1 = await fetch(`${BASE_URL}/storage/resumes/Aakash_Resume.pdf`);
  assert(r1.status === 404, "Direct unauthenticated /storage/resumes/... is blocked (404)", `Status: ${r1.status}`);

  const r2 = await fetch(`${BASE_URL}/resumes/Aakash_Resume.pdf`);
  assert(r2.status === 404, "Direct unauthenticated /resumes/... is blocked (404)", `Status: ${r2.status}`);

  const r3 = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}/resume`, {
    headers: { Cookie: cookieAdminB || "" },
  });
  assert(r3.status === 404, "Company B accessing Company A resume route returns 404", `Status: ${r3.status}`);

  const r4 = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}/resume`, {
    headers: { Cookie: cookieAdminA || "" },
  });
  assert(r4.status === 200, "Company A accessing own resume route returns 200", `Status: ${r4.status}`);

  const r5 = await fetch(`${BASE_URL}/api/candidate/profile/resume`, {
    headers: { Cookie: cookieCand || "" },
  });
  assert(r5.status === 200, "Candidate accessing own profile resume returns 200", `Status: ${r5.status}`);

  // Test missing resume file on disk -> must return 404 with { error: "Resume file not available" }
  const missingFileApp = await prisma.application.create({
    data: {
      jobId: jobA.id,
      candidateName: "Missing Resume Candidate",
      candidateEmail: "missing_resume@example.com",
      candidatePhone: "+91 9999999998",
      resumeFileName: "nonexistent_file.pdf",
      resumeUrl: "/uploads/resumes/nonexistent_file.pdf",
    },
  });
  const missingRes = await fetch(`${BASE_URL}/api/employer/applications/${missingFileApp.id}/resume`, {
    headers: { Cookie: cookieAdminA || "" },
  });
  const missingJson = await missingRes.json();
  assert(
    missingRes.status === 404 && missingJson.error === "Resume file not available",
    "Missing resume file returns 404 with '{ error: \"Resume file not available\" }'",
    `Status: ${missingRes.status}, Error: "${missingJson.error}"`
  );
  await prisma.application.delete({ where: { id: missingFileApp.id } });

  // ============================================================================
  // CHECK 2: QUESTION BUILDER API, 6 QUESTION TYPES, MARKS & NEGATIVE MARKS
  // ============================================================================
  console.log("\n--- [CHECK 2] Question Builder API, 6 Question Types & Explanations ---");
  const createAssessRes = await fetch(`${BASE_URL}/api/employer/assessments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieAdminA || "" },
    body: JSON.stringify({
      title: "Core Fullstack Screening Assessment",
      description: "Standard screening test for frontend and backend roles",
      skills: "React, TypeScript, Node.js, SQL",
      durationMinutes: 20,
      passingScore: 60,
      maxAttempts: 1,
      status: "DRAFT",
      questions: [
        {
          question: "Which of the following is a React Hook?",
          questionType: "SINGLE_CHOICE",
          options: ["useReducer", "renderDOM", "createClass", "componentWillMount"],
          correctAnswer: "useReducer",
          points: 10,
          negativePoints: 2.5,
          orderIndex: 0,
          explanation: "useReducer is a standard built-in React Hook.",
        },
        {
          question: "Which data structures provide O(1) average lookup?",
          questionType: "MULTIPLE_CHOICE",
          options: ["Hash Map", "Hash Set", "Linked List", "Binary Search Tree"],
          correctAnswer: "Hash Map, Hash Set",
          points: 20,
          negativePoints: 5,
          orderIndex: 1,
          explanation: "Hash Map and Hash Set use hashing for O(1) lookup.",
        },
        {
          question: "JavaScript is single-threaded.",
          questionType: "TRUE_FALSE",
          options: ["True", "False"],
          correctAnswer: "True",
          points: 10,
          negativePoints: 2,
          orderIndex: 2,
          explanation: "JS has a single main execution thread with an event loop.",
        },
        {
          question: "What is the Big-O time complexity of Binary Search on a sorted array?",
          questionType: "SHORT_TEXT",
          correctAnswer: "O(log n)",
          points: 10,
          negativePoints: 0,
          orderIndex: 3,
          explanation: "Binary search halves the search space each step.",
        },
        {
          question: "Explain the difference between optimistic and pessimistic concurrency control.",
          questionType: "LONG_TEXT",
          correctAnswer: "Optimistic assumes low collision and validates on commit; pessimistic locks records.",
          points: 25,
          negativePoints: 0,
          orderIndex: 4,
          explanation: "Manual review required by recruiter.",
        },
        {
          question: "Write a function `sumEven(nums: number[]): number`.",
          questionType: "CODE",
          correctAnswer: "nums.filter(n => n % 2 === 0).reduce((a, b) => a + b, 0)",
          points: 25,
          negativePoints: 0,
          orderIndex: 5,
          explanation: "Manual evaluation for code correctness and edge cases.",
        },
      ],
    }),
  });

  const assessData = await createAssessRes.json();
  const assessId = assessData.assessment?.id;
  assert(createAssessRes.status === 201 && !!assessId, "Create Assessment with 6 Question Types (201)", `ID: ${assessId}`);

  // Reorder questions test
  const reorderRes = await fetch(`${BASE_URL}/api/employer/assessments/${assessId}/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookieAdminA || "" },
    body: JSON.stringify({
      questionOrders: assessData.assessment?.questions?.map((q: any, i: number) => ({
        id: q.id,
        orderIndex: assessData.assessment.questions.length - 1 - i,
      })),
    }),
  });
  assert(reorderRes.status === 200, "Reorder Questions in Assessment (200)", `Status: ${reorderRes.status}`);

  // Duplicate assessment test
  const dupRes = await fetch(`${BASE_URL}/api/employer/assessments/${assessId}/duplicate`, {
    method: "POST",
    headers: { Cookie: cookieAdminA || "" },
  });
  const dupData = await dupRes.json();
  assert(dupRes.status === 201 && dupData.assessment?.title?.includes("Copy"), "Duplicate Assessment (201)", `Title: "${dupData.assessment?.title}"`);

  // Publish assessment
  const pubRes = await fetch(`${BASE_URL}/api/employer/assessments/${assessId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookieAdminA || "" },
    body: JSON.stringify({ status: "PUBLISHED" }),
  });
  assert(pubRes.status === 200, "Publish Assessment (200)", `Status: ${pubRes.status}`);

  // ============================================================================
  // CHECK 3: REGEX REJECTION FOR SHORT_TEXT QUESTIONS
  // ============================================================================
  console.log("\n--- [CHECK 3] SHORT_TEXT Regex Rejection (Exact/Keyword Only) ---");
  const regexAttemptRes = await fetch(`${BASE_URL}/api/employer/assessments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieAdminA || "" },
    body: JSON.stringify({
      title: "Invalid Regex Assessment",
      durationMinutes: 15,
      questions: [
        {
          question: "Enter status code",
          questionType: "SHORT_TEXT",
          correctAnswer: "/^[2-5][0-9]{2}$/",
          points: 10,
        },
      ],
    }),
  });
  const regexErrData = await regexAttemptRes.json();
  assert(
    regexAttemptRes.status === 400 && regexErrData.error?.toLowerCase().includes("regex"),
    "Reject recruiter-supplied regex on SHORT_TEXT (400)",
    `Message: "${regexErrData.error}"`
  );

  // ============================================================================
  // CHECK 4: CSV IMPORT LIMITS & VALIDATION REPORT
  // ============================================================================
  console.log("\n--- [CHECK 4] CSV Import Limits & Error Reporting ---");
  const csvValid = `question,questionType,options,correctAnswer,points,negativePoints,explanation\n"What is CSS Grid?","SINGLE_CHOICE","Layout|Database|Server","Layout",10,0,"CSS Layout system"\n"Is HTML a programming language?","TRUE_FALSE","True|False","False",10,0,"Markup language"`;
  const csvRes = await fetch(`${BASE_URL}/api/employer/assessments/${assessId}/import-csv`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieAdminA || "" },
    body: JSON.stringify({ csvContent: csvValid }),
  });
  const csvData = await csvRes.json();
  const importedCount = csvData.report?.importedCount ?? csvData.importedCount;
  assert(csvRes.status === 200 && importedCount === 2, "Valid CSV Import with validation report (200)", `Imported: ${importedCount}`);

  // Test CSV exceeding row limit (>200 rows)
  let hugeCsv = `question,questionType,options,correctAnswer,points,negativePoints,explanation\n`;
  for (let i = 1; i <= 205; i++) {
    hugeCsv += `"Question ${i}","SINGLE_CHOICE","A|B|C","A",10,0,""\n`;
  }
  const hugeCsvRes = await fetch(`${BASE_URL}/api/employer/assessments/${assessId}/import-csv`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieAdminA || "" },
    body: JSON.stringify({ csvContent: hugeCsv }),
  });
  assert(hugeCsvRes.status === 400, "Reject CSV exceeding 200 rows limit (400)", `Status: ${hugeCsvRes.status}`);

  // ============================================================================
  // CHECK 5: RBAC PERMISSIONS & TENANT ISOLATION
  // ============================================================================
  console.log("\n--- [CHECK 5] RBAC Permissions & Tenant Isolation ---");
  const hmGetRes = await fetch(`${BASE_URL}/api/employer/assessments/${assessId}`, {
    headers: { Cookie: cookieHmA || "" },
  });
  assert(hmGetRes.status === 200, "Hiring Manager GET /assessments/[id] View Allowed (200)", `Status: ${hmGetRes.status}`);

  const hmPostRes = await fetch(`${BASE_URL}/api/employer/assessments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHmA || "" },
    body: JSON.stringify({ title: "HM Blocked" }),
  });
  assert(hmPostRes.status === 403, "Hiring Manager POST /assessments Blocked (403)", `Status: ${hmPostRes.status}`);

  const intGetRes = await fetch(`${BASE_URL}/api/employer/assessments/${assessId}`, {
    headers: { Cookie: cookieInterviewerA || "" },
  });
  assert(intGetRes.status === 403, "Interviewer GET /assessments/[id] Blocked (403)", `Status: ${intGetRes.status}`);

  const coBGetRes = await fetch(`${BASE_URL}/api/employer/assessments/${assessId}`, {
    headers: { Cookie: cookieAdminB || "" },
  });
  assert(coBGetRes.status === 404, "Company B GET Company A Assessment Isolated (404)", `Status: ${coBGetRes.status}`);

  // ============================================================================
  // CHECK 6: ASSIGNMENT, TOKEN HASHING, SNAPSHOTTING & LINKAGE
  // ============================================================================
  console.log("\n--- [CHECK 6] Assignment, Token Hashing, Snapshotting & Linkage ---");
  const assignRes = await fetch(`${BASE_URL}/api/employer/assessments/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieRecruiterA || "" },
    body: JSON.stringify({
      assessmentId: assessId,
      applicationId: appA.id,
      daysValid: 7,
    }),
  });

  const assignData = await assignRes.json();
  const rawToken = assignData.rawToken || assignData.token;
  const assignmentId = assignData.assignment?.id || assignData.candidateAssessment?.id;
  assert(assignRes.status === 200 && !!rawToken, "Assign Assessment to Candidate (200)", `Token: ${rawToken?.slice(0, 10)}...`);

  // Verify DB stores only the SHA-256 token hash
  const storedAssignment = await prisma.candidateAssessment.findUnique({
    where: { id: assignmentId },
  });
  const expectedHash = hashToken(rawToken);
  assert(storedAssignment?.tokenHash === expectedHash, "Database stores SHA-256 tokenHash (never plaintext token)", `Hash: ${storedAssignment?.tokenHash?.slice(0, 16)}...`);

  // Verify Outbox and Notification linkage to companyId and applicationId
  const inviteOutbox = await prisma.emailOutbox.findFirst({
    where: { applicationId: appA.id, template: { in: ["ASSESSMENT_INVITATION", "CANDIDATE_ASSESSMENT_ASSIGNED"] } },
    orderBy: { createdAt: "desc" },
  });
  const inviteNotif = await prisma.notification.findFirst({
    where: { applicationId: appA.id, type: "ASSESSMENT_ASSIGNED" },
    orderBy: { createdAt: "desc" },
  });
  assert(inviteOutbox?.companyId === companyA.id && inviteOutbox?.applicationId === appA.id, "EmailOutbox links companyId and applicationId", `Outbox companyId=${inviteOutbox?.companyId}`);
  assert(inviteNotif?.companyId === companyA.id && inviteNotif?.applicationId === appA.id, "Notification links companyId and applicationId", `Notif companyId=${inviteNotif?.companyId}`);

  // Duplicate active assignment protection (maxAttempts=1)
  const dupAssignRes = await fetch(`${BASE_URL}/api/employer/assessments/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieRecruiterA || "" },
    body: JSON.stringify({ assessmentId: assessId, applicationId: appA.id }),
  });
  assert(dupAssignRes.status === 400, "Duplicate Active Assignment Blocked (400)", `Status: ${dupAssignRes.status}`);

  // Verify Question Snapshot Protection: modify original assessment questions in DB
  const firstQ = await prisma.assessmentQuestion.findFirst({ where: { assessmentId: assessId } });
  if (firstQ) {
    await prisma.assessmentQuestion.update({
      where: { id: firstQ.id },
      data: { question: "MODIFIED ORIGINAL QUESTION TEXT" },
    });
  }
  const snapshotAfterMod = await prisma.candidateAssessment.findUnique({ where: { id: assignmentId } });
  const snapshotQuestions = snapshotAfterMod?.questionsSnapshot as any[];
  const snapshotPreserved = snapshotQuestions?.[0]?.question !== "MODIFIED ORIGINAL QUESTION TEXT";
  assert(snapshotPreserved, "Candidate Question Snapshot Preserved After Assessment Edit in Builder");

  // Setup Wrong Candidate User for 403 test
  const wrongCandUser = await prisma.user.upsert({
    where: { email: "candidate.wrong@example.com" },
    update: { role: UserRole.CANDIDATE, passwordHash, status: "ACTIVE" },
    create: { email: "candidate.wrong@example.com", name: "Wrong Candidate", passwordHash, role: UserRole.CANDIDATE, status: "ACTIVE" },
  });
  const cookieWrongCand = await loginCandidate("candidate.wrong@example.com", "Password123!");

  // ============================================================================
  // CHECK 7: CANDIDATE SECURITY, EXPLICIT TIMER START, RESUMING & RESPONSE SHAPES
  // ============================================================================
  console.log("\n--- [CHECK 7] Candidate Security, Timer Start & Response Shapes ---");
  // 1. Tampered token
  const tamperedRes = await fetch(`${BASE_URL}/api/candidate/assessments/invalid_tampered_token_xyz`);
  assert(tamperedRes.status === 404, "Tampered / Nonexistent Token returns 404", `Status: ${tamperedRes.status}`);

  // 2. Candidate GET before Start (Verify NOT_STARTED and NO questions returned)
  const candGetBefore = await fetch(`${BASE_URL}/api/candidate/assessments/${rawToken}`);
  const candGetDataBefore = await candGetBefore.json();
  const notStartedValid = candGetDataBefore.status === "NOT_STARTED" && (!candGetDataBefore.assessment?.questions || candGetDataBefore.assessment.questions.length === 0);
  assert(candGetBefore.status === 200 && notStartedValid, "Candidate GET before start returns status NOT_STARTED and 0 questions", `Status: "${candGetDataBefore.status}", Questions: ${candGetDataBefore.assessment?.questions?.length || 0}`);

  // 3. Wrong candidate cookie calling GET /assessments/[token]
  const wrongCandGetRes = await fetch(`${BASE_URL}/api/candidate/assessments/${rawToken}`, {
    headers: { Cookie: cookieWrongCand || "" },
  });
  assert(wrongCandGetRes.status === 403, "Wrong Candidate cookie accessing token returns 403", `Status: ${wrongCandGetRes.status}`);

  // 4. Expired token check
  const expiredToken = crypto.randomBytes(32).toString("hex");
  const expiredHash = hashToken(expiredToken);
  await prisma.candidateAssessment.create({
    data: {
      assessmentId: assessId,
      applicationId: appA.id,
      candidateEmail: candidateUser.email,
      token: expiredToken,
      tokenHash: expiredHash,
      status: "PENDING",
      expiresAt: new Date(Date.now() - 3600000), // 1 hr ago
    },
  });
  const expiredRes = await fetch(`${BASE_URL}/api/candidate/assessments/${expiredToken}`);
  assert(expiredRes.status === 410, "Expired Assessment Token returns 410 Gone", `Status: ${expiredRes.status}`);

  // 5. Explicit POST /start Action (Server Timer Begins)
  const startRes = await fetch(`${BASE_URL}/api/candidate/assessments/${rawToken}/start`, {
    method: "POST",
  });
  const startData = await startRes.json();
  assert(startRes.status === 200 && !!startData.deadlineAt, "Explicit POST /start begins timer and sets server deadline", `Deadline: ${startData.deadlineAt}`);

  // Verify answer keys and recruiter explanations are NEVER sent to candidate
  const returnedQuestions = startData.questions || [];
  const noKeysLeaked = returnedQuestions.every((q: any) => q.correctAnswer === undefined && q.explanation === undefined);
  assert(noKeysLeaked, "Security Sanitization: correctAnswer and explanation are stripped from candidate response");

  // 6. Resume after refresh
  const resumeRes = await fetch(`${BASE_URL}/api/candidate/assessments/${rawToken}/start`, {
    method: "POST",
  });
  const resumeData = await resumeRes.json();
  assert(resumeRes.status === 200 && resumeData.resumed === true, "Resume In-Progress Assessment After Page Refresh", `Resumed: ${resumeData.resumed}`);

  // ============================================================================
  // CHECK 8: AUTOSAVE & DEADLINE ENFORCEMENT
  // ============================================================================
  console.log("\n--- [CHECK 8] Candidate Autosave & Deadline Enforcement ---");
  const qList = snapshotQuestions;
  const qSingle = qList.find((q: any) => q.questionType === "SINGLE_CHOICE");
  const qMulti = qList.find((q: any) => q.questionType === "MULTIPLE_CHOICE");
  const qTf = qList.find((q: any) => q.questionType === "TRUE_FALSE");
  const qShort = qList.find((q: any) => q.questionType === "SHORT_TEXT");
  const qLong = qList.find((q: any) => q.questionType === "LONG_TEXT");
  const qCode = qList.find((q: any) => q.questionType === "CODE");

  const answersPayload: Record<string, any> = {};
  if (qSingle) answersPayload[qSingle.id] = "useReducer"; // Correct (10 pts)
  if (qMulti) answersPayload[qMulti.id] = ["Hash Map", "Linked List"]; // 1 correct ("Hash Map"), 1 incorrect ("Linked List") -> Hand calculated: 1*(20/2) - 1*5 = 5 pts
  if (qTf) answersPayload[qTf.id] = "True"; // Correct (10 pts)
  if (qShort) answersPayload[qShort.id] = "o(log n)"; // Correct (10 pts)
  if (qLong) answersPayload[qLong.id] = "Optimistic locking checks version numbers on commit.";
  if (qCode) answersPayload[qCode.id] = "const sumEven = (nums) => nums.filter(n => n%2===0).reduce((a,b)=>a+b, 0);";

  const autosaveRes = await fetch(`${BASE_URL}/api/candidate/assessments/${rawToken}/autosave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: answersPayload }),
  });
  assert(autosaveRes.status === 200, "Candidate Periodic Autosave (200)", `Status: ${autosaveRes.status}`);

  // Test Late Autosave after deadline
  await prisma.candidateAssessment.update({
    where: { id: assignmentId },
    data: { deadlineAt: new Date(Date.now() - 60000) }, // 1 min in the past
  });
  const lateAutosaveRes = await fetch(`${BASE_URL}/api/candidate/assessments/${rawToken}/autosave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: answersPayload }),
  });
  assert(lateAutosaveRes.status === 403, "Autosave after server deadline rejected (403)", `Status: ${lateAutosaveRes.status}`);

  // Restore deadline for submission
  await prisma.candidateAssessment.update({
    where: { id: assignmentId },
    data: { deadlineAt: new Date(Date.now() + 1800000) },
  });

  // ============================================================================
  // CHECK 9: SUBMISSION, AUTO-SCORE NUMBERS & IMMEDIATE AUDIT LOGS
  // ============================================================================
  console.log("\n--- [CHECK 9] Submission, Auto-Score Numbers & Submit-Time Audit Rows ---");
  const submitRes = await fetch(`${BASE_URL}/api/candidate/assessments/${rawToken}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: answersPayload }),
  });
  const submitData = await submitRes.json();
  assert(submitRes.status === 200 && submitData.status === "PENDING_REVIEW", "Candidate Submit queued for review (200)", `Status: "${submitData.status}"`);

  // Double submit protection
  const doubleSubmitRes = await fetch(`${BASE_URL}/api/candidate/assessments/${rawToken}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: answersPayload }),
  });
  assert(doubleSubmitRes.status === 400, "Double Submit Protection returns 400", `Status: ${doubleSubmitRes.status}`);

  // Verify ApplicationEvent and Recruiter Notification created IMMEDIATELY AT SUBMIT TIME
  const submitAppEvent = await prisma.applicationEvent.findFirst({
    where: { applicationId: appA.id, action: "ASSESSMENT_SUBMITTED_PENDING_REVIEW" },
    orderBy: { createdAt: "desc" },
  });
  assert(
    !!submitAppEvent && submitAppEvent.applicationId === appA.id,
    "ApplicationEvent created at submit time (ASSESSMENT_SUBMITTED_PENDING_REVIEW)",
    `ID: ${submitAppEvent?.id}, Action: "${submitAppEvent?.action}"`
  );

  const submitRecruiterNotif = await prisma.notification.findFirst({
    where: { companyId: companyA.id, applicationId: appA.id, type: "ASSESSMENT_COMPLETED" },
    orderBy: { createdAt: "desc" },
  });
  assert(
    !!submitRecruiterNotif && submitRecruiterNotif.companyId === companyA.id && submitRecruiterNotif.applicationId === appA.id,
    "Recruiter Notification created at submit time with companyId & applicationId",
    `ID: ${submitRecruiterNotif?.id}, Title: "${submitRecruiterNotif?.title}"`
  );
  assert(
    !!submitRecruiterNotif?.recipientEmail && submitRecruiterNotif.recipientEmail.includes("@") && !submitRecruiterNotif.recipientEmail.includes(" "),
    "Recruiter Notification recipientEmail is a valid user email address from DB (not company name)",
    `recipientEmail: "${submitRecruiterNotif?.recipientEmail}"`
  );

  // Global check: no notifications in DB have invalid non-email recipientEmail
  const invalidNotifs = await prisma.notification.findMany({
    where: {
      OR: [
        { recipientEmail: { not: { contains: "@" } } },
        { recipientEmail: { contains: " " } },
      ],
    },
  });
  assert(invalidNotifs.length === 0, "All notifications in database have valid email recipientEmail format", `Invalid count: ${invalidNotifs.length}`);

  // Verify Auto-Score Numbers calculated by hand vs actual in DB
  const submittedAssessment = await prisma.candidateAssessment.findUnique({ where: { id: assignmentId } });
  const recordedAnswers = submittedAssessment?.answers as Record<string, any>;

  console.log("\n  [Auto-Score Math Verification (Hand vs Actual)]:");
  if (qSingle) {
    const singleAns = recordedAnswers[qSingle.id];
    assert(singleAns?.pointsAwarded === 10, "Single-Choice score: Hand=10.0 pts vs Actual=10 pts");
  }
  if (qMulti) {
    const multiAns = recordedAnswers[qMulti.id];
    assert(multiAns?.pointsAwarded === 5, "Multiple-Choice (Negative Marking ON: 5.0 pts penalty): Hand=5.0 pts (1 correct * 10 - 1 wrong * 5) vs Actual=5 pts");
  }
  if (qTf) {
    const tfAns = recordedAnswers[qTf.id];
    assert(tfAns?.pointsAwarded === 10, "True/False score: Hand=10.0 pts vs Actual=10 pts");
  }

  // ============================================================================
  // MULTIPLE-CHOICE SCORING MODES MATRIX VERIFICATION
  // ============================================================================
  console.log("\n  [Multiple-Choice Scoring Modes Matrix (ALL_OR_NOTHING vs PARTIAL)]:");

  // Test 1: ALL_OR_NOTHING mode tests (20 pts total, Options A & B correct, Options C & D wrong)
  const aonAssess = await prisma.assessment.create({
    data: {
      companyId: companyA.id,
      title: "All Or Nothing Scoring Verification",
      durationMinutes: 10,
      status: "PUBLISHED",
      questions: {
        create: [
          {
            question: "Select correct answers (ALL_OR_NOTHING)",
            questionType: "MULTIPLE_CHOICE",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A, Option B",
            points: 20,
            negativePoints: 5,
            scoringMode: "ALL_OR_NOTHING",
            orderIndex: 0,
          },
        ],
      },
    },
    include: { questions: true },
  });
  const aonQ = aonAssess.questions[0];

  // AON Case A: Exact match (Select Option A, Option B) -> Full 20 pts
  const aonToken1 = crypto.randomBytes(32).toString("hex");
  await prisma.candidateAssessment.create({
    data: {
      assessmentId: aonAssess.id,
      applicationId: appA.id,
      candidateEmail: candidateUser.email,
      token: aonToken1,
      tokenHash: hashToken(aonToken1),
      status: "IN_PROGRESS",
      startedAt: new Date(),
      deadlineAt: new Date(Date.now() + 600000),
      expiresAt: new Date(Date.now() + 7 * 86400000),
      questionsSnapshot: aonAssess.questions as any,
    },
  });
  await fetch(`${BASE_URL}/api/candidate/assessments/${aonToken1}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: { [aonQ.id]: ["Option A", "Option B"] } }),
  });
  const aonSub1 = await prisma.candidateAssessment.findFirst({ where: { tokenHash: hashToken(aonToken1) } });
  const aonScore1 = (aonSub1?.answers as any)?.[aonQ.id]?.pointsAwarded;
  assert(aonScore1 === 20, "ALL_OR_NOTHING: Exact match (Option A + Option B) => Hand=20 pts vs Actual=" + aonScore1 + " pts");

  // AON Case B: Select all options (Option A, B, C, D) -> Must NOT get full marks (awards 0 pts)
  const aonToken2 = crypto.randomBytes(32).toString("hex");
  await prisma.candidateAssessment.create({
    data: {
      assessmentId: aonAssess.id,
      applicationId: appA.id,
      candidateEmail: candidateUser.email,
      token: aonToken2,
      tokenHash: hashToken(aonToken2),
      status: "IN_PROGRESS",
      startedAt: new Date(),
      deadlineAt: new Date(Date.now() + 600000),
      expiresAt: new Date(Date.now() + 7 * 86400000),
      questionsSnapshot: aonAssess.questions as any,
    },
  });
  await fetch(`${BASE_URL}/api/candidate/assessments/${aonToken2}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: { [aonQ.id]: ["Option A", "Option B", "Option C", "Option D"] } }),
  });
  const aonSub2 = await prisma.candidateAssessment.findFirst({ where: { tokenHash: hashToken(aonToken2) } });
  const aonScore2 = (aonSub2?.answers as any)?.[aonQ.id]?.pointsAwarded;
  assert(aonScore2 === 0, "ALL_OR_NOTHING: Ticking ALL options (A+B+C+D) => Hand=0 pts vs Actual=" + aonScore2 + " pts (No full marks)");

  // AON Case C: Partial selection (Option A only) -> 0 pts
  const aonToken3 = crypto.randomBytes(32).toString("hex");
  await prisma.candidateAssessment.create({
    data: {
      assessmentId: aonAssess.id,
      applicationId: appA.id,
      candidateEmail: candidateUser.email,
      token: aonToken3,
      tokenHash: hashToken(aonToken3),
      status: "IN_PROGRESS",
      startedAt: new Date(),
      deadlineAt: new Date(Date.now() + 600000),
      expiresAt: new Date(Date.now() + 7 * 86400000),
      questionsSnapshot: aonAssess.questions as any,
    },
  });
  await fetch(`${BASE_URL}/api/candidate/assessments/${aonToken3}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: { [aonQ.id]: ["Option A"] } }),
  });
  const aonSub3 = await prisma.candidateAssessment.findFirst({ where: { tokenHash: hashToken(aonToken3) } });
  const aonScore3 = (aonSub3?.answers as any)?.[aonQ.id]?.pointsAwarded;
  assert(aonScore3 === 0, "ALL_OR_NOTHING: Partial selection (Option A only) => Hand=0 pts vs Actual=" + aonScore3 + " pts");

  // Test 2: PARTIAL mode tests (20 pts total, Options A & B correct, Options C & D wrong)
  const partialAssess = await prisma.assessment.create({
    data: {
      companyId: companyA.id,
      title: "Partial Mode Scoring Verification",
      durationMinutes: 10,
      status: "PUBLISHED",
      questions: {
        create: [
          {
            question: "Select correct answers (PARTIAL mode, Negative OFF)",
            questionType: "MULTIPLE_CHOICE",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A, Option B",
            points: 20,
            negativePoints: 0,
            scoringMode: "PARTIAL",
            orderIndex: 0,
          },
          {
            question: "Select correct answers (PARTIAL mode, Negative ON = 5 pts)",
            questionType: "MULTIPLE_CHOICE",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A, Option B",
            points: 20,
            negativePoints: 5,
            scoringMode: "PARTIAL",
            orderIndex: 1,
          },
        ],
      },
    },
    include: { questions: true },
  });
  const [partQNegOff, partQNegOn] = partialAssess.questions;

  // PARTIAL Case A: Exact match -> 20 pts
  const partToken1 = crypto.randomBytes(32).toString("hex");
  await prisma.candidateAssessment.create({
    data: {
      assessmentId: partialAssess.id,
      applicationId: appA.id,
      candidateEmail: candidateUser.email,
      token: partToken1,
      tokenHash: hashToken(partToken1),
      status: "IN_PROGRESS",
      startedAt: new Date(),
      deadlineAt: new Date(Date.now() + 600000),
      expiresAt: new Date(Date.now() + 7 * 86400000),
      questionsSnapshot: partialAssess.questions as any,
    },
  });
  await fetch(`${BASE_URL}/api/candidate/assessments/${partToken1}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answers: {
        [partQNegOff.id]: ["Option A", "Option B"],
        [partQNegOn.id]: ["Option A", "Option B"],
      },
    }),
  });
  const partSub1 = await prisma.candidateAssessment.findFirst({ where: { tokenHash: hashToken(partToken1) } });
  const partScore1Off = (partSub1?.answers as any)?.[partQNegOff.id]?.pointsAwarded;
  const partScore1On = (partSub1?.answers as any)?.[partQNegOn.id]?.pointsAwarded;
  assert(partScore1Off === 20, "PARTIAL (Neg OFF): Exact match (Option A + B) => Hand=20 pts vs Actual=" + partScore1Off + " pts");
  assert(partScore1On === 20, "PARTIAL (Neg ON): Exact match (Option A + B) => Hand=20 pts vs Actual=" + partScore1On + " pts");

  // PARTIAL Case B: Partial match (Option A only) -> 10 pts
  const partToken2 = crypto.randomBytes(32).toString("hex");
  await prisma.candidateAssessment.create({
    data: {
      assessmentId: partialAssess.id,
      applicationId: appA.id,
      candidateEmail: candidateUser.email,
      token: partToken2,
      tokenHash: hashToken(partToken2),
      status: "IN_PROGRESS",
      startedAt: new Date(),
      deadlineAt: new Date(Date.now() + 600000),
      expiresAt: new Date(Date.now() + 7 * 86400000),
      questionsSnapshot: partialAssess.questions as any,
    },
  });
  await fetch(`${BASE_URL}/api/candidate/assessments/${partToken2}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answers: {
        [partQNegOff.id]: ["Option A"],
        [partQNegOn.id]: ["Option A"],
      },
    }),
  });
  const partSub2 = await prisma.candidateAssessment.findFirst({ where: { tokenHash: hashToken(partToken2) } });
  const partScore2Off = (partSub2?.answers as any)?.[partQNegOff.id]?.pointsAwarded;
  const partScore2On = (partSub2?.answers as any)?.[partQNegOn.id]?.pointsAwarded;
  assert(partScore2Off === 10, "PARTIAL (Neg OFF): Partial match (Option A only) => Hand=10 pts vs Actual=" + partScore2Off + " pts");
  assert(partScore2On === 10, "PARTIAL (Neg ON): Partial match (Option A only) => Hand=10 pts vs Actual=" + partScore2On + " pts");

  // PARTIAL Case C: Select ALL options (Option A, B, C, D) -> Must NOT get full marks (Neg OFF gives 0, Neg ON gives 10)
  const partToken3 = crypto.randomBytes(32).toString("hex");
  await prisma.candidateAssessment.create({
    data: {
      assessmentId: partialAssess.id,
      applicationId: appA.id,
      candidateEmail: candidateUser.email,
      token: partToken3,
      tokenHash: hashToken(partToken3),
      status: "IN_PROGRESS",
      startedAt: new Date(),
      deadlineAt: new Date(Date.now() + 600000),
      expiresAt: new Date(Date.now() + 7 * 86400000),
      questionsSnapshot: partialAssess.questions as any,
    },
  });
  await fetch(`${BASE_URL}/api/candidate/assessments/${partToken3}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answers: {
        [partQNegOff.id]: ["Option A", "Option B", "Option C", "Option D"],
        [partQNegOn.id]: ["Option A", "Option B", "Option C", "Option D"],
      },
    }),
  });
  const partSub3 = await prisma.candidateAssessment.findFirst({ where: { tokenHash: hashToken(partToken3) } });
  const partScore3Off = (partSub3?.answers as any)?.[partQNegOff.id]?.pointsAwarded;
  const partScore3On = (partSub3?.answers as any)?.[partQNegOn.id]?.pointsAwarded;
  assert(partScore3Off === 0, "PARTIAL (Neg OFF): Ticking ALL options => Hand=0 pts vs Actual=" + partScore3Off + " pts (No full marks)");
  assert(partScore3On === 10, "PARTIAL (Neg ON: 5 pt penalty): Ticking ALL options (20 - 10 penalty) => Hand=10 pts vs Actual=" + partScore3On + " pts (No full marks)");

  // Clean up temporary scoring assessment fixtures
  await prisma.candidateAssessment.deleteMany({ where: { assessmentId: { in: [aonAssess.id, partialAssess.id] } } });
  await prisma.assessmentQuestion.deleteMany({ where: { assessmentId: { in: [aonAssess.id, partialAssess.id] } } });
  await prisma.assessment.deleteMany({ where: { id: { in: [aonAssess.id, partialAssess.id] } } });

  // ============================================================================
  // NOTIFICATION PRIORITY & UNROUTED ROUTING TEST
  // ============================================================================
  console.log("\n  [Notification Priority & Unrouted Fallback Verification]:");
  const unroutedComp = await prisma.company.create({
    data: {
      name: `Unrouted Test Company ${Date.now()}`,
      slug: `unrouted-test-comp-${Date.now()}`,
      industry: "IT",
      size: "10-50",
      location: "Bengaluru",
      description: "Company with zero users for unrouted notification testing",
    },
  });

  const unroutedJob = await prisma.job.create({
    data: {
      companyId: unroutedComp.id,
      title: "Unrouted Role",
      description: "Unrouted Job Description",
      responsibilities: ["Code"],
      requirements: ["TypeScript"],
      skills: ["TypeScript"],
      location: "Bengaluru",
      workMode: "REMOTE",
      jobType: "FULL_TIME",
      department: "Engineering",
      expiresAt: new Date(Date.now() + 30 * 86400000),
    },
  });

  // Apply to job at company with zero staff members
  const unroutedApplyRes = await fetch(`${BASE_URL}/api/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jobId: unroutedJob.id,
      fullName: "Unrouted Tester",
      email: "unrouted.applicant@gmail.com",
      phone: "+91 9988776655",
      skills: "TypeScript",
      totalExpYears: 3,
    }),
  });
  assert(unroutedApplyRes.status === 200, "Apply to unrouted job succeeds (200)");

  const unroutedNotif = await prisma.notification.findFirst({
    where: { companyId: unroutedComp.id },
    orderBy: { createdAt: "desc" },
  });
  assert(
    !!unroutedNotif && unroutedNotif.recipientEmail === null && unroutedNotif.isUnrouted === true,
    "Notification when no company staff exists is stored with recipientEmail=null and isUnrouted=true (never invented email)",
    `recipientEmail: ${unroutedNotif?.recipientEmail}, isUnrouted: ${unroutedNotif?.isUnrouted}`
  );

  // Clean up unrouted fixtures
  await prisma.notification.deleteMany({ where: { companyId: unroutedComp.id } });
  await prisma.applicationEvent.deleteMany({ where: { application: { jobId: unroutedJob.id } } });
  await prisma.application.deleteMany({ where: { jobId: unroutedJob.id } });
  await prisma.job.delete({ where: { id: unroutedJob.id } });
  await prisma.company.delete({ where: { id: unroutedComp.id } });

  // Recruiter reviews and grades manual questions
  const reviewDetailRes = await fetch(`${BASE_URL}/api/employer/assessments/reviews/${assignmentId}`, {
    headers: { Cookie: cookieRecruiterA || "" },
  });
  assert(reviewDetailRes.status === 200, "Recruiter GET Review Detail (200)", `Status: ${reviewDetailRes.status}`);

  const gradeRes = await fetch(`${BASE_URL}/api/employer/assessments/reviews/${assignmentId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieRecruiterA || "" },
    body: JSON.stringify({
      questionGrades: [
        { questionId: qLong?.id, marksAwarded: 20, feedback: "Good conceptual explanation" },
        { questionId: qCode?.id, marksAwarded: 25, feedback: "Clean solution using reduce" },
      ],
      recruiterNotes: "Solid technical performance.",
    }),
  });
  const gradeData = await gradeRes.json();
  assert(gradeRes.status === 200 && gradeData.submission?.status === "COMPLETED", "Recruiter Manual Grading (200)", `Final Status: "${gradeData.submission?.status}", Score: ${gradeData.submission?.score}%`);

  // MaxAttempts check: try to start another attempt when maxAttempts=1 and attempt is finished
  const secondAttemptRes = await fetch(`${BASE_URL}/api/candidate/assessments/${rawToken}/start`, {
    method: "POST",
  });
  assert(secondAttemptRes.status === 400, "Second Attempt Blocked when maxAttempts=1 (400)", `Status: ${secondAttemptRes.status}`);

  // ============================================================================
  // CHECK 10: RBAC ON GRADING & TENANT ISOLATION
  // ============================================================================
  console.log("\n--- [CHECK 10] RBAC on Grading & Multi-Tenant Isolation ---");
  // Hiring Manager blocked from POST grading
  const hmGradeRes = await fetch(`${BASE_URL}/api/employer/assessments/reviews/${assignmentId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHmA || "" },
    body: JSON.stringify({ questionGrades: [] }),
  });
  assert(hmGradeRes.status === 403, "Hiring Manager POST Grading Blocked (403)", `Status: ${hmGradeRes.status}`);

  // Interviewer blocked from POST grading
  const intGradeRes = await fetch(`${BASE_URL}/api/employer/assessments/reviews/${assignmentId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieInterviewerA || "" },
    body: JSON.stringify({ questionGrades: [] }),
  });
  assert(intGradeRes.status === 403, "Interviewer POST Grading Blocked (403)", `Status: ${intGradeRes.status}`);

  // Company B calling results and review
  const coBReviewRes = await fetch(`${BASE_URL}/api/employer/assessments/reviews/${assignmentId}`, {
    headers: { Cookie: cookieAdminB || "" },
  });
  assert(coBReviewRes.status === 404, "Company B GET Review Detail returns 404", `Status: ${coBReviewRes.status}`);

  const coBGradeRes = await fetch(`${BASE_URL}/api/employer/assessments/reviews/${assignmentId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieAdminB || "" },
    body: JSON.stringify({ questionGrades: [] }),
  });
  assert(coBGradeRes.status === 404, "Company B POST Grading returns 404", `Status: ${coBGradeRes.status}`);

  // ============================================================================
  // CHECK 11: ARCHIVAL ON DELETE WITH ASSIGNMENTS
  // ============================================================================
  console.log("\n--- [CHECK 11] Archival Protection ---");
  const delAssessRes = await fetch(`${BASE_URL}/api/employer/assessments/${assessId}`, {
    method: "DELETE",
    headers: { Cookie: cookieAdminA || "" },
  });
  const delData = await delAssessRes.json();
  assert(delAssessRes.status === 200 && delData.archived === true, "Delete Assessment with active assignments archives instead of hard-deleting", `Archived: ${delData.archived}`);

  // ============================================================================
  // CHECK 12: BRAND-NEW EMPTY DATABASE MIGRATION PROOF
  // ============================================================================
  console.log("\n--- [CHECK 12] Brand-New Empty Database Migration Proof ---");
  const testDbName = `test_empty_step5_${Date.now()}`;
  try {
    await prisma.$executeRawUnsafe(`CREATE DATABASE "${testDbName}";`);
    const originalUrl = process.env.DATABASE_URL!;
    const parsed = new URL(originalUrl);
    parsed.pathname = `/${testDbName}`;
    const newDbUrl = parsed.toString();

    execSync("npx prisma migrate deploy", {
      encoding: "utf-8",
      env: { ...process.env, DATABASE_URL: newDbUrl, DIRECT_URL: newDbUrl },
    });

    const testDbPrisma = new PrismaClient({ datasources: { db: { url: newDbUrl } } });
    const tables: Array<{ table_name: string }> = await testDbPrisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);
    assert(tables.length >= 35, "Empty Database Migration: Successfully builds all tables from migrations alone", `Tables count: ${tables.length}`);

    await testDbPrisma.$disconnect();

    await prisma.$executeRawUnsafe(`
      SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${testDbName}' AND pid <> pg_backend_pid();
    `);
    await prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${testDbName}";`);
  } catch (err: any) {
    console.error("  Empty DB Migration Error:", err.message);
    assert(false, "Empty DB Migration");
  }

  console.log("\n================================================================================");
  console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log("================================================================================");

  if (failedCount > 0) {
    throw new Error(`${failedCount} test(s) failed.`);
  }
}

main()
  .catch(async (e) => {
    console.error("Test failure:", e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
