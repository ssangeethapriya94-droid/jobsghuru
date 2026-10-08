import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      contactPerson,
      workEmail,
      phone,
      industry,
      companySize,
      hiringVolume,
      preferredPlan,
      message,
    } = body;

    if (!companyName || !contactPerson || !workEmail || !industry) {
      return NextResponse.json(
        { error: "Company name, contact person, work email, and industry are required." },
        { status: 400 }
      );
    }

    const lead = await db.employerLead.create({
      data: {
        companyName,
        contactPerson,
        workEmail,
        phone: phone || null,
        industry,
        companySize: companySize || "51-200",
        hiringVolume: hiringVolume || "6-20",
        preferredPlan: preferredPlan || "ENTERPRISE",
        message: message || null,
        status: "NEW",
      },
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: "Your inquiry has been submitted. Our enterprise talent director will reach out within 4 business hours.",
    });
  } catch (error: any) {
    console.error("Error creating employer lead:", error);
    return NextResponse.json({ error: "Failed to record sales inquiry." }, { status: 500 });
  }
}
