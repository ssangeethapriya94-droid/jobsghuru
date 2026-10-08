import { NextResponse } from "next/server";
import { destroyEmployerSession } from "@/lib/employer/auth";

export async function POST() {
  try {
    await destroyEmployerSession();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
