import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch real job count grouped by department from database
    const groupedJobs = await db.job.groupBy({
      by: ["department"],
      _count: { id: true },
    });

    // 2. Fetch system setting for category plan allocations
    const setting = await db.systemSetting.findUnique({
      where: { key: "CATEGORY_PLAN_RESTRICTIONS" },
    });

    let savedRestrictions: Record<string, string> = {};
    if (setting?.value) {
      try {
        savedRestrictions = JSON.parse(setting.value);
      } catch (e) {
        console.error("Failed to parse CATEGORY_PLAN_RESTRICTIONS json", e);
      }
    }

    const categories = groupedJobs.map((g, index) => {
      const deptName = g.department || "General Requisitions";
      const code = deptName.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 8);
      const requiredPlan = savedRestrictions[deptName] || "ALL";

      return {
        id: `cat-${index + 1}`,
        name: deptName,
        code,
        jobCount: g._count.id,
        requiredPlan,
        status: "Active",
      };
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { categoryName, requiredPlan } = body;

    if (!categoryName || !requiredPlan) {
      return NextResponse.json({ error: "Category name and required plan are required" }, { status: 400 });
    }

    const setting = await db.systemSetting.findUnique({
      where: { key: "CATEGORY_PLAN_RESTRICTIONS" },
    });

    let currentMap: Record<string, string> = {};
    if (setting?.value) {
      try {
        currentMap = JSON.parse(setting.value);
      } catch (e) {
        currentMap = {};
      }
    }

    currentMap[categoryName] = requiredPlan;

    await db.systemSetting.upsert({
      where: { key: "CATEGORY_PLAN_RESTRICTIONS" },
      update: {
        value: JSON.stringify(currentMap),
        category: "BILLING",
        updatedBy: admin.email,
      },
      create: {
        key: "CATEGORY_PLAN_RESTRICTIONS",
        value: JSON.stringify(currentMap),
        category: "BILLING",
        updatedBy: admin.email,
      },
    });

    return NextResponse.json({ success: true, categoryName, requiredPlan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update category restriction" }, { status: 500 });
  }
}
