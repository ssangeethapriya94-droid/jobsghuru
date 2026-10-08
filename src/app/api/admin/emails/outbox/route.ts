import { NextResponse } from "next/server";
import { emailOutbox } from "@/lib/email/mailer";
import { getCurrentAdmin } from "@/lib/admin/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    // Allow viewing in dev mode or with admin auth
    if (!admin && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      count: emailOutbox.length,
      emails: emailOutbox,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch email outbox" }, { status: 500 });
  }
}
