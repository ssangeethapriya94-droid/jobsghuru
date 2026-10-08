import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import IndustryLandingPage from "@/components/employer/IndustryLandingPage";

interface PageProps {
  params: { industry: string };
}

const INDUSTRY_CONFIG: Record<
  string,
  {
    title: string;
    headline: string;
    subheadline: string;
    categories: string[];
    challenges: { title: string; desc: string }[];
    features: { title: string; desc: string }[];
    planCode: string;
    planName: string;
    planDesc: string;
    faq: { q: string; a: string }[];
  }
> = {
  "it-software": {
    title: "IT & Software",
    headline: "Build your technology team with verified engineers.",
    subheadline:
      "Find skilled Frontend, Backend, Full Stack, Cloud, and AI professionals evaluated against real tech stacks and verified years of experience.",
    categories: [
      "Frontend Developers (React / Next.js / Vue)",
      "Backend Engineers (Node / Python / Go / Java)",
      "Full Stack Developers",
      "DevOps & Cloud Architects (AWS / Docker / K8s)",
      "Data Scientists & ML Engineers",
      "QA Automation Engineers",
      "Mobile Developers (React Native / Flutter)",
      "Security & Infrastructure Specialists",
    ],
    challenges: [
      {
        title: "Keyword Keyword Stacking on Resumes",
        desc: "Over 80% of applicants copy-paste buzzwords without core programming competency. We test required skills directly.",
      },
      {
        title: "High Ghosting Rates & Long Notice Periods",
        desc: "Engineers holding multiple offers often drop off. We track transparent notice periods and commitment SLAs.",
      },
      {
        title: "Salary Expectation Disconnect",
        desc: "Misalignment after weeks of technical interviews. Upfront transparent CTC criteria prevents wasted engineering hours.",
      },
    ],
    features: [
      {
        title: "Explainable Skill Matching",
        desc: "Inspect candidate proficiency in your exact framework, database, and cloud requirements with clear gap analysis.",
      },
      {
        title: "Candidate Search Credits",
        desc: "Proactively query active engineers available within 15 to 30 days in Chennai, Bengaluru, Hyderabad, and Remote.",
      },
      {
        title: "Collaborative Interview Scorecards",
        desc: "Engineering leads and hiring managers review code submissions and log technical evaluations in one place.",
      },
    ],
    planCode: "GROWTH",
    planName: "Growth Partnership",
    planDesc:
      "Includes 10 active job postings, 250 candidate search credits per month, Recruiter AI screening, and 5 team seats.",
    faq: [
      {
        q: "Can we filter software engineers by specific frameworks?",
        a: "Yes. Filter by primary technologies like React, Node.js, PostgreSQL, AWS, TypeScript, Docker, and Python.",
      },
      {
        q: "Does JobsGhuru support remote tech hiring?",
        a: "Yes. Over 45% of registered engineers are open to full-time remote or hybrid opportunities.",
      },
    ],
  },
  "digital-marketing": {
    title: "Digital Marketing",
    headline: "Scale acquisition with proven marketing leaders.",
    subheadline:
      "Hire Performance Marketers, SEO Specialists, Content Strategists, and Social Media Leads with documented campaign results.",
    categories: [
      "Performance Marketing (Meta / Google / TikTok)",
      "Search Engine Optimization (Technical & Content)",
      "Growth Marketing & CRO",
      "Email Marketing & Lifecycle Automation",
      "Brand Marketing & Copywriting",
      "Social Media & Community Managers",
      "Creative Directors & Visual Designers",
    ],
    challenges: [
      {
        title: "Unverifiable ROI Claims",
        desc: "Candidates frequently take credit for overall agency performance. We screen for hands-on ad spend management.",
      },
      {
        title: "Rapidly Evolving Platform Algorithms",
        desc: "Skill stagnation in Meta & Google ad policy. We highlight recent campaign experience.",
      },
    ],
    features: [
      {
        title: "Portfolio & Campaign Diagnostics",
        desc: "Candidate profiles include live campaign samples and analytics tool certifications.",
      },
      {
        title: "Rapid Skill Filtering",
        desc: "Instantly isolate candidates with experience in GA4, SEMrush, HubSpot, and Meta Ads Manager.",
      },
    ],
    planCode: "GROWTH",
    planName: "Growth Partnership",
    planDesc: "Optimized for scaling marketing teams with multi-channel hiring demands.",
    faq: [
      {
        q: "Can we find performance marketers with high-budget experience?",
        a: "Yes, you can filter by past ad-spend scale, industries (B2B, D2C, SaaS), and target geography.",
      },
    ],
  },
  sales: {
    title: "Sales & Business Development",
    headline: "Build a revenue engine with high-velocity sales talent.",
    subheadline:
      "Recruit B2B Inside Sales Executives, Enterprise Account Directors, SDRs, and Business Development Managers with proven track records.",
    categories: [
      "B2B Enterprise Account Executives",
      "Inside Sales Representatives",
      "Sales Development Reps (SDR / BDR)",
      "Sales Operations & CRM Managers",
      "Channel & Partnership Leads",
      "Customer Success Managers",
    ],
    challenges: [
      {
        title: "Resume Exaggeration in Quota Attainment",
        desc: "Many sales candidates claim 150% quota without context. We verify deal sizes and target markets.",
      },
      {
        title: "Culture & Pitch Dynamics",
        desc: "Testing communication and objection handling before in-person interviews.",
      },
    ],
    features: [
      {
        title: "Pipeline Simulation & Voice Notes",
        desc: "Listen to candidate audio introductions and view verified deal histories.",
      },
      {
        title: "Fast-Track Pipeline Stages",
        desc: "Move sales reps from application to introductory call in under 24 hours.",
      },
    ],
    planCode: "GROWTH",
    planName: "Growth Partnership",
    planDesc: "Perfect for scaling SDR teams and regional territory expansion.",
    faq: [
      {
        q: "Can we filter sales reps by industry experience (e.g. Fintech, SaaS)?",
        a: "Yes, our industry tags allow filtering by B2B SaaS, Real Estate, Financial Services, and Retail.",
      },
    ],
  },
  bpo: {
    title: "BPO & Customer Support",
    headline: "High-volume customer experience staffing made simple.",
    subheadline:
      "Fill voice and non-voice support queues with pre-assessed candidates possessing strong language and technical troubleshooting skills.",
    categories: [
      "Voice Support Representatives (Domestic & International)",
      "Non-Voice / Chat / Email Support Specialists",
      "Technical Support Engineers (L1 / L2)",
      "Team Leaders & Quality Analysts",
      "Workforce Management (WFM) Specialists",
    ],
    challenges: [
      {
        title: "Extreme Attrition & No-Shows",
        desc: "Candidate drop-off during onboarding. We offer automated attendance confirmation and SMS/WhatsApp interview alerts.",
      },
      {
        title: "Bulk Screening Fatigue",
        desc: "Handling hundreds of applicants daily without losing quality.",
      },
    ],
    features: [
      {
        title: "Bulk Applicant Actions",
        desc: "Shortlist, batch-schedule, or advance 50 applicants at once with one click.",
      },
      {
        title: "Shift Flexibility Matching",
        desc: "Match candidates explicitly willing to work night, US/UK, or rotational shifts.",
      },
    ],
    planCode: "PROFESSIONAL",
    planName: "Professional Partnership",
    planDesc: "Includes high-capacity job limits and bulk applicant processing workflows.",
    faq: [
      {
        q: "Do you offer custom pricing for 50+ monthly hires?",
        a: "Yes, our Enterprise and Bulk Hiring campaign plans offer custom quotes for high-volume staffing.",
      },
    ],
  },
  finance: {
    title: "Finance & Accounting",
    headline: "Hire accredited financial minds and compliance leaders.",
    subheadline:
      "Find Chartered Accountants, FP&A Analysts, Tax Consultants, and Accounting Managers with verified credentials.",
    categories: [
      "Chartered Accountants (CA Inter / CA Final)",
      "Financial Planning & Analysis (FP&A) Managers",
      "Statutory & Internal Auditors",
      "GST & Direct Tax Specialists",
      "Accounts Payable & Receivable Executives",
    ],
    challenges: [
      {
        title: "Regulatory Compliance Accuracy",
        desc: "Financial hires carry high liability. We verify background education and professional certifications.",
      },
      {
        title: "ERP & Tool Compatibility",
        desc: "Screening proficiency in TallyPrime, SAP, Oracle NetSuite, and advanced Excel modeling.",
      },
    ],
    features: [
      {
        title: "Certification Verification Badges",
        desc: "Highlight ICAI, CFA, CPA, and ACCA certified professionals upfront.",
      },
      {
        title: "Confidential Requisition Mode",
        desc: "Post leadership finance roles without exposing proprietary company financial data.",
      },
    ],
    planCode: "PROFESSIONAL",
    planName: "Professional Partnership",
    planDesc: "Provides enhanced privacy controls and senior-level recruitment tools.",
    faq: [
      {
        q: "Can we search for CA candidates with specific Big 4 audit experience?",
        a: "Yes, company background filters let you pinpoint alumni from top audit and advisory firms.",
      },
    ],
  },
  healthcare: {
    title: "Healthcare & Life Sciences",
    headline: "Qualified medical, nursing, and clinical talent.",
    subheadline:
      "Recruit verified healthcare practitioners, biomedical specialists, hospital administrators, and pharma researchers.",
    categories: [
      "Specialist Physicians & Duty Doctors",
      "Registered Nurses & Staff Coordinators",
      "Medical Laboratory Technicians",
      "Hospital Operations Managers",
      "Pharmacists & Clinical Research Associates",
    ],
    challenges: [
      {
        title: "Strict State Medical Registration Requirements",
        desc: "Non-compliant practitioners risk hospital licensing. We require medical council registration details.",
      },
      {
        title: "Round-the-Clock Emergency Availability",
        desc: "Clear shift agreements are essential before scheduling interviews.",
      },
    ],
    features: [
      {
        title: "Medical Council ID Screening",
        desc: "Candidates enter MCI / State Council registration numbers for rapid review.",
      },
      {
        title: "Location Proximity Filters",
        desc: "Find nurses and duty doctors located within 10km of your medical facility.",
      },
    ],
    planCode: "PROFESSIONAL",
    planName: "Professional Partnership",
    planDesc: "Tailored for clinics, multi-specialty hospitals, and diagnostic chains.",
    faq: [
      {
        q: "Can we specify hospital shift timings in job requisitions?",
        a: "Yes, you can clearly specify rotational, night, or weekend emergency duty shifts.",
      },
    ],
  },
  manufacturing: {
    title: "Manufacturing & Engineering",
    headline: "Staff your plants with certified industrial talent.",
    subheadline:
      "Source Plant Engineers, Quality Inspectors, CNC Operators, Safety Officers, and Production Supervisors.",
    categories: [
      "Mechanical & Electrical Engineers",
      "Quality Assurance & Six Sigma Inspectors",
      "Production & Plant Supervisors",
      "EHS (Environmental Health & Safety) Officers",
      "Supply Chain & Procurement Leads",
    ],
    challenges: [
      {
        title: "Industrial Zone Commute Issues",
        desc: "Candidates declining offers once they realize plant travel time. We filter by industrial cluster zones.",
      },
      {
        title: "Machinery & Safety Certifications",
        desc: "Ensuring candidates possess ISO and OSHA compliance awareness.",
      },
    ],
    features: [
      {
        title: "Industrial Corridor Mapping",
        desc: "Target engineers located near manufacturing hubs (e.g. Sriperumbudur, Peenya, Pune MIDC).",
      },
    ],
    planCode: "GROWTH",
    planName: "Growth Partnership",
    planDesc: "Reliable plant staffing with 10 concurrent active listings.",
    faq: [
      {
        q: "Do you support hiring for contract factory roles?",
        a: "Yes, job postings can be marked as Full-time, Contract, or Project-based.",
      },
    ],
  },
  retail: {
    title: "Retail & E-commerce",
    headline: "Fast-moving talent for omnichannel retail brands.",
    subheadline:
      "Staff retail store networks, warehouse hubs, and online e-commerce operations with motivated professionals.",
    categories: [
      "Store Managers & Retail Supervisors",
      "Visual Merchandisers & Stylists",
      "E-commerce Catalog & Listing Leads",
      "Order Fulfillment & Dispatch Coordinators",
      "Inventory & POS Specialists",
    ],
    challenges: [
      {
        title: "Seasonal Spike Hiring",
        desc: "Surge recruitment during festival seasons requiring dozens of quick hires.",
      },
    ],
    features: [
      {
        title: "Fast Turnaround Applicant Funnel",
        desc: "Shortlist candidates in minutes with pre-set screening criteria.",
      },
    ],
    planCode: "GROWTH",
    planName: "Growth Partnership",
    planDesc: "Scalable recruitment for store chains and digital marketplace merchants.",
    faq: [
      {
        q: "Can we post for multiple store locations in one go?",
        a: "Yes, specify multiple branch locations or create regional child requisitions easily.",
      },
    ],
  },
  education: {
    title: "Education & Edtech",
    headline: "Empower classrooms and digital learning platforms.",
    subheadline:
      "Hire experienced Educators, Subject Matter Experts, Curriculum Developers, and Academic Counselors.",
    categories: [
      "K-12 & Higher Secondary Teachers",
      "Edtech Subject Matter Experts (SMEs)",
      "Curriculum Designers & Instructional Leads",
      "Academic Counselors & Admissions Officers",
    ],
    challenges: [
      {
        title: "Pedagogical Communication Verification",
        desc: "Evaluating lecture delivery and student engagement style remotely.",
      },
    ],
    features: [
      {
        title: "Sample Video Presentation Links",
        desc: "Review teaching demo links and pedagogical methodology right from candidate dossiers.",
      },
    ],
    planCode: "GROWTH",
    planName: "Growth Partnership",
    planDesc: "Designed for schools, colleges, coaching institutes, and edtech scaleups.",
    faq: [
      {
        q: "Can we test teachers on specific curriculum boards (CBSE, ICSE, IB)?",
        a: "Yes, tag roles with specific syllabus requirements and pedagogical experience.",
      },
    ],
  },
  logistics: {
    title: "Logistics & Supply Chain",
    headline: "Keep your goods moving with verified logistics talent.",
    subheadline:
      "Find Fleet Managers, Warehouse Operations Leads, 3PL Coordinators, and Route Optimization Specialists.",
    categories: [
      "Warehouse Operations Managers",
      "Fleet & Dispatch Supervisors",
      "Freight Forwarding Specialists",
      "Supply Chain Analysts",
    ],
    challenges: [
      {
        title: "Multi-Hub Coordination",
        desc: "Recruiting across distributed fulfillment centers and hub facilities.",
      },
    ],
    features: [
      {
        title: "Geo-Radius Targeting",
        desc: "Target talent living within immediate access of major transport hubs and ICDs.",
      },
    ],
    planCode: "GROWTH",
    planName: "Growth Partnership",
    planDesc: "Includes high volume hiring options and multi-city team seats.",
    faq: [
      {
        q: "Do you have candidates experienced with WMS and TMS software?",
        a: "Yes, filter specifically for SAP EWM, Manhattan, and custom logistics ERPs.",
      },
    ],
  },
  hospitality: {
    title: "Hospitality & Travel",
    headline: "Deliver exceptional guest experiences with top hospitality staff.",
    subheadline:
      "Staff hotels, resorts, fine dining, and travel agencies with polished front-office, culinary, and operations professionals.",
    categories: [
      "Hotel General Managers & Front Office Leads",
      "Executive Chefs & Culinary Artists",
      "F&B Supervisors & Banquet Coordinators",
      "Travel Consultants & Ticketing Experts",
    ],
    challenges: [
      {
        title: "Grooming & Language Standards",
        desc: "Guest-facing roles demand verified etiquette and multilingual abilities.",
      },
    ],
    features: [
      {
        title: "Language Fluency Filters",
        desc: "Filter by English, Hindi, and regional language spoken proficiency levels.",
      },
    ],
    planCode: "STARTER",
    planName: "Starter / Growth Partnership",
    planDesc: "Flexible seasonal hiring for boutique resorts and restaurant chains.",
    faq: [
      {
        q: "Can we hire seasonally for peak tourist months?",
        a: "Yes, choose monthly plans or temporary job posting options.",
      },
    ],
  },
  construction: {
    title: "Construction & Real Estate",
    headline: "Build the future with seasoned engineering & project leaders.",
    subheadline:
      "Hire Project Architects, Civil Site Engineers, Quantity Surveyors, Real Estate Sales Leads, and Safety Managers.",
    categories: [
      "Civil Engineers (Site / Planning / Estimation)",
      "Project Architects & BIM Modelers",
      "Quantity Surveyors & Cost Consultants",
      "Real Estate Property Sales Managers",
    ],
    challenges: [
      {
        title: "Site Readiness & Remote Location Working",
        desc: "Verifying candidate willingness to operate from live job sites.",
      },
    ],
    features: [
      {
        title: "CAD & BIM Software Filters",
        desc: "Pinpoint candidates skilled in AutoCAD, Revit, Primavera, and MS Project.",
      },
    ],
    planCode: "GROWTH",
    planName: "Growth Partnership",
    planDesc: "Structured hiring for real estate developers and infrastructure contractors.",
    faq: [
      {
        q: "Can we find site engineers available for immediate joining?",
        a: "Yes, filter by notice period <= 15 days or immediate availability.",
      },
    ],
  },
  startups: {
    title: "Startups & Scaleups",
    headline: "Move fast and hire early-stage high-impact builders.",
    subheadline:
      "Find versatile founding engineers, full-stack builders, product generalists, and growth leads who thrive in ambiguity.",
    categories: [
      "Founding Engineers (Full Stack / AI)",
      "Early-Stage Product Designers",
      "Growth Hackers & Community Builders",
      "Chief of Staff & Operations Leads",
    ],
    challenges: [
      {
        title: "Competing Against Tech Giants for Talent",
        desc: "Showcasing vision and equity upside rather than just big-tech brand power.",
      },
      {
        title: "Spotting True Ownership Mentality",
        desc: "Filtering for problem solvers who don't need handholding.",
      },
    ],
    features: [
      {
        title: "Startup Culture Highlighting",
        desc: "Emphasize speed of execution, equity compensation, and direct founder interaction.",
      },
      {
        title: "Fast-Track Candidate Direct Chat",
        desc: "Engage matched candidates immediately with zero bureaucratic delays.",
      },
    ],
    planCode: "STARTER",
    planName: "Starter Partnership",
    planDesc: "Affordable startup rates with zero compromise on candidate quality.",
    faq: [
      {
        q: "Can we include ESOPs / Equity in the compensation description?",
        a: "Yes, specify salary plus equity percentages transparently in every job card.",
      },
    ],
  },
  enterprise: {
    title: "Enterprise Solutions",
    headline: "Scale recruitment operations across departments and continents.",
    subheadline:
      "Designed for organizations hiring hundreds of professionals yearly with compliance, ATS integrations, SSO, and dedicated SLAs.",
    categories: [
      "Cross-Functional Technology & Product Teams",
      "Multi-City Operations & Sales Workforces",
      "Executive & Leadership Appointments",
      "Campus & Early-Career Cohort Drives",
    ],
    challenges: [
      {
        title: "Fragmented Recruiter Coordination",
        desc: "Dozens of hiring managers using disconnected spreadsheets. We unify the entire pipeline.",
      },
      {
        title: "Audit Compliance & Data Privacy",
        desc: "Strict requirements for immutable audit logging and role segregation.",
      },
    ],
    features: [
      {
        title: "Custom ATS Webhooks & REST API",
        desc: "Seamless two-way sync with Workday, Greenhouse, Lever, and SAP SuccessFactors.",
      },
      {
        title: "Enterprise SSO & Role Governance",
        desc: "SAML 2.0 / Okta integration with custom interviewer, recruiter, and manager permissions.",
      },
      {
        title: "Dedicated Talent Acquisition Advisor",
        desc: "Quarterly strategy reviews, custom candidate pipelines, and priority support.",
      },
    ],
    planCode: "ENTERPRISE",
    planName: "Enterprise Partnership",
    planDesc: "Unlimited scaling with custom contracts, executive SLAs, and bespoke workflows.",
    faq: [
      {
        q: "Can we sign a custom Master Services Agreement (MSA)?",
        a: "Yes. Our enterprise legal and sales team provides customized enterprise MSAs and vendor onboarding.",
      },
    ],
  },
};

