import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: { poolId: string } }) {
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

    const body = await req.json();
    const { candidateEmail, candidateName, candidateId, applicationId, notes } = body;

    if (!candidateEmail || !candidateName) {
      return NextResponse.json({ error: "Candidate email and name are required." }, { status: 400 });
    }

    const member = await db.talentPoolMember.upsert({
      where: {
        poolId_candidateEmail: { poolId: params.poolId, candidateEmail: candidateEmail.toLowerCase() },
      },
      update: {
        candidateName,
        notes: notes || undefined,
        addedBy: employer.email,
      },
      create: {
        poolId: params.poolId,
        candidateEmail: candidateEmail.toLowerCase(),
        candidateName,
        candidateId: candidateId || undefined,
        applicationId: applicationId || undefined,
        notes: notes || undefined,
        addedBy: employer.email,
      },
    });

    return NextResponse.json({ success: true, member, message: "Added to talent pool." });
  } catch (error: any) {
    console.error("Error adding member to talent pool:", error);
    return NextResponse.json({ error: "Failed to add member to talent pool" }, { status: 500 });
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

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "memberId is required." }, { status: 400 });
    }

    await db.talentPoolMember.delete({ where: { id: memberId } });

    return NextResponse.json({ success: true, message: "Removed from talent pool." });
  } catch (error: any) {
    console.error("Error removing member from talent pool:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
