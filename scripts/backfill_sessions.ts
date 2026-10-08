import { db } from "../src/lib/db";

async function main() {
  const sessions = await db.adminSession.findMany({
    include: { user: true },
  });

  console.log(`Found ${sessions.length} sessions to check/backfill.`);

  let updated = 0;
  const employerRoles = ["COMPANY_ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER"];

  for (const s of sessions) {
    const shouldBeEmployer = employerRoles.includes(s.user.role);
    const targetRealm = shouldBeEmployer ? "EMPLOYER" : "ADMIN";

    if (s.realm !== targetRealm) {
      await db.adminSession.update({
        where: { id: s.id },
        data: { realm: targetRealm },
      });
      updated++;
    }
  }

  console.log(`Backfilled ${updated} sessions successfully.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
