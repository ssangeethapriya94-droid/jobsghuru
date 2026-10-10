import { db } from "@/lib/db";
import { DEFAULT_CMS_PAGES } from "@/lib/cms-defaults";
import { CmsPageViewer } from "@/components/CmsPageViewer";

export const metadata = {
  title: "About Us | JobsGhuru Recruitment Intelligence",
  description:
    "Learn about JobsGhuru, India's premier AI-driven talent recruitment & career growth ecosystem.",
};

async function getPageData() {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "CMS_PAGE_about" },
    });
    if (setting?.value) {
      return JSON.parse(setting.value);
    }
  } catch (e) {
    console.error("Failed to load CMS data", e);
  }
  return DEFAULT_CMS_PAGES["about"];
}

export default async function AboutPage() {
  const page = await getPageData();

  return (
    <CmsPageViewer
      slug="about"
      title={page.title || "About JobsGhuru"}
      metaDescription={page.metaDescription}
      contentHtml={page.contentHtml}
      badges={[
        {
          icon: "Sparkles",
          label: "Recruitment Intelligence & AI Matching",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        },
        {
          icon: "ShieldCheck",
          label: "100% Accredited Corporate Employers",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
      ]}
      metrics={[
        { value: "2M+", label: "Active Candidates", color: "text-blue-600" },
        { value: "5,000+", label: "Verified Employers", color: "text-emerald-600" },
        { value: "98.5%", label: "AI Match Score", color: "text-purple-600" },
        { value: "0 Fees", label: "Candidate Guarantee", color: "text-amber-600" },
      ]}
      helpCardTitle="Looking to Hire Top Talent?"
      helpCardDesc="Post requisitions and access pre-screened candidate pools across India."
      helpCardCta="Employer Portal"
      helpCardHref="/employer/login"
    />
  );
}
