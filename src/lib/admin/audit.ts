import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export interface CreateAuditLogParams {
  actorId?: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  reason: string;
  beforeState?: any;
  afterState?: any;
  beforeJson?: string | null;
  afterJson?: string | null;
  ipAddress?: string;
  userAgent?: string;
}

export async function recordAuditLog(params: CreateAuditLogParams) {
  try {
    const beforeJson =
      params.beforeJson !== undefined
        ? params.beforeJson
        : params.beforeState
        ? JSON.stringify(params.beforeState)
        : null;

    const afterJson =
      params.afterJson !== undefined
        ? params.afterJson
        : params.afterState
        ? JSON.stringify(params.afterState)
        : null;

    return await db.auditLog.create({
      data: {
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        actorRole: params.actorRole,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        reason: params.reason,
        beforeJson,
        afterJson,
        ipAddress: params.ipAddress || "127.0.0.1",
        userAgent: params.userAgent || "Internal Agent",
      },
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
    return null;
  }
}

export const createAuditLog = recordAuditLog;
