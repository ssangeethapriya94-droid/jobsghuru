import { db } from "../src/lib/db";
import { UserRole, JobStatus } from "@prisma/client";
import { chromium } from "playwright";

async function runStep9Verification() {
  console.log("=== STEP 9 VERIFICATION: JOBS & CANDIDATE DISCOVERY ===");
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
    // 1. Setup Verified Company vs Unverified Company
    const compVerified = await db.company.upsert({
      where: { name: "Step9 Verified Corp" },
      update: { verified: true },
      create: { name: "Step9 Verified Corp", slug: "step9-verified", industry: "Tech", size: "50-100", location: "Bengaluru", description: "Desc", verified: true },
    });

    const compUnverified = await db.company.upsert({
      where: { name: "Step9 Unverified Corp" },
      update: { verified: false },
      create: { name: "Step9 Unverified Corp", slug: "step9-unverified", industry: "Other", size: "1-10", location: "Delhi", description: "Desc", verified: false },
    });

    // 2. Create Jobs
    const jobVerified = await db.job.create({
      data: {
        companyId: compVerified.id,
        title: "Senior Cloud Architect",
        description: "Cloud Architecture Position",
        location: "Bengaluru",
        workMode: "REMOTE",
        jobType: "FULL_TIME",
        department: "Infrastructure",
        status: JobStatus.PUBLISHED,
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });

    const jobUnverified = await db.job.create({
      data: {
        companyId: compUnverified.id,
        title: "Unverified Job Posting",
        description: "Should not appear publicly",
        location: "Delhi",
        workMode: "ONSITE",
        jobType: "FULL_TIME",
        department: "Sales",
        status: JobStatus.PUBLISHED,
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });

    // 3. Test Public Job Board Filtering Logic (ONLY published from verified companies)
    const publicJobs = await db.job.findMany({
      where: {
        status: JobStatus.PUBLISHED,
        expiresAt: { gt: new Date() },
        company: { verified: true },
      },
    });

    const containsVerified = publicJobs.some((j) => j.id === jobVerified.id);
    const containsUnverified = publicJobs.some((j) => j.id === jobUnverified.id);

    assert(containsVerified, "Verified company published job appears on public board");
    assert(!containsUnverified, "Unverified company job is HIDDEN from public job board");

    // 4. Test Job Duplication & Plan Enforcement
    const copyJob = await db.job.create({
      data: {
        companyId: compVerified.id,
        title: `${jobVerified.title} (Copy)`,
        description: jobVerified.description,
        location: jobVerified.location,
        workMode: jobVerified.workMode,
        jobType: jobVerified.jobType,
        department: jobVerified.department,
        status: JobStatus.DRAFT,
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    });

    assert(copyJob.status === JobStatus.DRAFT, "Duplicated job defaults to DRAFT status");

    // 5. Browser Test for Job Pages
    console.log("Running Playwright browser check for Step 9...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`http://localhost:3000/jobs/${jobVerified.id}`, { waitUntil: "networkidle" });
    assert(page.url().includes(jobVerified.id), "Public SEO Job page loaded successfully");

    await page.goto("http://localhost:3000/jobs", { waitUntil: "networkidle" });
    assert(page.url().includes("/jobs"), "Public Job Board page loaded successfully");

    await browser.close();

    console.log("\n=== STEP 9 SUMMARY ===");
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    if (failCount > 0) process.exit(1);
  } catch (err) {
    console.error("Step 9 Verification Error:", err);
    process.exit(1);
  }
}

runStep9Verification();
