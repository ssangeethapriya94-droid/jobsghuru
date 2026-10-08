import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const storageDir = path.join(process.cwd(), "storage", "resumes");
const testResumePath = path.join(storageDir, "Rohan_Resume_A.pdf");

async function main() {
  console.log("================================================================================");
  console.log("             STEP 4 CANDIDATE 360 COMPLETE VERIFICATION SUITE                  ");
  console.log("  (12 Original Step 4 Assertions + 17 Interactive Action & Scope Tests = 29 Total) ");
  console.log("================================================================================");

  console.log("Generating password hash...");
  const passwordHash = await bcrypt.hash("Password123!", 10);
  console.log("Password hash generated. Setting up test companies...");

  // Company A (TechCorp)
  let companyA = await prisma.company.findFirst({ where: { name: "TechCorp Alpha 360" } });
  if (!companyA) {
    companyA = await prisma.company.create({
      data: {
        name: "TechCorp Alpha 360",
        slug: "techcorp-alpha-360",
        website: "https://alpha.example.com",
        industry: "Technology",
        size: "50-200",
        location: "Bengaluru",
        description: "Leading enterprise cloud software provider",
        verified: true,
      },
    });
  }
  console.log("Company A ready:", companyA.id);

  // Company B (Beta Solutions)
  let companyB = await prisma.company.findFirst({ where: { name: "Beta Solutions 360" } });
  if (!companyB) {
    companyB = await prisma.company.create({
      data: {
        name: "Beta Solutions 360",
        slug: "beta-solutions-360",
        website: "https://beta.example.com",
        industry: "Consulting",
        size: "20-50",
        location: "Mumbai",
        description: "Digital transformation consultancy",
        verified: true,
      },
    });
  }

  // Company A Users
  const adminA = await prisma.user.upsert({
    where: { email: "admin.alpha360@example.com" },
    update: { company: { connect: { id: companyA.id } }, role: UserRole.COMPANY_ADMIN },
    create: {
      email: "admin.alpha360@example.com",
      name: "Admin Alpha",
      passwordHash,
      role: UserRole.COMPANY_ADMIN,
      company: { connect: { id: companyA.id } },
    },
  });

  const recruiterA = await prisma.user.upsert({
    where: { email: "recruiter.alpha360@example.com" },
    update: { company: { connect: { id: companyA.id } }, role: UserRole.RECRUITER },
    create: {
      email: "recruiter.alpha360@example.com",
      name: "Recruiter Alpha",
      passwordHash,
      role: UserRole.RECRUITER,
      company: { connect: { id: companyA.id } },
    },
  });

  const hmA = await prisma.user.upsert({
    where: { email: "hm.alpha360@example.com" },
    update: { company: { connect: { id: companyA.id } }, role: UserRole.HIRING_MANAGER },
    create: {
      email: "hm.alpha360@example.com",
      name: "HiringManager Alpha",
      passwordHash,
      role: UserRole.HIRING_MANAGER,
      company: { connect: { id: companyA.id } },
    },
  });

  const interviewerAssignedA = await prisma.user.upsert({
    where: { email: "interviewer.assigned360@example.com" },
    update: { company: { connect: { id: companyA.id } }, role: UserRole.INTERVIEWER },
    create: {
      email: "interviewer.assigned360@example.com",
      name: "Assigned Interviewer Alpha",
      passwordHash,
      role: UserRole.INTERVIEWER,
      company: { connect: { id: companyA.id } },
    },
  });

  const interviewerUnlinkedA = await prisma.user.upsert({
    where: { email: "interviewer.unlinked360@example.com" },
    update: { company: { connect: { id: companyA.id } }, role: UserRole.INTERVIEWER },
    create: {
      email: "interviewer.unlinked360@example.com",
      name: "Unlinked Interviewer Alpha",
      passwordHash,
      role: UserRole.INTERVIEWER,
      company: { connect: { id: companyA.id } },
    },
  });

  // Company B Admin
  const adminB = await prisma.user.upsert({
    where: { email: "admin.beta360@example.com" },
    update: { company: { connect: { id: companyB.id } }, role: UserRole.COMPANY_ADMIN },
    create: {
      email: "admin.beta360@example.com",
      name: "Admin Beta",
      passwordHash,
      role: UserRole.COMPANY_ADMIN,
      company: { connect: { id: companyB.id } },
    },
  });

  // Registered Candidate with hideSalaryFromEmployers = true
  const regCandidateUser = await prisma.user.upsert({
    where: { email: "candidate.registered360@example.com" },
    update: { role: UserRole.CANDIDATE },
    create: {
      email: "candidate.registered360@example.com",
      name: "Rohan Candidate",
      passwordHash,
      role: UserRole.CANDIDATE,
      phone: "+919876543210",
    },
  });

  await prisma.candidateProfile.upsert({
    where: { userId: regCandidateUser.id },
    update: {
      headline: "Senior Fullstack Engineer",
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      totalExperienceYears: 5,
      currentCtc: 18,
      expectedCtc: 24,
      hideSalaryFromEmployers: true,
      profileCompleteness: 85,
    },
    create: {
      userId: regCandidateUser.id,
      headline: "Senior Fullstack Engineer",
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      totalExperienceYears: 5,
      currentCtc: 18,
      expectedCtc: 24,
      hideSalaryFromEmployers: true,
      profileCompleteness: 85,
    },
  });

  // Jobs for Company A and B
  let jobA = await prisma.job.findFirst({ where: { companyId: companyA.id, title: "Principal Backend Engineer" } });
  if (!jobA) {
    jobA = await prisma.job.create({
      data: {
        companyId: companyA.id,
        title: "Principal Backend Engineer",
        description: "Build robust backend microservices",
        department: "Engineering",
        location: "Bengaluru",
        workMode: "HYBRID",
        jobType: "FULL_TIME",
        status: "PUBLISHED",
        responsibilities: ["Lead engineering architecture"],
        requirements: ["5+ yrs Node/Postgres"],
        skills: ["Node.js", "PostgreSQL", "System Design"],
        preferredSkills: ["Redis", "Docker"],
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });
  }

  let jobB = await prisma.job.findFirst({ where: { companyId: companyB.id, title: "Frontend Specialist" } });
  if (!jobB) {
    jobB = await prisma.job.create({
      data: {
        companyId: companyB.id,
        title: "Frontend Specialist",
        description: "Build awesome frontend interfaces",
        department: "Engineering",
        location: "Mumbai",
        workMode: "REMOTE",
        jobType: "FULL_TIME",
        status: "PUBLISHED",
        responsibilities: ["Build accessible React UI"],
        requirements: ["3+ yrs React/TypeScript"],
        skills: ["React", "TypeScript", "Tailwind CSS"],
        preferredSkills: ["Next.js"],
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });
  }

  // Application 1: Registered candidate applies to Company A
  const appA = await prisma.application.create({
    data: {
      jobId: jobA.id,
      candidateId: regCandidateUser.id,
      candidateName: "Rohan Candidate",
      candidateEmail: regCandidateUser.email,
      candidatePhone: "+919876543210",
      status: "UNDER_REVIEW",
      currentCompany: "Acme Corp",
      currentRole: "Fullstack Dev",
      experienceYears: 5,
      currentCtc: 19.5, // Application-specific CTC
      expectedCtc: 26.0, // Application-specific CTC
      noticePeriod: "30 Days",
      resumeFileName: "Rohan_Resume_A.pdf",
      resumeUrl: "/uploads/resumes/rohan_resume.pdf",
    },
  });

  // Application 2: Guest candidate applies to Company A
  const appGuestA = await prisma.application.create({
    data: {
      jobId: jobA.id,
      candidateId: null, // Guest applicant
      candidateName: "Aarav Guest Applicant",
      candidateEmail: "aarav.guest360@example.com",
      candidatePhone: "+919123456780",
      status: "SUBMITTED",
      currentCompany: "Guest Tech Inc",
      currentRole: "Junior Dev",
      experienceYears: 2,
      currentCtc: 8.0,
      expectedCtc: 12.0,
      noticePeriod: "15 Days",
      resumeFileName: "Aarav_Guest_Resume.pdf",
      resumeUrl: "/uploads/resumes/aarav_guest.pdf",
    },
  });

  // Application 3: Registered candidate also applies to Company B (Tenant isolation test)
  const appB = await prisma.application.create({
    data: {
      jobId: jobB.id,
      candidateId: regCandidateUser.id,
      candidateName: "Rohan Candidate",
      candidateEmail: regCandidateUser.email,
      candidatePhone: "+919876543210",
      status: "OFFER_EXTENDED",
      currentCompany: "Acme Corp",
      currentRole: "Fullstack Dev",
      experienceYears: 5,
      currentCtc: 20.0,
      expectedCtc: 30.0,
      noticePeriod: "30 Days",
      resumeFileName: "Rohan_Resume_B.pdf",
      resumeUrl: "/uploads/resumes/rohan_b_resume.pdf",
    },
  });

  // Schedule Interview in Company A with interviewerAssignedA
  const interviewA = await prisma.interview.create({
    data: {
      companyId: companyA.id,
      jobId: jobA.id,
      applicationId: appA.id,
      interviewerId: interviewerAssignedA.id,
      candidateName: regCandidateUser.name,
      candidateEmail: regCandidateUser.email,
      title: "Technical Architecture Round",
      scheduledAt: new Date(Date.now() + 86400000),
      durationMinutes: 45,
      mode: "VIDEO",
      status: "SCHEDULED",
    },
  });

  // Add feedback by assigned interviewer
  await prisma.interviewFeedback.create({
    data: {
      interviewId: interviewA.id,
      interviewerId: interviewerAssignedA.id,
      interviewerName: interviewerAssignedA.name,
      interviewerEmail: interviewerAssignedA.email,
      overallRating: 5,
      recommendation: "STRONG_HIRE",
      comments: "Superb depth in database indexing and distributed systems.",
    },
  });

  // Add recruiter note in Company A
  const existingNote = await prisma.recruiterNote.create({
    data: {
      applicationId: appA.id,
      companyId: companyA.id,
      authorId: recruiterA.id,
      authorName: recruiterA.name,
      authorRole: "RECRUITER",
      content: "Candidate is performing exceptionally well in preliminary rounds.",
    },
  });

  // Add offer in Company A (read-only for 360)
  await prisma.offer.create({
    data: {
      companyId: companyA.id,
      jobId: jobA.id,
      applicationId: appA.id,
      candidateName: regCandidateUser.name,
      candidateEmail: regCandidateUser.email,
      roleTitle: "Staff Software Engineer",
      baseSalaryLpa: 25.0,
      variableLpa: 3.0,
      currency: "INR",
      startDate: new Date(Date.now() + 14 * 86400000),
      expiryDate: new Date(Date.now() + 28 * 86400000),
      status: "DRAFT",
    },
  });

  // Add multiple timeline events for pagination test
  for (let i = 1; i <= 15; i++) {
    await prisma.applicationEvent.create({
      data: {
        applicationId: appA.id,
        action: `EVENT_STEP4_${i}`,
        actorName: "System Automation",
        actorRole: "SYSTEM",
        metadata: { index: i },
      },
    });
  }

  // Add email outbox and notification linked to Company A and appA
  await prisma.emailOutbox.create({
    data: {
      companyId: companyA.id,
      applicationId: appA.id,
      to: regCandidateUser.email,
      subject: "Interview Scheduled for Technical Round",
      template: "INTERVIEW_SCHEDULED",
      status: "SENT",
    },
  });

  await prisma.notification.create({
    data: {
      companyId: companyA.id,
      applicationId: appA.id,
      userId: regCandidateUser.id,
      recipientEmail: regCandidateUser.email,
      title: "Interview Scheduled",
      message: "Your interview with TechCorp Alpha 360 is scheduled.",
      type: "INTERVIEW_SCHEDULED",
    },
  });

  // Helper to create valid employer session token
  async function createSession(userId: string): Promise<string> {
    const token = `test_session_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    await prisma.adminSession.create({
      data: {
        token,
        userId,
        realm: "EMPLOYER",
        ipAddress: "127.0.0.1",
        userAgent: "Verification Script",
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });
    return token;
  }

  const tokenAdminA = await createSession(adminA.id);
  const tokenRecruiterA = await createSession(recruiterA.id);
  const tokenHmA = await createSession(hmA.id);
  const tokenInterviewerAssignedA = await createSession(interviewerAssignedA.id);
  const tokenInterviewerUnlinkedA = await createSession(interviewerUnlinkedA.id);
  const tokenAdminB = await createSession(adminB.id);

  // Setup real resume file on disk for Test 11
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  fs.writeFileSync(
    testResumePath,
    Buffer.from("%PDF-1.4\n%Real Candidate Test Resume\n1 0 obj\n<<\n>>\nendobj\ntrailer\n<<\n>>\n%%EOF")
  );
  console.log("Created real resume file in storage/resumes:", testResumePath);

  let passed = 0;
  let failed = 0;
  function check(condition: boolean, desc: string) {
    if (condition) {
      passed++;
      console.log(`  ✓ PASS: ${desc}`);
    } else {
      failed++;
      console.error(`  ✗ FAIL: ${desc}`);
    }
  }

  console.log("\n================================================================================");
  console.log("     PART 1: ORIGINAL 12 STEP 4 ASSERTIONS (MANDATORY CANONICAL CHECKS)         ");
  console.log("================================================================================");

  // ASSERTION 1: Registered candidate 360 lookup (returns 200 with candidate data)
  console.log("\n[ASSERTION 1] Registered candidate 360 lookup (returns 200 with candidate data)");
  const resA1 = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenAdminA}` },
  });
  const dataA1 = await resA1.json();
  check(
    resA1.status === 200 && dataA1.candidate?.name === "Rohan Candidate" && dataA1.candidate?.email === regCandidateUser.email,
    "Assertion 1: Registered candidate 360 lookup returns 200 with candidate data"
  );
  console.log(`Expected status: 200 | Actual: ${resA1.status} | Name: ${dataA1.candidate?.name}`);

  // ASSERTION 2: Guest applicant 360 lookup (returns 200 with applicant data)
  console.log("\n[ASSERTION 2] Guest applicant 360 lookup by applicationId (returns 200 with applicant data)");
  const resA2 = await fetch(`${BASE_URL}/api/employer/candidates/${appGuestA.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenRecruiterA}` },
  });
  const dataA2 = await resA2.json();
  check(
    resA2.status === 200 && dataA2.candidate?.email === "aarav.guest360@example.com",
    "Assertion 2: Guest applicant 360 lookup returns 200 with applicant data"
  );
  console.log(`Expected status: 200 | Actual: ${resA2.status} | Guest Email: ${dataA2.candidate?.email}`);

  // ASSERTION 3: Company A vs B cross-company isolation (returns 404 and Company A sees only Company A apps)
  console.log("\n[ASSERTION 3] Company A vs B cross-company isolation (returns 404 and Company A sees only Company A apps)");
  const resA3Cross = await fetch(`${BASE_URL}/api/employer/candidates/${appGuestA.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenAdminB}` },
  });
  const resA3Own = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenAdminA}` },
  });
  const dataA3Own = await resA3Own.json();
  const companyAAppJobTitles = dataA3Own.applications?.map((a: any) => a.jobTitle) || [];
  check(
    resA3Cross.status === 404 && resA3Own.status === 200 && !companyAAppJobTitles.includes("Frontend Specialist"),
    "Assertion 3: Company A vs B isolation: cross-company returns 404 and Company A sees only Company A apps"
  );
  console.log(`Cross-company status: Expected 404 | Actual: ${resA3Cross.status}`);
  console.log(`Company A sees jobs: ${JSON.stringify(companyAAppJobTitles)} (Company B job "Frontend Specialist" absent)`);

  // ASSERTION 4: Unlinked Interviewer returns 404
  console.log("\n[ASSERTION 4] Unlinked Interviewer scoping (returns 404)");
  const resA4 = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenInterviewerUnlinkedA}` },
  });
  check(resA4.status === 404, "Assertion 4: Unlinked interviewer returns 404");
  console.log(`Expected status: 404 | Actual: ${resA4.status}`);

  // ASSERTION 5: Linked Interviewer access scoping (no notes, no offers, no communication log, no salary)
  console.log("\n[ASSERTION 5] Linked Interviewer access scoping (no notes, no offers, no comms, no salary)");
  const resA5 = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenInterviewerAssignedA}` },
  });
  const dataA5 = await resA5.json();
  check(
    resA5.status === 200 &&
    (dataA5.applications?.[0]?.notes?.length ?? 0) === 0 &&
    (dataA5.offers?.length ?? 0) === 0 &&
    dataA5.communication === null &&
    dataA5.applications?.[0]?.currentCtc === null &&
    dataA5.candidate?.currentCtc === null,
    "Assertion 5: Linked interviewer access scoping hides notes, offers, comms, and CTC"
  );
  console.log(`Expected status: 200 | Actual: ${resA5.status}`);
  console.log(`Notes count: ${dataA5.applications?.[0]?.notes?.length} | Offers count: ${dataA5.offers?.length} | Comms: ${dataA5.communication}`);

  // ASSERTION 6: Hiring Manager view-only check (isViewOnly: true, accessRole: HIRING_MANAGER, CTC visible)
  console.log("\n[ASSERTION 6] Hiring Manager view-only check (isViewOnly: true, accessRole: HIRING_MANAGER, CTC visible)");
  const resA6 = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenHmA}` },
  });
  const dataA6 = await resA6.json();
  check(
    resA6.status === 200 &&
    dataA6.accessRole === "HIRING_MANAGER" &&
    dataA6.isViewOnly === true &&
    dataA6.applications?.[0]?.currentCtc === 19.5,
    "Assertion 6: Hiring Manager view-only check (isViewOnly=true, accessRole=HIRING_MANAGER)"
  );
  console.log(`Access Role: ${dataA6.accessRole} | isViewOnly: ${dataA6.isViewOnly} | Application CTC: ₹${dataA6.applications?.[0]?.currentCtc} LPA`);

  // ASSERTION 7: Hide-salary privacy rules (hideSalaryFromEmployers=true vs Application-level CTC)
  console.log("\n[ASSERTION 7] Hide-salary privacy rules (hideSalaryFromEmployers=true vs Application-level CTC)");
  check(
    dataA1.candidate?.currentCtc === null &&
    dataA1.applications?.[0]?.currentCtc === 19.5 &&
    dataA2.applications?.[0]?.currentCtc === 8.0,
    "Assertion 7: Salary privacy rules: hideSalaryFromEmployers hides profile CTC while app CTC is visible"
  );
  console.log(`Profile CTC for Admin: ${dataA1.candidate?.currentCtc} (null) | App CTC Admin: ₹${dataA1.applications?.[0]?.currentCtc} LPA | App CTC Recruiter: ₹${dataA2.applications?.[0]?.currentCtc} LPA`);

  // ASSERTION 8: Timeline pagination and deduplication
  console.log("\n[ASSERTION 8] Timeline pagination and deduplication");
  const resA8P1 = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360?timelinePage=1&timelineLimit=5`, {
    headers: { Cookie: `cb_employer_session=${tokenAdminA}` },
  });
  const dataA8P1 = await resA8P1.json();
  const resA8P2 = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360?timelinePage=2&timelineLimit=5`, {
    headers: { Cookie: `cb_employer_session=${tokenAdminA}` },
  });
  const dataA8P2 = await resA8P2.json();
  const idsA8P1 = dataA8P1.timeline?.events?.map((e: any) => e.id) || [];
  const idsA8P2 = dataA8P2.timeline?.events?.map((e: any) => e.id) || [];
  const overlapA8 = idsA8P1.filter((id: string) => idsA8P2.includes(id));
  check(
    resA8P1.status === 200 && resA8P2.status === 200 && idsA8P1.length > 0 && overlapA8.length === 0,
    "Assertion 8: Timeline pagination and deduplication: distinct events across pages"
  );
  console.log(`Page 1 count: ${idsA8P1.length} | Page 2 count: ${idsA8P2.length} | Duplicate IDs: ${overlapA8.length}`);

  // ASSERTION 9: Communication log tenant linkage (emails & notifications linked to company applications)
  console.log("\n[ASSERTION 9] Communication log tenant linkage (emails & notifications linked to company applications)");
  check(
    (dataA1.communication?.emails?.length ?? 0) > 0 && (dataA1.communication?.notifications?.length ?? 0) > 0,
    "Assertion 9: Communication log tenant linkage returns company emails and notifications"
  );
  console.log(`Emails count: ${dataA1.communication?.emails?.length} | Notifications count: ${dataA1.communication?.notifications?.length}`);

  // ASSERTION 10: Read-only offers display
  console.log("\n[ASSERTION 10] Read-only offers display");
  check(
    (dataA1.offers?.length ?? 0) > 0 && dataA1.offers?.[0]?.status === "DRAFT",
    "Assertion 10: Read-only offers display returns offer records with status"
  );
  console.log(`Offers count: ${dataA1.offers?.length} | Offer Status: ${dataA1.offers?.[0]?.status} | Base: ₹${dataA1.offers?.[0]?.baseSalaryLpa} LPA`);

  // ASSERTION 11: Resume route status codes (200, 404 missing, 404 unlinked, 401 unauthenticated)
  console.log("\n[ASSERTION 11] Resume route status codes (200, 404 missing, 404 unlinked, 401 unauthenticated)");
  const resA11Valid = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}/resume`, {
    headers: { Cookie: `cb_employer_session=${tokenAdminA}` },
  });
  const resA11Missing = await fetch(`${BASE_URL}/api/employer/applications/${appGuestA.id}/resume`, {
    headers: { Cookie: `cb_employer_session=${tokenAdminA}` },
  });
  const resA11Unlinked = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}/resume`, {
    headers: { Cookie: `cb_employer_session=${tokenInterviewerUnlinkedA}` },
  });
  const resA11Unauth = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}/resume`);
  check(
    resA11Valid.status === 200 &&
    resA11Missing.status === 404 &&
    resA11Unlinked.status === 404 &&
    resA11Unauth.status === 401,
    "Assertion 11: Resume route returns 200 (valid), 404 (missing), 404 (unlinked), 401 (unauthenticated)"
  );
  console.log(`Valid: ${resA11Valid.status} | Missing: ${resA11Missing.status} | Unlinked: ${resA11Unlinked.status} | Unauthenticated: ${resA11Unauth.status}`);

  // ASSERTION 12: Immutable AuditLog verification (CANDIDATE_360_VIEWED, opaque ID, no raw email)
  console.log("\n[ASSERTION 12] Immutable AuditLog verification (CANDIDATE_360_VIEWED, opaque ID, no raw email)");
  const auditA12 = await prisma.auditLog.findFirst({
    where: {
      action: "CANDIDATE_360_VIEWED",
      actorId: adminA.id,
      entityId: regCandidateUser.id,
    },
    orderBy: { createdAt: "desc" },
  });
  check(
    !!auditA12 &&
    auditA12.action === "CANDIDATE_360_VIEWED" &&
    auditA12.entityId === regCandidateUser.id &&
    !auditA12.reason?.includes("@"),
    "Assertion 12: AuditLog contains CANDIDATE_360_VIEWED with opaque ID and no raw email in reason"
  );
  console.log(`AuditLog Found: ${!!auditA12} | Action: ${auditA12?.action} | EntityId: ${auditA12?.entityId} | Raw Email in Reason: ${auditA12?.reason?.includes("@")}`);

  console.log("\n================================================================================");
  console.log("       PART 2: 17 INTERACTIVE ACTION & SCOPE TESTS (EXTENDED WORKFLOW)          ");
  console.log("================================================================================");

  // TEST 1: Full 360 data response structure (HTTP 200)
  console.log("\n[TEST 1] Full 360 data response structure (HTTP 200)");
  check(
    resA1.status === 200 &&
    "candidate" in dataA1 &&
    "applications" in dataA1 &&
    "timeline" in dataA1 &&
    "offers" in dataA1 &&
    "communication" in dataA1 &&
    "accessRole" in dataA1 &&
    "isViewOnly" in dataA1,
    "Test 1: Full 360 data response structure (HTTP 200)"
  );

  // TEST 2: In-app note creation (HTTP 200/201)
  console.log("\n[TEST 2] In-app note creation (HTTP 200/201)");
  const resT2 = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `cb_employer_session=${tokenRecruiterA}`,
    },
    body: JSON.stringify({ content: "Candidate demonstrates high architectural maturity." }),
  });
  const dataT2 = await resT2.json();
  const createdNoteId = dataT2.note?.id;
  check(
    (resT2.status === 200 || resT2.status === 201) && !!createdNoteId,
    "Test 2: In-app note creation (HTTP 200/201)"
  );
  console.log(`Note creation status: Expected 200/201 | Actual: ${resT2.status} | Note ID: ${createdNoteId}`);

  // TEST 3: Note content verification in 360 view (HTTP 200)
  console.log("\n[TEST 3] Note content verification in 360 view (HTTP 200)");
  const resT3 = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenRecruiterA}` },
  });
  const dataT3 = await resT3.json();
  const notesT3 = dataT3.applications?.[0]?.notes || [];
  const noteFoundT3 = notesT3.some((n: any) => n.id === createdNoteId || n.content.includes("architectural maturity"));
  check(resT3.status === 200 && noteFoundT3, "Test 3: Note content verification in 360 view (HTTP 200)");
  console.log(`360 status: ${resT3.status} | Note present in 360 view: ${noteFoundT3}`);

  // TEST 4: Delete own note (HTTP 200)
  console.log("\n[TEST 4] Delete own note (HTTP 200)");
  const resT4 = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}/notes/${createdNoteId}`, {
    method: "DELETE",
    headers: { Cookie: `cb_employer_session=${tokenRecruiterA}` },
  });
  check(resT4.status === 200, "Test 4: Delete own note (HTTP 200)");
  console.log(`Note deletion status: Expected 200 | Actual: ${resT4.status}`);

  // TEST 5: Verify note removed (HTTP 200)
  console.log("\n[TEST 5] Verify note removed (HTTP 200)");
  const resT5 = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenRecruiterA}` },
  });
  const dataT5 = await resT5.json();
  const notesT5 = dataT5.applications?.[0]?.notes || [];
  const notePresentT5 = notesT5.some((n: any) => n.id === createdNoteId);
  check(resT5.status === 200 && !notePresentT5, "Test 5: Verify note removed from 360 view (HTTP 200)");
  console.log(`Note still present after deletion: ${notePresentT5} (Expected: false)`);

  // TEST 6: Note author cross-tenant isolation (HTTP 403)
  console.log("\n[TEST 6] Note author cross-tenant isolation (HTTP 403)");
  const resT6 = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}/notes/${existingNote.id}`, {
    method: "DELETE",
    headers: { Cookie: `cb_employer_session=${tokenAdminB}` },
  });
  check(resT6.status === 403 || resT6.status === 404, "Test 6: Note author cross-tenant isolation (HTTP 403/404)");
  console.log(`Cross-company note deletion status: Expected 403/404 | Actual: ${resT6.status}`);

  // TEST 7: Interviewer note submission blocked (HTTP 403)
  console.log("\n[TEST 7] Interviewer note submission blocked (HTTP 403)");
  const resT7 = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `cb_employer_session=${tokenInterviewerAssignedA}`,
    },
    body: JSON.stringify({ content: "Unauthorized interviewer note attempt" }),
  });
  check(resT7.status === 403, "Test 7: Interviewer note submission blocked (HTTP 403)");
  console.log(`Interviewer note submission status: Expected 403 | Actual: ${resT7.status}`);

  // TEST 8: Stage transition to INTERVIEW_SCHEDULED (HTTP 200)
  console.log("\n[TEST 8] Stage transition to INTERVIEW_SCHEDULED (HTTP 200)");
  const resT8 = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `cb_employer_session=${tokenAdminA}`,
    },
    body: JSON.stringify({ status: "INTERVIEW_SCHEDULED" }),
  });
  const dataT8 = await resT8.json();
  check(
    resT8.status === 200 && dataT8.application?.status === "INTERVIEW_SCHEDULED",
    "Test 8: Stage transition to INTERVIEW_SCHEDULED (HTTP 200)"
  );
  console.log(`Stage transition status: Expected 200 | Actual: ${resT8.status} | Application Status: ${dataT8.application?.status}`);

  // TEST 9: Interview feedback submission (HTTP 200/201)
  console.log("\n[TEST 9] Interview feedback submission (HTTP 200/201)");
  const resT9 = await fetch(`${BASE_URL}/api/employer/interviews/${interviewA.id}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `cb_employer_session=${tokenInterviewerAssignedA}`,
    },
    body: JSON.stringify({
      technicalRating: 5,
      problemSolvingRating: 5,
      communicationRating: 4,
      roleKnowledgeRating: 5,
      overallRating: 5,
      recommendation: "STRONG_HIRE",
      strengths: "System design, SQL indexing",
      comments: "Outstanding candidate.",
    }),
  });
  check(resT9.status === 200 || resT9.status === 201, "Test 9: Interview feedback submission (HTTP 200/201)");
  console.log(`Feedback submission status: Expected 200/201 | Actual: ${resT9.status}`);

  // TEST 10: Feedback appears in 360 view (HTTP 200)
  console.log("\n[TEST 10] Feedback appears in 360 view (HTTP 200)");
  const resT10 = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenAdminA}` },
  });
  const dataT10 = await resT10.json();
  const interviewsT10 = dataT10.applications?.[0]?.interviews || [];
  const feedbackPresentT10 = interviewsT10.some((iv: any) =>
    iv.feedback?.some((fb: any) => fb.recommendation === "STRONG_HIRE")
  );
  check(resT10.status === 200 && feedbackPresentT10, "Test 10: Feedback appears in 360 view (HTTP 200)");
  console.log(`360 status: ${resT10.status} | Feedback recommendation present: ${feedbackPresentT10}`);

  // TEST 11: Candidate resume download (HTTP 200, application/pdf)
  console.log("\n[TEST 11] Candidate resume download (HTTP 200, application/pdf)");
  const resT11 = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}/resume`, {
    headers: { Cookie: `cb_employer_session=${tokenAdminA}` },
  });
  const contentTypeT11 = resT11.headers.get("content-type") || "";
  check(
    resT11.status === 200 && contentTypeT11.includes("application/pdf"),
    "Test 11: Candidate resume download (HTTP 200, application/pdf)"
  );
  console.log(`Resume download status: Expected 200 | Actual: ${resT11.status} | Content-Type: ${contentTypeT11}`);

  // TEST 12: Missing resume file returns 404 { error: "Resume file not available" }
  console.log("\n[TEST 12] Missing resume file returns 404 { error: \"Resume file not available\" }");
  const resT12 = await fetch(`${BASE_URL}/api/employer/applications/${appGuestA.id}/resume`, {
    headers: { Cookie: `cb_employer_session=${tokenAdminA}` },
  });
  const dataT12 = await resT12.json();
  check(
    resT12.status === 404 && dataT12.error === "Resume file not available",
    "Test 12: Missing resume file returns 404 { error: \"Resume file not available\" }"
  );
  console.log(`Missing resume status: Expected 404 | Actual: ${resT12.status} | Error: "${dataT12.error}"`);

  // TEST 13: Regression test: 360 view with null participant/feedback emails (HTTP 200)
  console.log("\n[TEST 13] Regression test: 360 view with null participant/feedback emails (HTTP 200)");
  const nullEmailParticipant = await prisma.interviewParticipant.create({
    data: {
      interviewId: interviewA.id,
      userId: recruiterA.id,
      name: "Nullable Participant",
      email: "",
      roleTitle: "ATTENDEE",
    },
  });
  const resT13 = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenInterviewerAssignedA}` },
  });
  check(
    resT13.status === 200,
    "Test 13: Regression test: 360 view with null participant/feedback emails (HTTP 200)"
  );
  console.log(`Null participant regression test status: Expected 200 | Actual: ${resT13.status}`);
  await prisma.interviewParticipant.delete({ where: { id: nullEmailParticipant.id } }).catch(() => {});

  // TEST 14: Cross-tenant 360 isolation (HTTP 404)
  console.log("\n[TEST 14] Cross-tenant 360 isolation (HTTP 404)");
  const resT14 = await fetch(`${BASE_URL}/api/employer/candidates/${appGuestA.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenAdminB}` },
  });
  check(resT14.status === 404, "Test 14: Cross-tenant 360 isolation (HTTP 404)");
  console.log(`Cross-tenant 360 status: Expected 404 | Actual: ${resT14.status}`);

  // TEST 15: Cross-tenant resume isolation (HTTP 404)
  console.log("\n[TEST 15] Cross-tenant resume isolation (HTTP 404)");
  const resT15 = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}/resume`, {
    headers: { Cookie: `cb_employer_session=${tokenAdminB}` },
  });
  check(resT15.status === 404, "Test 15: Cross-tenant resume isolation (HTTP 404)");
  console.log(`Cross-tenant resume status: Expected 404 | Actual: ${resT15.status}`);

  // TEST 16: Interviewer visibility restricted to assigned interviews (HTTP 200)
  console.log("\n[TEST 16] Interviewer visibility restricted to assigned interviews (HTTP 200)");
  const resT16 = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360`, {
    headers: { Cookie: `cb_employer_session=${tokenInterviewerAssignedA}` },
  });
  const dataT16 = await resT16.json();
  const assignedInterviewsOnly = (dataT16.applications?.[0]?.interviews?.length ?? 0) > 0 &&
    (dataT16.applications?.[0]?.notes?.length ?? 0) === 0;
  check(
    resT16.status === 200 && assignedInterviewsOnly,
    "Test 16: Interviewer visibility restricted to assigned interviews (HTTP 200)"
  );
  console.log(`Interviewer 360 status: Expected 200 | Actual: ${resT16.status} | Assigned interview visible: ${assignedInterviewsOnly}`);

  // TEST 17: Unauthorized access blocked (HTTP 401)
  console.log("\n[TEST 17] Unauthorized access blocked (HTTP 401)");
  const resT17_360 = await fetch(`${BASE_URL}/api/employer/candidates/${regCandidateUser.id}/360`);
  const resT17_Resume = await fetch(`${BASE_URL}/api/employer/applications/${appA.id}/resume`);
  check(
    resT17_360.status === 401 && resT17_Resume.status === 401,
    "Test 17: Unauthorized access blocked (HTTP 401)"
  );
  console.log(`Unauth 360: Expected 401 | Actual: ${resT17_360.status} | Unauth Resume: Expected 401 | Actual: ${resT17_Resume.status}`);

  console.log("\n================================================================================");
  console.log(`   STEP 4 TOTAL RESULTS: ${passed} passed, ${failed} failed (Total: ${passed + failed})`);
  console.log("================================================================================");

  if (failed > 0) {
    throw new Error(`${failed} assertions failed in Step 4 verification`);
  }
}

main()
  .catch((e) => {
    console.error("Step 4 verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    if (fs.existsSync(testResumePath)) {
      try {
        fs.unlinkSync(testResumePath);
        console.log("Cleaned up test resume file:", testResumePath);
      } catch {}
    }
    await prisma.$disconnect();
  });
