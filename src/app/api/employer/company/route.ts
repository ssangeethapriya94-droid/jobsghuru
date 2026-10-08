import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer } from "@/lib/employer/auth";

export async function GET(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await db.company.findUnique({
      where: { id: employer.companyId },
      include: {
        verifications: {
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ success: true, company });
  } catch (error: any) {
    console.error("Error fetching company details:", error);
    return NextResponse.json({ error: "Failed to fetch company details" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (employer.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Company Admin can update company profile and settings." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      legalName,
      website,
      businessPhone,
      location,
      size,
      description,
      culture,
      benefits,
    } = body;

    const updated = await db.company.update({
      where: { id: employer.companyId },
      data: {
        name: name || undefined,
        legalName: legalName || undefined,
        website: website || undefined,
        businessPhone: businessPhone || undefined,
        location: location || undefined,
        size: size || undefined,
        description: description || undefined,
        culture: culture || undefined,
        benefits: Array.isArray(benefits) ? benefits : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      company: updated,
      message: "Company details updated successfully.",
    });
  } catch (error: any) {
    console.error("Error updating company details:", error);
    return NextResponse.json({ error: "Failed to update company details" }, { status: 500 });
  }
}
