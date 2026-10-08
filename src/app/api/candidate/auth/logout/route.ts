import { NextResponse } from "next/server";
import { destroyCandidateSession } from "@/lib/candidate/auth";

export async function POST() {
  try {
    await destroyCandidateSession();
    return NextResponse.json({
      success: true,
      message: "Logged out successfully from candidate portal.",
    });
  } catch (err: any) {
    console.error("Candidate logout error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to log out." },
      { status: 500 }
    );
  }
}
