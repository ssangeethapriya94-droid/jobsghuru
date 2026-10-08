import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    const note = await db.recruiterNote.findFirst({
      where: {
        id: params.noteId,
        applicationId: params.id,
        companyId: employer.companyId,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Only note author or COMPANY_ADMIN can delete the note
    if (note.authorId !== employer.id && employer.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own notes." },
        { status: 403 }
      );
    }

    await db.recruiterNote.delete({
      where: { id: note.id },
    });

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (err: any) {
    console.error("Error deleting note:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete note." },
      { status: 500 }
    );
  }
}
