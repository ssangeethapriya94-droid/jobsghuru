import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import crypto from "crypto";

const db = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "careerbridge_salt_2026").digest("hex");
}

async function main() {
  const companies = await db.company.findMany();
  console.log(`Checking employer users for ${companies.length} companies...`);

  for (const c of companies) {
    const existingUser = await db.user.findFirst({
      where: { companyId: c.id },
    });

    if (!existingUser) {
      const email = `talent@${c.slug}.com`;
      await db.user.create({
        data: {
          name: `${c.name} Talent Team`,
          email,
          passwordHash: hashPassword("CareerBridge2026!"),
          role: UserRole.COMPANY_ADMIN,
          status: UserStatus.ACTIVE,
          phone: "+91 98400 11223",
          companyId: c.id,
        },
      });
      console.log(`Created employer admin user for ${c.name}: ${email}`);
    }
  }

  // Ensure default demo recruiters
  let demoCompany = await db.company.findFirst({ where: { verified: true } });
  if (!demoCompany) {
    demoCompany = await db.company.create({
      data: {
        name: "JobsGhuru Verified Enterprise",
        slug: "jobsghuru-verified-enterprise",
        verified: true,
        industry: "Information Technology",
        location: "Bengaluru, India",
        size: "100-500",
        description: "Verified corporate hiring partner on JobsGhuru.",
      },
    });
  }

  const demoAccounts = [
    { email: "sarah.recruiter@example.com", name: "Sarah Jenkins" },
    { email: "recruiter@example.com", name: "Alex Recruiter" },
    { email: "recruiter@northwindlabs.com", name: "Karthik Raja" },
  ];

  for (const acc of demoAccounts) {
    await db.user.upsert({
      where: { email: acc.email },
      update: {
        companyId: demoCompany.id,
        role: UserRole.COMPANY_ADMIN,
        status: UserStatus.ACTIVE,
        passwordHash: hashPassword("RecruiterPass123!"),
      },
      create: {
        name: acc.name,
        email: acc.email,
        passwordHash: hashPassword("RecruiterPass123!"),
        role: UserRole.COMPANY_ADMIN,
        status: UserStatus.ACTIVE,
        phone: "+91 98401 23456",
        companyId: demoCompany.id,
      },
    });
    console.log(`Ensured employer user ${acc.email} exists with password RecruiterPass123!`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
