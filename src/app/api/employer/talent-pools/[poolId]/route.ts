import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: { poolId: string } }) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    const pool = await db.talentPool.findUnique({
      where: { id: params.poolId },
      include: {
        members: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                candidateProfile: true,
              },
            },
            application: {
              select: {
                id: true,
                job: { select: { title: true } },
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!pool || pool.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Talent pool not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, pool });
  } catch (error: any) {
    console.error("Error fetching talent pool detail:", error);
    return NextResponse.json({ error: "Failed to fetch talent pool detail" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { poolId: string } }) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const pool = await db.talentPool.findUnique({ where: { id: params.poolId } });
    if (!pool || pool.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Talent pool not found" }, { status: 404 });
    }

    await db.talentPool.delete({ where: { id: params.poolId } });

    return NextResponse.json({ success: true, message: "Talent pool deleted." });
  } catch (error: any) {
    console.error("Error deleting talent pool:", error);
    return NextResponse.json({ error: "Failed to delete talent pool" }, { status: 500 });
  }
}
