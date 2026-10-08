import { db } from "../src/lib/db";
import { scheduleInterview } from "../src/lib/interview/service";

async function test() {
  const company = await db.company.findFirst({ where: { slug: "test-company-alpha" } });
  const job = await db.job.findFirst({ where: { companyId: company?.id } });
  const app = await db.application.findFirst({ where: { jobId: job?.id } });
  const user = await db.user.findFirst({ where: { email: "comp_admin_a@alpha.io" } });

  console.log({ company: company?.id, job: job?.id, app: app?.id, user: user?.id });

  if (company && job && app && user) {
    try {
      const inv = await scheduleInterview({
        companyId: company.id,
        actorId: user.id,
        actorName: user.name,
        actorEmail: user.email,
        actorRole: user.role,
        applicationId: app.id,
        jobId: job.id,
        title: "Debug Schedule Test",
        scheduledAt: new Date(Date.now() + 86400000),
        mode: "VIDEO",
        interviewers: [{ name: "Tester", email: "test@alpha.io", roleTitle: "Lead" }],
      });
      console.log("Success:", inv.id, inv.secureToken);
    } catch (e: any) {
      console.error("DEBUG ERROR:", e);
    }
  }
}

test()
  .catch(console.error)
  .finally(() => db.$disconnect());
