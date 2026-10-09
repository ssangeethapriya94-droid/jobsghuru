import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentEmployer } from "@/lib/employer/auth";

export async function POST(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json(
        { error: "Unauthorized: Active employer session required." },
        { status: 401 }
      );
    }

    const { companyId } = await req.json();
    if (!companyId || typeof companyId !== "string") {
      return NextResponse.json(
        { error: "Valid companyId parameter is required." },
        { status: 400 }
      );
    }

    // Verify user has access to requested companyId
    const isAuthorized = employer.availableCompanies?.some((c) => c.id === companyId);
    if (!isAuthorized && employer.companyId !== companyId) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to manage this company." },
        { status: 403 }
      );
    }

    // Set active company cookie
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);
    cookies().set("cb_active_company_id", companyId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return NextResponse.json({
      success: true,
      activeCompanyId: companyId,
      message: "Active company context switched successfully.",
    });
  } catch (error: any) {
    console.error("Error switching employer company context:", error);
    return NextResponse.json(
      { error: "Failed to switch active company." },
      { status: 500 }
    );
  }
}
