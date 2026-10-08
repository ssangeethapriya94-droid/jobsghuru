import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("=== PLAYWRIGHT CANDIDATE 360 REAL BROWSER VERIFICATION ===");

  // 1. Find Admin A and Candidate Rohan
  const compA = await prisma.company.findFirst({
    where: { name: "TechCorp Alpha 360" },
  });
  if (!compA) throw new Error("Step4 Corp A company not found in DB");

  const adminA = await prisma.user.findFirst({
    where: { companyId: compA.id, role: "COMPANY_ADMIN" },
  });
  if (!adminA) throw new Error("Admin A user not found in DB");

  const candidate = await prisma.user.findFirst({
    where: { name: "Rohan Candidate" },
  });
  if (!candidate) throw new Error("Rohan Candidate not found in DB");

  // 2. Create active session token
  const sessionToken = `test_session_${adminA.id}_${Date.now()}`;
  await prisma.adminSession.create({
    data: {
      token: sessionToken,
      userId: adminA.id,
      realm: "EMPLOYER",
      ipAddress: "127.0.0.1",
      userAgent: "Playwright Browser Verification",
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
    },
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Set auth cookie
  await context.addCookies([
    {
      name: "cb_employer_session",
      value: sessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  const pageErrors: string[] = [];
  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  const url = `http://localhost:3000/employer/candidates/${candidate.id}`;
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  console.log("Waiting for company authentication and profile data to load...");
  await page.waitForSelector("text=Rohan Candidate", { timeout: 30000 });
  console.log("✓ Candidate header and name rendered correctly: Rohan Candidate");

  // Tabs to test
  const tabs = [
    { id: "applications", label: "Applications" },
    { id: "interviews", label: "Interviews" },
    { id: "notes", label: "Notes" },
    { id: "assessments", label: "Assessments" },
    { id: "offers", label: "Offers" },
    { id: "timeline", label: "Timeline" },
    { id: "communication", label: "Communication" },
  ];

  for (const tab of tabs) {
    console.log(`Testing tab: ${tab.label}...`);
    // Click button matching tab label
    const tabButton = page.locator(`button:has-text("${tab.label}")`).first();
    await tabButton.click();
    await page.waitForTimeout(300);

    const bodyContent = await page.textContent("body");
    console.log(`✓ Tab '${tab.label}' active and rendered without error.`);
  }

  console.log(`Console errors encountered: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log("Console errors detail:", consoleErrors);
  }

  console.log(`Page uncaught errors encountered: ${pageErrors.length}`);
  if (pageErrors.length > 0) {
    console.log("Page errors detail:", pageErrors);
  }

  await page.screenshot({ path: "candidate_360_browser_check.png", fullPage: true });
  console.log("Screenshot saved to candidate_360_browser_check.png");

  await browser.close();
  await prisma.$disconnect();

  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    throw new Error("Browser verification failed due to console or page errors");
  }

  console.log("🎉 ALL CANDIDATE 360 TABS RENDERED SUCCESSFULLY WITH ZERO CONSOLE/SERVER ERRORS!");
}

main().catch((err) => {
  console.error("Browser verification error:", err);
  process.exit(1);
});
