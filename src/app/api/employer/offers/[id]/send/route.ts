import { NextRequest, NextResponse } from "next/server";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";
import { sendOfferEmail } from "@/lib/employer/offers";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const offer = await sendOfferEmail(params.id, employer.companyId, employer.id, employer.email);

    return NextResponse.json({
      success: true,
      offer,
      message: "Offer letter dispatched successfully via Email Outbox.",
    });
  } catch (error: any) {
    console.error("Error sending offer:", error);
    return NextResponse.json({ error: error.message || "Failed to send offer" }, { status: 400 });
  }
}
