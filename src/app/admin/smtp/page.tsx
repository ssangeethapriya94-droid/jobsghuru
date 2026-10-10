import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminSmtpGatewayView from "@/components/admin/AdminSmtpGatewayView";

export const metadata = {
  title: "Email & SMTP Gateway | JobsGhuru Admin Console",
  description: "Configure SMTP credentials, sender identities, and automated notification triggers for JobsGhuru.",
};

export default async function AdminSmtpPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  let initialConfig = undefined;

  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "SMTP_GATEWAY_CONFIG" },
    });
    if (setting?.value) {
      initialConfig = JSON.parse(setting.value);
    }
  } catch (e) {
    console.error("Failed to load initial SMTP config", e);
  }

  return <AdminSmtpGatewayView initialConfig={initialConfig} />;
}
