import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rawToken = params.token;
    const tokenHash = hashToken(rawToken);

    const candidateAssessment = await db.candidateAssessment.findFirst({
      where: {
        OR: [{ tokenHash }, { token: rawToken }],
      },
    });

    if (!candidateAssessment) {
      return NextResponse.json({ error: "Invalid assessment token." }, { status: 404 });
    }

    if (candidateAssessment.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Cannot autosave: assessment is not in progress." },
        { status: 400 }
      );
    }

    // Deadline check
    if (candidateAssessment.deadlineAt && new Date() > candidateAssessment.deadlineAt) {
      return NextResponse.json(
        { error: "Time limit exceeded. Autosave rejected." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { answers } = body;

    await db.candidateAssessment.update({
      where: { id: candidateAssessment.id },
      data: {
        answers: answers || {},
      },
    });

    return NextResponse.json({ success: true, savedAt: new Date() });
  } catch (error: any) {
    console.error("Autosave error:", error);
    return NextResponse.json({ error: "Failed to autosave answers" }, { status: 500 });
  }
}
