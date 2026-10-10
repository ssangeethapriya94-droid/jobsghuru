import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { createAuditLog } from "@/lib/admin/audit";

export interface SmtpConfig {
  smtpHost: string;
  smtpPort: string;
  useSslTls: boolean;
  smtpUsername: string;
  smtpPassword?: string;
  fromDisplayName: string;
  fromEmailAddress: string;
  adminNotificationEmail: string;
  triggerJobApplications: boolean;
  triggerEmployerPostings: boolean;
  triggerSubscriptions: boolean;
  triggerCampaigns: boolean;
}

const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  smtpHost: process.env.SMTP_HOST || "smtp.hostinger.com",
  smtpPort: process.env.SMTP_PORT || "465",
  useSslTls: process.env.SMTP_SECURE === "false" ? false : true,
  smtpUsername: process.env.SMTP_USER || "info@jobshuru.com",
  smtpPassword: process.env.SMTP_PASS || "",
  fromDisplayName: "JobsGhuru",
  fromEmailAddress: process.env.SMTP_FROM_EMAIL || "info@jobshuru.com",
  adminNotificationEmail: process.env.ADMIN_NOTIFY_EMAIL || "info@jobshuru.com",
  triggerJobApplications: true,
  triggerEmployerPostings: true,
  triggerSubscriptions: true,
  triggerCampaigns: true,
};

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const setting = await db.systemSetting.findUnique({
      where: { key: "SMTP_GATEWAY_CONFIG" },
    });

    let config: SmtpConfig = { ...DEFAULT_SMTP_CONFIG };

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        config = { ...config, ...parsed };
      } catch (e) {
        console.error("Failed to parse stored SMTP config", e);
      }
    }

    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load SMTP settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const body: SmtpConfig = await req.json();

    if (!body.smtpHost || !body.smtpPort || !body.smtpUsername) {
      return NextResponse.json(
        { error: "SMTP Host, Port, and Username/Sender Email are required." },
        { status: 400 }
      );
    }

    const before = await db.systemSetting.findUnique({
      where: { key: "SMTP_GATEWAY_CONFIG" },
    });

    const setting = await db.systemSetting.upsert({
      where: { key: "SMTP_GATEWAY_CONFIG" },
      create: {
        key: "SMTP_GATEWAY_CONFIG",
        value: JSON.stringify(body),
        category: "SYSTEM_EMAIL",
        updatedBy: admin.email,
      },
      update: {
        value: JSON.stringify(body),
        updatedBy: admin.email,
      },
    });

    await createAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "SMTP_CONFIG_UPDATED",
      entityType: "SYSTEM_SETTING",
      entityId: "SMTP_GATEWAY_CONFIG",
      beforeJson: before?.value || null,
      afterJson: JSON.stringify(body),
      reason: "Admin updated SMTP Email Gateway & Notification Triggers configuration.",
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "SMTP & Email Gateway settings saved successfully!",
      config: body,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save SMTP config" }, { status: 500 });
  }
}
