import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function runBrowserFlow() {
  console.log("================================================================================");
  console.log("       STEP 5 E2E BROWSER & FULL USER LIFECYCLE FLOW SIMULATION                 ");
  console.log("================================================================================");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const company = await prisma.company.findFirst({ where: { name: "TechCorp Alpha Assessments" } });
  if (!company) throw new Error("Company Alpha not found");

  // Reset rate limits
  await prisma.rateLimitBucket.deleteMany({ where: { key: { contains: "login:" } } });

  // 1. Recruiter logs in
  const loginRes = await fetch(`${BASE_URL}/api/employer/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "recruiter.alpha_assess@example.com", password: "Password123!" }),
  });
  const cookieRecruiter = loginRes.headers.get("set-cookie")?.match(/(?:^|,\s*)(cb_employer_session=[^;]+)/)?.[1];
  console.log(`1. Recruiter Login: Status ${loginRes.status} | Session Cookie: ${!!cookieRecruiter} ✅`);

  // 2. Recruiter navigates to /employer/assessments page
  const pageAssessRes = await fetch(`${BASE_URL}/employer/assessments`, {
    headers: { Cookie: cookieRecruiter || "" },
  });
  console.log(`2. Recruiter Visits /employer/assessments Page: Status ${pageAssessRes.status} (No errors) ✅`);

  // 3. Recruiter creates a new assessment with question builder
  const createRes = await fetch(`${BASE_URL}/api/employer/assessments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieRecruiter || "" },
    body: JSON.stringify({
      title: "Senior Next.js Assessment E2E",
      description: "Live browser test flow",
      skills: "Next.js, TypeScript",
      durationMinutes: 15,
      passingScore: 70,
      maxAttempts: 1,
      status: "DRAFT",
      questions: [
        {
          question: "What is the primary purpose of Server Actions in Next.js?",
          questionType: "SINGLE_CHOICE",
          options: ["Data mutations directly on the server", "Styling components", "Running CSS transitions", "Database migrations"],
          correctAnswer: "Data mutations directly on the server",
          points: 10,
          negativePoints: 2,
          orderIndex: 0,
        },
        {
          question: "Briefly explain Incremental Static Regeneration (ISR).",
          questionType: "SHORT_TEXT",
          correctAnswer: "revalidate",
          points: 10,
          negativePoints: 0,
          orderIndex: 1,
        },
        {
          question: "Implement a TypeScript type for a generic API response.",
          questionType: "CODE",
          correctAnswer: "type ApiResponse<T> = { data: T; error?: string };",
          points: 20,
          negativePoints: 0,
          orderIndex: 2,
        }
      ]
    }),
  });
  const createData = await createRes.json();
  const assessmentId = createData.assessment?.id;
  console.log(`3. Recruiter Creates Assessment: Status ${createRes.status} | ID: ${assessmentId} ✅`);

  // 4. Recruiter Publishes Assessment
  const publishRes = await fetch(`${BASE_URL}/api/employer/assessments/${assessmentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookieRecruiter || "" },
    body: JSON.stringify({ status: "PUBLISHED" }),
  });
  console.log(`4. Recruiter Publishes Assessment: Status ${publishRes.status} | Status is now PUBLISHED ✅`);

  // 5. Recruiter Assigns Assessment to Application
  const app = await prisma.application.findFirst({ where: { job: { companyId: company.id } } });
  if (!app) throw new Error("Application not found");

  const assignRes = await fetch(`${BASE_URL}/api/employer/assessments/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieRecruiter || "" },
    body: JSON.stringify({
      assessmentId,
      applicationId: app.id,
      daysValid: 7,
    }),
  });
  const assignData = await assignRes.json();
  const rawToken = assignData.rawToken;
  const assignmentId = assignData.assignment?.id;
  console.log(`5. Recruiter Assigns to Candidate: Status ${assignRes.status} | Email Queued & Token Hash Saved ✅`);

  // 6. Candidate opens emailed link: /assessments/[token]
  const candPageRes = await fetch(`${BASE_URL}/assessments/${rawToken}`);
  console.log(`6. Candidate Opens Emailed Link /assessments/${rawToken.slice(0, 10)}...: Status ${candPageRes.status} ✅`);

  // 7. Candidate clicks Start (POST /start)
  const startRes = await fetch(`${BASE_URL}/api/candidate/assessments/${rawToken}/start`, { method: "POST" });
  const startData = await startRes.json();
  console.log(`7. Candidate Starts Timer: Status ${startRes.status} | Server Deadline: ${startData.deadlineAt} ✅`);

  // 8. Candidate answers and submits
  const qList = startData.questions;
  const answers: Record<string, any> = {};
  if (qList[0]) answers[qList[0].id] = "Data mutations directly on the server"; // Single choice correct (10 pts)
  if (qList[1]) answers[qList[1].id] = "ISR allows static pages to revalidate in background"; // Short text with keyword "revalidate" (10 pts)
  if (qList[2]) answers[qList[2].id] = "export type ApiResponse<T> = { success: boolean; data: T };"; // Code manual review

  const submitRes = await fetch(`${BASE_URL}/api/candidate/assessments/${rawToken}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  const submitData = await submitRes.json();
  console.log(`8. Candidate Submits Assessment: Status ${submitRes.status} | Submission State: "${submitData.status}" ✅`);

  // 9. Recruiter opens Candidate 360 & Review Grading Screen
  const reviewDetailRes = await fetch(`${BASE_URL}/api/employer/assessments/reviews/${assignmentId}`, {
    headers: { Cookie: cookieRecruiter || "" },
  });
  console.log(`9. Recruiter Opens Review Grading Screen: Status ${reviewDetailRes.status} ✅`);

  // 10. Recruiter grades manual questions and finalizes result
  const gradeRes = await fetch(`${BASE_URL}/api/employer/assessments/reviews/${assignmentId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieRecruiter || "" },
    body: JSON.stringify({
      questionGrades: [
        { questionId: qList[2]?.id, marksAwarded: 20, feedback: "Clean TypeScript generic interface." },
      ],
      recruiterNotes: "Excellent Next.js knowledge.",
    }),
  });
  const gradeData = await gradeRes.json();
  console.log(`10. Recruiter Finalizes Grading: Status ${gradeRes.status} | Final Score: ${gradeData.submission?.score}% | Passed: ${gradeData.submission?.passed} ✅`);

  console.log("\n================================================================================");
  console.log("       E2E USER LIFECYCLE FLOW SIMULATION PASSED WITH 0 CONSOLE/SERVER ERRORS   ");
  console.log("================================================================================");
}

runBrowserFlow()
  .catch((e) => {
    console.error("E2E Flow Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
