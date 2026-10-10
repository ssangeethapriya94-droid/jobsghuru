import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { createAuditLog } from "@/lib/admin/audit";

export interface PaymentGatewayConfig {
  enableRazorpay: boolean;
  enableUpiQr: boolean;
  upiId: string;
  qrImageUrl?: string;
  razorpayKeyId: string;
  razorpayKeySecret?: string;
  gstTaxRate: number;
}

const DEFAULT_PAYMENT_CONFIG: PaymentGatewayConfig = {
  enableRazorpay: false,
  enableUpiQr: true,
  upiId: "manishmadhava91@okicici",
  qrImageUrl: "",
  razorpayKeyId: "",
  razorpayKeySecret: "",
  gstTaxRate: 18,
};

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const setting = await db.systemSetting.findUnique({
      where: { key: "PAYMENT_GATEWAY_CONFIG" },
    });

    let config: PaymentGatewayConfig = { ...DEFAULT_PAYMENT_CONFIG };

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        config = { ...config, ...parsed };
      } catch (e) {
        console.error("Failed to parse stored Payment Gateway config", e);
      }
    }

    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load payment settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: Admin session required" }, { status: 401 });
    }

    const body: PaymentGatewayConfig = await req.json();

    if (!body.upiId) {
      return NextResponse.json(
        { error: "Business UPI ID (VPA) is required." },
        { status: 400 }
      );
    }

    const before = await db.systemSetting.findUnique({
      where: { key: "PAYMENT_GATEWAY_CONFIG" },
    });

    const setting = await db.systemSetting.upsert({
      where: { key: "PAYMENT_GATEWAY_CONFIG" },
      create: {
        key: "PAYMENT_GATEWAY_CONFIG",
        value: JSON.stringify(body),
        category: "BILLING_PAYMENT",
        updatedBy: admin.email,
      },
      update: {
        value: JSON.stringify(body),
        updatedBy: admin.email,
      },
    });

    await createAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "PAYMENT_CONFIG_UPDATED",
      entityType: "SYSTEM_SETTING",
      entityId: "PAYMENT_GATEWAY_CONFIG",
      beforeJson: before?.value || null,
      afterJson: JSON.stringify(body),
      reason: "Admin updated Payment Gateway, Business UPI ID & Tax configuration.",
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Payment Gateway & UPI settings saved successfully!",
      config: body,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save payment settings" }, { status: 500 });
  }
}
