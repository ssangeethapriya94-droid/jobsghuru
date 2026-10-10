import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminPaymentGatewayView from "@/components/admin/AdminPaymentGatewayView";

export const metadata = {
  title: "Payment Gateway & UPI Controls | JobsGhuru Admin Console",
  description: "Manage visible payment methods (Razorpay & Dynamic UPI QR Code), set your business UPI ID, and configure tax rates.",
};

export default async function AdminPaymentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  let initialConfig = undefined;

  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "PAYMENT_GATEWAY_CONFIG" },
    });
    if (setting?.value) {
      initialConfig = JSON.parse(setting.value);
    }
  } catch (e) {
    console.error("Failed to load initial Payment Gateway config", e);
  }

  return <AdminPaymentGatewayView initialConfig={initialConfig} />;
}
