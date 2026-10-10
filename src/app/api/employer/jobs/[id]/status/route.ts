import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);

    if (!authorized) return response!;

    const jobId = params.id;
    const { status } = await req.json();

    const existingJob = await db.job.findFirst({
      where: { id: jobId, companyId: employer.companyId },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "Job posting not found or access denied." },
        { status: 404 }
      );
    }

    const updatedJob = await db.job.update({
      where: { id: jobId },
      data: { status: status as any },
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
    });
  } catch (error: any) {
    console.error("Error updating job status:", error);
    return NextResponse.json(
      { error: "Failed to update job status" },
      { status: 500 }
    );
  }
}
