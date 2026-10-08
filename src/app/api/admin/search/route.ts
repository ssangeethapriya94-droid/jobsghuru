export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";

interface NavPage {
  title: string;
  href: string;
  category: string;
  keywords: string[];
}

const ADMIN_PAGES: NavPage[] = [
  {
    title: "Platform Command Center",
    href: "/admin/dashboard",
    category: "Main",
    keywords: ["dashboard", "home", "command center", "overview", "telemetry", "kpi", "stats"],
  },
  {
    title: "Users Management",
    href: "/admin/users",
    category: "Main",
    keywords: ["users", "accounts", "user list", "user management", "user directory", "logins"],
  },
  {
    title: "Candidates Database",
    href: "/admin/candidates",
    category: "Main",
    keywords: ["candidates", "job seekers", "applicants", "candidate list", "resumes", "profiles"],
  },
  {
    title: "Companies & Employers",
    href: "/admin/companies",
    category: "Main",
    keywords: ["companies", "employers", "organizations", "corporate", "clients", "recruiters"],
  },
  {
    title: "Job Listings Management",
    href: "/admin/jobs",
    category: "Main",
    keywords: ["jobs", "job listings", "vacancies", "openings", "posts", "careers"],
  },
  {
    title: "Applications Pipeline",
    href: "/admin/applications",
    category: "Main",
    keywords: ["applications", "pipeline", "hiring funnel", "submissions", "candidates applied"],
  },
  {
    title: "Company Verification (KYC)",
    href: "/admin/verifications",
    category: "Trust & Safety",
    keywords: ["company verification", "verification", "kyc", "gst", "pan", "documents", "business proof", "verify"],
  },
  {
    title: "Job Moderation",
    href: "/admin/moderation",
    category: "Trust & Safety",
    keywords: ["job moderation", "moderation", "review jobs", "unmoderated", "pending jobs", "approve jobs"],
  },
  {
    title: "User Reports & Escalations",
    href: "/admin/reports",
    category: "Trust & Safety",
    keywords: ["user reports", "reports", "abuse", "scam", "policy escalations", "complaints", "flags", "safety reports"],
  },
  {
    title: "Fraud & Trust Safety",
    href: "/admin/safety",
    category: "Trust & Safety",
    keywords: ["fraud", "safety", "trust", "security", "risks", "bot protection"],
  },
  {
    title: "Suspended Accounts",
    href: "/admin/suspended",
    category: "Trust & Safety",
    keywords: ["suspended accounts", "suspended", "banned", "blacklisted", "disabled users"],
  },
  {
    title: "AI Assistant Controls",
    href: "/admin/ai",
    category: "AI & Career",
    keywords: ["ai assistant", "gemini", "ai controls", "prompts", "ai features"],
  },
  {
    title: "AI Usage & Token Telemetry",
    href: "/admin/ai/usage",
    category: "AI & Career",
    keywords: ["ai usage", "tokens", "cost", "token telemetry", "model usage", "gemini cost"],
  },
  {
    title: "Skill Taxonomy Database",
    href: "/admin/skills",
    category: "AI & Career",
    keywords: ["skills", "skill database", "taxonomy", "technologies", "competencies"],
  },
  {
    title: "Career Paths Engine",
    href: "/admin/career-paths",
    category: "AI & Career",
    keywords: ["career paths", "roadmaps", "progression", "growth"],
  },
  {
    title: "Assessments Management",
    href: "/admin/assessments",
    category: "AI & Career",
    keywords: ["assessments", "tests", "screening", "quizzes", "evaluations", "mcq"],
  },
  {
    title: "Subscriptions & Plans",
    href: "/admin/subscriptions",
    category: "Business",
    keywords: ["subscriptions", "plans", "pricing", "tiers", "employer plans", "memberships"],
  },
  {
    title: "Payments & Invoices",
    href: "/admin/payments",
    category: "Business",
    keywords: ["payments", "transactions", "invoices", "revenue", "receipts", "billing"],
  },
  {
    title: "Featured Jobs & Promotions",
    href: "/admin/promotions",
    category: "Business",
    keywords: ["promotions", "featured jobs", "sponsored", "boosts"],
  },
  {
    title: "Platform Analytics",
    href: "/admin/analytics",
    category: "Analytics",
    keywords: ["analytics", "metrics", "reports", "charts", "graphs", "kpi"],
  },
  {
    title: "Admin Users Control",
    href: "/admin/admin-users",
    category: "System",
    keywords: ["admin users", "administrators", "team", "internal users", "super admin"],
  },
  {
    title: "Roles & Permissions",
    href: "/admin/permissions",
    category: "System",
    keywords: ["roles", "permissions", "rbac", "access control", "privileges"],
  },
  {
    title: "Security Audit Trail",
    href: "/admin/audit-logs",
    category: "System",
    keywords: ["audit logs", "audit trail", "security log", "compliance", "history", "actions"],
  },
  {
    title: "Platform Settings & Governance",
    href: "/admin/settings",
    category: "System",
    keywords: ["settings", "platform settings", "config", "governance", "flags", "environment", "smtp"],
  },
];

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    if (!q) {
      return NextResponse.json({
        pages: [],
        users: [],
        companies: [],
        jobs: [],
        reports: [],
      });
    }

    // 1. Search matching Admin Pages
    const matchingPages = ADMIN_PAGES.filter((page) => {
      const matchTitle = page.title.toLowerCase().includes(q);
      const matchCat = page.category.toLowerCase().includes(q);
      const matchKeywords = page.keywords.some((kw) => kw.includes(q) || q.includes(kw));
      return matchTitle || matchCat || matchKeywords;
    }).slice(0, 5);

    // 2. Search DB in parallel
    const [users, companies, jobs, reports] = await Promise.all([
      // Search Users
      db.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
        take: 4,
      }).catch(() => []),

      // Search Companies
      db.company.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
            { industry: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          industry: true,
          location: true,
          verified: true,
        },
        take: 4,
      }).catch(() => []),

      // Search Jobs
      db.job.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { department: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          department: true,
          status: true,
          company: { select: { name: true } },
        },
        take: 4,
      }).catch(() => []),

      // Search Reports
      db.report.findMany({
        where: {
          OR: [
            { reporterEmail: { contains: q, mode: "insensitive" } },
            { targetTitle: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          reporterEmail: true,
          targetTitle: true,
          reason: true,
          status: true,
        },
        take: 4,
      }).catch(() => []),
    ]);

    return NextResponse.json({
      pages: matchingPages,
      users,
      companies,
      jobs,
      reports,
    });
  } catch (err: any) {
    console.error("Admin search error:", err);
    return NextResponse.json({ error: "Failed to execute search" }, { status: 500 });
  }
}
