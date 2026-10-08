import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { UserRole } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, response } = await requireAdmin([
      UserRole.SUPER_ADMIN,
      UserRole.PLATFORM_ADMIN,
      UserRole.MODERATION_ADMIN,
    ]);
    if (!authorized) return response!;

    const company = await db.company.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        jobs: {
          select: {
            id: true,
            title: true,
            status: true,
            location: true,
            createdAt: true,
            _count: {
              select: { applications: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        verifications: {
          orderBy: { submittedAt: "desc" },
        },
        _count: {
          select: {
            jobs: true,
            users: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Compute total applications across all jobs for company
    const totalApplications = company.jobs.reduce(
      (acc, job) => acc + (job._count?.applications || 0),
      0
    );

    return NextResponse.json({
      success: true,
      company: {
        ...company,
        _count: {
          ...company._count,
          applications: totalApplications,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin company detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch company details" },
      { status: 500 }
    );
  }
}
