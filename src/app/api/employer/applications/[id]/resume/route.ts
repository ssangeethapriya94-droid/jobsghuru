import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";
import fs from "fs";
import path from "path";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
      UserRole.INTERVIEWER,
    ]);
    if (!authorized) return response!;

    const applicationId = params.id;
    if (!applicationId) {
      return NextResponse.json({ error: "Application ID required" }, { status: 400 });
    }

    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        job: { select: { companyId: true } },
        interviews: {
          where: { companyId: employer.companyId },
          include: { participants: true },
        },
      },
    });

    if (!application || application.deletedAt !== null || application.job.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // INTERVIEWER role check: must be assigned to an interview on this application
    if (employer.role === UserRole.INTERVIEWER) {
      const isAssigned = application.interviews.some(
        (inv) =>
          inv.interviewerId === employer.id ||
          inv.participants.some(
            (p) => p.userId === employer.id || p.email.toLowerCase() === employer.email.toLowerCase()
          )
      );

      // Rule: INTERVIEWER on an unlinked candidate gets 404, not 403
      if (!isAssigned) {
        return NextResponse.json({ error: "Resume not found" }, { status: 404 });
      }
    }

    const fileName = application.resumeFileName || "Candidate_Resume.pdf";
    const resumeUrl = application.resumeUrl;

    // Check disk storage for the resume file
    const candidatePaths: string[] = [];
    if (fileName) {
      candidatePaths.push(path.join(process.cwd(), "storage", "resumes", fileName));
      candidatePaths.push(path.join(process.cwd(), "public", "uploads", "resumes", fileName));
      candidatePaths.push(path.join(process.cwd(), "public", fileName));
    }
    if (resumeUrl && !resumeUrl.startsWith("http://") && !resumeUrl.startsWith("https://")) {
      const cleanPath = resumeUrl.startsWith("/") ? resumeUrl.slice(1) : resumeUrl;
      const baseName = path.basename(cleanPath);
      candidatePaths.push(path.join(process.cwd(), "storage", "resumes", baseName));
      candidatePaths.push(path.join(process.cwd(), "storage", "resumes", cleanPath));
      candidatePaths.push(path.join(process.cwd(), "public", cleanPath));
      candidatePaths.push(path.join(process.cwd(), "public", "uploads", "resumes", baseName));
    }

    const targetPath = candidatePaths.find((p) => fs.existsSync(p));

    if (targetPath) {
      const fileBuffer = fs.readFileSync(targetPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
        },
      });
    }

    // Return 404 if physical resume file is not available on disk
    return NextResponse.json({ error: "Resume file not available" }, { status: 404 });
  } catch (error: any) {
    console.error("Error serving resume:", error);
    return NextResponse.json({ error: "Failed to retrieve resume" }, { status: 500 });
  }
}
