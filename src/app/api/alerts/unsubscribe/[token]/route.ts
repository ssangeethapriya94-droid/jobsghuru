import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  return handleUnsubscribe(params.token);
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  return handleUnsubscribe(params.token);
}

async function handleUnsubscribe(token: string) {
  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const alert = await db.jobAlert.findFirst({
      where: { tokenHash },
    });

    if (!alert) {
      return new NextResponse("Invalid or expired unsubscribe link.", { status: 404 });
    }

    await db.jobAlert.update({
      where: { id: alert.id },
      data: { active: false },
    });

    return new NextResponse(
      "<html><body style='font-family:sans-serif;padding:40px;text-align:center;'><h2>Successfully Unsubscribed</h2><p>You will no longer receive job alert emails for this search.</p></body></html>",
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return new NextResponse("Failed to unsubscribe", { status: 500 });
  }
}
