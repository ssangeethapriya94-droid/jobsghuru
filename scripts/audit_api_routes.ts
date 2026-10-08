import fs from "fs";
import path from "path";

interface RouteAudit {
  file: string;
  methods: string[];
  authType: string;
  roleRules: string;
  status: "SECURED" | "FLAGGED_UNPROTECTED" | "PUBLIC_AUTH_ROUTE";
}

function scanDir(dir: string, baseDir: string, results: RouteAudit[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, baseDir, results);
    } else if (entry.name === "route.ts" || entry.name === "route.js") {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      const content = fs.readFileSync(fullPath, "utf8");

      const methods: string[] = [];
      if (/export\s+(async\s+)?function\s+GET/i.test(content)) methods.push("GET");
      if (/export\s+(async\s+)?function\s+POST/i.test(content)) methods.push("POST");
      if (/export\s+(async\s+)?function\s+PATCH/i.test(content)) methods.push("PATCH");
      if (/export\s+(async\s+)?function\s+PUT/i.test(content)) methods.push("PUT");
      if (/export\s+(async\s+)?function\s+DELETE/i.test(content)) methods.push("DELETE");

      let authType = "NONE";
      let roleRules = "ALL_ROLES";
      let status: "SECURED" | "FLAGGED_UNPROTECTED" | "PUBLIC_AUTH_ROUTE" = "FLAGGED_UNPROTECTED";

      // Is it a public auth route (login/logout/register)?
      if (
        relPath.includes("auth/login") ||
        relPath.includes("auth/logout") ||
        relPath.includes("auth/session") ||
        relPath.includes("auth/me")
      ) {
        authType = "PUBLIC / AUTH_HANDLER";
        roleRules = "Anonymous / Session Handlers";
        status = "PUBLIC_AUTH_ROUTE";
      } else if (relPath.startsWith("employer/")) {
        if (content.includes("getCurrentEmployer") || content.includes("requireEmployer")) {
          authType = "requireEmployer / getCurrentEmployer (Realm: EMPLOYER)";
          status = "SECURED";
          if (content.includes("COMPANY_ADMIN") && (content.includes("403") || content.includes("Forbidden"))) {
            roleRules = "Restricted (COMPANY_ADMIN only)";
          } else if (content.includes("INTERVIEWER") && content.includes("participants")) {
            roleRules = "Interviewer Participant Scope + Employer Staff";
          } else {
            roleRules = "All Employer Staff (COMPANY_ADMIN, RECRUITER, HIRING_MANAGER, INTERVIEWER)";
          }
        }
      } else if (relPath.startsWith("admin/")) {
        if (content.includes("getCurrentAdmin") || content.includes("verifyAdminAccess")) {
          authType = "verifyAdminAccess / getCurrentAdmin (Realm: ADMIN)";
          status = "SECURED";
          roleRules = "Platform Admins (SUPER_ADMIN, PLATFORM_ADMIN, etc.)";
        }
      }

      results.push({
        file: "/api/" + relPath,
        methods,
        authType,
        roleRules,
        status,
      });
    }
  }
}

async function run() {
  const rootApi = path.join(process.cwd(), "src/app/api");
  const results: RouteAudit[] = [];

  scanDir(path.join(rootApi, "employer"), rootApi, results);
  scanDir(path.join(rootApi, "admin"), rootApi, results);

  console.log("========================================================================================================");
  console.log("API ROUTE AUTH & RBAC AUDIT REPORT");
  console.log("========================================================================================================");

  let securedCount = 0;
  let flaggedCount = 0;

  for (const r of results) {
    const icon = r.status === "SECURED" ? "🔒 SECURED" : r.status === "PUBLIC_AUTH_ROUTE" ? "🔑 AUTH_ENDPOINT" : "⚠️ UNPROTECTED";
    console.log(`\nROUTE: ${r.file}`);
    console.log(`  Methods:   ${r.methods.join(", ")}`);
    console.log(`  Status:    ${icon}`);
    console.log(`  Auth Rule: ${r.authType}`);
    console.log(`  RBAC:      ${r.roleRules}`);

    if (r.status === "SECURED" || r.status === "PUBLIC_AUTH_ROUTE") securedCount++;
    else flaggedCount++;
  }

  console.log("\n========================================================================================================");
  console.log(`AUDIT SUMMARY: Total: ${results.length} | Protected / Valid Auth: ${securedCount} | Flagged: ${flaggedCount}`);
  console.log("========================================================================================================");
}

run();
