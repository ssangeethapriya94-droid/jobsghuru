import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

export async function POST(
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

    const application = await db.application.findFirst({
      where: {
        id: params.id,
        job: { companyId: employer.companyId },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const body = await req.json();
    const { content, isPrivate } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Note content is required." }, { status: 400 });
    }

    const note = await db.recruiterNote.create({
      data: {
        applicationId: application.id,
        companyId: employer.companyId,
        authorId: employer.id,
        authorName: employer.name,
        authorRole: employer.role,
        content: content.trim(),
        isPrivate: Boolean(isPrivate),
      },
    });

    await db.applicationEvent.create({
      data: {
        applicationId: application.id,
        actorId: employer.id,
        actorName: employer.name,
        actorRole: employer.role,
        action: "RECRUITER_NOTE_ADDED",
        metadata: { isPrivate: Boolean(isPrivate) },
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
  }
}
