import { db } from "@/lib/db";
import { DEFAULT_CMS_PAGES } from "@/lib/cms-defaults";
import { CmsPageViewer } from "@/components/CmsPageViewer";

export const metadata = {
  title: "Terms & Conditions of Service | JobsGhuru",
  description:
    "Terms of service governing job seekers, recruiters, enterprise subscriptions, and platform usage.",
};

async function getPageData() {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "CMS_PAGE_terms" },
    });
    if (setting?.value) {
      return JSON.parse(setting.value);
    }
  } catch (e) {
    console.error("Failed to load CMS data", e);
  }
  return DEFAULT_CMS_PAGES["terms"];
}

export default async function TermsPage() {
  const page = await getPageData();

  return (
    <CmsPageViewer
      slug="terms"
      title={page.title || "Terms & Conditions of Service"}
      metaDescription={page.metaDescription}
      contentHtml={page.contentHtml}
      badges={[
        {
          icon: "Scale",
          label: "Legal & Platform Governance",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        },
        {
          icon: "ShieldCheck",
          label: "100% Accredited Employers",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
      ]}
      metrics={[
        { value: "100%", label: "Fair Hiring Policy", color: "text-blue-600" },
        { value: "Verified", label: "Corporate Recruiters", color: "text-emerald-600" },
        { value: "Zero", label: "MLM / Scam Tolerance", color: "text-purple-600" },
        { value: "Strict", label: "Quota Enforcement", color: "text-amber-600" },
      ]}
      helpCardTitle="Have Legal Questions?"
      helpCardDesc="Contact our corporate compliance team for contract terms or quota details."
      helpCardCta="Contact Legal Team"
      helpCardHref="/contact"
    />
  );
}
