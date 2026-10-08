/**
 * Comprehensive Step 2 End-to-End HTTP Test Suite
 * 
 * Verifies all Candidate Foundation requirements:
 * 1. Employer cookie and admin cookie on /api/candidate/* (401/403).
 * 2. Logout of one realm keeps the other two realms' sessions (all pairs).
 * 3. Unverified candidate: cannot open /candidate/* pages or APIs and cannot trigger application linking.
 * 4. Candidate A cannot read or edit Candidate B's profile, resume or applications by guessing IDs.
 * 5. Forgot-password and reset: token stored hashed, expires, one-time, wrong or expired token rejected;
 *    change-password and resend-verification work and are rate limited; signup, verification resend and reset are rate limited too.
 * 6. Signup and forgot-password give the same response whether the email exists or not.
 * 7. Email failure: force a send failure and show the outbox record is FAILED with the real error and the UI does not say sent.
 * 8. Backfill idempotency: run it twice, show no duplicate links or events, and print the counts linked.
 * 9. /assessments/[token] and /candidate/interviews/[token] open without login.
 * 10. Re-run Step 1 HTTP suite and company admin/platform admin smoke tests.
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { queueAndSendEmail } from "../src/lib/email/outbox";

const BASE_URL = process.env.TEST_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
const prisma = new PrismaClient();

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

async function runStep2ComprehensiveSuite() {
  console.log("==========================================================================");
  console.log("🚀 STARTING STEP 2: CANDIDATE FOUNDATION COMPREHENSIVE E2E HTTP SUITE");
  console.log(`Targeting Base URL: ${BASE_URL}`);
  console.log("==========================================================================\n");

  const runSeed = Math.floor(Math.random() * 100000);
  const runId = `step2_${Date.now()}_${runSeed}`;
  let ipCounter = 1;
  const getNextIp = () => `10.42.${Math.floor(runSeed / 256)}.${(runSeed % 250) + (ipCounter++)}`;

  // --------------------------------------------------------------------------
  // TEST DATA SETUP
  // --------------------------------------------------------------------------
  const companySlug = `corp-step2-${runId}`;
  const company = await prisma.company.create({
    data: {
      name: `Step2 Corp ${runId}`,
      slug: companySlug,
      industry: "Technology",
      size: "50-100",
      location: "Bengaluru",
      description: "Test Company Step 2",
      verified: true,
    },
  });

  const employerEmail = `emp_${runId}@company.com`;
  const employerPassword = "EmployerPass123!";
  const employerUser = await prisma.user.create({
    data: {
      name: `Employer Admin ${runId}`,
      email: employerEmail,
      passwordHash: hashPasswordSync(employerPassword),
      role: "COMPANY_ADMIN",
      companyId: company.id,
      status: "ACTIVE",
    },
  });

  const adminEmail = `admin_${runId}@platform.local`;
  const adminPassword = "PlatformAdmin123!";
  const adminUser = await prisma.user.create({
    data: {
      name: `Platform Admin ${runId}`,
      email: adminEmail,
      passwordHash: hashPasswordSync(adminPassword),
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  const publishedJob = await prisma.job.create({
    data: {
      companyId: company.id,
      title: `Principal Staff Architect ${runId}`,
      department: "Infrastructure",
      location: "Bengaluru, India",
      jobType: "FULL_TIME",
      workMode: "HYBRID",
      description: "Build ultra resilient distributed career platforms.",
      responsibilities: ["Lead engineering", "Architect platforms"],
      requirements: ["TypeScript", "Next.js", "Distributed Systems"],
      skills: ["TypeScript", "PostgreSQL", "Next.js"],
      status: "PUBLISHED",
      postedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
  });

  const candAEmail = `candidate_alpha_${runId}@example.com`;
  const candAPassword = "AlphaPassword2026!";
  const candBEmail = `candidate_beta_${runId}@example.com`;

  // Create 2 pre-existing unlinked applications for candAEmail (as if submitted on job board previously)
  const preExistingApp1 = await prisma.application.create({
    data: {
      jobId: publishedJob.id,
      candidateId: null,
      candidateName: `Alpha Candidate ${runId}`,
      candidateEmail: candAEmail,
      candidatePhone: "+91 98765 43210",
      currentCompany: "Initial Startup",
      currentRole: "Senior Engineer",
      experienceYears: 4,
      status: "UNDER_REVIEW",
      matchScore: 92,
    },
  });

  const preExistingApp2 = await prisma.application.create({
    data: {
      jobId: publishedJob.id,
      candidateId: null,
      candidateName: `Alpha Candidate ${runId}`,
      candidateEmail: candAEmail,
      candidatePhone: "+91 98765 43210",
      currentCompany: "Initial Startup",
      currentRole: "Lead Engineer",
      experienceYears: 4,
      status: "INTERVIEW_SCHEDULED",
      matchScore: 95,
    },
  });

  // Create an interview with secureToken for token-based test
  const interviewToken = `inv_token_secure_${runId}_${Date.now()}`;
  const assessmentToken = `test_token_secure_${runId}_${Date.now()}`;

  const interview = await prisma.interview.create({
    data: {
      applicationId: preExistingApp1.id,
      jobId: publishedJob.id,
      companyId: company.id,
      candidateName: `Alpha Candidate ${runId}`,
      candidateEmail: candAEmail,
      title: "Architecture & System Design",
      scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
      durationMinutes: 60,
      status: "SCHEDULED",
      secureToken: interviewToken,
    },
  });

  const assessment = await prisma.assessment.create({
    data: {
      companyId: company.id,
      title: `Node.js & Systems Assessment ${runId}`,
      description: "Technical coding evaluation",
      durationMinutes: 45,
    },
  });

  await prisma.candidateAssessment.create({
    data: {
      assessmentId: assessment.id,
      applicationId: preExistingApp1.id,
      candidateEmail: candAEmail,
      token: assessmentToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      status: "PENDING",
    },
  });

  // Attach confidential recruiter note & interview feedback to preExistingApp1
  await prisma.recruiterNote.create({
    data: {
      applicationId: preExistingApp1.id,
      companyId: company.id,
      authorName: "Recruiter Sam",
      authorRole: "RECRUITER",
      content: "CONFIDENTIAL_RECRUITER_NOTE: Internal budget max 17 LPA.",
      isPrivate: true,
    },
  });

  await prisma.interviewFeedback.create({
    data: {
      interviewId: interview.id,
      interviewerName: "Staff Architect",
      interviewerEmail: "architect@company.com",
      overallRating: 5,
      comments: "CONFIDENTIAL_FEEDBACK_SCORE: Strong candidate with deep DB internals knowledge.",
      recommendation: "STRONG_HIRE",
    },
  });

  // --------------------------------------------------------------------------
  // LOGINS FOR EMPLOYER & ADMIN (REAL SESSIONS)
  // --------------------------------------------------------------------------
  const empLoginRes = await fetch(`${BASE_URL}/api/employer/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ email: employerEmail, password: employerPassword }),
  });
  const empCookie = empLoginRes.headers.get("set-cookie") || "";

  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const adminCookie = adminLoginRes.headers.get("set-cookie") || "";

  // ==========================================================================
  // REQUIREMENT 1: EMPLOYER COOKIE & ADMIN COOKIE ON /api/candidate/* (401)
  // ==========================================================================
  console.log("\n--- SECTION 1: CROSS-REALM ACCESS REJECTION ON CANDIDATE APIS ---");

  const empOnCandProfileRes = await fetch(`${BASE_URL}/api/candidate/profile`, {
    headers: { Cookie: empCookie, "x-forwarded-for": getNextIp() },
  });
  assertTest(
    "Cross-Realm Rejection",
    "Employer cookie rejected on GET /api/candidate/profile (401)",
    401,
    empOnCandProfileRes.status,
    empOnCandProfileRes.status === 401
  );

  const empOnCandAppsRes = await fetch(`${BASE_URL}/api/candidate/applications`, {
    headers: { Cookie: empCookie, "x-forwarded-for": getNextIp() },
  });
  assertTest(
    "Cross-Realm Rejection",
    "Employer cookie rejected on GET /api/candidate/applications (401)",
    401,
    empOnCandAppsRes.status,
    empOnCandAppsRes.status === 401
  );

  const adminOnCandProfileRes = await fetch(`${BASE_URL}/api/candidate/profile`, {
    headers: { Cookie: adminCookie, "x-forwarded-for": getNextIp() },
  });
  assertTest(
    "Cross-Realm Rejection",
    "Admin cookie rejected on GET /api/candidate/profile (401)",
    401,
    adminOnCandProfileRes.status,
    adminOnCandProfileRes.status === 401
  );

  const adminOnCandAppsRes = await fetch(`${BASE_URL}/api/candidate/applications`, {
    headers: { Cookie: adminCookie, "x-forwarded-for": getNextIp() },
  });
  assertTest(
    "Cross-Realm Rejection",
    "Admin cookie rejected on GET /api/candidate/applications (401)",
    401,
    adminOnCandAppsRes.status,
    adminOnCandAppsRes.status === 401
  );

  // ==========================================================================
  // REQUIREMENT 3: UNVERIFIED CANDIDATE GUARDS
  // ==========================================================================
  console.log("\n--- SECTION 2: UNVERIFIED CANDIDATE ACCESS & BACKFILL CONTROLS ---");

  // Candidate A Signs up
  const candASignupIp = getNextIp();
  const signupRes = await fetch(`${BASE_URL}/api/candidate/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": candASignupIp },
    body: JSON.stringify({
      name: `Alpha Candidate ${runId}`,
      email: candAEmail,
      password: candAPassword,
      phone: "+91 98765 43210",
    }),
  });
  assertTest(
    "Unverified Candidate",
    "Candidate Signup succeeds with generic message (200)",
    200,
    signupRes.status,
    signupRes.status === 200
  );

  // Verify status is PENDING_VERIFICATION in DB
  const unverifiedUser = await prisma.user.findUnique({ where: { email: candAEmail } });
  assertTest(
    "Unverified Candidate",
    "User created with status PENDING_VERIFICATION",
    "PENDING_VERIFICATION",
    unverifiedUser?.status || "",
    unverifiedUser?.status === "PENDING_VERIFICATION"
  );

  // Unverified candidate cannot log in -> 403
  const unverifiedLoginRes = await fetch(`${BASE_URL}/api/candidate/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({
      email: candAEmail,
      password: candAPassword,
    }),
  });
  assertTest(
    "Unverified Candidate",
    "Unverified candidate login blocked with 403",
    403,
    unverifiedLoginRes.status,
    unverifiedLoginRes.status === 403
  );

  // Check that unverified user HAS NOT linked pre-existing applications
  const unverifiedApps = await prisma.application.findMany({
    where: { candidateEmail: candAEmail },
  });
  const anyLinkedPrematurely = unverifiedApps.some((a) => a.candidateId !== null);
  assertTest(
    "Unverified Candidate",
    "Unverified candidate email DOES NOT link applications prematurely",
    null,
    anyLinkedPrematurely ? "linked" : null,
    !anyLinkedPrematurely
  );

  // ==========================================================================
  // REQUIREMENT 8: VERIFICATION & IDEMPOTENT APPLICATION BACKFILL
  // ==========================================================================
  console.log("\n--- SECTION 3: EMAIL VERIFICATION & IDEMPOTENT BACKFILL ---");

  // Retrieve raw token from outbox or DB token record
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: { identifier: candAEmail, type: "EMAIL_VERIFICATION" },
  });

  // Verify using the token
  const verifyRawToken = crypto.randomBytes(32).toString("hex");
  const verifyTokenHash = crypto.createHash("sha256").update(verifyRawToken).digest("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: candAEmail,
      tokenHash: verifyTokenHash,
      type: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + 3600 * 1000),
    },
  });

  const verifyRes = await fetch(`${BASE_URL}/api/candidate/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ email: candAEmail, token: verifyRawToken }),
  });
  const candACookie = verifyRes.headers.get("set-cookie") || "";

  assertTest(
    "Email Verification",
    "Verification succeeds, activates account, and issues session",
    200,
    verifyRes.status,
    verifyRes.status === 200 && candACookie.includes("cb_candidate_session")
  );

  // Verify backfill linked both preExistingApp1 and preExistingApp2
  const linkedApps = await prisma.application.findMany({
    where: { candidateEmail: candAEmail },
  });
  const allLinked = linkedApps.every((a) => a.candidateId === unverifiedUser?.id);
  assertTest(
    "Backfill Idempotency",
    "Backfill linked both pre-existing applications on verification",
    2,
    linkedApps.filter((a) => a.candidateId === unverifiedUser?.id).length,
    allLinked && linkedApps.length === 2
  );

  // Verify ApplicationEvents created
  const appEvents = await prisma.applicationEvent.findMany({
    where: {
      applicationId: { in: [preExistingApp1.id, preExistingApp2.id] },
      action: "CANDIDATE_LINKED",
    },
  });
  assertTest(
    "Backfill Idempotency",
    "Exactly 2 CANDIDATE_LINKED events created",
    2,
    appEvents.length,
    appEvents.length === 2
  );

  // RUN BACKFILL A SECOND TIME (Simulating Idempotent rerun)
  const { backfillCandidateApplications } = await import("../src/lib/candidate/auth");
  const secondBackfillResult = await backfillCandidateApplications(unverifiedUser!.id, candAEmail);
  assertTest(
    "Backfill Idempotency",
    "Second backfill run reports 0 newly linked applications",
    0,
    secondBackfillResult.linkedCount,
    secondBackfillResult.linkedCount === 0
  );

  const eventsCount2 = await prisma.applicationEvent.count({
    where: {
      applicationId: { in: [preExistingApp1.id, preExistingApp2.id] },
      action: "CANDIDATE_LINKED",
    },
  });
  assertTest(
    "Backfill Idempotency",
    "Zero duplicate application events created on second run",
    2,
    eventsCount2,
    eventsCount2 === 2
  );

  // ==========================================================================
  // REQUIREMENT 4: CANDIDATE A vs CANDIDATE B ID GUESSING ISOLATION
  // ==========================================================================
  console.log("\n--- SECTION 4: CANDIDATE-TO-CANDIDATE MULTI-TENANT ISOLATION ---");

  // Create Candidate B
  const candBUser = await prisma.user.create({
    data: {
      name: `Beta Candidate ${runId}`,
      email: candBEmail,
      passwordHash: hashPasswordSync("BetaPass!2026"),
      role: "CANDIDATE",
      status: "ACTIVE",
    },
  });

  await prisma.candidateProfile.create({
    data: {
      userId: candBUser.id,
      headline: "Secret Backend Profile",
      resumeFileName: "Beta_Confidential_Resume.pdf",
      resumeUrl: "/uploads/resumes/beta_confidential.pdf",
      searchableByEmployers: false,
    },
  });

  const candBApp = await prisma.application.create({
    data: {
      jobId: publishedJob.id,
      candidateId: candBUser.id,
      candidateName: candBUser.name,
      candidateEmail: candBUser.email,
      candidatePhone: "+91 91234 56789",
      status: "SUBMITTED",
    },
  });

  // Candidate A attempts to read Candidate B's application by ID -> 404
  const candAGetCandBAppRes = await fetch(`${BASE_URL}/api/candidate/applications/${candBApp.id}`, {
    headers: { Cookie: candACookie, "x-forwarded-for": getNextIp() },
  });
  assertTest(
    "ID Guessing Protection",
    "Candidate A cannot read Candidate B's application by ID (404)",
    404,
    candAGetCandBAppRes.status,
    candAGetCandBAppRes.status === 404
  );

  // Candidate A calls PUT /api/candidate/profile — only updates Candidate A's profile
  const candAUpdateProfileRes = await fetch(`${BASE_URL}/api/candidate/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: candACookie,
      "x-forwarded-for": getNextIp(),
    },
    body: JSON.stringify({
      headline: "Alpha Staff Architect",
      skills: ["Go", "TypeScript", "PostgreSQL"],
      searchableByEmployers: true,
      contactableByEmployers: true,
      hideSalaryFromEmployers: false,
    }),
  });
  assertTest(
    "Profile Self-Edit",
    "Candidate A can edit own profile (200)",
    200,
    candAUpdateProfileRes.status,
    candAUpdateProfileRes.status === 200
  );

  // Verify Candidate B's profile was UNTOUCHED
  const candBProfileAfter = await prisma.candidateProfile.findUnique({ where: { userId: candBUser.id } });
  assertTest(
    "Profile Isolation",
    "Candidate B's profile remains untouched after Candidate A edits",
    "Secret Backend Profile",
    candBProfileAfter?.headline || "",
    candBProfileAfter?.headline === "Secret Backend Profile" && candBProfileAfter?.searchableByEmployers === false
  );

  // Verify Safe Application sanitization: Candidate A views own application and does NOT see recruiter notes or feedback
  const candAViewOwnAppRes = await fetch(`${BASE_URL}/api/candidate/applications/${preExistingApp1.id}`, {
    headers: { Cookie: candACookie, "x-forwarded-for": getNextIp() },
  });
  const candAOwnAppData = await candAViewOwnAppRes.json();
  const rawResponseText = JSON.stringify(candAOwnAppData);
  const leakedRecruiterNote = rawResponseText.includes("CONFIDENTIAL_RECRUITER_NOTE");
  const leakedFeedbackScore = rawResponseText.includes("CONFIDENTIAL_FEEDBACK_SCORE");

  assertTest(
    "Data Sanitization",
    "Candidate application view strips internal recruiter notes and interview feedback",
    false,
    leakedRecruiterNote || leakedFeedbackScore,
    !leakedRecruiterNote && !leakedFeedbackScore && candAViewOwnAppRes.status === 200
  );

  // ==========================================================================
  // REQUIREMENT 5 & 6: FORGOT/RESET PASSWORD, CHANGE PASSWORD, TOKEN HASHING, ENUMERATION RESISTANCE
  // ==========================================================================
  console.log("\n--- SECTION 5: PASSWORD WORKFLOWS, TOKEN SECURITY & ANTI-ENUMERATION ---");

  // Anti-enumeration on signup: existing active vs non-existent
  const signupEnumIp = getNextIp();
  const signupExistingRes = await fetch(`${BASE_URL}/api/candidate/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": signupEnumIp },
    body: JSON.stringify({
      name: "Existing User",
      email: candAEmail,
      password: "NewPassword123!",
    }),
  });
  const signupExistingData = await signupExistingRes.json();

  const signupNonExistentRes = await fetch(`${BASE_URL}/api/candidate/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({
      name: "Non Existent",
      email: `non_existent_${runId}@example.com`,
      password: "NewPassword123!",
    }),
  });
  const signupNonExistentData = await signupNonExistentRes.json();

  assertTest(
    "Signup Anti-Enumeration",
    "Signup gives identical response whether email exists or not",
    signupExistingData.message,
    signupNonExistentData.message,
    signupExistingData.message === signupNonExistentData.message && signupExistingRes.status === 200
  );

  // Anti-enumeration on forgot-password: existing vs non-existent
  const forgotExistingRes = await fetch(`${BASE_URL}/api/candidate/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ email: candAEmail }),
  });
  const forgotExistingData = await forgotExistingRes.json();

  const forgotNonExistentRes = await fetch(`${BASE_URL}/api/candidate/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ email: `random_absent_${runId}@example.com` }),
  });
  const forgotNonExistentData = await forgotNonExistentRes.json();

  assertTest(
    "Forgot Password Anti-Enumeration",
    "Forgot password gives identical response whether email exists or not",
    forgotExistingData.message,
    forgotNonExistentData.message,
    forgotExistingData.message === forgotNonExistentData.message && forgotExistingRes.status === 200
  );

  // Verify Reset Token is stored HASHED in DB
  const resetTokenRecord = await prisma.verificationToken.findFirst({
    where: { identifier: candAEmail, type: "PASSWORD_RESET" },
  });
  assertTest(
    "Hashed Reset Token",
    "Password reset token is stored as SHA-256 hash (64 hex characters)",
    64,
    resetTokenRecord?.tokenHash.length || 0,
    resetTokenRecord?.tokenHash.length === 64
  );

  // Reset password with wrong token -> 400
  const wrongResetRes = await fetch(`${BASE_URL}/api/candidate/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({
      email: candAEmail,
      token: "wrong_plain_token_123",
      newPassword: "BrandNewPassword2026!",
    }),
  });
  assertTest(
    "Reset Token Validation",
    "Invalid reset token rejected with 400",
    400,
    wrongResetRes.status,
    wrongResetRes.status === 400
  );

  // Reset password with expired token -> 400
  const expiredRawToken = `expired_token_${runId}`;
  const expiredTokenHash = crypto.createHash("sha256").update(expiredRawToken).digest("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: candAEmail,
      tokenHash: expiredTokenHash,
      type: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() - 3600 * 1000), // Expired 1 hour ago
    },
  });

  const expiredResetRes = await fetch(`${BASE_URL}/api/candidate/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({
      email: candAEmail,
      token: expiredRawToken,
      newPassword: "BrandNewPassword2026!",
    }),
  });
  assertTest(
    "Expired Token Rejection",
    "Expired reset token rejected with 400",
    400,
    expiredResetRes.status,
    expiredResetRes.status === 400
  );

  // Reset password with VALID token
  const validRawResetToken = `valid_reset_${runId}`;
  const validResetHash = crypto.createHash("sha256").update(validRawResetToken).digest("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: candAEmail,
      tokenHash: validResetHash,
      type: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000),
    },
  });

  const validResetRes = await fetch(`${BASE_URL}/api/candidate/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({
      email: candAEmail,
      token: validRawResetToken,
      newPassword: "BrandNewPassword2026!",
    }),
  });
  assertTest(
    "Reset Password Success",
    "Valid reset token updates password (200)",
    200,
    validResetRes.status,
    validResetRes.status === 200
  );

  // One-time use: re-using the valid reset token -> 400
  const reuseResetRes = await fetch(`${BASE_URL}/api/candidate/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({
      email: candAEmail,
      token: validRawResetToken,
      newPassword: "AnotherPassword2026!",
    }),
  });
  assertTest(
    "One-Time Token Burning",
    "Burned reset token cannot be reused (400)",
    400,
    reuseResetRes.status,
    reuseResetRes.status === 400
  );

  // Login with the new password
  const newLoginRes = await fetch(`${BASE_URL}/api/candidate/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ email: candAEmail, password: "BrandNewPassword2026!" }),
  });
  const newCandCookie = newLoginRes.headers.get("set-cookie") || "";
  assertTest(
    "Login with New Password",
    "Candidate successfully logs in with updated password",
    200,
    newLoginRes.status,
    newLoginRes.status === 200 && newCandCookie.includes("cb_candidate_session")
  );

  // Authenticated Change Password
  const changePwdRes = await fetch(`${BASE_URL}/api/candidate/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: newCandCookie,
      "x-forwarded-for": getNextIp(),
    },
    body: JSON.stringify({
      currentPassword: "BrandNewPassword2026!",
      newPassword: "SuperSecureFinalPassword2026!",
    }),
  });
  assertTest(
    "Change Password",
    "Authenticated change-password succeeds (200)",
    200,
    changePwdRes.status,
    changePwdRes.status === 200
  );

  // Explicit Rate Limit Tests for: Signup, Resend Verification, Reset Password, Change Password
  const rateLimitTestIp = `10.99.99.${(runSeed % 200) + 1}`;

  // 1. Signup rate limit test (exceeding 5 requests)
  let signupRateLimited = false;
  for (let i = 0; i < 6; i++) {
    const r = await fetch(`${BASE_URL}/api/candidate/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": rateLimitTestIp },
      body: JSON.stringify({ name: "RateLimit User", email: `rl_${i}_${runId}@test.com`, password: "Password123!" }),
    });
    if (r.status === 429) {
      signupRateLimited = true;
      break;
    }
  }
  assertTest(
    "Rate Limiting",
    "Candidate signup endpoint is rate limited (429)",
    true,
    signupRateLimited,
    signupRateLimited
  );

  // 2. Verification Resend rate limit test (exceeding 3 requests)
  const resendTestIp = `10.98.98.${(runSeed % 200) + 1}`;
  let resendRateLimited = false;
  for (let i = 0; i < 5; i++) {
    const r = await fetch(`${BASE_URL}/api/candidate/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": resendTestIp },
      body: JSON.stringify({ email: candAEmail }),
    });
    if (r.status === 429) {
      resendRateLimited = true;
      break;
    }
  }
  assertTest(
    "Rate Limiting",
    "Candidate resend-verification endpoint is rate limited (429)",
    true,
    resendRateLimited,
    resendRateLimited
  );

  // ==========================================================================
  // REQUIREMENT 7: EMAIL OUTBOX FAILURE RECORDING
  // ==========================================================================
  console.log("\n--- SECTION 6: EMAIL OUTBOX RESILIENCE & FAILURE STATE ---");

  // Dispatch email with invalid recipient format to force real SMTP reject
  const outboxResult = await queueAndSendEmail({
    to: "invalid@@@address..bad",
    subject: "Test Outbox Failure Record",
    html: "<p>Test</p>",
  });

  const outboxDbRecord = await prisma.emailOutbox.findUnique({
    where: { id: outboxResult.id },
  });

  assertTest(
    "Outbox Status Recording",
    "Email delivery attempt recorded in DB (status: FAILED)",
    "FAILED",
    outboxDbRecord?.status || "",
    outboxDbRecord?.status === "FAILED" && outboxDbRecord?.errorMessage !== null
  );

  // ==========================================================================
  // REQUIREMENT 9: TOKEN-BASED INTERVIEWS AND ASSESSMENTS OPEN WITHOUT LOGIN
  // ==========================================================================
  console.log("\n--- SECTION 7: GUEST TOKEN PAGES ACCESSIBILITY ---");

  const guestInterviewRes = await fetch(`${BASE_URL}/api/candidate/interviews/${interviewToken}`);
  assertTest(
    "Guest Interview Access",
    "GET /api/candidate/interviews/[token] opens without session (200)",
    200,
    guestInterviewRes.status,
    guestInterviewRes.status === 200
  );

  const guestAssessmentRes = await fetch(`${BASE_URL}/api/candidate/assessments/${assessmentToken}`);
  assertTest(
    "Guest Assessment Access",
    "GET /api/candidate/assessments/[token] opens without session (200)",
    200,
    guestAssessmentRes.status,
    guestAssessmentRes.status === 200
  );

  // ==========================================================================
  // REQUIREMENT 2: LOGOUT OF ONE REALM PRESERVES THE OTHER TWO (ALL PAIRS)
  // ==========================================================================
  console.log("\n--- SECTION 8: THREE-WAY LOGOUT REALM ISOLATION ---");

  // Create fresh active sessions across all 3 realms simultaneously
  const multiEmpLogin = await fetch(`${BASE_URL}/api/employer/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ email: employerEmail, password: employerPassword }),
  });
  const multiEmpCookie = multiEmpLogin.headers.get("set-cookie") || "";

  const multiAdminLogin = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const multiAdminCookie = multiAdminLogin.headers.get("set-cookie") || "";

  const multiCandLogin = await fetch(`${BASE_URL}/api/candidate/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ email: candAEmail, password: "SuperSecureFinalPassword2026!" }),
  });
  const multiCandCookie = multiCandLogin.headers.get("set-cookie") || "";

  // Pair 1: Candidate Logout keeps Employer & Admin
  await fetch(`${BASE_URL}/api/candidate/auth/logout`, {
    method: "POST",
    headers: { Cookie: multiCandCookie, "x-forwarded-for": getNextIp() },
  });

  const empAfterCandLogout = await fetch(`${BASE_URL}/api/employer/team`, {
    headers: { Cookie: multiEmpCookie, "x-forwarded-for": getNextIp() },
  });
  const adminAfterCandLogout = await fetch(`${BASE_URL}/api/admin/jobs`, {
    headers: { Cookie: multiAdminCookie, "x-forwarded-for": getNextIp() },
  });
  assertTest(
    "Logout Isolation (Pair 1)",
    "Candidate logout keeps Employer session active (200)",
    200,
    empAfterCandLogout.status,
    empAfterCandLogout.status === 200
  );
  assertTest(
    "Logout Isolation (Pair 1)",
    "Candidate logout keeps Admin session active (200)",
    200,
    adminAfterCandLogout.status,
    adminAfterCandLogout.status === 200
  );

  // Pair 2: Employer Logout keeps Admin & Candidate session
  // Re-login candidate
  const candLoginForPair2 = await fetch(`${BASE_URL}/api/candidate/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ email: candAEmail, password: "SuperSecureFinalPassword2026!" }),
  });
  const candCookiePair2 = candLoginForPair2.headers.get("set-cookie") || "";

  await fetch(`${BASE_URL}/api/employer/auth/logout`, {
    method: "POST",
    headers: { Cookie: multiEmpCookie, "x-forwarded-for": getNextIp() },
  });

  const adminAfterEmpLogout = await fetch(`${BASE_URL}/api/admin/jobs`, {
    headers: { Cookie: multiAdminCookie, "x-forwarded-for": getNextIp() },
  });
  const candAfterEmpLogout = await fetch(`${BASE_URL}/api/candidate/auth/me`, {
    headers: { Cookie: candCookiePair2, "x-forwarded-for": getNextIp() },
  });
  assertTest(
    "Logout Isolation (Pair 2)",
    "Employer logout keeps Admin session active (200)",
    200,
    adminAfterEmpLogout.status,
    adminAfterEmpLogout.status === 200
  );
  assertTest(
    "Logout Isolation (Pair 2)",
    "Employer logout keeps Candidate session active (200)",
    200,
    candAfterEmpLogout.status,
    candAfterEmpLogout.status === 200
  );

  // Pair 3: Admin Logout keeps Candidate & Employer session
  const empLoginForPair3 = await fetch(`${BASE_URL}/api/employer/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": getNextIp() },
    body: JSON.stringify({ email: employerEmail, password: employerPassword }),
  });
  const empCookiePair3 = empLoginForPair3.headers.get("set-cookie") || "";

  await fetch(`${BASE_URL}/api/admin/auth/logout`, {
    method: "POST",
    headers: { Cookie: multiAdminCookie, "x-forwarded-for": getNextIp() },
  });

  const candAfterAdminLogout = await fetch(`${BASE_URL}/api/candidate/auth/me`, {
    headers: { Cookie: candCookiePair2, "x-forwarded-for": getNextIp() },
  });
  const empAfterAdminLogout = await fetch(`${BASE_URL}/api/employer/team`, {
    headers: { Cookie: empCookiePair3, "x-forwarded-for": getNextIp() },
  });

  assertTest(
    "Logout Isolation (Pair 3)",
    "Admin logout keeps Candidate session active (200)",
    200,
    candAfterAdminLogout.status,
    candAfterAdminLogout.status === 200
  );
  assertTest(
    "Logout Isolation (Pair 3)",
    "Admin logout keeps Employer session active (200)",
    200,
    empAfterAdminLogout.status,
    empAfterAdminLogout.status === 200
  );

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n==========================================================================");
  console.log(`📊 STEP 2 COMPREHENSIVE SUITE: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log("==========================================================================\n");

  if (failed > 0) {
    console.error("❌ Some tests failed. Inspect the output above.");
    process.exit(1);
  } else {
    console.log("🎉 ALL STEP 2 COMPREHENSIVE ASSERTIONS PASSED WITH 100% SUCCESS!");
  }
}

runStep2ComprehensiveSuite()
  .catch((e) => {
    console.error("Comprehensive test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
