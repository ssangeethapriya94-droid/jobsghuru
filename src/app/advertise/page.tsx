import Link from "next/link";
import { db } from "@/lib/db";
import { DEFAULT_CMS_PAGES } from "@/lib/cms-defaults";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Megaphone, Sparkles, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Advertise With Us | JobsGhuru Corporate Growth",
  description: "Promote your employer brand, run targeted recruitment campaigns, and sponsor job categories.",
};

async function getPageData() {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "CMS_PAGE_advertise" },
    });
    if (setting?.value) {
      return JSON.parse(setting.value);
    }
  } catch (e) {
    console.error("Failed to load CMS data", e);
  }
  return DEFAULT_CMS_PAGES["advertise"];
}

export default async function AdvertisePage() {
  const page = await getPageData();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <section className="bg-slate-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
            <Megaphone size={14} />
            <span>Employer Branding & Talent Advertising</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            {page.title || "Advertise With JobsGhuru"}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl">
            {page.metaDescription}
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
          <div
            dangerouslySetInnerHTML={{ __html: page.contentHtml }}
            className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base prose-headings:font-display prose-headings:font-extrabold prose-headings:text-slate-900 prose-h2:text-2xl prose-h3:text-xl prose-a:text-blue-600"
          />
        </div>

        {/* Call to Action Card */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-white text-center space-y-4 shadow-xl">
          <h2 className="font-display text-2xl font-extrabold">Ready to Boost Your Hiring Reach?</h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto">
            Connect with our Corporate Ads & Partnerships team to request a customized hiring strategy package.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl bg-white text-blue-700 hover:bg-slate-100 font-extrabold text-xs px-6 py-3 shadow-lg transition active:scale-95"
            >
              <span>Contact Sales Team</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
