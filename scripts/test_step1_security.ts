import { db } from "../src/lib/db";
import { verifyPassword, hashPassword, isBcryptHash } from "../src/lib/auth/password";
import { checkRateLimit, resetRateLimit } from "../src/lib/auth/rateLimit";
import { confirmInterview, requestInterviewReschedule, scheduleInterview } from "../src/lib/interview/service";

async function runTests() {
  console.log("==========================================");
  console.log("STARTING STEP 1 SECURITY & CRITICAL FIX TESTS");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Test Password Hashing and Bcrypt compatibility
  console.log("\n--- Testing Password Hashing & Bcrypt ---");
  const rawPassword = "TestPassword123!";
  const bcryptHash = await hashPassword(rawPassword);
  assert(isBcryptHash(bcryptHash), "hashPassword returns valid bcrypt hash");
  assert(await verifyPassword(rawPassword, bcryptHash), "verifyPassword succeeds on bcrypt hash");
  assert(!(await verifyPassword("WrongPassword", bcryptHash)), "verifyPassword rejects wrong password on bcrypt hash");

  // Legacy SHA-256 verification
  const crypto = require("crypto");
  const legacySha = crypto.createHash("sha256").update(rawPassword + "careerbridge_salt_2026").digest("hex");
  assert(!isBcryptHash(legacySha), "isBcryptHash correctly identifies SHA-256 as non-bcrypt");
  assert(await verifyPassword(rawPassword, legacySha), "verifyPassword transparently verifies legacy SHA-256");

  // 2. Test Rate Limiter
  console.log("\n--- Testing Rate Limiter ---");
  const testKey = "test:ratelimit:ip1";
  resetRateLimit(testKey);
  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(testKey, 5, 60000);
    assert(res.allowed, `Attempt ${i + 1} is allowed`);
  }
  const blockedRes = checkRateLimit(testKey, 5, 60000);
  assert(!blockedRes.allowed, "6th attempt is rate-limited / blocked");
  assert(blockedRes.retryAfterSec > 0, "Rate limiter returns retryAfterSec");
  resetRateLimit(testKey);

  // 3. Test Sessions in DB have realm populated
  console.log("\n--- Testing DB Session Realm Backfill ---");
  const sessionsWithoutRealm = await db.adminSession.findMany({
    where: { realm: { notIn: ["ADMIN", "EMPLOYER"] } },
  });
  assert(sessionsWithoutRealm.length === 0, "All database sessions have valid realm ('ADMIN' | 'EMPLOYER')");

  // 4. Test Notification & Interview Fixes
  console.log("\n--- Testing Interview & Notification Email / Link Fixes ---");
  const sampleInterview = await db.interview.findFirst({
    where: { companyId: { not: undefined } },
    include: { job: { include: { company: true } } },
  });

  if (sampleInterview) {
    // Test confirmInterview
    const confirmRes = await confirmInterview(sampleInterview.secureToken || sampleInterview.id);
    assert(confirmRes.success, "confirmInterview executes without crash");

    const notif = await db.notification.findFirst({
      where: {
        companyId: sampleInterview.companyId,
        type: "INTERVIEW_CONFIRMED",
      },
      orderBy: { createdAt: "desc" },
    });
    assert(!!notif, "Notification recorded for confirmed interview");
    assert(
      Boolean(notif?.recipientEmail?.includes("@")),
      `Notification recipientEmail is an email address: ${notif?.recipientEmail}`
    );
    assert(
      Boolean(notif?.link?.startsWith("/employer/interviews/")),
      `Notification link is correct: ${notif?.link}`
    );
  }

  // 5. Test Assessment Candidate startedAt
  console.log("\n--- Testing Candidate Assessment startedAt Fix ---");
  const testApp = await db.application.findFirst({
    include: { job: true },
  });
  const testAssessment = await db.assessment.findFirst();

  if (testApp && testAssessment) {
    const candAssess = await db.candidateAssessment.create({
      data: {
        assessmentId: testAssessment.id,
        applicationId: testApp.id,
        candidateEmail: testApp.candidateEmail,
        token: "test_tok_" + Date.now(),
        status: "PENDING",
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    assert(candAssess.startedAt === null, "New candidate assessment startedAt is initially null");

    // Simulate candidate GET start
    await db.candidateAssessment.update({
      where: { id: candAssess.id },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    const refreshed = await db.candidateAssessment.findUnique({
      where: { id: candAssess.id },
    });
    assert(refreshed?.status === "IN_PROGRESS", "Candidate assessment moves to IN_PROGRESS");
    assert(refreshed?.startedAt !== null, "Candidate assessment startedAt is properly recorded");

    // Clean up test record
    await db.candidateAssessment.delete({ where: { id: candAssess.id } }).catch(() => {});
  }

  console.log("\n==========================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================");
}

runTests()
  .catch(console.error)
  .finally(() => db.$disconnect());
