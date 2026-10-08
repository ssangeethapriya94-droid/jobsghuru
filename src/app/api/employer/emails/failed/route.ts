import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";
import { processEmailOutbox } from "@/lib/email/outbox";

export async function GET(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const failedEmails = await db.emailOutbox.findMany({
      where: {
        companyId: employer.companyId,
        status: "FAILED",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, emails: failedEmails });
  } catch (error: any) {
    console.error("Error fetching failed email outbox:", error);
    return NextResponse.json({ error: "Failed to fetch failed emails" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const body = await req.json();
    const { emailId } = body;

    if (!emailId) {
      return NextResponse.json({ error: "emailId is required." }, { status: 400 });
    }

    const email = await db.emailOutbox.findUnique({ where: { id: emailId } });
    if (!email || email.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Failed email record not found" }, { status: 404 });
    }

    // Reset status to PENDING and retry processing
    await db.emailOutbox.update({
      where: { id: emailId },
      data: { status: "PENDING", errorMessage: null },
    });

    await processEmailOutbox().catch(() => {});

    const updated = await db.emailOutbox.findUnique({ where: { id: emailId } });

    return NextResponse.json({
      success: true,
      email: updated,
      message: updated?.status === "SENT" ? "Email retried and delivered successfully." : "Email retry queued.",
    });
  } catch (error: any) {
    console.error("Error retrying failed email:", error);
    return NextResponse.json({ error: "Failed to retry email" }, { status: 500 });
  }
}
