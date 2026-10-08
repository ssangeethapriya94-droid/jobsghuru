import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";
import { recordAuditLog } from "@/lib/admin/audit";

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
    ]);
    if (!authorized) return response!;

    const assessment = await db.assessment.findFirst({
      where: {
        id: params.id,
        companyId: employer.companyId,
      },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
        assignments: {
          orderBy: { createdAt: "desc" },
          include: {
            application: {
              select: { id: true, candidateName: true, candidateEmail: true, jobId: true },
            },
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, assessment });
  } catch (err: any) {
    console.error("Error fetching assessment:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const existing = await db.assessment.findFirst({
      where: {
        id: params.id,
        companyId: employer.companyId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description,
      skills,
      durationMinutes,
      passingScore,
      maxAttempts,
      status,
      isRandomized,
      questions,
    } = body;

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

    const updated = await db.$transaction(async (tx) => {
      // 1. Update assessment header
      const assess = await tx.assessment.update({
        where: { id: params.id },
        data: {
          ...(title && { title: title.trim() }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(skills && {
            skills: Array.isArray(skills) ? skills : skills.split(",").map((s: string) => s.trim()).filter(Boolean),
          }),
          ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
          ...(passingScore !== undefined && { passingScore: Number(passingScore) }),
          ...(maxAttempts !== undefined && { maxAttempts: Number(maxAttempts) }),
          ...(status && {
            status,
            isArchived: status === "ARCHIVED",
          }),
          ...(isRandomized !== undefined && { isRandomized: Boolean(isRandomized) }),
        },
      });

      // 2. Sync questions if provided
      if (Array.isArray(questions)) {
        await tx.assessmentQuestion.deleteMany({
          where: { assessmentId: params.id },
        });

        await tx.assessmentQuestion.createMany({
          data: questions.map((q: any, idx: number) => ({
            assessmentId: params.id,
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
        });
      }

      return await tx.assessment.findUnique({
        where: { id: params.id },
        include: { questions: { orderBy: { orderIndex: "asc" } } },
      });
    });

    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role as any,
      action: "ASSESSMENT_UPDATED",
      entityType: "ASSESSMENT",
      entityId: params.id,
      reason: `Updated assessment: ${updated?.title}`,
    });

    return NextResponse.json({ success: true, assessment: updated });
  } catch (err: any) {
    console.error("Error updating assessment:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const existing = await db.assessment.findFirst({
      where: {
        id: params.id,
        companyId: employer.companyId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status, isArchived } = body;

    const newStatus = status || (isArchived ? "ARCHIVED" : existing.status);
    const updated = await db.assessment.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        isArchived: newStatus === "ARCHIVED" || Boolean(isArchived),
      },
    });

    return NextResponse.json({ success: true, assessment: updated });
  } catch (err: any) {
    console.error("Error updating assessment status:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const assessment = await db.assessment.findFirst({
      where: {
        id: params.id,
        companyId: employer.companyId,
      },
      include: {
        assignments: { select: { id: true } },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    // Versioning rule: If assignments exist, soft-archive instead of hard-deleting
    if (assessment.assignments.length > 0) {
      const archived = await db.assessment.update({
        where: { id: params.id },
        data: {
          isArchived: true,
          status: "ARCHIVED",
        },
      });

      await recordAuditLog({
        actorId: employer.id,
        actorEmail: employer.email,
        actorRole: employer.role as any,
        action: "ASSESSMENT_ARCHIVED",
        entityType: "ASSESSMENT",
        entityId: params.id,
        reason: `Archived assessment ${assessment.title} (retained for ${assessment.assignments.length} assignments)`,
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: "Assessment has active or past candidate assignments and was safely archived.",
        assessment: archived,
      });
    }

    await db.assessment.delete({ where: { id: params.id } });

    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role as any,
      action: "ASSESSMENT_DELETED",
      entityType: "ASSESSMENT",
      entityId: params.id,
      reason: `Deleted unused assessment: ${assessment.title}`,
    });

    return NextResponse.json({ success: true, deleted: true, message: "Assessment deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting assessment:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
