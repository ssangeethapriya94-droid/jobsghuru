import Link from "next/link";

export const dynamic = "force-dynamic";
import {
  Building2,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  Award,
  Sparkles,
  Bot,
  Calendar,
  Layers,
  BarChart3,
  Search,
  Briefcase,
  Sliders,
  DollarSign,
  Lock,
  ChevronRight,
  TrendingUp,
  Code2,
  Megaphone,
  HeartPulse,
  Truck,
  GraduationCap,
  Store,
  Factory,
  Building,
  HelpCircle,
} from "lucide-react";
import { db } from "@/lib/db";
import NaukriStyleEmployerHero from "@/components/employer/NaukriStyleEmployerHero";

export const metadata = {
  title: "For Employers · Complete Hiring Operating System",
  description:
    "Discover JobsGhuru Hiring Operating System. Post verified jobs, search talent, run AI candidate matching, schedule interviews, and measure team performance.",
};

export const revalidate = 60;

export default async function EmployersPage() {
  // Fetch real database metrics
  const [plans, verifiedCompaniesCount, activeJobsCount] = await Promise.all([
    db.employerPlan.findMany({
      where: { active: true },
      orderBy: { monthlyPriceInr: "asc" },
    }).catch(() => []),
    db.company.count({ where: { verified: true } }).catch(() => 12),
    db.job.count({ where: { status: "PUBLISHED", expiresAt: { gt: new Date() } } }).catch(() => 45),
  ]);

  const solutions = [
    {
      icon: Briefcase,
      title: "Job Posting & Feeds",
      desc: "Distribute verified job openings across candidate category feeds with zero ghost-listing clutter.",
      badge: "High Conversion",
    },
    {
      icon: Search,
      title: "Candidate Search",
      desc: "Proactively source screened software engineers, marketers, and sales leaders with fine-grained filters.",
      badge: "Proactive Sourcing",
    },
    {
      icon: Sparkles,
      title: "AI Candidate Matching",
      desc: "Transparent match explanations breaking down required skills coverage, years of experience, and missing gaps.",
      badge: "Explainable AI",
    },
    {
      icon: Layers,
      title: "Applicant Kanban Pipeline",
      desc: "Track candidates across 8 custom stages from initial application to offer letter sign-off in real-time.",
      badge: "Pipeline Control",
    },
    {
      icon: Calendar,
      title: "Interview Management",
      desc: "Schedule technical, HR, and culture-fit rounds with calendar links, reminders, and structured feedback cards.",
      badge: "Scorecards",
    },
    {
      icon: Building2,
      title: "Employer Branding",
      desc: "Showcase company culture, engineering stacks, employee benefits, and verified badges on your career page.",
      badge: "Talent Trust",
    },
    {
      icon: BarChart3,
      title: "Hiring Analytics",
      desc: "Measure pipeline conversion rates, time-to-hire velocity, recruiter reply SLAs, and source efficacy.",
      badge: "Live Telemetry",
    },
    {
      icon: Bot,
      title: "Recruiter AI Copilot",
      desc: "Draft compliant job descriptions, generate candidate dossier summaries, and spot top applicants faster.",
      badge: "Recruiter Assist",
    },
  ];

  const industries = [
    {
      name: "IT & Software",
      slug: "it-software",
      icon: Code2,
      roles: "Frontend, Backend, Full Stack, DevOps, Data Science",
      features: "Technical skill filters, GitHub/stack signals, code assessments",
      plan: "Growth or Professional",
    },
    {
      name: "Digital Marketing",
      slug: "digital-marketing",
      icon: Megaphone,
      roles: "Performance Marketers, SEO Leads, Content Creators, Meta/Google Ads",
      features: "Campaign portfolio checks, ROI proofing, brand writing",
      plan: "Growth Plan",
    },
    {
      name: "Sales & Business Dev",
      slug: "sales",
      icon: TrendingUp,
      roles: "B2B Sales Executives, Inside Sales, SDRs, Account Directors",
      features: "Quota track-record, pipeline communication, incentive modeling",
      plan: "Growth or Starter",
    },
    {
      name: "BPO & Customer Support",
      slug: "bpo",
      icon: Users,
      roles: "Voice Specialists, Chat Support, Team Leads, QA Trainers",
      features: "Volume hiring workflows, language tests, fast turnaround",
      plan: "Volume Hiring / Bulk",
    },
    {
      name: "Finance & Accounting",
      slug: "finance",
      icon: DollarSign,
      roles: "Chartered Accountants, Financial Analysts, Billing Specialists",
      features: "Taxation knowledge, ERP experience, verified compliance",
      plan: "Professional Plan",
    },
    {
      name: "Healthcare & Life Sciences",
      slug: "healthcare",
      icon: HeartPulse,
      roles: "Doctors, Nurses, Lab Technicians, Health-tech Product Leads",
      features: "Medical certification verification, shift scheduling compliance",
      plan: "Professional or Enterprise",
    },
    {
      name: "Manufacturing & Industrial",
      slug: "manufacturing",
      icon: Factory,
      roles: "Plant Supervisors, Mechanical Engineers, Safety Officers",
      features: "Shift preferences, factory location proximity, safety audits",
      plan: "Starter or Growth",
    },
    {
      name: "Retail & E-commerce",
      slug: "retail",
      icon: Store,
      roles: "Store Managers, Merchandisers, Catalog Specialists, Logistics",
      features: "Weekend flexibility, inventory management, retail speed",
      plan: "Growth Plan",
    },
    {
      name: "Education & Edtech",
      slug: "education",
      icon: GraduationCap,
      roles: "Curriculum Designers, Subject Teachers, Academic Counselors",
      features: "Pedagogical skill tests, communication scoring, degree verification",
      plan: "Growth Plan",
    },
    {
      name: "Logistics & Supply Chain",
      slug: "logistics",
      icon: Truck,
      roles: "Fleet Coordinators, Warehouse Supervisors, Dispatch Leads",
      features: "Multi-city coverage, route efficiency, quick onboarding",
      plan: "Volume Hiring",
    },
    {
      name: "Construction & Real Estate",
      slug: "construction",
      icon: Building,
      roles: "Civil Engineers, Project Architects, Site Coordinators, Valuers",
      features: "Site visit availability, project history, CAD skills",
      plan: "Growth Plan",
    },
    {
      name: "Startups & Scaleups",
      slug: "startups",
      icon: Zap,
      roles: "Founding Engineers, Generalists, Growth Hackers, Product Leads",
      features: "Agile speed, equity alignment, fast-track candidate screening",
      plan: "Starter / Growth",
    },
    {
      name: "Enterprise Solutions",
      slug: "enterprise",
      icon: Building2,
      roles: "Multi-Department Volume Hiring across pan-India and Global offices",
      features: "Custom ATS webhooks, Okta/SAML SSO, dedicated TA advisor",
      plan: "Enterprise Partnership",
    },
  ];

  const steps = [
    { num: "01", title: "Register Company", desc: "Submit business details, verify domain & legal identity for instant trust." },
    { num: "02", title: "Choose Hiring Plan", desc: "Select monthly, annual, or bulk volume plans matching your scale." },
    { num: "03", title: "Create Jobs", desc: "Publish roles with structured skill requirements and transparent compensation." },
    { num: "04", title: "Find Candidates", desc: "Proactively search talent pool or let explainable AI surface top applicants." },
    { num: "05", title: "Shortlist & Contact", desc: "Review candidate dossiers, resume highlights, and skill coverage." },
    { num: "06", title: "Interview & Score", desc: "Schedule technical rounds with calendar links and collaborative feedback." },
    { num: "07", title: "Extend Offers", desc: "Send formal offer letters with compensation structures and digital acceptance." },
    { num: "08", title: "Analyze Performance", desc: "Track hiring funnel velocity, recruiter SLAs, and source ROI." },
  ];

  const faqs = [
    {
      q: "How do I register my company on JobsGhuru?",
      a: "Click 'Register Your Company' to launch the 6-stage wizard. You will enter your organization type, official domain, contact recruiter details, hiring requirements, and select a suitable plan.",
    },
    {
      q: "How long does company verification take?",
      a: "Our administrative team reviews registered companies within 2 to 6 business hours. We verify official work emails, corporate websites, and business legitimacy to maintain a scam-free ecosystem.",
    },
    {
      q: "Can I post multiple jobs across different departments?",
      a: "Yes. Depending on your active hiring plan (Starter: 3 jobs, Growth: 10 jobs, Professional: 30 jobs, Enterprise: 100+ jobs), you can post and manage concurrent roles across any department.",
    },
    {
      q: "Can I proactively search for candidates without waiting for applications?",
      a: "Absolutely. JobsGhuru includes monthly Candidate Search Credits allowing your recruiters to query our verified talent database with skill, experience, location, and notice period filters.",
    },
    {
      q: "Can multiple recruiters use one company account?",
      a: "Yes. Company Admins can invite recruiters, hiring managers, and interviewers with granular Role-Based Access Control (RBAC) ensuring candidate data isolation and secure delegation.",
    },
    {
      q: "How does AI matching work and is it unbiased?",
      a: "JobsGhuru AI matching is explainable. It analyzes required technical skills, years of verified experience, and compensation alignment. It provides transparent evidence cards and never automatically rejects candidates.",
    },
    {
      q: "Can I upgrade or change my plan anytime?",
      a: "Yes, you can upgrade, add recruiter seats, or purchase additional search and AI credits directly from your Employer Billing dashboard with prorated billing.",
    },
    {
      q: "How does candidate privacy work?",
      a: "Candidate information is protected. Recruiters can only access profiles of applicants or candidates discovered through authorized credit consumption adhering to platform data privacy standards.",
    },
    {
      q: "Can we integrate JobsGhuru with our existing ATS?",
      a: "Enterprise plans include custom ATS webhooks and REST API integration to seamlessly synchronize applications and status updates with your in-house HR software.",
    },
  ];

  return (
    <div className="bg-[#F8FAFC]">
      {/* FLAGSHIP TALENT CLOUD HERO & SOLUTIONS (BETTER THAN NAUKRI) */}
      <NaukriStyleEmployerHero />

      {/* SECTION 2 — TRUST / VALUE METRICS */}
      <section className="py-14 border-b border-slate-200 bg-white">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition duration-200 text-center">
              <div className="mx-auto h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <ShieldCheck size={22} />
              </div>
              <div className="text-sm font-extrabold text-slate-900">Verified Companies</div>
              <div className="text-xs text-slate-500 mt-1">100% domain & MCA vetted</div>
              <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Zero Ghost Postings
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition duration-200 text-center">
              <div className="mx-auto h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Users size={22} />
              </div>
              <div className="text-sm font-extrabold text-slate-900">Screened Candidates</div>
              <div className="text-xs text-slate-500 mt-1">Active tech & business leads</div>
              <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                12,500+ Ready CVs
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition duration-200 text-center">
              <div className="mx-auto h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Sparkles size={22} />
              </div>
              <div className="text-sm font-extrabold text-slate-900">Explainable AI Match</div>
              <div className="text-xs text-slate-500 mt-1">Skill overlap diagnostics</div>
              <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                No Black-Box Bots
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition duration-200 text-center">
              <div className="mx-auto h-11 w-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <BarChart3 size={22} />
              </div>
              <div className="text-sm font-extrabold text-slate-900">Hiring Velocity</div>
              <div className="text-xs text-slate-500 mt-1">Real-time candidate telemetry</div>
              <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                4.8x Faster Time-to-Offer
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition duration-200 text-center col-span-2 sm:col-span-1">
              <div className="mx-auto h-11 w-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <Lock size={22} />
              </div>
              <div className="text-sm font-extrabold text-slate-900">Secure Employer OS</div>
              <div className="text-xs text-slate-500 mt-1">Granular RBAC isolation</div>
              <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                Enterprise Tenant SLA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — EMPLOYER SOLUTIONS */}
      <section className="py-20 lg:py-24 border-b border-slate-200 bg-[#F8FAFC]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3.5 py-1.5 rounded-md">
              Comprehensive Capabilities
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
              An End-to-End Recruitment Operating System
            </h2>
            <p className="mt-4 text-base text-slate-500 leading-relaxed">
              Everything your talent acquisition team needs to discover, engage, interview, and close top candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs hover:border-blue-400 hover:shadow-lg transition duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition duration-200">
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2.5 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-100">
                    <Link
                      href="/employers/register"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
                    >
                      Explore capability <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 — INDUSTRY SOLUTIONS */}
      <section className="py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3.5 py-1.5 rounded-md">
                Industry-Tailored Hiring
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
                Specialized Sourcing for Every Sector
              </h2>
              <p className="mt-3 text-base text-slate-500 max-w-2xl leading-relaxed">
                Hiring workflows and skill filters tuned for tech, sales, healthcare, BPO, manufacturing, and enterprise teams.
              </p>
            </div>
            <Link
              href="/employers/plans"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-2 bg-blue-50 px-4 py-2.5 rounded-xl hover:bg-blue-100/70 transition shrink-0"
            >
              Compare Industry Plans <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {industries.map((ind) => {
              const Icon = ind.icon;
              return (
                <div
                  key={ind.slug}
                  className="rounded-3xl border border-slate-200/90 bg-[#FBFDFF] p-6 hover:bg-white hover:border-blue-400 hover:shadow-md transition duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="h-11 w-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-slate-900">{ind.name}</h3>
                        <span className="text-[11px] font-bold text-blue-700">{ind.plan}</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-0.5">Top Roles:</div>
                        <div className="text-slate-600 line-clamp-2">{ind.roles}</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-0.5">Tailored Features:</div>
                        <div className="text-slate-500 line-clamp-2">{ind.features}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3">
                    <Link
                      href={`/employers/${ind.slug}`}
                      className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Details <ChevronRight size={14} />
                    </Link>
                    <Link
                      href={`/employers/register?industry=${encodeURIComponent(ind.name)}`}
                      className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-2xs"
                    >
                      Hire Talent
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5 — HOW JOBSGHURU WORKS */}
      <section className="py-20 lg:py-24 border-b border-slate-200 bg-[#F8FAFC]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3.5 py-1.5 rounded-md">
              Lifecycle Roadmap
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
              From Registration to Hired in 8 Guided Steps
            </h2>
            <p className="mt-4 text-base text-slate-500 leading-relaxed">
              A frictionless recruitment operating journey connecting your company profile to verified candidate hires.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st) => (
              <div key={st.num} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-2xs hover:border-blue-300 hover:shadow-xs transition duration-200">
                <span className="font-mono text-3xl font-black text-blue-600/80">{st.num}</span>
                <h3 className="mt-3 font-display text-base font-bold text-slate-900">{st.title}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — AI RECRUITING & EXPLAINABLE INTELLIGENCE */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-[#0A2558] via-[#0B3B82] to-[#0A2558] text-white border-b border-blue-950">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-200 border border-blue-400/30">
              <Sparkles size={15} className="text-blue-300" /> Explainable Intelligence
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight">
              AI Built to Assist Recruiters, Not Replace Them
            </h2>
            <p className="mt-4 text-base text-blue-100/80 leading-relaxed">
              Transparent, evidence-based intelligence that extracts candidate qualifications, highlights missing skills, and drafts compliant job requisitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="rounded-3xl border border-blue-700/60 bg-blue-950/50 p-8 backdrop-blur-xs hover:border-blue-400/50 transition">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-5">
                <Search size={22} />
              </div>
              <h3 className="font-display text-lg font-bold text-white">AI Candidate Search</h3>
              <p className="mt-3 text-xs sm:text-sm text-blue-200/80 leading-relaxed">
                Convert natural search queries like <em>&ldquo;React developer with 3+ years experience in Chennai&rdquo;</em> into structured filters executed against verified database profiles.
              </p>
            </div>

            <div className="rounded-3xl border border-blue-700/60 bg-blue-950/50 p-8 backdrop-blur-xs hover:border-blue-400/50 transition">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-5">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="font-display text-lg font-bold text-white">Evidence-Based Matching</h3>
              <p className="mt-3 text-xs sm:text-sm text-blue-200/80 leading-relaxed">
                Rather than an opaque percentage score, recruiters see exact skill overlaps, experience sufficiency, and specific gap diagnostics for every applicant.
              </p>
            </div>

            <div className="rounded-3xl border border-blue-700/60 bg-blue-950/50 p-8 backdrop-blur-xs hover:border-blue-400/50 transition">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-5">
                <Bot size={22} />
              </div>
              <h3 className="font-display text-lg font-bold text-white">AI Job Requisition Assist</h3>
              <p className="mt-3 text-xs sm:text-sm text-blue-200/80 leading-relaxed">
                Generate responsibilities, core skills, and screening questions in seconds. Drafts always require explicit recruiter approval prior to publishing.
              </p>
            </div>
          </div>

          {/* Ethics Note */}
          <div className="mt-12 rounded-2xl border border-blue-600/40 bg-blue-900/60 p-5 text-center text-xs sm:text-sm text-blue-200 max-w-3xl mx-auto shadow-sm">
            <span className="font-extrabold text-white">Ethical AI Mandate: </span>
            JobsGhuru AI assists recruiters with analysis and summaries. AI never automatically rejects or excludes candidates from your hiring pipeline.
          </div>
        </div>
      </section>

      {/* SECTION 7 — EMPLOYER DASHBOARD PREVIEW (EXPANDED TO FULL EXECUTIVE CANVAS) */}
      <section className="py-20 lg:py-24 bg-slate-100/70 border-b border-slate-200">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3.5 py-1.5 rounded-md">
              Hiring Command Center
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
              Preview Your Live Employer Dashboard
            </h2>
            <p className="mt-4 text-base text-slate-500 leading-relaxed">
              Real-time KPIs, multi-stage candidate funnels, interview calendars, and credit monitors.
            </p>
          </div>

          {/* Dashboard Mock Container - Full Executive Width */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 lg:p-10 shadow-xl w-full">
            <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise Recruitment Tenant</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 mt-0.5">
                  Northwind Labs Talent Hub
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-3 py-1 text-xs font-bold text-emerald-700">
                    <ShieldCheck size={14} /> Verified Entity
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/employer/dashboard"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-98 transition flex items-center gap-2"
                >
                  <Briefcase size={15} />
                  Open Live Dashboard
                </Link>
              </div>
            </div>

            {/* Mock KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 lg:gap-4 mt-8">
              {[
                { label: "Active Jobs", val: "8 / 10", color: "text-blue-600", sub: "2 slots available" },
                { label: "Total Applications", val: "142", color: "text-slate-900", sub: "+24 this week" },
                { label: "Shortlisted", val: "38", color: "text-indigo-600", sub: "27% pass rate" },
                { label: "Interviews", val: "12", color: "text-amber-600", sub: "4 today" },
                { label: "Offers Sent", val: "4", color: "text-purple-600", sub: "3 accepted" },
                { label: "Hired (This Mo)", val: "3", color: "text-emerald-600", sub: "Goal: 4" },
              ].map((k) => (
                <div key={k.label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 hover:border-blue-200 hover:bg-white transition">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</div>
                  <div className={`mt-2 text-2xl font-black ${k.color}`}>{k.val}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Funnel Visualization & Live Candidate Stream */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Funnel */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Application Conversion Velocity</div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">Pan-India Average: 28 Days</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center text-xs">
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
                    <div className="text-lg font-black text-slate-900">142</div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">Applied (100%)</div>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
                    <div className="text-lg font-black text-slate-900">89</div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">Screened (62%)</div>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
                    <div className="text-lg font-black text-slate-900">38</div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">Shortlist (27%)</div>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
                    <div className="text-lg font-black text-slate-900">12</div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">Interview (8.4%)</div>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
                    <div className="text-lg font-black text-slate-900">4</div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">Offered (2.8%)</div>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs ring-1 ring-emerald-500/20">
                    <div className="text-lg font-black text-emerald-600">3</div>
                    <div className="text-[10px] font-bold text-emerald-700 mt-0.5">Hired (2.1%)</div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
                  <span>Median Recruiter Response Time: <strong>1.4 business hours</strong></span>
                  <span className="text-emerald-600 font-bold">Top 5% on JobsGhuru</span>
                </div>
              </div>

              {/* Live Candidate Stream Preview */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Recent Candidate Activity</div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Feed
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">Arun V. · Senior React Engineer</div>
                        <div className="text-[11px] text-slate-500">Notice: Immediate · Bengaluru · 18 LPA</div>
                      </div>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                        96% Match
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">Divya N. · Full Stack Node/Postgres</div>
                        <div className="text-[11px] text-slate-500">Notice: 15 Days · Chennai · 15 LPA</div>
                      </div>
                      <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                        92% Match
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">Karthik S. · DevOps & AWS Cloud</div>
                        <div className="text-[11px] text-slate-500">Notice: 30 Days · Hyderabad · 22 LPA</div>
                      </div>
                      <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700">
                        89% Match
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 text-right">
                  <Link href="/employers/register" className="text-xs font-bold text-blue-600 hover:underline">
                    Access all applicant dossiers &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — EMPLOYER PLANS */}
      <section className="py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3.5 py-1.5 rounded-md">
              Transparent Pricing
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
              Choose the Hiring Plan That Fits Your Scale
            </h2>
            <p className="mt-4 text-base text-slate-500 leading-relaxed">
              Database-driven plans with clear job slots, search credits, and team seats. No hidden surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => {
              const isPopular = p.badge === "Most Popular";
              return (
                <div
                  key={p.code}
                  className={`rounded-3xl border p-7 flex flex-col justify-between transition relative ${
                    isPopular
                      ? "border-blue-600 bg-blue-50/20 shadow-xl ring-2 ring-blue-600/20"
                      : "border-slate-200 bg-white shadow-2xs hover:border-slate-300"
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3.5 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-xs">
                      {p.badge}
                    </span>
                  )}

                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900">{p.name}</h3>
                    <p className="mt-2 text-xs text-slate-500 min-h-[36px] leading-relaxed">{p.description}</p>

                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900">
                        ₹{p.monthlyPriceInr.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">/ month</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Billed annually at ₹{p.annualPriceInr.toLocaleString("en-IN")}/mo (+18% GST)
                    </div>

                    <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-xs">
                      <div className="flex items-center gap-2.5 font-bold text-slate-800">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                        <span>{p.jobPostingLimit} Active Job Postings</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-bold text-slate-800">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                        <span>{p.searchCreditsMonthly} Candidate Search Credits</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-bold text-slate-800">
                        <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                        <span>{p.recruiterSeatsLimit} Recruiter Team Seat{p.recruiterSeatsLimit > 1 ? "s" : ""}</span>
                      </div>

                      {p.features.slice(3, 7).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-slate-600">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-100">
                    <Link
                      href={`/employers/register?plan=${p.code}`}
                      className={`block w-full text-center rounded-xl py-3 text-xs font-bold transition shadow-xs ${
                        isPopular
                          ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-98"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Choose {p.name.split(" ")[0]}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/employers/plans"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs"
            >
              Compare All Plans & Detailed Feature Matrix <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 9 — FAQ */}
      <section className="py-20 lg:py-24 border-b border-slate-200 bg-[#F8FAFC]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3.5 py-1.5 rounded-md">
              Employer Questions
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-base text-slate-500 leading-relaxed">
              Clear answers regarding verification, recruiter seats, billing, and candidate privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs hover:border-blue-300 transition">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 h-7 w-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <HelpCircle size={16} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900 leading-snug">{faq.q}</h3>
                    <p className="mt-2.5 text-xs text-slate-500 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10 — FINAL EXECUTIVE CALL TO ACTION */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-white to-blue-50/80">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="rounded-3xl border border-blue-200/90 bg-white p-8 sm:p-12 lg:p-16 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-4 py-1 text-xs font-extrabold text-blue-700">
                <Sparkles size={14} className="text-blue-600" /> Start Hiring Qualified Talent Today
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
                Ready to transform your recruitment pipeline?
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Register your organization today. Experience explainable matching, transparent INR pricing, streamlined interview coordination, and accelerated time-to-hire.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/employers/register"
                  className="rounded-2xl bg-blue-600 px-8 py-4 text-sm font-extrabold text-white shadow-md hover:bg-blue-700 active:scale-98 transition flex items-center gap-2"
                >
                  Register Your Company
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="/employers/contact-sales"
                  className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-sm font-extrabold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
                >
                  Talk to Enterprise Sales
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={15} className="text-emerald-600" /> MCA & GST Verified Companies
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={15} className="text-blue-600" /> Direct Recruiter Support: +91 44 4800 1200
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Lock size={15} className="text-indigo-600" /> SOC 2 Type II Audited
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
