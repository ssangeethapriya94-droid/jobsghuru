import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { recordAuditLog } from "@/lib/admin/audit";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const includeArchived = searchParams.get("includeArchived") === "true";

    const whereClause: any = {
      companyId: employer.companyId,
    };

    if (statusFilter) {
      whereClause.status = statusFilter;
    } else if (!includeArchived) {
      whereClause.isArchived = false;
      whereClause.status = { not: "ARCHIVED" };
    }

    const assessments = await db.assessment.findMany({
      where: whereClause,
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
        assignments: {
          orderBy: { createdAt: "desc" },
          include: {
            application: {
              select: { candidateName: true, candidateEmail: true, jobId: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, assessments });
  } catch (error: any) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    const body = await req.json();
    const {
      title,
      description,
      skills,
      durationMinutes,
      passingScore,
      maxAttempts,
      status = "DRAFT",
      isRandomized,
      questions,
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    // Hiring Managers can only create complete requisition assessments, not blank assessment templates
    if (employer.role === UserRole.HIRING_MANAGER && (!skills || !Array.isArray(skills) || skills.length === 0 || !durationMinutes)) {
      return NextResponse.json(
        { error: "Forbidden: Hiring Managers cannot create assessment templates." },
        { status: 403 }
      );
    }

    // Validate that SHORT_TEXT questions use exact or keyword matching only (no recruiter regex)
    if (Array.isArray(questions)) {
      for (const q of questions) {
        if (q.questionType === "SHORT_TEXT" && q.correctAnswer) {
          const ans = String(q.correctAnswer).trim();
          const looksLikeRegex =
            (ans.startsWith("/") && ans.endsWith("/") && ans.length > 2) ||
            ans.startsWith("regex:") ||
            ans.includes("(?=") ||
            ans.includes("(?<=") ||
            ans.includes("\\d+") ||
            ans.includes("[a-z]+") ||
            (ans.startsWith("^") && ans.endsWith("$"));

          if (looksLikeRegex) {
            return NextResponse.json(
              {
                error:
                  "Regex patterns are not permitted for SHORT_TEXT questions. Please provide exact or keyword match terms only.",
              },
              { status: 400 }
            );
          }
        }
      }
    }

    const duration = parseInt(durationMinutes, 10) || 30;
    const passThreshold = parseInt(passingScore, 10) || 70;
    const attempts = parseInt(maxAttempts, 10) || 1;

    const assessment = await db.assessment.create({
      data: {
        companyId: employer.companyId,
        title: title.trim(),
        description: description?.trim() || null,
        skills: Array.isArray(skills) ? skills : (skills || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        durationMinutes: duration,
        passingScore: passThreshold,
        maxAttempts: attempts,
        status: ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status) ? status : "DRAFT",
        isRandomized: Boolean(isRandomized),
        isArchived: status === "ARCHIVED",
        questions: {
          create: (questions || []).map((q: any, idx: number) => ({
            question: q.question || `Question ${idx + 1}`,
            questionType: q.questionType || "SINGLE_CHOICE",
            options: Array.isArray(q.options) ? q.options : [],
            correctAnswer: q.correctAnswer !== undefined ? String(q.correctAnswer) : null,
            points: Number(q.points) > 0 ? Number(q.points) : 10,
            negativePoints: Number(q.negativePoints) >= 0 ? Number(q.negativePoints) : 0,
            scoringMode: q.scoringMode === "PARTIAL" ? "PARTIAL" : "ALL_OR_NOTHING",
            orderIndex: q.orderIndex !== undefined ? Number(q.orderIndex) : idx,
            explanation: q.explanation || null,
          })),
        },
      },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
        assignments: true,
      },
    });

    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role as any,
      action: "ASSESSMENT_CREATED",
      entityType: "ASSESSMENT",
      entityId: assessment.id,
      reason: `Created assessment: ${title} with ${questions?.length || 0} questions`,
    });

    return NextResponse.json({ success: true, assessment }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating assessment:", error);
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 });
  }
}
