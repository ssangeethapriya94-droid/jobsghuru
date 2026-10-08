import { NextRequest, NextResponse } from "next/server";
import { requireCandidate } from "@/lib/candidate/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { authorized, candidate, response } = await requireCandidate();
    if (!authorized) return response!;

    const savedJobs = await db.savedJob.findMany({
      where: { userId: candidate.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            workMode: true,
            jobType: true,
            minExp: true,
            maxExp: true,
            salaryMinLpa: true,
            salaryMaxLpa: true,
            department: true,
            status: true,
            postedAt: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                industry: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      savedJobs: savedJobs.map((item) => ({
        id: item.id,
        savedAt: item.createdAt,
        job: item.job,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching saved jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved jobs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, candidate, response } = await requireCandidate();
    if (!authorized) return response!;

    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const job = await db.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const existing = await db.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: candidate.id,
          jobId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Job already saved",
        savedJob: existing,
      });
    }

    const savedJob = await db.savedJob.create({
      data: {
        userId: candidate.id,
        jobId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Job saved successfully",
      savedJob,
    });
  } catch (error: any) {
    console.error("Error saving job:", error);
    return NextResponse.json(
      { error: "Failed to save job" },
      { status: 500 }
    );
  }
}
