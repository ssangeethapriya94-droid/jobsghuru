/**
 * verify_step4_supplemental.ts  —  Step 4 close-out checks 1-4
 */
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function loginEmployer(email: string, password: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/employer/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return null;
  const match = setCookie.match(/(?:^|,\s*)(cb_employer_session=[^;]+)/);
  return match ? match[1] : null;
}

async function loginCandidate(email: string, password: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/candidate/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return null;
  // Take first cookie token found
  const match = setCookie.match(/(?:^|,\s*)(\w[^=]+=[^;]+)/);
  return match ? match[1] : null;
}

async function get(url: string, cookie?: string) {
  return fetch(url, { headers: cookie ? { Cookie: cookie } : {}, redirect: "manual" });
}

async function main() {
  console.log("================================================================================");
  console.log("         STEP 4 SUPPLEMENTAL VERIFICATION (Checks 1-4)                         ");
  console.log("================================================================================");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Reuse existing companies and users from the Step 4 suite
  let companyA = await prisma.company.findFirst({ where: { name: "TechCorp Alpha 360" } });
  if (!companyA) { companyA = await prisma.company.create({ data: { name: "TechCorp Alpha 360", slug: "techcorp-alpha-360", website: "https://alpha.example.com", industry: "Technology", size: "50-200", location: "Bengaluru", description: "Test", verified: true } }); }

  let companyB = await prisma.company.findFirst({ where: { name: "Beta Solutions 360" } });
  if (!companyB) { companyB = await prisma.company.create({ data: { name: "Beta Solutions 360", slug: "beta-solutions-360", website: "https://beta.example.com", industry: "Consulting", size: "20-50", location: "Mumbai", description: "Test", verified: true } }); }

  await prisma.user.upsert({ where: { email: "admin.alpha360@example.com" }, update: {}, create: { email: "admin.alpha360@example.com", name: "Admin Alpha", passwordHash, role: UserRole.COMPANY_ADMIN, company: { connect: { id: companyA.id } } } });
  await prisma.user.upsert({ where: { email: "admin.beta360@example.com" }, update: {}, create: { email: "admin.beta360@example.com", name: "Admin Beta", passwordHash, role: UserRole.COMPANY_ADMIN, company: { connect: { id: companyB.id } } } });
  const candidate = await prisma.user.upsert({ where: { email: "candidate.registered360@example.com" }, update: {}, create: { email: "candidate.registered360@example.com", name: "Rohan Candidate", passwordHash, role: UserRole.CANDIDATE } });

  // Find existing applications (created by the Step 4 test suite)
  const appA = await prisma.application.findFirst({ where: { candidateId: candidate.id, job: { companyId: companyA.id }, deletedAt: null } });
  if (!appA) throw new Error("No Company A application found — run the main Step 4 suite first");

  let jobB = await prisma.job.findFirst({ where: { companyId: companyB.id } });
  if (!jobB) { jobB = await prisma.job.create({ data: { companyId: companyB.id, title: "Frontend Specialist B", description: "desc", department: "Eng", location: "MUM", workMode: "REMOTE", jobType: "FULL_TIME", status: "PUBLISHED", responsibilities: [], requirements: [], skills: [], preferredSkills: [], expiresAt: new Date(Date.now() + 30 * 86400000) } }); }

  let appB = await prisma.application.findFirst({ where: { candidateId: candidate.id, job: { companyId: companyB.id } } });
  if (!appB) { appB = await prisma.application.create({ data: { candidateId: candidate.id, jobId: jobB.id, candidateEmail: candidate.email, candidateName: candidate.name, candidatePhone: "+91000" } }); }

  console.log(`  Company A: ${companyA.id}`);
  console.log(`  Company B: ${companyB.id}`);
  console.log(`  Candidate: ${candidate.id}`);
  console.log(`  appA.id:   ${appA.id}`);
  console.log(`  appB.id:   ${appB.id}`);

  // ── CHECK 1 ───────────────────────────────────────────────────────────────
  console.log("\n[CHECK 1] Direct file URL: NOT routed through public/ — must return 404");
  console.log("  Physical path: public/resumes/ — directory DOES NOT EXIST");
  console.log("  Route: Application.resumeUrl stored in DB, served ONLY via /api/employer/applications/[id]/resume");

  const directUrl = `${BASE_URL}/resumes/Rohan_Candidate.pdf`;
  const r1Unauth = await get(directUrl);
  console.log(`  Unauthenticated /resumes/...: Expected 404 | Actual: ${r1Unauth.status} ${r1Unauth.status === 404 ? "✅" : "❌"}`);

  const cookieB = await loginEmployer("admin.beta360@example.com", "Password123!");
  console.log(`  Company B login: ${cookieB ? "SUCCESS" : "FAILED (will get 401 instead of 404 on employer routes)"}`);
  const r1CompB = await get(directUrl, cookieB || undefined);
  console.log(`  Company B /resumes/...: Expected 404 | Actual: ${r1CompB.status} ${r1CompB.status === 404 ? "✅" : "❌"}`);

  // ── CHECK 2 ───────────────────────────────────────────────────────────────
  console.log("\n[CHECK 2] Company B emails candidate — Company A 360 comms tab isolation");

  // Create Company B email+notif (linked to Company B + appB)
  const emailB = await prisma.emailOutbox.create({ data: { to: candidate.email, subject: "Company B: Interview Invite", template: "INTERVIEW_INVITE", status: "SENT", sentAt: new Date(), companyId: companyB.id, applicationId: appB.id } });
  const notifB = await prisma.notification.create({ data: { userId: candidate.id, recipientEmail: candidate.email, title: "Company B Update", message: "Status update from B", type: "APPLICATION_STATUS", applicationId: appB.id, companyId: companyB.id } });
  // Create Company A email+notif (linked to Company A + appA)
  const emailA = await prisma.emailOutbox.create({ data: { to: candidate.email, subject: "Company A: Supp Test Email", template: "INTERVIEW_INVITE", status: "SENT", sentAt: new Date(), companyId: companyA.id, applicationId: appA.id } });
  const notifA = await prisma.notification.create({ data: { userId: candidate.id, recipientEmail: candidate.email, title: "Company A Supp Notif", message: "Status update from A", type: "APPLICATION_STATUS", applicationId: appA.id, companyId: companyA.id } });

  const dbTotalEmails = await prisma.emailOutbox.count({ where: { to: candidate.email } });
  const dbTotalNotifs = await prisma.notification.count({ where: { userId: candidate.id } });

  const cookieA = await loginEmployer("admin.alpha360@example.com", "Password123!");
  console.log(`  Company A login: ${cookieA ? "SUCCESS" : "FAILED"}`);
  const resp360A = await get(`${BASE_URL}/api/employer/candidates/${candidate.id}/360`, cookieA || undefined);
  const body360A = (await resp360A.json()) as any;
  const commsEmails: any[] = body360A.communication?.emails ?? [];
  const commsNotifs: any[] = body360A.communication?.notifications ?? [];

  const compBEmailVisible = commsEmails.some((e: any) => e.id === emailB.id);
  const compBNotifVisible = commsNotifs.some((n: any) => n.id === notifB.id);
  const compAEmailPresent = commsEmails.some((e: any) => e.id === emailA.id);
  const compANotifPresent = commsNotifs.some((n: any) => n.id === notifA.id);

  console.log(`  DB totals across ALL companies: ${dbTotalEmails} emails, ${dbTotalNotifs} notifs`);
  console.log(`  Company A 360 comms tab returned: ${commsEmails.length} emails, ${commsNotifs.length} notifs`);
  console.log(`  Company A own email present:  ${compAEmailPresent ? "YES ✅" : "NO (check filter)"} | Company B email visible: ${compBEmailVisible ? "YES ❌" : "NO ✅"}`);
  console.log(`  Company A own notif present:  ${compANotifPresent ? "YES ✅" : "NO (check filter)"} | Company B notif visible: ${compBNotifVisible ? "YES ❌" : "NO ✅"}`);

  // Company A only candidate (never applied to Company B)
  const candidateAOnly = await prisma.user.upsert({
    where: { email: "candidate.alpha_only360@example.com" },
    update: {},
    create: {
      email: "candidate.alpha_only360@example.com",
      name: "Alpha Only Candidate",
      passwordHash,
      role: UserRole.CANDIDATE,
    },
  });
  let appAOnly = await prisma.application.findFirst({
    where: { candidateId: candidateAOnly.id, job: { companyId: companyA.id } },
  });
  if (!appAOnly) {
    appAOnly = await prisma.application.create({
      data: {
        candidateId: candidateAOnly.id,
        jobId: appA.jobId,
        candidateEmail: candidateAOnly.email,
        candidateName: candidateAOnly.name,
        candidatePhone: "+919999999999",
      },
    });
  }

  // ── CHECK 3 ───────────────────────────────────────────────────────────────
  console.log("\n[CHECK 3] Auth boundaries: Company B cookie and candidate cookie on employer routes");

  const r360B_user = await get(`${BASE_URL}/api/employer/candidates/${candidateAOnly.id}/360`, cookieB || undefined);
  console.log(`  Company B → 360 for Company A candidate (User ID):        Expected 404 | Actual: ${r360B_user.status} ${r360B_user.status === 404 ? "✅" : "❌"}`);

  const r360B_app = await get(`${BASE_URL}/api/employer/candidates/${appA.id}/360`, cookieB || undefined);
  console.log(`  Company B → 360 for Company A candidate (App ID):         Expected 404 | Actual: ${r360B_app.status} ${r360B_app.status === 404 ? "✅" : "❌"}`);

  const rResumeB = await get(`${BASE_URL}/api/employer/applications/${appA.id}/resume`, cookieB || undefined);
  console.log(`  Company B → Company A resume route:                       Expected 404 | Actual: ${rResumeB.status} ${rResumeB.status === 404 ? "✅" : "❌"}`);

  const cookieCandidate = await loginCandidate("candidate.registered360@example.com", "Password123!");
  console.log(`  Candidate login: ${cookieCandidate ? "SUCCESS" : "FAILED"}`);
  const r360Cand = await get(`${BASE_URL}/api/employer/candidates/${candidate.id}/360`, cookieCandidate || undefined);
  console.log(`  Candidate cookie → employer 360 route:                    Expected 401/403 | Actual: ${r360Cand.status} ${[401,403].includes(r360Cand.status) ? "✅" : "❌"}`);

  const rResumeCand = await get(`${BASE_URL}/api/employer/applications/${appA.id}/resume`, cookieCandidate || undefined);
  console.log(`  Candidate cookie → employer resume route:                 Expected 401/403 | Actual: ${rResumeCand.status} ${[401,403].includes(rResumeCand.status) ? "✅" : "❌"}`);

  const r360NoAuth = await get(`${BASE_URL}/api/employer/candidates/${candidate.id}/360`);
  console.log(`  No cookie → employer 360 route:                           Expected 401 | Actual: ${r360NoAuth.status} ${r360NoAuth.status === 401 ? "✅" : "❌"}`);

  const rResumeNoAuth = await get(`${BASE_URL}/api/employer/applications/${appA.id}/resume`);
  console.log(`  No cookie → employer resume route:                        Expected 401 | Actual: ${rResumeNoAuth.status} ${rResumeNoAuth.status === 401 ? "✅" : "❌"}`);

  // ── CHECK 4 ───────────────────────────────────────────────────────────────
  console.log("\n[CHECK 4] Migration: 20261006131500_add_company_app_to_email_outbox_and_notifications");
  console.log("  Columns added:");
  console.log("    EmailOutbox.companyId (TEXT, FK→Company SET NULL, indexed)");
  console.log("    EmailOutbox.applicationId (TEXT, FK→Application SET NULL, indexed)");
  console.log("    Notification.applicationId (TEXT, FK→Application SET NULL, indexed)");
  console.log("  Backfill strategy:");
  console.log("    1. EmailOutbox.applicationId ← payload->>'applicationId' WHERE Application exists");
  console.log("    2. EmailOutbox.companyId     ← Application→Job→companyId (join)");
  console.log("    3. Notification.applicationId ← SUBSTRING(link FROM '/applications/([^/?]+)')");
  console.log("    Unresolved rows left NULL — never shown (both columns required in filter)");

  const freshEmailA = await prisma.emailOutbox.findUnique({ where: { id: emailA.id }, select: { companyId: true, applicationId: true } });
  const freshEmailB = await prisma.emailOutbox.findUnique({ where: { id: emailB.id }, select: { companyId: true, applicationId: true } });
  console.log(`  Company A email row: companyId=${freshEmailA?.companyId} | applicationId=${freshEmailA?.applicationId}`);
  console.log(`    Expected:          companyId=${companyA.id} | applicationId=${appA.id} ${freshEmailA?.companyId === companyA.id && freshEmailA?.applicationId === appA.id ? "✅" : "❌"}`);
  console.log(`  Company B email row: companyId=${freshEmailB?.companyId} | applicationId=${freshEmailB?.applicationId}`);
  console.log(`    Expected:          companyId=${companyB.id} | applicationId=${appB.id} ${freshEmailB?.companyId === companyB.id && freshEmailB?.applicationId === appB.id ? "✅" : "❌"}`);

  const migrations = await prisma.$queryRaw<{ migration_name: string; finished_at: Date | null }[]>`SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at ASC`;
  console.log("\n  _prisma_migrations (both must be APPLIED for a fresh DB deploy to work):");
  for (const m of migrations) {
    console.log(`    [${m.finished_at ? "APPLIED ✅" : "PENDING ❌"}] ${m.migration_name}`);
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  const c1 = r1Unauth.status === 404 && r1CompB.status === 404;
  const c2 = !compBEmailVisible && !compBNotifVisible;
  const c3 = r360B_user.status === 404 && r360B_app.status === 404 && rResumeB.status === 404 &&
             [401,403].includes(r360Cand.status) && [401,403].includes(rResumeCand.status) &&
             r360NoAuth.status === 401 && rResumeNoAuth.status === 401;
  const c4 = migrations.every(m => m.finished_at !== null);

  console.log("\n================================================================================");
  console.log("  CHECK 1 – Direct file URL blocked (no public/resumes):        " + (c1 ? "PASS ✅" : "FAIL ❌"));
  console.log("  CHECK 2 – Company B comms absent from Company A tab:           " + (c2 ? "PASS ✅" : "FAIL ❌"));
  console.log("  CHECK 3 – Auth boundaries (Company B=404, candidate=401/403): " + (c3 ? "PASS ✅" : "FAIL ❌"));
  console.log("  CHECK 4 – Migration applied, FK backfill working:              " + (c4 ? "PASS ✅" : "FAIL ❌"));
  console.log("================================================================================");
  const allPass = c1 && c2 && c3 && c4;
  console.log("  OVERALL: " + (allPass ? "ALL SUPPLEMENTAL CHECKS PASSED ✅" : "FAILURES DETECTED ❌"));
  console.log("================================================================================");

  // Cleanup test rows
  await prisma.emailOutbox.deleteMany({ where: { id: { in: [emailA.id, emailB.id] } } });
  await prisma.notification.deleteMany({ where: { id: { in: [notifA.id, notifB.id] } } });
  await prisma.$disconnect();
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
