import { NextResponse } from "next/server";
import { getCurrentEmployer } from "@/lib/employer/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ authenticated: false, employer: null });
    }
    return NextResponse.json({
      authenticated: true,
      employer,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ authenticated: false, employer: null }, { status: 500 });
  }
}
