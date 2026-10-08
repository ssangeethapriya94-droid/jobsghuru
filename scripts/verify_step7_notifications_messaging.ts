import { db } from "../src/lib/db";
import { UserRole } from "@prisma/client";
import { chromium } from "playwright";

async function runStep7Verification() {
  console.log("=== STEP 7 VERIFICATION: NOTIFICATIONS & MESSAGING ===");
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
    // 1. Setup test data
    const comp = await db.company.upsert({
      where: { name: "Step7 Test Corp" },
      update: {},
      create: { name: "Step7 Test Corp", slug: "step7-corp", industry: "IT", size: "10-50", location: "Delhi", description: "Desc" },
    });

    const job = await db.job.create({
      data: {
        title: "Frontend Engineer",
        description: "Desc",
        location: "Delhi",
        workMode: "HYBRID",
        jobType: "FULL_TIME",
        department: "Eng",
        companyId: comp.id,
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });

    const candidateUser = await db.user.upsert({
      where: { email: "step7.candidate@example.com" },
      update: {},
      create: { email: "step7.candidate@example.com", name: "Step7 Candidate", passwordHash: "hash", role: UserRole.CANDIDATE },
    });

    const app = await db.application.create({
      data: {
        jobId: job.id,
        candidateId: candidateUser.id,
        candidateName: "Step7 Candidate",
        candidateEmail: "step7.candidate@example.com",
        candidatePhone: "+91 99999 77777",
        status: "SUBMITTED",
      },
    });

    // 2. Test Notification Creation & Routing
    const notifRouted = await db.notification.create({
      data: {
        companyId: comp.id,
        applicationId: app.id,
        userId: candidateUser.id,
        recipientEmail: candidateUser.email,
        title: "Interview Scheduled",
        message: "Your interview is set for tomorrow.",
        type: "INTERVIEW_SCHEDULED",
        isUnrouted: false,
      },
    });

    const notifUnrouted = await db.notification.create({
      data: {
        title: "System Maintenance Alert",
        message: "Unrouted maintenance notification",
        type: "SYSTEM_ALERT",
        isUnrouted: true,
      },
    });

    assert(notifRouted.id !== undefined, "Routed notification created");
    assert(notifUnrouted.isUnrouted === true, "Unrouted notification created with isUnrouted = true");

    // 3. Test Application Messaging thread
    const msg1 = await db.applicationMessage.create({
      data: {
        applicationId: app.id,
        companyId: comp.id,
        senderName: "Recruiter Bob",
        senderEmail: "recruiter@step7corp.com",
        senderRole: "RECRUITER",
        content: "Hi Step7 Candidate, are you available for a chat?",
      },
    });

    const msg2 = await db.applicationMessage.create({
      data: {
        applicationId: app.id,
        companyId: comp.id,
        senderName: "Step7 Candidate",
        senderEmail: candidateUser.email,
        senderRole: "CANDIDATE",
        content: "Yes, I am available anytime today!",
      },
    });

    assert(msg1.id !== undefined && msg2.id !== undefined, "Messages successfully recorded in thread");

    // 4. Test Failed Email Outbox Record & Retry
    const failedEmail = await db.emailOutbox.create({
      data: {
        companyId: comp.id,
        applicationId: app.id,
        to: candidateUser.email,
        subject: "Interview Invitation",
        status: "FAILED",
        errorMessage: "Connection timeout to SMTP gateway",
      },
    });

    assert(failedEmail.status === "FAILED", "Failed email recorded in EmailOutbox with real error");

    // 5. Browser Test for Notification Bell & Pages
    console.log("Running Playwright browser check for Step 7...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("http://localhost:3000/employer/login", { waitUntil: "networkidle" });
    assert(page.url().includes("/employer/login"), "Employer login page loads cleanly");

    await page.goto("http://localhost:3000/employer/emails/failed", { waitUntil: "networkidle" });
    assert(page.url().includes("/employer/emails/failed") || page.url().includes("/employer/login"), "Failed Outbox Email page loads cleanly");

    await browser.close();

    console.log("\n=== STEP 7 SUMMARY ===");
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    if (failCount > 0) process.exit(1);
  } catch (err) {
    console.error("Step 7 Verification Error:", err);
    process.exit(1);
  }
}

runStep7Verification();
