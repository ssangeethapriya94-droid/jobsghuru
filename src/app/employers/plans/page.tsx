import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Building2,
  Users,
  Briefcase,
  HelpCircle,
  X,
  PhoneCall,
} from "lucide-react";
import { db } from "@/lib/db";
import PlansClientView from "./PlansClientView";

export const metadata = {
  title: "Employer Hiring Plans & Partnerships · JobsGhuru",
  description:
    "Explore transparent hiring partnerships for startups, growing companies, and enterprises. Compare features, active job slots, and candidate search credits.",
};

export const revalidate = 60;

export default async function EmployerPlansPage() {
  const plans = await db.employerPlan
    .findMany({
      where: { active: true },
      orderBy: { monthlyPriceInr: "asc" },
      include: {
        industryPricings: true,
      },
    })
    .catch(() => []);

  return <PlansClientView initialPlans={plans} />;
}
