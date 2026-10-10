import { db } from "@/lib/db";
import { DEFAULT_CMS_PAGES } from "@/lib/cms-defaults";
import { CmsPageViewer } from "@/components/CmsPageViewer";

export const metadata = {
  title: "Privacy Policy & Data Security | JobsGhuru",
  description:
    "JobsGhuru candidate & employer privacy framework, data encryption, and DPDP compliance.",
};

async function getPageData() {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "CMS_PAGE_privacy" },
    });
    if (setting?.value) {
      return JSON.parse(setting.value);
    }
  } catch (e) {
    console.error("Failed to load CMS data", e);
  }
  return DEFAULT_CMS_PAGES["privacy"];
}

export default async function PrivacyPage() {
  const page = await getPageData();

  return (
    <CmsPageViewer
      slug="privacy"
      title={page.title || "Privacy Policy & Data Security"}
      metaDescription={page.metaDescription}
      contentHtml={page.contentHtml}
      badges={[
        {
          icon: "ShieldCheck",
          label: "Data Sovereignty & DPDP Compliance",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
        {
          icon: "Lock",
          label: "AES-256 Resume Encryption",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        },
      ]}
      metrics={[
        { value: "100%", label: "AES-256 Encrypted", color: "text-blue-600" },
        { value: "DPDP '23", label: "Law Compliant", color: "text-emerald-600" },
        { value: "0", label: "Data Selling", color: "text-purple-600" },
        { value: "Instant", label: "Data Scrubbing", color: "text-amber-600" },
      ]}
      helpCardTitle="Privacy & Data Inquiry?"
      helpCardDesc="Contact our Data Protection Officer for profile data inspection, export, or permanent account scrubbing."
      helpCardCta="Contact DPO Officer"
      helpCardHref="/contact"
    />
  );
}
