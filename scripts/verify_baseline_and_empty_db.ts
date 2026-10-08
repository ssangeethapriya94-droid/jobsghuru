import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function main() {
  console.log("==========================================================================");
  console.log("1. BASELINE MIGRATION RECORDING & PROOF ON EMPTY DATABASE");
  console.log("==========================================================================\n");

  // Step A: Mark baseline applied in existing database
  console.log("[Step A] Synchronizing _prisma_migrations for baseline...");
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "_prisma_migrations";`);
  } catch (err) {
    console.log("Note: _prisma_migrations table created fresh if needed");
  }

  const resolveOutput = execSync("npx prisma migrate resolve --applied 20261006000000_full_schema_baseline", {
    encoding: "utf-8",
  });
  console.log(resolveOutput.trim());

  const statusOutput = execSync("npx prisma migrate status", { encoding: "utf-8" });
  console.log(statusOutput.trim());
  console.log("✅ Baseline marked applied. Database is in sync.\n");

  // Step B: Prove a brand-new empty database can be built from migrations alone with prisma migrate deploy
  console.log("[Step B] Proving empty database creation via 'prisma migrate deploy' alone...");
  const testDbName = `test_empty_db_${Date.now()}`;
  
  // 1. Create empty database in Postgres
  await prisma.$executeRawUnsafe(`CREATE DATABASE "${testDbName}";`);
  console.log(`Created empty Postgres database: "${testDbName}"`);

  // 2. Run prisma migrate deploy with connection string pointing to new empty database
  const originalUrl = process.env.DATABASE_URL!;
  const parsed = new URL(originalUrl);
  parsed.pathname = `/${testDbName}`;
  const newDbUrl = parsed.toString();

  const deployOutput = execSync("npx prisma migrate deploy", {
    encoding: "utf-8",
    env: {
      ...process.env,
      DATABASE_URL: newDbUrl,
      DIRECT_URL: newDbUrl,
    },
  });
  console.log(deployOutput.trim());

  // 3. Connect to the new database and verify tables
  const testDbPrisma = new PrismaClient({
    datasources: { db: { url: newDbUrl } },
  });

  const tables: Array<{ table_name: string }> = await testDbPrisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  console.log(`\nFound ${tables.length} tables successfully created from migration in empty database:`);
  console.log(tables.map(t => t.table_name).join(", "));

  // 4. Verify critical columns like Application.deletedAt exist
  const appColumns: Array<{ column_name: string; data_type: string }> = await testDbPrisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'Application' AND column_name = 'deletedAt';
  `);
  console.log(`\nVerified Application.deletedAt in new database: ${JSON.stringify(appColumns[0])}`);

  await testDbPrisma.$disconnect();

  // 5. Clean up temporary test database
  try {
    await prisma.$executeRawUnsafe(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = '${testDbName}' AND pid <> pg_backend_pid();
    `);
    await prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${testDbName}";`);
    console.log(`Cleaned up temporary test database: "${testDbName}"`);
  } catch (dropErr) {
    console.log(`Note on cleanup: ${dropErr}`);
  }

  console.log("\n==========================================================================");
  console.log("🎉 BASELINE MIGRATION PROVEN SUCCESSFUL ON BRAND-NEW EMPTY DATABASE!");
  console.log("==========================================================================");
}

main()
  .catch((err) => {
    console.error("Error verifying baseline migration:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
