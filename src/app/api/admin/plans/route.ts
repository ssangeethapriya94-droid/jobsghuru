import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await db.plan.findMany({
      orderBy: { priceInr: "asc" },
    });

    return NextResponse.json({ plans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, priceInr, billingCycle, features, jobLimit, resumeLimit, type } = body;

    if (!name || typeof priceInr !== "number") {
      return NextResponse.json({ error: "Plan name and price are required." }, { status: 400 });
    }

    const newPlan = await db.plan.create({
      data: {
        name,
        priceInr,
        billingCycle: billingCycle || "MONTHLY",
        features: Array.isArray(features) ? features : [],
        jobLimit: typeof jobLimit === "number" ? jobLimit : 5,
        resumeLimit: typeof resumeLimit === "number" ? resumeLimit : 100,
        type: type || "EMPLOYER",
        active: true,
      },
    });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create plan" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, priceInr, billingCycle, jobLimit, resumeLimit, active, features } = body;

    if (!id) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    const updatedPlan = await db.plan.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(typeof priceInr === "number" && { priceInr }),
        ...(billingCycle && { billingCycle }),
        ...(typeof jobLimit === "number" && { jobLimit }),
        ...(typeof resumeLimit === "number" && { resumeLimit }),
        ...(typeof active === "boolean" && { active }),
        ...(Array.isArray(features) && { features }),
      },
    });

    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    await db.plan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Plan deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete plan" }, { status: 500 });
  }
}