export async function generateMetadata({ params }: PageProps) {
  const config = INDUSTRY_CONFIG[params.industry];
  if (!config) return { title: "Employer Solutions · JobsGhuru" };
  return {
    title: `${config.title} Hiring Solutions · JobsGhuru Employers`,
    description: config.subheadline,
  };
}

export default async function IndustryPage({ params }: PageProps) {
  const config = INDUSTRY_CONFIG[params.industry];
  if (!config) {
    notFound();
  }

  // Fetch real jobs in this industry or matching department
  const liveJobs = await db.job
    .findMany({
      where: {
        status: "PUBLISHED",
        expiresAt: { gt: new Date() },
      },
      take: 6,
      include: { company: true },
      orderBy: { postedAt: "desc" },
    })
    .catch(() => []);

  const roles = liveJobs.map((j) => ({
    id: j.id,
    title: j.title,
    location: j.location,
    salaryMinLpa: j.salaryMinLpa,
    salaryMaxLpa: j.salaryMaxLpa,
    companyName: j.company.name,
  }));

  return (
    <IndustryLandingPage
      industryTitle={config.title}
      heroHeadline={config.headline}
      heroSubheadline={config.subheadline}
      candidateCategories={config.categories}
      hiringChallenges={config.challenges}
      platformFeatures={config.features}
      recommendedPlanCode={config.planCode}
      recommendedPlanName={config.planName}
      recommendedPlanDesc={config.planDesc}
      faqList={config.faq}
      liveRoles={roles}
    />
  );
}
