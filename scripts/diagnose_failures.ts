import { db } from "../src/lib/db";
import { hashLegacyPassword } from "../src/lib/auth/password";
import { createEmployerSession } from "../src/lib/employer/auth";

async function diagnose() {
  console.log("Diagnosing test failures...");

  // 1. Test Employer Login directly
  const compAdmin = await db.user.findFirst({
    where: { email: "legacy_user_test@alpha.io" },
    include: { company: true },
  });
  console.log("CompAdmin found:", compAdmin?.id, compAdmin?.company?.name);

  const loginRes = await fetch("http://localhost:3001/api/employer/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "legacy_user_test@alpha.io", password: "Step1SecurePass2026!" }),
  });
  console.log("Login status:", loginRes.status);
  console.log("Login body:", await loginRes.text());

  // 2. Test Interviewer Scope
  const interviewer = await db.user.findFirst({
    where: { email: "interviewer_a@alpha.io" },
  });
  if (interviewer) {
    const token = await createEmployerSession(interviewer.id);
    const intRes = await fetch("http://localhost:3001/api/employer/interviews", {
      headers: { Cookie: `cb_employer_session=${token}` },
    });
    console.log("Interviews list status:", intRes.status);
    const intData = await intRes.json();
    console.log("Interviews list count:", intData.interviews?.length);
  }

  // 3. Test Candidate interview endpoint
  const interview = await db.interview.findFirst();
  if (interview) {
    console.log("Testing candidate interview endpoint for token:", interview.secureToken);
    const candRes = await fetch(`http://localhost:3001/api/candidate/interviews/${interview.secureToken}`);
    console.log("Candidate interview status:", candRes.status);
    console.log("Candidate interview body:", await candRes.text());
  }
}

diagnose()
  .catch(console.error)
  .finally(() => db.$disconnect());
