import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
    ]);
    if (!authorized) return response!;

    const [payments, subscription] = await Promise.all([
      db.payment.findMany({
        where: { companyId: employer.companyId },
        orderBy: { createdAt: "desc" },
      }),
      db.subscription.findFirst({
        where: { companyId: employer.companyId, status: "ACTIVE" },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      subscription: subscription
        ? {
            id: subscription.id,
            planName: subscription.plan.name,
            status: subscription.status,
            currentStart: subscription.currentStart,
            currentEnd: subscription.currentEnd,
          }
        : null,
      payments: payments.map((p) => ({
        id: p.id,
        invoiceNumber: p.invoiceNumber,
        amountInr: p.amountInr,
        planName: p.planName,
        paymentMethod: p.paymentMethod,
        status: p.status,
        createdAt: p.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching billing:", error);
    return NextResponse.json({ error: "Failed to fetch billing" }, { status: 500 });
  }
}
