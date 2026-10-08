import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Helper to parse key-value pairs from an env file
function parseEnvFile(filePath: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
          result[key] = val;
        }
      }
    }
  }
  return result;
}

// 1. Read primary .env
const primaryEnv = parseEnvFile(path.join(process.cwd(), ".env"));
const primaryDbUrl = process.env.DATABASE_URL || primaryEnv.DATABASE_URL || "";

// 2. Read .env.test
const testEnv = parseEnvFile(path.join(process.cwd(), ".env.test"));
const testDbUrl = process.env.TEST_DATABASE_URL || testEnv.TEST_DATABASE_URL || "";

// Guard 1: TEST_DATABASE_URL must be defined
if (!testDbUrl) {
  console.error("FATAL: TEST_DATABASE_URL is not configured in .env.test. Aborting test runner.");
  process.exit(1);
}

// Guard 2: Refuse to run if TEST_DATABASE_URL equals DATABASE_URL
if (primaryDbUrl && testDbUrl === primaryDbUrl) {
  console.error("FATAL: TEST_DATABASE_URL must not equal DATABASE_URL. Test runner refused to run against primary database.");
  process.exit(1);
}

// Guard 3: Production safety check (without printing URLs)
const isProduction =
  process.env.NODE_ENV === "production" ||
  testDbUrl.toLowerCase().includes("production") ||
  testDbUrl.toLowerCase().includes("-prod.") ||
  testDbUrl.toLowerCase().includes("/prod");

if (isProduction) {
  console.error("FATAL: Test runner refused to run. Non-development/production database target detected!");
  process.exit(1);
}

console.log("Database security check passed: Dedicated TEST_DATABASE_URL verified (isolated from DATABASE_URL).");

// Initialize Prisma client pointing specifically to TEST_DATABASE_URL
const prisma = new PrismaClient({
  datasources: {
    db: { url: testDbUrl },
  },
});

interface SuiteResult {
  suite: string;
  command: string;
  passed: boolean;
  durationSec: number;
}

const suites = [
  { name: "Step 1 Security", script: "scripts/test_step1_http_e2e.ts" },
  { name: "Step 2 Candidate Foundation", script: "scripts/test_step2_http_e2e.ts" },
  { name: "Step 3 Application Detail", script: "scripts/test_step3_http_e2e.ts" },
  { name: "Step 3 Requirements Verification", script: "scripts/verify_step3_exact_requirements.ts" },
  { name: "Step 4 Candidate 360", script: "scripts/verify_step4_candidate360.ts" },
  { name: "Step 5 Assessments", script: "scripts/verify_step5_assessments.ts" },
];

async function main() {
  console.log("================================================================================");
  console.log("                       CAREERBRIDGE FULL TEST SUITE RUNNER                      ");
  console.log("================================================================================\n");

  const results: SuiteResult[] = [];

  for (const suite of suites) {
    // Delete ONLY rate limit rows created by test suites (scoped to test IPs and keys)
    await prisma.rateLimitBucket.deleteMany({
      where: {
        OR: [
          { key: { contains: "127.0.0.1" } },
          { key: { contains: "::1" } },
          { key: { contains: "localhost" } },
          { key: { contains: "test_" } },
          { key: { contains: "example.com" } },
          { key: { startsWith: "test" } },
          { key: { contains: ":10." } }, // test IP range
          { key: { contains: ":192.168." } },
        ],
      },
    }).catch(() => {});

    const start = Date.now();
    let passed = true;
    try {
      execSync(`npx tsx ${suite.script}`, {
        stdio: "inherit",
        encoding: "utf-8",
        env: {
          ...process.env,
          DATABASE_URL: testDbUrl,
          DIRECT_URL: testEnv.TEST_DIRECT_URL || testDbUrl,
          BASE_URL: process.env.BASE_URL || testEnv.TEST_BASE_URL || "http://localhost:3000",
          TEST_BASE_URL: process.env.TEST_BASE_URL || testEnv.TEST_BASE_URL || "http://localhost:3000",
        },
      });
    } catch (err: any) {
      passed = false;
    }
    const durationSec = Math.round((Date.now() - start) / 100) / 10;
    results.push({
      suite: suite.name,
      command: suite.script,
      passed,
      durationSec,
    });
    console.log(`\n[${passed ? "PASS" : "FAIL"}] ${suite.name} (${durationSec}s)\n`);
  }

  console.log("================================================================================");
  const allPassed = results.every((r) => r.passed);
  console.log(`SUMMARY: ${results.filter((r) => r.passed).length}/${results.length} test suites passed.`);
  console.log("================================================================================");

  await prisma.$disconnect();

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch(async (e) => {
  console.error("Test runner execution error:", e.message || e);
  await prisma.$disconnect();
  process.exit(1);
});
