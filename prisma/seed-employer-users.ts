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

  // Ensure default demo recruiter
  const northwind = await db.company.findFirst({ where: { name: "Northwind Labs" } });
  if (northwind) {
    await db.user.upsert({
      where: { email: "recruiter@northwindlabs.com" },
      update: { companyId: northwind.id, role: UserRole.COMPANY_ADMIN },
      create: {
        name: "Karthik Raja",
        email: "recruiter@northwindlabs.com",
        passwordHash: hashPassword("CareerBridge2026!"),
        role: UserRole.COMPANY_ADMIN,
        status: UserStatus.ACTIVE,
        phone: "+91 98401 23456",
        companyId: northwind.id,
      },
    });
    console.log("Ensured recruiter@northwindlabs.com exists.");
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
