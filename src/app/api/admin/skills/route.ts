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

    const skills = await db.skill.findMany({
      orderBy: [{ verified: "desc" }, { jobCount: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ skills });
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

    if (!hasPermission(admin.role, "skills.manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, category, description, verified, reason } = await req.json();

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and Category are required" },
        { status: 400 }
      );
    }

    const skill = await db.skill.create({
      data: {
        name: name.trim(),
        category,
        description,
        verified: verified !== undefined ? verified : true,
      },
    });

    await createAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "SKILL_CREATED",
      entityType: "SKILL",
      entityId: skill.id,
      afterJson: JSON.stringify(skill),
      reason: reason || "Added to canonical platform skill taxonomy",
    });

    return NextResponse.json({ success: true, skill });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Skill already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, verified, reason } = await req.json();

    const before = await db.skill.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const updated = await db.skill.update({
      where: { id },
      data: { verified },
    });

    await createAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "SKILL_VERIFICATION_TOGGLED",
      entityType: "SKILL",
      entityId: updated.id,
      beforeJson: JSON.stringify({ verified: before.verified }),
      afterJson: JSON.stringify({ verified: updated.verified }),
      reason: reason || "Admin taxonomy verification status change",
    });

    return NextResponse.json({ success: true, skill: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
