import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
    ]);
    if (!authorized) return response!;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    // Fetch company team member IDs
    const teamMembers = await db.user.findMany({
      where: { companyId: employer.companyId },
      select: { id: true, email: true },
    });
    const actorEmails = teamMembers.map((m) => m.email);

    // Fetch audit logs performed by company team members or referencing company entity
    const where: any = {
      OR: [
        { actorEmail: { in: actorEmails } },
        { entityType: "COMPANY", entityId: employer.companyId },
      ],
    };

    if (category && category !== "ALL") {
      where.action = { contains: category };
    }

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("Error fetching company audit logs:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
