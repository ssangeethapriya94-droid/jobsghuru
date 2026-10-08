import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/permissions";
import { createAuditLog } from "@/lib/admin/audit";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await db.systemSetting.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(admin.role, "settings.manage")) {
      return NextResponse.json(
        { error: "Super Admin privileges required to update platform settings" },
        { status: 403 }
      );
    }

    const { key, value, category, reason } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and Value required" }, { status: 400 });
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "Administrative justification (min 5 chars) is mandatory" },
        { status: 400 }
      );
    }

    const before = await db.systemSetting.findUnique({ where: { key } });

    const setting = await db.systemSetting.upsert({
      where: { key },
      create: {
        key,
        value: String(value),
        category: category || "GENERAL",
        updatedBy: admin.email,
      },
      update: {
        value: String(value),
        updatedBy: admin.email,
      },
    });

    await createAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "SETTING_UPDATED",
      entityType: "SETTING",
      entityId: setting.key,
      beforeJson: before ? JSON.stringify({ value: before.value }) : null,
      afterJson: JSON.stringify({ value: setting.value }),
      reason,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
