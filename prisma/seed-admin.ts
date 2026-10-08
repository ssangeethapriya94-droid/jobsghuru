import { PrismaClient, UserRole, UserStatus, ApplicationStatus, VerificationStatus, ReportStatus, ReportReason, WorkMode, JobType, JobStatus } from "@prisma/client";
import crypto from "crypto";

const db = new PrismaClient();

// Simple deterministic hash for demo seed (SHA256 with salt)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "careerbridge_salt_2026").digest("hex");
}

async function main() {
  console.log("Starting Enterprise Admin Database Seeding...");

  // 1. Seed Admin & Enterprise Users
  const adminUsers = [
    {
      email: "superadmin@careerbridge.com",
      name: "Super Administrator",
      role: UserRole.SUPER_ADMIN,
      phone: "+91 98765 00001",
      twoFactorEnabled: true,
    },
    {
      email: "admin@careerbridge.com",
      name: "Priya Sundaram",
      role: UserRole.PLATFORM_ADMIN,
      phone: "+91 98765 00002",
      twoFactorEnabled: false,
    },
    {
      email: "moderator@careerbridge.com",
      name: "Karthik Verma",
      role: UserRole.MODERATION_ADMIN,
      phone: "+91 98765 00003",
      twoFactorEnabled: false,
    },
    {
      email: "support@careerbridge.com",
      name: "Sneha Mukherjee",
      role: UserRole.SUPPORT_ADMIN,
      phone: "+91 98765 00004",
      twoFactorEnabled: false,
    },
    {
      email: "finance@careerbridge.com",
      name: "Rohan Kapoor",
      role: UserRole.FINANCE_ADMIN,
      phone: "+91 98765 00005",
      twoFactorEnabled: false,
    },
    {
      email: "ai.lead@careerbridge.com",
      name: "Dr. Vikram Joshi",
      role: UserRole.AI_ADMIN,
      phone: "+91 98765 00006",
      twoFactorEnabled: true,
    },
  ];

  for (const u of adminUsers) {
    await db.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        status: UserStatus.ACTIVE,
        twoFactorEnabled: u.twoFactorEnabled,
      },
      create: {
        email: u.email,
        name: u.name,
        passwordHash: hashPassword("Admin@CareerBridge2026"),
        role: u.role,
        status: UserStatus.ACTIVE,
        phone: u.phone,
        twoFactorEnabled: u.twoFactorEnabled,
      },
    });
  }

  // 2. Fetch existing companies
  const companies = await db.company.findMany();
  console.log(`Found ${companies.length} existing companies.`);

  // 3. Seed Recruiters and Company Admins
  if (companies.length > 0) {
    const northwind = companies.find((c) => c.name.includes("Northwind")) || companies[0];
    const bluepeak = companies.find((c) => c.name.includes("Bluepeak")) || companies[1] || companies[0];

    await db.user.upsert({
      where: { email: "recruiter@northwindlabs.com" },
      update: { companyId: northwind.id, role: UserRole.RECRUITER },
      create: {
        email: "recruiter@northwindlabs.com",
        name: "Arun Mehra",
        passwordHash: hashPassword("Recruiter@123"),
        role: UserRole.RECRUITER,
        companyId: northwind.id,
        phone: "+91 98401 11223",
      },
    });

    await db.user.upsert({
      where: { email: "hr.admin@bluepeak.com" },
      update: { companyId: bluepeak.id, role: UserRole.COMPANY_ADMIN },
      create: {
        email: "hr.admin@bluepeak.com",
        name: "Deepa Nair",
        passwordHash: hashPassword("Employer@123"),
        role: UserRole.COMPANY_ADMIN,
        companyId: bluepeak.id,
        phone: "+91 98402 33445",
      },
    });

    // Seed Company Verifications
    for (const c of companies) {
      const existing = await db.companyVerification.findFirst({ where: { companyId: c.id } });
      if (!existing) {
        await db.companyVerification.create({
          data: {
            companyId: c.id,
            legalName: `${c.name} Private Limited`,
            taxId: `GSTIN33AAAC${Math.floor(1000 + Math.random() * 9000)}B1Z5`,
            businessRegister: `U72900TN2020PTC${Math.floor(100000 + Math.random() * 900000)}`,
            domain: c.website || `https://${c.slug}.com`,
            recruiterProof: "HR Authorization Letter + Corporate ID Badge",
            documents: ["certificate_of_incorporation.pdf", "gst_registration.pdf", "directors_list.pdf"],
            status: c.verified ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
            notes: c.verified ? "Verified via Ministry of Corporate Affairs cross-check." : "Awaiting corporate document review.",
            reviewedBy: c.verified ? "superadmin@careerbridge.com" : null,
            reviewedAt: c.verified ? new Date() : null,
          },
        });
      }
    }
  }

  // 4. Seed Candidate Users
  const candidateUsers = [
    { email: "arun.kumar@example.com", name: "Arun Kumar", phone: "+91 98401 23456", exp: 3.5 },
    { email: "sneha.patel@example.com", name: "Sneha Patel", phone: "+91 98201 55678", exp: 5.0 },
    { email: "rahul.sharma@example.com", name: "Rahul Sharma", phone: "+91 98111 22334", exp: 2.0 },
    { email: "ananya.iyer@example.com", name: "Ananya Iyer", phone: "+91 98409 88776", exp: 4.2 },
    { email: "vikram.singh@example.com", name: "Vikram Singh", phone: "+91 99301 44556", exp: 6.0 },
  ];

  const createdCandidates = [];
  for (const c of candidateUsers) {
    const user = await db.user.upsert({
      where: { email: c.email },
      update: { name: c.name, role: UserRole.CANDIDATE },
      create: {
        email: c.email,
        name: c.name,
        passwordHash: hashPassword("Candidate@123"),
        role: UserRole.CANDIDATE,
        phone: c.phone,
      },
    });
    createdCandidates.push({ ...user, exp: c.exp });
  }

  // 5. Seed Applications for existing jobs
  const jobs = await db.job.findMany({ take: 6 });
  if (jobs.length > 0) {
    const existingAppsCount = await db.application.count();
    if (existingAppsCount === 0) {
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        const cand = createdCandidates[i % createdCandidates.length];
        await db.application.create({
          data: {
            jobId: job.id,
            candidateId: cand.id,
            candidateName: cand.name,
            candidateEmail: cand.email,
            candidatePhone: cand.phone || "+91 98401 23456",
            currentCompany: "Tech Innovators Pvt Ltd",
            currentRole: "Software Engineer",
            experienceYears: cand.exp,
            currentCtc: 8.5 + i,
            expectedCtc: 14.0 + i,
            noticePeriod: "30 Days",
            resumeFileName: `${cand.name.replace(/\s+/g, "_")}_Resume.pdf`,
            resumeUrl: `/resumes/${cand.name.replace(/\s+/g, "_")}.pdf`,
            coverNote: `Excited about the ${job.title} role at your company! Experienced in modern tech stacks.`,
            matchScore: 85 + (i * 2) % 13,
            status: i === 0 ? ApplicationStatus.SUBMITTED : i === 1 ? ApplicationStatus.UNDER_REVIEW : ApplicationStatus.SHORTLISTED,
          },
        });
      }
    }
  }

  // 6. Seed Safety / Reports Queue
  const existingReportsCount = await db.report.count();
  if (existingReportsCount === 0 && jobs.length > 0) {
    await db.report.create({
      data: {
        reporterEmail: "candidate.alert@gmail.com",
        targetType: "JOB",
        targetId: jobs[0].id,
        targetTitle: jobs[0].title,
        reason: ReportReason.SCAM,
        description: "Recruiter asking for an upfront registration fee for scheduling interview.",
        status: ReportStatus.OPEN,
      },
    });

    await db.report.create({
      data: {
        reporterEmail: "moderator.flag@careerbridge.com",
        targetType: "COMPANY",
        targetId: companies[0]?.id || "company_1",
        targetTitle: companies[0]?.name || "Sample Tech",
        reason: ReportReason.FAKE_JOB,
        description: "Duplicate company address flagged by automated geolocation anomaly check.",
        status: ReportStatus.INVESTIGATING,
      },
    });
  }

  // 7. Seed Official Skills Taxonomy
  const skillsData = [
    { name: "React", category: "Technology", description: "Frontend declarative UI library" },
    { name: "TypeScript", category: "Technology", description: "Typed superset of JavaScript" },
    { name: "Next.js", category: "Technology", description: "React full-stack framework" },
    { name: "Node.js", category: "Technology", description: "JavaScript runtime environment" },
    { name: "PostgreSQL", category: "Technology", description: "Relational SQL database" },
    { name: "Python", category: "Technology", description: "Versatile programming language for AI & web" },
    { name: "Figma", category: "Design", description: "Collaborative interface design tool" },
    { name: "UX Research", category: "Design", description: "User interviews and usability heuristics" },
    { name: "SEO Optimization", category: "Marketing", description: "Organic search ranking and site audit" },
    { name: "Google Ads", category: "Marketing", description: "Paid performance advertising" },
    { name: "Product Strategy", category: "Business", description: "Roadmapping, market fit, and metrics" },
    { name: "Docker", category: "Technology", description: "Container virtualization platform" },
    { name: "AWS Cloud", category: "Technology", description: "Amazon Web Services infrastructure" },
  ];

  for (const s of skillsData) {
    await db.skill.upsert({
      where: { name: s.name },
      update: { category: s.category, description: s.description },
      create: { name: s.name, category: s.category, description: s.description, verified: true, jobCount: 12 },
    });
  }

  // 8. Seed Career Paths
  const careerPaths = [
    {
      title: "Frontend Engineering Specialist",
      department: "Engineering",
      level: "Senior",
      skills: ["React", "TypeScript", "Next.js", "CSS", "Performance Optimization"],
      nextRoles: ["Tech Lead", "Staff Frontend Engineer", "Engineering Manager"],
      avgSalary: "₹18-32 LPA",
    },
    {
      title: "Full Stack Web Architect",
      department: "Engineering",
      level: "Lead",
      skills: ["React", "Node.js", "PostgreSQL", "Docker", "System Design"],
      nextRoles: ["Principal Architect", "VP of Engineering"],
      avgSalary: "₹28-48 LPA",
    },
    {
      title: "Data Analytics & BI Strategist",
      department: "Data",
      level: "Mid",
      skills: ["SQL", "Python", "Power BI", "Statistics", "Data Modeling"],
      nextRoles: ["Senior Analytics Engineer", "Data Science Lead"],
      avgSalary: "₹12-22 LPA",
    },
  ];

  for (const cp of careerPaths) {
    await db.careerPath.upsert({
      where: { title: cp.title },
      update: { skills: cp.skills, nextRoles: cp.nextRoles, avgSalary: cp.avgSalary },
      create: cp,
    });
  }

  // 9. Seed Plans & Subscriptions
  const plansData = [
    {
      name: "Starter Trial",
      type: "EMPLOYER",
      priceInr: 0,
      billingCycle: "FREE",
      jobLimit: 1,
      resumeLimit: 50,
      features: ["1 Active Verified Job", "Standard Search Listing", "Direct Candidate Inquiries"],
    },
    {
      name: "Growth Scale",
      type: "EMPLOYER",
      priceInr: 4999,
      billingCycle: "MONTHLY",
      jobLimit: 5,
      resumeLimit: 500,
      features: ["5 Active Verified Jobs", "Priority Search Placement", "Candidate Skill Gap Diagnostics", "Dedicated Account Manager"],
    },
    {
      name: "Enterprise Pro",
      type: "EMPLOYER",
      priceInr: 14999,
      billingCycle: "MONTHLY",
      jobLimit: 25,
      resumeLimit: 2500,
      features: ["Unlimited Active Jobs", "AI Candidate Matching", "Custom ATS Webhooks", "Candidate Pre-screening", "24/7 Phone Support"],
    },
    {
      name: "Candidate Pro Career",
      type: "CANDIDATE",
      priceInr: 799,
      billingCycle: "MONTHLY",
      jobLimit: 0,
      resumeLimit: 0,
      features: ["AI Resume Reviewer", "Profile Spotlight to Verified Recruiters", "Salary Negotiation Benchmarks", "Direct Recruiter Inquiries"],
    },
  ];

  for (const p of plansData) {
    await db.plan.upsert({
      where: { name: p.name },
      update: { priceInr: p.priceInr, features: p.features, jobLimit: p.jobLimit },
      create: p,
    });
  }

  // 10. Seed AI Usage Logs
  const existingAILogs = await db.aIUsageLog.count();
  if (existingAILogs === 0) {
    const aiFeatures = ["CAREER_COPILOT", "RESUME_PITCH", "MATCH_EXPLAIN", "SKILL_RECOMMENDER"];
    for (let i = 0; i < 25; i++) {
      const feat = aiFeatures[i % aiFeatures.length];
      const pTokens = 240 + (i * 35);
      const cTokens = 120 + (i * 15);
      await db.aIUsageLog.create({
        data: {
          feature: feat,
          modelName: "gemini-1.5-flash",
          promptTokens: pTokens,
          completionTokens: cTokens,
          totalTokens: pTokens + cTokens,
          latencyMs: 380 + (i * 45),
          estimatedCostUsd: Number(((pTokens * 0.000000075) + (cTokens * 0.0000003)).toFixed(6)),
          createdAt: new Date(Date.now() - (i * 3600000 * 4)),
        },
      });
    }
  }

  // 11. Seed System Settings
  const settingsData = [
    { category: "GENERAL", key: "platform_name", value: "CareerBridge Enterprise" },
    { category: "GENERAL", key: "support_email", value: "support@careerbridge.com" },
    { category: "AUTH", key: "two_factor_mandatory_for_admins", value: "true" },
    { category: "AUTH", key: "session_timeout_minutes", value: "120" },
    { category: "SECURITY", key: "rate_limit_admin_login_per_minute", value: "5" },
    { category: "SECURITY", key: "automatic_job_moderation_ai_scan", value: "true" },
    { category: "AI", key: "primary_model", value: "gemini-1.5-flash" },
    { category: "AI", key: "daily_token_limit_per_candidate", value: "50000" },
    { category: "BILLING", key: "currency_default", value: "INR" },
    { category: "BILLING", key: "gst_tax_percentage", value: "18" },
  ];

  for (const s of settingsData) {
    await db.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 12. Seed Immutable Audit Logs
  const auditLogsData = [
    {
      actorEmail: "superadmin@careerbridge.com",
      actorRole: UserRole.SUPER_ADMIN,
      action: "PLATFORM_INITIALIZATION",
      entityType: "SYSTEM",
      entityId: "SYSTEM_ROOT",
      reason: "Initial deployment of CareerBridge RBAC enterprise admin cluster",
      beforeJson: JSON.stringify({ status: "UNINITIALIZED" }),
      afterJson: JSON.stringify({ status: "INITIALIZED", rbac: "ENABLED" }),
      ipAddress: "127.0.0.1",
    },
    {
      actorEmail: "superadmin@careerbridge.com",
      actorRole: UserRole.SUPER_ADMIN,
      action: "COMPANY_VERIFIED",
      entityType: "COMPANY",
      entityId: companies[0]?.id || "company_1",
      reason: "Verified corporate credentials via MCA database check",
      beforeJson: JSON.stringify({ verified: false }),
      afterJson: JSON.stringify({ verified: true }),
      ipAddress: "127.0.0.1",
    },
    {
      actorEmail: "moderator@careerbridge.com",
      actorRole: UserRole.MODERATION_ADMIN,
      action: "JOB_APPROVED",
      entityType: "JOB",
      entityId: jobs[0]?.id || "job_1",
      reason: "Listing conforms to pay transparency and compliance policies",
      beforeJson: JSON.stringify({ status: "PENDING_REVIEW" }),
      afterJson: JSON.stringify({ status: "PUBLISHED" }),
      ipAddress: "127.0.0.1",
    },
  ];

  for (const log of auditLogsData) {
    await db.auditLog.create({
      data: log,
    });
  }

  console.log("Enterprise Admin Database Seeding successfully completed!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
