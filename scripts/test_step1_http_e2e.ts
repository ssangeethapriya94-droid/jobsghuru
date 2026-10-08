import { db } from "../src/lib/db";
import { hashLegacyPassword, isBcryptHash } from "../src/lib/auth/password";
import { createEmployerSession } from "../src/lib/employer/auth";
import { createAdminSession } from "../src/lib/admin/auth";
import { UserRole, UserStatus } from "@prisma/client";
import { canPostJob, canSearchCandidates } from "../src/lib/employer/entitlements";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.TEST_BASE_URL || process.env.BASE_URL || "http://localhost:3000";

async function runComprehensiveVerification() {
  console.log("==========================================================================");
  console.log("CAREERBRIDGE STEP 1: COMPREHENSIVE HTTP-LEVEL E2E & REALM TEST SUITE");
  console.log("==========================================================================");

  let passed = 0;
  let failed = 0;

  function report(title: string, passedCondition: boolean, expected?: string, actual?: string) {
    if (passedCondition) {
      console.log(`  ✅ [PASS] ${title}${expected ? ` (Expected: ${expected} | Actual: ${actual})` : ""}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}${expected ? ` (Expected: ${expected} | Actual: ${actual})` : ""}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // 1. SETUP TENANTS & USERS
  // -------------------------------------------------------------------------
  const companyA = await db.company.upsert({
    where: { slug: "test-company-alpha-e2e" },
    update: { verified: true },
    create: {
      name: "Test Company Alpha E2E",
      slug: "test-company-alpha-e2e",
      industry: "Technology",
      size: "50-100",
      location: "Bangalore",
      description: "Test Company Alpha",
      verified: true,
    },
  });

  const companyB = await db.company.upsert({
    where: { slug: "test-company-beta-e2e" },
    update: { verified: true },
    create: {
      name: "Test Company Beta E2E",
      slug: "test-company-beta-e2e",
      industry: "Fintech",
      size: "20-50",
      location: "Mumbai",
      description: "Test Company Beta",
      verified: true,
    },
  });

  const rawTestPass = "Step1SecurePass2026!";
  const legacyHash = hashLegacyPassword(rawTestPass);

  const adminUser = await db.user.upsert({
    where: { email: "platform_super_admin@careerbridge.io" },
    update: { role: UserRole.SUPER_ADMIN, status: UserStatus.ACTIVE },
    create: {
      email: "platform_super_admin@careerbridge.io",
      name: "Super Admin Platform",
      passwordHash: legacyHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const compA_Admin = await db.user.upsert({
    where: { email: "admin_e2e@alpha.io" },
    update: { companyId: companyA.id, role: UserRole.COMPANY_ADMIN, status: UserStatus.ACTIVE },
    create: {
      email: "admin_e2e@alpha.io",
      name: "Alpha Admin",
      passwordHash: legacyHash,
      role: UserRole.COMPANY_ADMIN,
      status: UserStatus.ACTIVE,
      companyId: companyA.id,
    },
  });

  const compA_Recruiter = await db.user.upsert({
    where: { email: "recruiter_e2e@alpha.io" },
    update: { companyId: companyA.id, role: UserRole.RECRUITER, status: UserStatus.ACTIVE },
    create: {
      email: "recruiter_e2e@alpha.io",
      name: "Alpha Recruiter",
      passwordHash: legacyHash,
      role: UserRole.RECRUITER,
      status: UserStatus.ACTIVE,
      companyId: companyA.id,
    },
  });

  const compA_HiringManager = await db.user.upsert({
    where: { email: "manager_e2e@alpha.io" },
    update: { companyId: companyA.id, role: UserRole.HIRING_MANAGER, status: UserStatus.ACTIVE },
    create: {
      email: "manager_e2e@alpha.io",
      name: "Alpha Manager",
      passwordHash: legacyHash,
      role: UserRole.HIRING_MANAGER,
      status: UserStatus.ACTIVE,
      companyId: companyA.id,
    },
  });

  const compA_Interviewer = await db.user.upsert({
    where: { email: "interviewer_e2e@alpha.io" },
    update: { companyId: companyA.id, role: UserRole.INTERVIEWER, status: UserStatus.ACTIVE },
    create: {
      email: "interviewer_e2e@alpha.io",
      name: "Alpha Interviewer",
      passwordHash: legacyHash,
      role: UserRole.INTERVIEWER,
      status: UserStatus.ACTIVE,
      companyId: companyA.id,
    },
  });

  const compB_Admin = await db.user.upsert({
    where: { email: "admin_e2e@beta.io" },
    update: { companyId: companyB.id, role: UserRole.COMPANY_ADMIN, status: UserStatus.ACTIVE },
    create: {
      email: "admin_e2e@beta.io",
      name: "Beta Admin",
      passwordHash: legacyHash,
      role: UserRole.COMPANY_ADMIN,
      status: UserStatus.ACTIVE,
      companyId: companyB.id,
    },
  });

  // Create real sessions
  const adminToken = await createAdminSession(adminUser.id, "127.0.0.1", "HTTP-E2E-Runner");
  const compA_AdminToken = await createEmployerSession(compA_Admin.id, "127.0.0.1", "HTTP-E2E-Runner");
  const compA_RecruiterToken = await createEmployerSession(compA_Recruiter.id, "127.0.0.1", "HTTP-E2E-Runner");
  const compA_ManagerToken = await createEmployerSession(compA_HiringManager.id, "127.0.0.1", "HTTP-E2E-Runner");
  const compA_InterviewerToken = await createEmployerSession(compA_Interviewer.id, "127.0.0.1", "HTTP-E2E-Runner");
  const compB_AdminToken = await createEmployerSession(compB_Admin.id, "127.0.0.1", "HTTP-E2E-Runner");

  const employerCookie = (token: string) => ({ Cookie: `cb_employer_session=${token}` });
  const adminCookie = (token: string) => ({ Cookie: `cb_admin_session=${token}` });

  // -------------------------------------------------------------------------
  // SEED PRIMARY JOBS & APPLICATIONS FOR TESTS
  // -------------------------------------------------------------------------
  const jobA = await db.job.create({
    data: {
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "Bangalore",
      workMode: "REMOTE",
      jobType: "FULL_TIME",
      description: "Company A Primary Job",
      companyId: companyA.id,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });

  const appA_Assigned = await db.application.create({
    data: {
      jobId: jobA.id,
      candidateName: "Assigned Candidate Alpha",
      candidateEmail: "assigned.cand@alpha.io",
      candidatePhone: "9999990001",
      status: "INTERVIEW_SCHEDULED",
    },
  });

  const appA_Unassigned = await db.application.create({
    data: {
      jobId: jobA.id,
      candidateName: "Unassigned Candidate Alpha",
      candidateEmail: "unassigned.cand@alpha.io",
      candidatePhone: "9999990002",
      status: "SUBMITTED",
    },
  });

  const invA_Assigned = await db.interview.create({
    data: {
      companyId: companyA.id,
      jobId: jobA.id,
      applicationId: appA_Assigned.id,
      candidateName: appA_Assigned.candidateName,
      candidateEmail: appA_Assigned.candidateEmail,
      title: "Technical Round with Assigned Interviewer",
      interviewerId: compA_Interviewer.id,
      scheduledAt: new Date(Date.now() + 3600000),
      durationMinutes: 45,
      mode: "VIDEO",
      secureToken: "tok_assigned_" + Date.now(),
      status: "SCHEDULED",
      participants: {
        create: [{
          userId: compA_Interviewer.id,
          name: compA_Interviewer.name,
          email: compA_Interviewer.email,
          roleTitle: "Lead Interviewer",
        }],
      },
    },
  });

  const invA_Unassigned = await db.interview.create({
    data: {
      companyId: companyA.id,
      jobId: jobA.id,
      applicationId: appA_Unassigned.id,
      candidateName: appA_Unassigned.candidateName,
      candidateEmail: appA_Unassigned.candidateEmail,
      title: "Managerial Round with Hiring Manager",
      interviewerId: compA_HiringManager.id,
      scheduledAt: new Date(Date.now() + 7200000),
      durationMinutes: 45,
      mode: "VIDEO",
      secureToken: "tok_unassigned_" + Date.now(),
      status: "SCHEDULED",
      participants: {
        create: [{
          userId: compA_HiringManager.id,
          name: compA_HiringManager.name,
          email: compA_HiringManager.email,
          roleTitle: "Hiring Manager",
        }],
      },
    },
  });

  // =========================================================================
  // SECTION 1: ROLE MATRIX RBAC TESTS
  // =========================================================================
  console.log("\n1. ROLE MATRIX RBAC TESTS (COMPANY_ADMIN, RECRUITER, HIRING_MANAGER, INTERVIEWER)");

  const teamAdminGet = await fetch(`${BASE_URL}/api/employer/team`, { headers: employerCookie(compA_AdminToken) });
  report("COMPANY_ADMIN accesses GET /api/employer/team", teamAdminGet.status === 200, "200", String(teamAdminGet.status));

  const teamRecruiterPost = await fetch(`${BASE_URL}/api/employer/team`, {
    method: "POST",
    headers: { ...employerCookie(compA_RecruiterToken), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Unauthorized Member", email: "unauth@alpha.io", role: "INTERVIEWER" }),
  });
  report("RECRUITER blocked from POST /api/employer/team", teamRecruiterPost.status === 403, "403", String(teamRecruiterPost.status));

  const teamInterviewerPost = await fetch(`${BASE_URL}/api/employer/team`, {
    method: "POST",
    headers: { ...employerCookie(compA_InterviewerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Unauthorized Member", email: "unauth2@alpha.io", role: "INTERVIEWER" }),
  });
  report("INTERVIEWER blocked from POST /api/employer/team", teamInterviewerPost.status === 403, "403", String(teamInterviewerPost.status));

  const compSettingsAdmin = await fetch(`${BASE_URL}/api/employer/company`, { headers: employerCookie(compA_AdminToken) });
  report("COMPANY_ADMIN accesses GET /api/employer/company", compSettingsAdmin.status === 200, "200", String(compSettingsAdmin.status));

  const compSettingsRecruiter = await fetch(`${BASE_URL}/api/employer/company`, {
    method: "PATCH",
    headers: { ...employerCookie(compA_RecruiterToken), "Content-Type": "application/json" },
    body: JSON.stringify({ description: "Unauthorized Edit" }),
  });
  report("RECRUITER blocked from PATCH /api/employer/company (403)", compSettingsRecruiter.status === 403, "403", String(compSettingsRecruiter.status));

  // 1.1 Pipelines RBAC (POST/PATCH/DELETE -> COMPANY_ADMIN, RECRUITER only)
  const pipePostAdmin = await fetch(`${BASE_URL}/api/employer/pipelines`, {
    method: "POST",
    headers: { ...employerCookie(compA_AdminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Admin Pipeline" }),
  });
  report("COMPANY_ADMIN can create pipeline (200)", pipePostAdmin.status === 200, "200", String(pipePostAdmin.status));

  const pipePostRec = await fetch(`${BASE_URL}/api/employer/pipelines`, {
    method: "POST",
    headers: { ...employerCookie(compA_RecruiterToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Recruiter Pipeline" }),
  });
  report("RECRUITER can create pipeline (200)", pipePostRec.status === 200, "200", String(pipePostRec.status));

  const pipePostHM = await fetch(`${BASE_URL}/api/employer/pipelines`, {
    method: "POST",
    headers: { ...employerCookie(compA_ManagerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "HM Pipeline" }),
  });
  report("HIRING_MANAGER blocked from create pipeline (403)", pipePostHM.status === 403, "403", String(pipePostHM.status));

  const pipePostInt = await fetch(`${BASE_URL}/api/employer/pipelines`, {
    method: "POST",
    headers: { ...employerCookie(compA_InterviewerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Interviewer Pipeline" }),
  });
  report("INTERVIEWER blocked from create pipeline (403)", pipePostInt.status === 403, "403", String(pipePostInt.status));

  // 1.2 Jobs PATCH RBAC (COMPANY_ADMIN, RECRUITER only)
  const jobPatchHM = await fetch(`${BASE_URL}/api/employer/jobs/${jobA.id}`, {
    method: "PATCH",
    headers: { ...employerCookie(compA_ManagerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "HM Edit Job" }),
  });
  report("HIRING_MANAGER blocked from PATCH /api/employer/jobs/[id] (403)", jobPatchHM.status === 403, "403", String(jobPatchHM.status));

  // 1.3 Jobs Duplicate RBAC (COMPANY_ADMIN, RECRUITER only)
  const jobDupHM = await fetch(`${BASE_URL}/api/employer/jobs/${jobA.id}/duplicate`, {
    method: "POST",
    headers: { ...employerCookie(compA_ManagerToken), "Content-Type": "application/json" },
  });
  report("HIRING_MANAGER blocked from job duplicate (403)", jobDupHM.status === 403, "403", String(jobDupHM.status));

  // 1.4 Applications DELETE RBAC (COMPANY_ADMIN only)
  const appDelRec = await fetch(`${BASE_URL}/api/employer/applications/${appA_Unassigned.id}`, {
    method: "DELETE",
    headers: employerCookie(compA_RecruiterToken),
  });
  report("RECRUITER blocked from DELETE application (403)", appDelRec.status === 403, "403", String(appDelRec.status));

  // 1.5 Audit & Billing (COMPANY_ADMIN only)
  const auditRec = await fetch(`${BASE_URL}/api/employer/audit`, { headers: employerCookie(compA_RecruiterToken) });
  report("RECRUITER blocked from GET /api/employer/audit (403)", auditRec.status === 403, "403", String(auditRec.status));

  const billRec = await fetch(`${BASE_URL}/api/employer/billing`, { headers: employerCookie(compA_RecruiterToken) });
  report("RECRUITER blocked from GET /api/employer/billing (403)", billRec.status === 403, "403", String(billRec.status));

  // 1.6 Notes (COMPANY_ADMIN, RECRUITER, HM allowed, INTERVIEWER blocked)
  const noteHM = await fetch(`${BASE_URL}/api/employer/applications/${appA_Assigned.id}/notes`, {
    method: "POST",
    headers: { ...employerCookie(compA_ManagerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ content: "HM Note on candidate" }),
  });
  report("HIRING_MANAGER can add notes (200)", noteHM.status === 200, "200", String(noteHM.status));

  const noteInt = await fetch(`${BASE_URL}/api/employer/applications/${appA_Assigned.id}/notes`, {
    method: "POST",
    headers: { ...employerCookie(compA_InterviewerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ content: "Interviewer illegal note" }),
  });
  report("INTERVIEWER blocked from adding notes (403)", noteInt.status === 403, "403", String(noteInt.status));

  // 1.7 Candidate Search (COMPANY_ADMIN, RECRUITER allowed, HM & INTERVIEWER blocked)
  const searchHM = await fetch(`${BASE_URL}/api/employer/candidates/search`, {
    method: "POST",
    headers: { ...employerCookie(compA_ManagerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ skills: "React" }),
  });
  report("HIRING_MANAGER blocked from candidate search (403)", searchHM.status === 403, "403", String(searchHM.status));

  const searchInt = await fetch(`${BASE_URL}/api/employer/candidates/search`, {
    method: "POST",
    headers: { ...employerCookie(compA_InterviewerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ skills: "React" }),
  });
  report("INTERVIEWER blocked from candidate search (403)", searchInt.status === 403, "403", String(searchInt.status));

  // 1.8 Dashboard Stats (INTERVIEWER blocked)
  const statsInt = await fetch(`${BASE_URL}/api/employer/dashboard/stats`, { headers: employerCookie(compA_InterviewerToken) });
  report("INTERVIEWER blocked from GET /api/employer/dashboard/stats (403)", statsInt.status === 403, "403", String(statsInt.status));

  // 1.9 Offers GET (INTERVIEWER blocked)
  const offersInt = await fetch(`${BASE_URL}/api/employer/offers`, { headers: employerCookie(compA_InterviewerToken) });
  report("INTERVIEWER blocked from GET /api/employer/offers (403)", offersInt.status === 403, "403", String(offersInt.status));

  // =========================================================================
  // SECTION 2: INTERVIEWER SCOPE FOR APPLICATIONS AND JOBS
  // =========================================================================
  console.log("\n2. INTERVIEWER SCOPE TESTS (GET /api/employer/applications & GET /api/employer/jobs)");

  // 2.1 Interviewer Applications list: ONLY candidates where interviewer participates
  const interviewerAppsRes = await fetch(`${BASE_URL}/api/employer/applications`, { headers: employerCookie(compA_InterviewerToken) });
  report("INTERVIEWER can fetch GET /api/employer/applications (200)", interviewerAppsRes.status === 200, "200", String(interviewerAppsRes.status));

  const interviewerAppsData = await interviewerAppsRes.json();
  const visibleAppIds = (interviewerAppsData.applications || []).map((a: any) => a.id);
  const includesAssigned = visibleAppIds.includes(appA_Assigned.id);
  const includesUnassigned = visibleAppIds.includes(appA_Unassigned.id);

  report("INTERVIEWER sees assigned candidate application in listing", includesAssigned, "true", String(includesAssigned));
  report("INTERVIEWER CANNOT see unassigned candidate in applications listing", !includesUnassigned, "true", String(!includesUnassigned));

  // 2.2 Interviewer Detail View
  const interviewerGetAssignedApp = await fetch(`${BASE_URL}/api/employer/applications/${appA_Assigned.id}`, { headers: employerCookie(compA_InterviewerToken) });
  report("INTERVIEWER can view assigned candidate detail (200)", interviewerGetAssignedApp.status === 200, "200", String(interviewerGetAssignedApp.status));

  const interviewerGetUnassignedApp = await fetch(`${BASE_URL}/api/employer/applications/${appA_Unassigned.id}`, { headers: employerCookie(compA_InterviewerToken) });
  report("INTERVIEWER receives 403 when requesting unassigned candidate detail", interviewerGetUnassignedApp.status === 403, "403", String(interviewerGetUnassignedApp.status));

  // 2.3 Interviewer Jobs listing: returns active company jobs
  const interviewerJobsRes = await fetch(`${BASE_URL}/api/employer/jobs`, { headers: employerCookie(compA_InterviewerToken) });
  report("INTERVIEWER accesses GET /api/employer/jobs cleanly (200)", interviewerJobsRes.status === 200, "200", String(interviewerJobsRes.status));

  // =========================================================================
  // SECTION 3: PLAN LIMITS OVER HTTP (POST /api/employer/jobs & candidate search)
  // =========================================================================
  console.log("\n3. HTTP PLAN LIMIT ENFORCEMENT (Job Postings & Candidate Search)");

  const limitedCompany = await db.company.create({
    data: {
      name: "Quota Test Company " + Date.now(),
      slug: "quota-test-company-" + Date.now(),
      industry: "Retail",
      size: "10-50",
      location: "Bangalore",
      description: "Quota Test Description",
      verified: true,
    },
  });

  const limitedAdmin = await db.user.create({
    data: {
      email: "quota_admin_" + Date.now() + "@quota.io",
      name: "Quota Admin",
      passwordHash: legacyHash,
      role: UserRole.COMPANY_ADMIN,
      status: UserStatus.ACTIVE,
      companyId: limitedCompany.id,
    },
  });
  const limitedAdminToken = await createEmployerSession(limitedAdmin.id);

  // Set up 1-job limit plan subscription
  const starterPlanLimit1 = await db.plan.upsert({
    where: { name: "Test Starter Limit 1" },
    update: { jobLimit: 1 },
    create: {
      name: "Test Starter Limit 1",
      type: "EMPLOYER",
      priceInr: 0,
      billingCycle: "MONTHLY",
      jobLimit: 1,
      resumeLimit: 50,
      features: ["1 Active Job"],
    },
  });

  await db.subscription.create({
    data: {
      companyId: limitedCompany.id,
      planId: starterPlanLimit1.id,
      status: "ACTIVE",
      currentStart: new Date(),
      currentEnd: new Date(Date.now() + 30 * 86400000),
    },
  });

  // Create 1 job to consume limit
  await db.job.create({
    data: {
      title: "Saturating Job",
      department: "Marketing",
      location: "Bangalore",
      workMode: "HYBRID",
      jobType: "FULL_TIME",
      description: "First Active Job",
      companyId: limitedCompany.id,
      status: "PUBLISHED",
      expiresAt: new Date(Date.now() + 86400000),
    },
  });

  // Attempt to create second job over HTTP POST /api/employer/jobs -> Expect 403
  const overLimitJobRes = await fetch(`${BASE_URL}/api/employer/jobs`, {
    method: "POST",
    headers: { ...employerCookie(limitedAdminToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Second Job Exceeding Limit",
      department: "Marketing",
      location: "Bangalore",
      workMode: "REMOTE",
      jobType: "FULL_TIME",
      description: "This should fail",
    }),
  });
  report("HTTP POST /api/employer/jobs returns 403 when plan limit reached", overLimitJobRes.status === 403, "403", String(overLimitJobRes.status));

  // Exhaust candidate search credits
  const currentMonth = new Date().toISOString().slice(0, 7);
  await db.candidateSearchCredit.upsert({
    where: { companyId_month: { companyId: limitedCompany.id, month: currentMonth } },
    update: { total: 50, used: 50 },
    create: { companyId: limitedCompany.id, month: currentMonth, total: 50, used: 50 },
  });

  const overLimitSearchRes = await fetch(`${BASE_URL}/api/employer/candidates/search`, {
    method: "POST",
    headers: { ...employerCookie(limitedAdminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ query: "Software Engineer", skills: ["React"] }),
  });
  report("HTTP POST /api/employer/candidates/search returns 403 when credits exhausted", overLimitSearchRes.status === 403, "403", String(overLimitSearchRes.status));

  // Clean up limited company
  await db.job.deleteMany({ where: { companyId: limitedCompany.id } }).catch(() => {});
  await db.subscription.deleteMany({ where: { companyId: limitedCompany.id } }).catch(() => {});
  await db.candidateSearchCredit.deleteMany({ where: { companyId: limitedCompany.id } }).catch(() => {});
  await db.user.delete({ where: { id: limitedAdmin.id } }).catch(() => {});
  await db.company.delete({ where: { id: limitedCompany.id } }).catch(() => {});

  // =========================================================================
  // SECTION 4: COMPANY A VS COMPANY B ISOLATION ON ALL RESOURCES
  // =========================================================================
  console.log("\n4. TENANT ISOLATION TESTS (Company A vs Company B GET/PATCH -> 404/403)");

  // Seed Company B resources
  const jobB = await db.job.create({
    data: {
      title: "Confidential Lead at Beta",
      department: "Product",
      location: "Mumbai",
      workMode: "ONSITE",
      jobType: "FULL_TIME",
      description: "Company B Job",
      companyId: companyB.id,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });

  const appB = await db.application.create({
    data: {
      jobId: jobB.id,
      candidateName: "Candidate Beta",
      candidateEmail: "cand@beta.io",
      candidatePhone: "9876540000",
      status: "INTERVIEW_SCHEDULED",
    },
  });

  const invB = await db.interview.create({
    data: {
      companyId: companyB.id,
      jobId: jobB.id,
      applicationId: appB.id,
      candidateName: appB.candidateName,
      candidateEmail: appB.candidateEmail,
      title: "Beta Technical Round",
      scheduledAt: new Date(Date.now() + 3600000),
      durationMinutes: 45,
      mode: "VIDEO",
      secureToken: "sec_tok_beta_" + Date.now(),
      status: "SCHEDULED",
    },
  });

  const assessB = await db.assessment.create({
    data: {
      companyId: companyB.id,
      title: "Beta Python Assessment",
      description: "Confidential Beta test",
      skills: ["Python", "Django"],
      durationMinutes: 45,
      passingScore: 75,
    },
  });

  const offerB = await db.offer.create({
    data: {
      companyId: companyB.id,
      applicationId: appB.id,
      jobId: jobB.id,
      candidateName: appB.candidateName,
      candidateEmail: appB.candidateEmail,
      roleTitle: "Lead Architect",
      baseSalaryLpa: 45,
      currency: "INR",
      startDate: new Date(Date.now() + 86400000 * 30),
      expiryDate: new Date(Date.now() + 86400000 * 7),
      status: "DRAFT",
    },
  });

  // 4.1 Jobs Isolation
  const compAGetJobB = await fetch(`${BASE_URL}/api/employer/jobs/${jobB.id}`, { headers: employerCookie(compA_AdminToken) });
  report("Company A receives 404 on GET /api/employer/jobs/[CompanyB_JobId]", compAGetJobB.status === 404, "404", String(compAGetJobB.status));

  const compAPatchJobB = await fetch(`${BASE_URL}/api/employer/jobs/${jobB.id}`, {
    method: "PATCH",
    headers: { ...employerCookie(compA_AdminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Renamed by Comp A" }),
  });
  report("Company A receives 404 on PATCH /api/employer/jobs/[CompanyB_JobId]", compAPatchJobB.status === 404, "404", String(compAPatchJobB.status));

  // 4.2 Applications Isolation
  const compAGetAppB = await fetch(`${BASE_URL}/api/employer/applications/${appB.id}`, { headers: employerCookie(compA_AdminToken) });
  report("Company A receives 404 on GET /api/employer/applications/[CompanyB_AppId]", compAGetAppB.status === 404, "404", String(compAGetAppB.status));

  const compAPatchAppB = await fetch(`${BASE_URL}/api/employer/applications/${appB.id}`, {
    method: "PATCH",
    headers: { ...employerCookie(compA_AdminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ status: "REJECTED" }),
  });
  report("Company A receives 404 on PATCH /api/employer/applications/[CompanyB_AppId]", compAPatchAppB.status === 404, "404", String(compAPatchAppB.status));

  // 4.3 Interviews Isolation
  const compAGetInvB = await fetch(`${BASE_URL}/api/employer/interviews/${invB.id}`, { headers: employerCookie(compA_AdminToken) });
  report("Company A receives 404 on GET /api/employer/interviews/[CompanyB_InvId]", compAGetInvB.status === 404, "404", String(compAGetInvB.status));

  const compAPatchInvB = await fetch(`${BASE_URL}/api/employer/interviews/${invB.id}`, {
    method: "PATCH",
    headers: { ...employerCookie(compA_AdminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ notes: "Comp A note" }),
  });
  report("Company A receives 404 on PATCH /api/employer/interviews/[CompanyB_InvId]", compAPatchInvB.status === 404, "404", String(compAPatchInvB.status));

  // 4.4 Assessments Isolation
  const compAGetAssessB = await fetch(`${BASE_URL}/api/employer/assessments/${assessB.id}`, { headers: employerCookie(compA_AdminToken) });
  report("Company A receives 404 on GET /api/employer/assessments/[CompanyB_AssessId]", compAGetAssessB.status === 404, "404", String(compAGetAssessB.status));

  const compAPatchAssessB = await fetch(`${BASE_URL}/api/employer/assessments/${assessB.id}`, {
    method: "PATCH",
    headers: { ...employerCookie(compA_AdminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Comp A Hijacked Assessment" }),
  });
  report("Company A receives 404 on PATCH /api/employer/assessments/[CompanyB_AssessId]", compAPatchAssessB.status === 404, "404", String(compAPatchAssessB.status));

  // 4.5 Offers Isolation
  const compAGetOfferB = await fetch(`${BASE_URL}/api/employer/offers/${offerB.id}`, { headers: employerCookie(compA_AdminToken) });
  report("Company A receives 404 on GET /api/employer/offers/[CompanyB_OfferId]", compAGetOfferB.status === 404, "404", String(compAGetOfferB.status));

  const compAPatchOfferB = await fetch(`${BASE_URL}/api/employer/offers/${offerB.id}`, {
    method: "PATCH",
    headers: { ...employerCookie(compA_AdminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ baseSalaryLpa: 100 }),
  });
  report("Company A receives 404 on PATCH /api/employer/offers/[CompanyB_OfferId]", compAPatchOfferB.status === 404, "404", String(compAPatchOfferB.status));

  // Clean up Company B test data
  await db.offer.delete({ where: { id: offerB.id } }).catch(() => {});
  await db.assessment.delete({ where: { id: assessB.id } }).catch(() => {});
  await db.interview.delete({ where: { id: invB.id } }).catch(() => {});
  await db.application.delete({ where: { id: appB.id } }).catch(() => {});
  await db.job.delete({ where: { id: jobB.id } }).catch(() => {});

  // =========================================================================
  // SECTION 5: WRITE-ACTION ROLE TESTS (HIRING_MANAGER vs INTERVIEWER)
  // =========================================================================
  console.log("\n5. WRITE-ACTION ROLE TESTS (HIRING_MANAGER vs INTERVIEWER)");

  // 5.1 Create a Job
  const hmCreateJob = await fetch(`${BASE_URL}/api/employer/jobs`, {
    method: "POST",
    headers: { ...employerCookie(compA_ManagerToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "QA Engineer (Posted by HM)",
      department: "QA",
      location: "Bangalore",
      workMode: "REMOTE",
      jobType: "FULL_TIME",
      description: "HM Job Requisition",
    }),
  });
  report("HIRING_MANAGER can create a job (200)", hmCreateJob.status === 200, "200", String(hmCreateJob.status));

  const intCreateJob = await fetch(`${BASE_URL}/api/employer/jobs`, {
    method: "POST",
    headers: { ...employerCookie(compA_InterviewerToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Unauthorized Job by Interviewer",
      department: "Engineering",
      location: "Bangalore",
      workMode: "REMOTE",
      jobType: "FULL_TIME",
      description: "Interviewer Job Requisition",
    }),
  });
  report("INTERVIEWER blocked from creating a job (403)", intCreateJob.status === 403, "403", String(intCreateJob.status));

  // 5.2 Shortlist Candidate
  const hmShortlist = await fetch(`${BASE_URL}/api/employer/interviews/${invA_Assigned.id}/shortlist`, {
    method: "POST",
    headers: { ...employerCookie(compA_ManagerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ notes: "Shortlisted by HM" }),
  });
  report("HIRING_MANAGER can shortlist candidate (200)", hmShortlist.status === 200, "200", String(hmShortlist.status));

  const intShortlist = await fetch(`${BASE_URL}/api/employer/interviews/${invA_Assigned.id}/shortlist`, {
    method: "POST",
    headers: { ...employerCookie(compA_InterviewerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ notes: "Shortlisted by Interviewer" }),
  });
  report("INTERVIEWER blocked from shortlisting candidate (403)", intShortlist.status === 403, "403", String(intShortlist.status));

  // 5.3 Reject Candidate
  const hmReject = await fetch(`${BASE_URL}/api/employer/interviews/${invA_Assigned.id}/reject`, {
    method: "POST",
    headers: { ...employerCookie(compA_ManagerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "HM Rejection decision" }),
  });
  report("HIRING_MANAGER can reject candidate (200)", hmReject.status === 200, "200", String(hmReject.status));

  const intReject = await fetch(`${BASE_URL}/api/employer/interviews/${invA_Assigned.id}/reject`, {
    method: "POST",
    headers: { ...employerCookie(compA_InterviewerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "Interviewer Rejection attempt" }),
  });
  report("INTERVIEWER blocked from rejecting candidate (403)", intReject.status === 403, "403", String(intReject.status));

  // 5.4 Offer Permissions: RECRUITER creates, HM reviews/approves, INTERVIEWER blocked
  const recCreateOffer = await fetch(`${BASE_URL}/api/employer/offers`, {
    method: "POST",
    headers: { ...employerCookie(compA_RecruiterToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      applicationId: appA_Assigned.id,
      jobId: jobA.id,
      candidateName: appA_Assigned.candidateName,
      candidateEmail: appA_Assigned.candidateEmail,
      roleTitle: "Senior Engineer",
      baseSalaryLpa: 24,
      startDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    }),
  });
  report("RECRUITER can create/draft an offer (200)", recCreateOffer.status === 200, "200", String(recCreateOffer.status));
  const recOfferData = await recCreateOffer.json();
  const createdOfferId = recOfferData.offer?.id;

  const hmCreateOffer = await fetch(`${BASE_URL}/api/employer/offers`, {
    method: "POST",
    headers: { ...employerCookie(compA_ManagerToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      applicationId: appA_Assigned.id,
      jobId: jobA.id,
      candidateName: appA_Assigned.candidateName,
      candidateEmail: appA_Assigned.candidateEmail,
      roleTitle: "Senior Engineer",
      baseSalaryLpa: 24,
      startDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    }),
  });
  report("HIRING_MANAGER blocked from creating offer (403)", hmCreateOffer.status === 403, "403", String(hmCreateOffer.status));

  const hmApproveOffer = await fetch(`${BASE_URL}/api/employer/offers/${createdOfferId}`, {
    method: "PATCH",
    headers: { ...employerCookie(compA_ManagerToken), "Content-Type": "application/json" },
    body: JSON.stringify({ status: "SENT" }),
  });
  report("HIRING_MANAGER can view/approve an offer (200)", hmApproveOffer.status === 200, "200", String(hmApproveOffer.status));

  const intCreateOffer = await fetch(`${BASE_URL}/api/employer/offers`, {
    method: "POST",
    headers: { ...employerCookie(compA_InterviewerToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      applicationId: appA_Assigned.id,
      jobId: jobA.id,
      candidateName: appA_Assigned.candidateName,
      candidateEmail: appA_Assigned.candidateEmail,
      roleTitle: "Senior Engineer",
      baseSalaryLpa: 24,
      startDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    }),
  });
  report("INTERVIEWER blocked from creating an offer (403)", intCreateOffer.status === 403, "403", String(intCreateOffer.status));

  // 5.5 Create / Modify Assessment
  const hmCreateAssessment = await fetch(`${BASE_URL}/api/employer/assessments`, {
    method: "POST",
    headers: { ...employerCookie(compA_ManagerToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "QA Automation Assessment",
      description: "HM Created test",
      skills: ["Playwright", "Jest"],
      durationMinutes: 30,
      passingScore: 70,
    }),
  });
  report("HIRING_MANAGER can create/assign an assessment (200/201)", hmCreateAssessment.status === 200 || hmCreateAssessment.status === 201, "200/201", String(hmCreateAssessment.status));

  const intCreateAssessment = await fetch(`${BASE_URL}/api/employer/assessments`, {
    method: "POST",
    headers: { ...employerCookie(compA_InterviewerToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Interviewer Assessment Attempt",
      skills: ["Java"],
    }),
  });
  report("INTERVIEWER blocked from creating/modifying assessments (403)", intCreateAssessment.status === 403, "403", String(intCreateAssessment.status));

  // =========================================================================
  // SECTION 6: ADMIN LOGOUT PRESERVES EMPLOYER SESSION
  // =========================================================================
  console.log("\n6. ADMIN LOGOUT PRESERVES EMPLOYER SESSION");

  const tempAdminToken = await createAdminSession(adminUser.id, "127.0.0.1", "AdminLogoutTester");
  const tempEmployerToken = await createEmployerSession(compA_Admin.id, "127.0.0.1", "EmployerSessionKeeper");

  // Call admin logout
  const adminLogoutRes = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
    method: "POST",
    headers: { Cookie: `cb_admin_session=${tempAdminToken}` },
  });
  report("Admin logout succeeds (200)", adminLogoutRes.status === 200, "200", String(adminLogoutRes.status));

  // Check admin session is now invalid (401)
  const adminCheckAfterLogout = await fetch(`${BASE_URL}/api/admin/jobs`, { headers: { Cookie: `cb_admin_session=${tempAdminToken}` } });
  report("Admin session invalidated after logout (401)", adminCheckAfterLogout.status === 401, "401", String(adminCheckAfterLogout.status));

  // Verify employer session is still valid and functioning (200)
  const employerCheckAfterAdminLogout = await fetch(`${BASE_URL}/api/employer/jobs`, { headers: { Cookie: `cb_employer_session=${tempEmployerToken}` } });
  report("Employer session remains active after admin logout (200)", employerCheckAfterAdminLogout.status === 200, "200", String(employerCheckAfterAdminLogout.status));

  // Clean up test sessions
  await db.adminSession.deleteMany({ where: { token: { in: [tempAdminToken, tempEmployerToken] } } }).catch(() => {});

  // =========================================================================
  // SECTION 7: ENVIRONMENT HYGIENE & BRAND VERIFICATION
  // =========================================================================
  console.log("\n7. ENVIRONMENT HYGIENE & BRAND CHECKS");

  const envContent = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
  const smtpFromMatch = envContent.match(/SMTP_FROM=["']?([^"'\r\n]+)["']?/);
  const smtpFromValue = smtpFromMatch ? smtpFromMatch[1] : "";
  const usesCareerBridgeBrand = smtpFromValue.includes("CareerBridge") && smtpFromValue.includes("ivywind2003@gmail.com");
  report("SMTP_FROM uses CareerBridge brand name and ivywind2003@gmail.com", usesCareerBridgeBrand, "true", String(usesCareerBridgeBrand));

  const gitignoreContent = fs.readFileSync(path.join(process.cwd(), ".gitignore"), "utf-8");
  const gitignoreHasEnv = gitignoreContent.includes(".env");
  report(".env is registered in .gitignore", gitignoreHasEnv, "true", String(gitignoreHasEnv));

  const envExampleExists = fs.existsSync(path.join(process.cwd(), ".env.example"));
  report(".env.example template file exists", envExampleExists, "true", String(envExampleExists));

  // -------------------------------------------------------------------------
  // CLEANUP PRIMARY TEST DATA
  // -------------------------------------------------------------------------
  await db.interviewParticipant.deleteMany({ where: { interview: { companyId: companyA.id } } }).catch(() => {});
  await db.interview.deleteMany({ where: { companyId: companyA.id } }).catch(() => {});
  await db.offer.deleteMany({ where: { companyId: companyA.id } }).catch(() => {});
  await db.assessment.deleteMany({ where: { companyId: companyA.id } }).catch(() => {});
  await db.applicationEvent.deleteMany({ where: { application: { job: { companyId: companyA.id } } } }).catch(() => {});
  await db.application.deleteMany({ where: { job: { companyId: companyA.id } } }).catch(() => {});
  await db.job.deleteMany({ where: { companyId: companyA.id } }).catch(() => {});

  console.log("\n==========================================================================");
  console.log(`STEP 1 E2E INTEGRATION SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================================");
}

runComprehensiveVerification()
  .catch(console.error)
  .finally(() => db.$disconnect());
