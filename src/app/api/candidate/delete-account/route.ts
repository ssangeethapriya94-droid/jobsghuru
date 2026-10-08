import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCandidate } from "@/lib/candidate/auth";

export async function POST(req: NextRequest) {
  try {
    const candidate = await getCurrentCandidate();
    if (!candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { confirmText } = body;

    if (confirmText !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: "Confirmation text mismatch. Type 'DELETE MY ACCOUNT' to confirm." },
        { status: 400 }
      );
    }

    // Perform DPDP compliant deletion
    await db.user.delete({
      where: { id: candidate.id },
    });

    return NextResponse.json({
      success: true,
      message: "Your account and personal data have been permanently deleted.",
    });
  } catch (error: any) {
    console.error("Error deleting candidate account:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
