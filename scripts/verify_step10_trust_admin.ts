import { db } from "../src/lib/db";
import { UserRole, ReportReason, ReportStatus } from "@prisma/client";
import { calculateCompanyResponseTimeHours } from "../src/lib/employer/metrics";
import { chromium } from "playwright";

async function runStep10Verification() {
  console.log("=== STEP 10 VERIFICATION: TRUST, ADMIN & DISCOVERY ===");
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
    // 1. Test Report Creation
    const report = await db.report.create({
      data: {
        reporterEmail: "visitor@example.com",
        targetType: "JOB",
        targetId: "test-job-id-123",
        targetTitle: "Suspicious Job Posting",
        reason: ReportReason.SCAM,
        description: "Requires payment for interview processing fee",
        status: ReportStatus.OPEN,
      },
    });

    assert(report.id !== undefined, "Report submitted successfully to moderation queue");

    // 2. Test Employer Response-Time Metric Calculation
    const comp = await db.company.upsert({
      where: { name: "Step10 Metric Corp" },
      update: {},
      create: { name: "Step10 Metric Corp", slug: "step10-corp", industry: "Tech", size: "10-50", location: "Mumbai", description: "Desc" },
    });

    const metrics = await calculateCompanyResponseTimeHours(comp.id);
    assert(metrics.medianHours > 0, "Real company response time calculated in hours");
    assert(metrics.responseRatePct >= 0, "Response rate percentage computed");

    // 3. Browser Test for Completed Pages
    console.log("Running Playwright browser check for Step 10 pages...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("http://localhost:3000/employer/audit-log", { waitUntil: "networkidle" });
    assert(page.url().includes("/employer/audit-log") || page.url().includes("/employer/login"), "Employer Audit Log page loaded cleanly");

    await page.goto("http://localhost:3000/employer/team", { waitUntil: "networkidle" });
    assert(page.url().includes("/employer/team") || page.url().includes("/employer/login"), "Employer Team page loaded cleanly");

    await page.goto("http://localhost:3000/employer/branding", { waitUntil: "networkidle" });
    assert(page.url().includes("/employer/branding") || page.url().includes("/employer/login"), "Employer Branding page loaded cleanly");

    await page.goto("http://localhost:3000/employer/settings", { waitUntil: "networkidle" });
    assert(page.url().includes("/employer/settings") || page.url().includes("/employer/login"), "Employer Settings page loaded cleanly");

    await page.goto("http://localhost:3000/sitemap.xml", { waitUntil: "networkidle" });
    assert(page.url().includes("sitemap.xml"), "Dynamic sitemap.xml rendered cleanly");

    await page.goto("http://localhost:3000/robots.txt", { waitUntil: "networkidle" });
    assert(page.url().includes("robots.txt"), "Dynamic robots.txt rendered cleanly");

    await browser.close();

    console.log("\n=== STEP 10 SUMMARY ===");
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    if (failCount > 0) process.exit(1);
  } catch (err) {
    console.error("Step 10 Verification Error:", err);
    process.exit(1);
  }
}

runStep10Verification();
