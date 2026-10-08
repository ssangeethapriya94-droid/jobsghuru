import { UserRole } from "@prisma/client";

export type Permission =
  // Users
  | "users.view"
  | "users.create"
  | "users.suspend"
  | "users.reactivate"
  | "users.manage_roles"
  | "users.reset_security"
  // Candidates
  | "candidates.view"
  | "candidates.audit_view"
  // Companies
  | "companies.view"
  | "companies.verify"
  | "companies.suspend"
  // Jobs & Moderation
  | "jobs.view"
  | "jobs.moderate"
  | "jobs.delete"
  // Applications
  | "applications.view"
  | "applications.audit"
  // Reports & Safety
  | "reports.view"
  | "reports.investigate"
  | "reports.resolve"
  // AI & Career
  | "ai.view"
  | "ai.manage_models"
  | "ai.manage_prompts"
  | "skills.view"
  | "skills.manage"
  | "career_paths.view"
  | "career_paths.manage"
  // Business & Payments
  | "subscriptions.view"
  | "subscriptions.manage"
  | "payments.view"
  | "payments.refund"
  | "promotions.view"
  | "promotions.manage"
  // Analytics
  | "analytics.view"
  // Audit & Settings
  | "audit.view"
  | "settings.view"
  | "settings.manage"
  | "notifications.view"
  | "notifications.manage";

export type AdminPermission = Permission;

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "users.view",
    "users.create",
    "users.suspend",
    "users.reactivate",
    "users.manage_roles",
    "users.reset_security",
    "candidates.view",
    "candidates.audit_view",
    "companies.view",
    "companies.verify",
    "companies.suspend",
    "jobs.view",
    "jobs.moderate",
    "jobs.delete",
    "applications.view",
    "applications.audit",
    "reports.view",
    "reports.investigate",
    "reports.resolve",
    "ai.view",
    "ai.manage_models",
    "ai.manage_prompts",
    "skills.view",
    "skills.manage",
    "career_paths.view",
    "career_paths.manage",
    "subscriptions.view",
    "subscriptions.manage",
    "payments.view",
    "payments.refund",
    "promotions.view",
    "promotions.manage",
    "analytics.view",
    "audit.view",
    "settings.view",
    "settings.manage",
    "notifications.view",
    "notifications.manage",
  ],

  PLATFORM_ADMIN: [
    "users.view",
    "users.create",
    "users.suspend",
    "users.reactivate",
    "candidates.view",
    "companies.view",
    "companies.verify",
    "companies.suspend",
    "jobs.view",
    "jobs.moderate",
    "applications.view",
    "reports.view",
    "reports.investigate",
    "reports.resolve",
    "ai.view",
    "skills.view",
    "skills.manage",
    "career_paths.view",
    "career_paths.manage",
    "subscriptions.view",
    "payments.view",
    "promotions.view",
    "analytics.view",
    "audit.view",
    "settings.view",
    "notifications.view",
  ],

  MODERATION_ADMIN: [
    "users.view",
    "companies.view",
    "companies.verify",
    "jobs.view",
    "jobs.moderate",
    "reports.view",
    "reports.investigate",
    "reports.resolve",
    "audit.view",
  ],

  SUPPORT_ADMIN: [
    "users.view",
    "users.reset_security",
    "candidates.view",
    "companies.view",
    "jobs.view",
    "applications.view",
    "applications.audit",
    "reports.view",
    "audit.view",
  ],

  FINANCE_ADMIN: [
    "subscriptions.view",
    "subscriptions.manage",
    "payments.view",
    "payments.refund",
    "promotions.view",
    "promotions.manage",
    "analytics.view",
    "audit.view",
  ],

  AI_ADMIN: [
    "ai.view",
    "ai.manage_models",
    "ai.manage_prompts",
    "skills.view",
    "skills.manage",
    "career_paths.view",
    "career_paths.manage",
    "analytics.view",
    "audit.view",
  ],

  ANALYTICS_ADMIN: [
    "analytics.view",
    "ai.view",
    "audit.view",
  ],

  // B2B & External roles have zero platform admin access
  COMPANY_ADMIN: [],
  RECRUITER: [],
  HIRING_MANAGER: [],
  INTERVIEWER: [],
  CANDIDATE: [],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  if (role === "SUPER_ADMIN") return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function isPlatformAdmin(role: UserRole): boolean {
  return [
    "SUPER_ADMIN",
    "PLATFORM_ADMIN",
    "MODERATION_ADMIN",
    "SUPPORT_ADMIN",
    "FINANCE_ADMIN",
    "AI_ADMIN",
    "ANALYTICS_ADMIN",
  ].includes(role);
}
