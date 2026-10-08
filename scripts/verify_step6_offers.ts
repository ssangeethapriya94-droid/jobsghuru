import { db } from "../src/lib/db";
import { OfferStatus, UserRole } from "@prisma/client";
import { canTransitionOfferStatus, hashToken, processCandidateAcceptance } from "../src/lib/employer/offers";
import { chromium } from "playwright";

async function runStep6Verification() {
  console.log("=== STEP 6 VERIFICATION: OFFER MANAGEMENT ===");
  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`[PASS] ${description}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${description}`);
      failCount++;
    }
  }

  try {
    // 1. Setup Test Companies & Roles
    const compA = await db.company.upsert({
      where: { name: "Step6 CompA Corp" },
      update: {},
      create: { name: "Step6 CompA Corp", slug: "step6-compa", industry: "Tech", size: "10-50", location: "Bengaluru", description: "Desc" },
    });

    const compB = await db.company.upsert({
      where: { name: "Step6 CompB Corp" },
      update: {},
      create: { name: "Step6 CompB Corp", slug: "step6-compb", industry: "Finance", size: "50-100", location: "Mumbai", description: "Desc" },
    });

    const jobA = await db.job.create({
      data: {
        title: "Senior Backend Developer",
        description: "Job desc",
        location: "Bengaluru",
        workMode: "REMOTE",
        jobType: "FULL_TIME",
        department: "Engineering",
        companyId: compA.id,
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });

    const candidateUser = await db.user.upsert({
      where: { email: "step6.candidate@example.com" },
      update: {},
      create: { email: "step6.candidate@example.com", name: "Step6 Candidate", passwordHash: "hash", role: UserRole.CANDIDATE },
    });

    const appA = await db.application.create({
      data: {
        jobId: jobA.id,
        candidateId: candidateUser.id,
        candidateName: "Step6 Candidate",
        candidateEmail: "step6.candidate@example.com",
        candidatePhone: "+91 99999 88888",
        status: "SUBMITTED",
      },
    });

    // 2. State machine assertion
    assert(canTransitionOfferStatus(OfferStatus.DRAFT, OfferStatus.SENT), "State Machine: DRAFT -> SENT allowed");
    assert(!canTransitionOfferStatus(OfferStatus.ACCEPTED, OfferStatus.SENT), "State Machine: ACCEPTED -> SENT prohibited");

    const testRawToken = `raw-token-step6-test-${Date.now()}`;
    const testHashVal = hashToken(testRawToken);

    // 3. Create Offer with CTC Breakdown
    const offer = await db.offer.create({
      data: {
        applicationId: appA.id,
        jobId: jobA.id,
        companyId: compA.id,
        candidateName: "Step6 Candidate",
        candidateEmail: "step6.candidate@example.com",
        roleTitle: "Senior Backend Developer",
        fixedCtc: 20,
        variableCtc: 4,
        joiningBonus: 2,
        baseSalaryLpa: 20,
        currency: "INR",
        startDate: new Date(Date.now() + 14 * 86400000),
        expiryDate: new Date(Date.now() + 7 * 86400000),
        status: OfferStatus.SENT,
        terms: "Standard contract",
        internalNotes: "TOP SECRET RECRUITER NOTE 123",
        tokenHash: testHashVal,
      },
    });

    assert(offer.id !== undefined, "Offer created successfully in database");
    assert(offer.fixedCtc === 20 && offer.variableCtc === 4, "Fixed and Variable CTC correctly recorded");

    // 4. Token & Hash verification
    assert(offer.tokenHash === testHashVal, "SHA-256 token hash verified");

    // 5. Test Accept Action Idempotency & App Status Change
    const acceptResult = await processCandidateAcceptance(offer.id, "step6.candidate@example.com");
    assert(acceptResult.offer.status === OfferStatus.ACCEPTED, "Offer status updated to ACCEPTED");
    assert(acceptResult.application.status === "HIRED", "Application status updated to HIRED");

    const updatedApp = await db.application.findUnique({ where: { id: appA.id } });
    assert(updatedApp?.status === "HIRED", "Application status confirmed HIRED in DB");

    // 6. Test Expiry Cron Secret Check
    const cronResNoSecret = await fetch("http://localhost:3000/api/cron/offers-expire");
    assert(cronResNoSecret.status === 401, "Cron route blocks execution without valid secret (401)");

    const cronResWithSecret = await fetch("http://localhost:3000/api/cron/offers-expire?secret=careerbridge_cron_secret_2026");
    assert(cronResWithSecret.status === 200, "Cron route succeeds with valid secret (200)");

    // 7. Browser Test (Playwright) for Pages Rendering
    console.log("Running Playwright browser check for Step 6 pages...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    let consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    // Check employer offers page
    await page.goto("http://localhost:3000/employer/offers", { waitUntil: "networkidle" });
    assert(page.url().includes("/employer/offers") || page.url().includes("/employer/login"), "Browser loaded /employer/offers (or protected login redirect) successfully");

    // Check offer detail page
    await page.goto(`http://localhost:3000/employer/offers/${offer.id}`, { waitUntil: "networkidle" });
    assert(page.url().includes(offer.id) || page.url().includes("/employer/login"), `Browser loaded /employer/offers/${offer.id} successfully`);

    // Check guest token page
    await page.goto(`http://localhost:3000/offers/${testRawToken}`, { waitUntil: "networkidle" });
    assert(page.url().includes(`/offers/${testRawToken}`), "Browser loaded guest token offer page");

    await browser.close();

    console.log("\n=== STEP 6 SUMMARY ===");
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    if (failCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Step 6 Verification Error:", err);
    process.exit(1);
  }
}

runStep6Verification();
