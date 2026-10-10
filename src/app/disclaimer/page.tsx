import { db } from "@/lib/db";
import { DEFAULT_CMS_PAGES } from "@/lib/cms-defaults";
import { CmsPageViewer } from "@/components/CmsPageViewer";

export const metadata = {
  title: "Disclaimer & Anti-Fraud Safety | JobsGhuru",
  description:
    "JobsGhuru official anti-fraud guidelines, pay transparency compliance, and candidate protection.",
};

async function getPageData() {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "CMS_PAGE_disclaimer" },
    });
    if (setting?.value) {
      return JSON.parse(setting.value);
    }
  } catch (e) {
    console.error("Failed to load CMS data", e);
  }
  return DEFAULT_CMS_PAGES["disclaimer"];
}

export default async function DisclaimerPage() {
  const page = await getPageData();

  return (
    <CmsPageViewer
      slug="disclaimer"
      title={page.title || "Platform Disclaimer & Anti-Fraud Safety"}
      metaDescription={page.metaDescription}
      contentHtml={page.contentHtml}
      badges={[
        {
          icon: "AlertTriangle",
          label: "Candidate Anti-Fraud Protection",
          color: "bg-amber-50 text-amber-800 border-amber-200",
        },
        {
          icon: "ShieldCheck",
          label: "100% Zero Fee Guarantee",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
      ]}
      metrics={[
        { value: "0 Fees", label: "Candidate Guarantee", color: "text-emerald-600" },
        { value: "100%", label: "Verified Employers", color: "text-blue-600" },
        { value: "Strict", label: "Pay Transparency", color: "text-purple-600" },
        { value: "24/7", label: "Fraud Helpline", color: "text-amber-600" },
      ]}
      helpCardTitle="Report Fraud or Scam?"
      helpCardDesc="Report suspicious job listings or requests for candidate payments immediately to our trust team."
      helpCardCta="Report Suspicious Job"
      helpCardHref="/contact"
    />
  );
}
