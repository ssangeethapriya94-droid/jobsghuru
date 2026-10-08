import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { JobStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("q") || "";
    const location = searchParams.get("location") || "";
    const jobType = searchParams.get("jobType") || "";
    const workMode = searchParams.get("workMode") || "";
    const minSalary = parseInt(searchParams.get("minSalary") || "0");
    const minExp = parseInt(searchParams.get("minExp") || "0");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    const now = new Date();

    // PUBLIC DISCOVERY RULE: Show ONLY published, non-expired jobs from VERIFIED companies!
    const where: any = {
      status: JobStatus.PUBLISHED,
      expiresAt: { gt: now },
      company: { verified: true },
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { department: { contains: query, mode: "insensitive" } },
        { skills: { has: query } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (workMode) {
      where.workMode = workMode;
    }

    if (minSalary > 0) {
      where.salaryMaxLpa = { gte: minSalary };
    }

    if (minExp > 0) {
      where.minExp = { lte: minExp };
    }

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        include: {
          company: {
            select: { id: true, name: true, logo: true, verified: true, location: true, industry: true },
          },
        },
        orderBy: { postedAt: "desc" },
        skip,
        take: limit,
      }),
      db.job.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching public jobs:", error);
    return NextResponse.json({ error: "Failed to fetch public job postings" }, { status: 500 });
  }
}
