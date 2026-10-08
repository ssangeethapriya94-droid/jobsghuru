import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    if (employer.role === UserRole.INTERVIEWER) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pools = await db.talentPool.findMany({
      where: { companyId: employer.companyId },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, pools });
  } catch (error: any) {
    console.error("Error fetching talent pools:", error);
    return NextResponse.json({ error: "Failed to fetch talent pools" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const body = await req.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Talent pool name is required." }, { status: 400 });
    }

    const pool = await db.talentPool.create({
      data: {
        companyId: employer.companyId,
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, pool, message: "Talent pool created." });
  } catch (error: any) {
    console.error("Error creating talent pool:", error);
    return NextResponse.json({ error: "Failed to create talent pool" }, { status: 500 });
  }
}
