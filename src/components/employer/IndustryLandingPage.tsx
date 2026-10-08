import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Briefcase,
  Layers,
  HelpCircle,
  Building2,
  MapPin,
} from "lucide-react";

interface IndustryLandingPageProps {
  industryTitle: string;
  heroHeadline: string;
  heroSubheadline: string;
  candidateCategories: string[];
  hiringChallenges: { title: string; desc: string }[];
  platformFeatures: { title: string; desc: string }[];
  recommendedPlanCode: string;
  recommendedPlanName: string;
  recommendedPlanDesc: string;
  faqList: { q: string; a: string }[];
  liveRoles: Array<{
    id: string;
    title: string;
    location: string;
    salaryMinLpa: number | null;
    salaryMaxLpa: number | null;
    companyName: string;
  }>;
}

export default function IndustryLandingPage({
  industryTitle,
  heroHeadline,
  heroSubheadline,
  candidateCategories,
  hiringChallenges,
  platformFeatures,
  recommendedPlanCode,
  recommendedPlanName,
  recommendedPlanDesc,
  faqList,
  liveRoles,
}: IndustryLandingPageProps) {
  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/60 via-white to-white py-16 lg:py-24">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">
              <Building2 size={14} className="text-blue-700" /> {industryTitle} Hiring Solutions
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {heroHeadline}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
              {heroSubheadline}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={`/employers/register?industry=${encodeURIComponent(industryTitle)}&plan=${recommendedPlanCode}`}
                className="rounded-2xl bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition flex items-center gap-2"
              >
                Hire {industryTitle} Talent
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/employers/plans"
                className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              >
                View Hiring Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Candidate Categories */}
      <section className="py-12 border-b border-slate-200 bg-white">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
            Candidate Specializations Covered
          </div>
          <div className="flex flex-wrap gap-2.5">
            {candidateCategories.map((cat, idx) => (
              <span
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-blue-400 hover:bg-blue-50/50 transition cursor-default shadow-2xs"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges & Solutions */}
      <section className="py-20 border-b border-slate-200">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Challenges */}
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-md">
                Industry Challenges
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                Overcoming {industryTitle} Talent Bottlenecks
              </h2>
              <div className="mt-6 space-y-4">
                {hiringChallenges.map((c, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:border-slate-300 transition">
                    <h3 className="font-display text-base font-bold text-slate-900">{c.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Features */}
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-md">
                JobsGhuru Advantage
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                Purpose-Built Recruitment Workflow
              </h2>
              <div className="mt-6 space-y-4">
                {platformFeatures.map((f, idx) => (
                  <div key={idx} className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-6">
                    <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2.5">
                      <CheckCircle2 size={17} className="text-blue-600" />
                      {f.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Sample Jobs in this Category */}
      {liveRoles.length > 0 && (
        <section className="py-16 border-b border-slate-200 bg-white">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-md">
                  Active Feed
                </span>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-900">
                  Live Verified Roles in {industryTitle}
                </h2>
              </div>
              <Link href="/jobs" className="text-xs font-bold text-blue-600 hover:underline">
                View all live listings &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveRoles.slice(0, 3).map((job) => (
                <div key={job.id} className="rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-blue-300 transition">
                  <div className="text-xs font-bold text-blue-700">{job.companyName}</div>
                  <h3 className="mt-1 text-base font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} /> {job.location}
                    </span>
                    {job.salaryMinLpa && (
                      <span className="font-semibold text-slate-700">
                        ₹{job.salaryMinLpa} - {job.salaryMaxLpa} LPA
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Plan CTA */}
      <section className="py-16 border-b border-slate-200 bg-slate-50">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="rounded-3xl border border-blue-200 bg-white p-8 md:p-12 shadow-md w-full flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-md">
                Recommended Solution
              </span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                {recommendedPlanName} for {industryTitle}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                {recommendedPlanDesc}
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap gap-3 w-full md:w-auto">
              <Link
                href={`/employers/register?industry=${encodeURIComponent(industryTitle)}&plan=${recommendedPlanCode}`}
                className="rounded-2xl bg-blue-600 px-7 py-3.5 text-center text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
              >
                Choose {recommendedPlanName}
              </Link>
              <Link
                href="/employers/plans"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Compare All Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              {industryTitle} Recruitment FAQ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqList.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 shadow-2xs hover:bg-white hover:border-blue-200 transition">
                <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle size={15} className="text-blue-600 shrink-0" />
                  {item.q}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
