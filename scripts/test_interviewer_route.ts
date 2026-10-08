import { db } from "../src/lib/db";
import { createEmployerSession } from "../src/lib/employer/auth";

async function testInterviewer() {
  const comp = await db.company.findFirst({ where: { slug: "test-company-alpha" } });
  const interviewer = await db.user.findFirst({ where: { email: "interviewer_a@alpha.io" } });

  if (!comp || !interviewer) {
    console.log("Comp or interviewer not found");
    return;
  }

  const job = await db.job.create({
    data: {
      title: "Test Job for Interviewer Filter",
      department: "Eng",
      location: "BLR",
      workMode: "REMOTE",
      jobType: "FULL_TIME",
      description: "Test Job",
      companyId: comp.id,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });

  const app = await db.application.create({
    data: {
      jobId: job.id,
      candidateName: "Cand 1",
      candidateEmail: "cand1@test.io",
      candidatePhone: "9999999999",
      status: "INTERVIEW_SCHEDULED",
    },
  });

  const inv1 = await db.interview.create({
    data: {
      companyId: comp.id,
      jobId: job.id,
      applicationId: app.id,
      candidateName: app.candidateName,
      candidateEmail: app.candidateEmail,
      title: "Inv 1 for Interviewer",
      interviewerId: interviewer.id,
      scheduledAt: new Date(Date.now() + 3600000),
      durationMinutes: 45,
      mode: "VIDEO",
      secureToken: "tok_test_inv_1_" + Date.now(),
      status: "SCHEDULED",
    },
  });

  const token = await createEmployerSession(interviewer.id, "127.0.0.1");

  const res = await fetch("http://localhost:3001/api/employer/interviews", {
    headers: { Cookie: `cb_employer_session=${token}` },
  });

  const data = await res.json();
  console.log("Interviewer fetch status:", res.status);
  console.log("Interviewer visible interviews:", data.interviews?.length, data.interviews?.map((i: any) => i.id));

  // Clean up
  await db.interview.delete({ where: { id: inv1.id } }).catch(() => {});
  await db.application.delete({ where: { id: app.id } }).catch(() => {});
  await db.job.delete({ where: { id: job.id } }).catch(() => {});
}

testInterviewer()
  .catch(console.error)
  .finally(() => db.$disconnect());
