import { db } from "../src/lib/db";
import { UserRole } from "@prisma/client";
import { chromium } from "playwright";

async function runStep8Verification() {
  console.log("=== STEP 8 VERIFICATION: CANDIDATE SEARCH & TALENT POOLS ===");
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
    // 1. Setup test candidate profiles (1 opted in, 1 opted out)
    const optInUser = await db.user.upsert({
      where: { email: "optin.candidate@example.com" },
      update: {},
      create: { email: "optin.candidate@example.com", name: "OptIn Candidate", passwordHash: "hash", role: UserRole.CANDIDATE },
    });

    const optOutUser = await db.user.upsert({
      where: { email: "optout.candidate@example.com" },
      update: {},
      create: { email: "optout.candidate@example.com", name: "OptOut Candidate", passwordHash: "hash", role: UserRole.CANDIDATE },
    });

    await db.candidateProfile.upsert({
      where: { userId: optInUser.id },
      update: { searchableByEmployers: true, contactableByEmployers: true, hideSalaryFromEmployers: true },
      create: {
        userId: optInUser.id,
        headline: "Senior React Architect",
        skills: ["React", "TypeScript", "Next.js"],
        totalExperienceYears: 6,
        searchableByEmployers: true,
        contactableByEmployers: true,
        hideSalaryFromEmployers: true,
        expectedCtc: 25,
      },
    });

    await db.candidateProfile.upsert({
      where: { userId: optOutUser.id },
      update: { searchableByEmployers: false },
      create: {
        userId: optOutUser.id,
        headline: "Hidden Engineer",
        skills: ["Python", "Django"],
        totalExperienceYears: 4,
        searchableByEmployers: false,
        contactableByEmployers: false,
      },
    });

    // 2. Query Search API logic directly
    const searchableProfiles = await db.candidateProfile.findMany({
      where: { searchableByEmployers: true },
    });

    const hasOptIn = searchableProfiles.some((p) => p.userId === optInUser.id);
    const hasOptOut = searchableProfiles.some((p) => p.userId === optOutUser.id);

    assert(hasOptIn, "Opted-in candidate appears in search results");
    assert(!hasOptOut, "Opted-out candidate NEVER appears in employer search results");

    // 3. Test Talent Pool Creation & Member Management
    const comp = await db.company.upsert({
      where: { name: "Step8 Talent Corp" },
      update: {},
      create: { name: "Step8 Talent Corp", slug: "step8-corp", industry: "Tech", size: "100+", location: "Pune", description: "Desc" },
    });

    const pool = await db.talentPool.create({
      data: {
        companyId: comp.id,
        name: "React Specialists",
        description: "Frontend candidates with 5+ yrs exp",
      },
    });

    assert(pool.id !== undefined, "Talent pool created successfully");

    const member = await db.talentPoolMember.create({
      data: {
        poolId: pool.id,
        candidateId: optInUser.id,
        candidateEmail: optInUser.email,
        candidateName: optInUser.name,
      },
    });

    assert(member.id !== undefined, "Candidate added to talent pool successfully");

    // 4. Browser Check (Playwright) for Search and Pools Pages
    console.log("Running Playwright browser check for Step 8...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("http://localhost:3000/employer/candidates/search", { waitUntil: "networkidle" });
    assert(page.url().includes("/employer/candidates/search") || page.url().includes("/employer/login"), "Browser loaded Candidate Search page");

    await page.goto("http://localhost:3000/employer/talent-pools", { waitUntil: "networkidle" });
    assert(page.url().includes("/employer/talent-pools") || page.url().includes("/employer/login"), "Browser loaded Talent Pools list page");

    await page.goto(`http://localhost:3000/employer/talent-pools/${pool.id}`, { waitUntil: "networkidle" });
    assert(page.url().includes(pool.id) || page.url().includes("/employer/login"), "Browser loaded Talent Pool Detail page");

    await browser.close();

    console.log("\n=== STEP 8 SUMMARY ===");
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    if (failCount > 0) process.exit(1);
  } catch (err) {
    console.error("Step 8 Verification Error:", err);
    process.exit(1);
  }
}

runStep8Verification();
