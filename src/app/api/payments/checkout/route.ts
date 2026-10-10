import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = parseFloat(searchParams.get("amount") || "0");
    const planName = searchParams.get("planName") || "JobsGhuru Plan";

    const setting = await db.systemSetting.findUnique({
      where: { key: "PAYMENT_GATEWAY_CONFIG" },
    });

    let config = {
      enableRazorpay: false,
      enableUpiQr: true,
      upiId: "manishmadhava91@okicici",
      qrImageUrl: "",
      razorpayKeyId: "",
      gstTaxRate: 18,
    };

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        config = { ...config, ...parsed };
      } catch (e) {
        console.error("Failed to parse stored Payment Gateway config", e);
      }
    }

    const gstAmount = (amount * (config.gstTaxRate || 18)) / 100;
    const totalAmount = (amount + gstAmount).toFixed(2);

    const upiIntentString = `upi://pay?pa=${encodeURIComponent(config.upiId)}&pn=JobsGhuru&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(planName)}`;
    const qrCodeUrl = config.qrImageUrl && config.qrImageUrl.trim().length > 5
      ? config.qrImageUrl
      : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiIntentString)}`;

    return NextResponse.json({
      success: true,
      enableRazorpay: config.enableRazorpay,
      enableUpiQr: config.enableUpiQr,
      upiId: config.upiId,
      razorpayKeyId: config.razorpayKeyId,
      gstTaxRate: config.gstTaxRate,
      baseAmount: amount,
      gstAmount: parseFloat(gstAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount),
      qrCodeUrl,
      upiIntentString,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch checkout details" }, { status: 500 });
  }
}
