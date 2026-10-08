import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminBillingView from "@/components/admin/AdminBillingView";

export const metadata = {
  title: "Subscription Management | JobsGhuru Admin",
};

export default async function AdminSubscriptionsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const [plans, subscriptions, payments] = await Promise.all([
    db.plan.findMany({ orderBy: { priceInr: "asc" } }),
    db.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true } },
        plan: { select: { name: true, priceInr: true } },
      },
    }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { company: { select: { name: true } } },
      take: 60,
    }),
  ]);

  const serializedPlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    priceInr: p.priceInr,
    billingCycle: p.billingCycle,
    features: p.features,
    jobLimit: p.jobLimit,
    resumeLimit: p.resumeLimit,
    active: p.active,
  }));

  const serializedSubs = subscriptions.map((s) => ({
    id: s.id,
    companyName: s.company?.name || null,
    planName: s.plan.name,
    priceInr: s.plan.priceInr,
    status: s.status,
    currentStart: s.currentStart.toISOString(),
    currentEnd: s.currentEnd.toISOString(),
    createdAt: s.createdAt.toISOString(),
  }));

  const serializedPayments = payments.map((p) => ({
    id: p.id,
    invoiceNumber: p.invoiceNumber,
    companyName: p.company?.name || null,
    planName: p.planName,
    amountInr: p.amountInr,
    currency: p.currency,
    status: p.status,
    paymentMethod: p.paymentMethod,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <AdminBillingView
      plans={serializedPlans}
      subscriptions={serializedSubs}
      payments={serializedPayments}
      initialTab="subscriptions"
    />
  );
}
