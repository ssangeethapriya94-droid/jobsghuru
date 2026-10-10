import { db } from "@/lib/db";
import { DEFAULT_CMS_PAGES } from "@/lib/cms-defaults";
import { CmsPageViewer } from "@/components/CmsPageViewer";
import { Headphones, Mail, Phone, MapPin, Send, ShieldCheck, Clock } from "lucide-react";

export const metadata = {
  title: "Contact Us & Corporate Support | JobsGhuru",
  description:
    "Get in touch with JobsGhuru support, candidate helpline, and enterprise sales teams.",
};

async function getPageData() {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: "CMS_PAGE_contact" },
    });
    if (setting?.value) {
      return JSON.parse(setting.value);
    }
  } catch (e) {
    console.error("Failed to load CMS data", e);
  }
  return DEFAULT_CMS_PAGES["contact"];
}

export default async function ContactPage() {
  const page = await getPageData();

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-6 sm:py-10 text-slate-900">
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 space-y-8">
        
        {/* Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Headphones size={14} className="text-blue-600" />
              24/7 Corporate & Candidate Support
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Clock size={13} />
              2-Hour SLA Response Guarantee
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {page.title || "Contact Us & Corporate Support"}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            {page.metaDescription}
          </p>

          {/* Department Quick Cards Grid */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs">
                <Headphones size={16} />
                <span>Candidate Helpline</span>
              </div>
              <p className="text-xs text-slate-600">Mon-Sat 9 AM - 8 PM IST</p>
              <a
                href="mailto:support@jobshuru.com"
                className="text-xs font-bold text-blue-700 hover:underline block"
              >
                support@jobshuru.com
              </a>
              <div className="text-xs font-mono text-slate-500 font-bold">1800 200 4487</div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs">
                <Mail size={16} />
                <span>Enterprise Sales</span>
              </div>
              <p className="text-xs text-slate-600">Recruiter Subscriptions & Plans</p>
              <a
                href="mailto:sales@jobshuru.com"
                className="text-xs font-bold text-emerald-700 hover:underline block"
              >
                sales@jobshuru.com
              </a>
              <div className="text-xs font-mono text-slate-500 font-bold">+91 124 459 9000</div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs">
                <ShieldCheck size={16} />
                <span>Legal & DPO Officer</span>
              </div>
              <p className="text-xs text-slate-600">Compliance & Data Sovereignty</p>
              <a
                href="mailto:compliance@jobshuru.com"
                className="text-xs font-bold text-purple-700 hover:underline block"
              >
                compliance@jobshuru.com
              </a>
              <div className="text-xs text-slate-500 font-bold">Cyber City, Gurugram</div>
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout: Left Content + Right Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: CMS Body & Address Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div
                dangerouslySetInnerHTML={{ __html: page.contentHtml }}
                className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base prose-headings:font-display prose-headings:font-extrabold prose-headings:text-slate-900 prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-3 prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-blue-900 prose-a:text-blue-600 prose-a:font-bold hover:prose-a:underline"
              />
            </div>

            {/* Corporate Location Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <MapPin size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-sm font-extrabold text-slate-900">
                  JobsGhuru Corporate Headquarters
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  JobsGhuru Technologies Private Limited<br />
                  Cyber City, Tower 4, 12th Floor, Sector 24<br />
                  Gurugram, Haryana - 122002, India
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Support Inquiry Form */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="space-y-1">
                <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Mail size={18} className="text-blue-600" />
                  <span>Send a Direct Inquiry</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Fill out the form below and our team will get back to you within 2 hours.
                </p>
              </div>

              <form className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inquiry Department</label>
                  <select className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 font-bold focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition cursor-pointer">
                    <option value="candidate">Candidate Support & Application Helpline</option>
                    <option value="enterprise">Enterprise Recruiter & Plan Subscriptions</option>
                    <option value="legal">Legal, Privacy & DPDP DPO Inquiry</option>
                    <option value="fraud">Report Scam / Suspicious Job Listing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about your query or requested assistance..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={15} />
                  <span>Send Inquiry</span>
                </button>
              </form>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
