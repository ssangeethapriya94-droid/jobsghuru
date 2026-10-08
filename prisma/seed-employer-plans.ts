import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const plans = [
  {
    code: "STARTER",
    name: "Starter Partnership",
    description: "For small businesses and early-stage startups testing verified talent hiring.",
    badge: null,
    monthlyPriceInr: 2499,
    annualPriceInr: 1999,
    jobPostingLimit: 3,
    searchCreditsMonthly: 50,
    aiCreditsMonthly: 25,
    recruiterSeatsLimit: 1,
    featuredJobCredits: 0,
    features: [
      "3 Active job listings",
      "50 Candidate search credits / month",
      "Explainable candidate matching",
      "Standard applicant management pipeline",
      "Accredited company profile badge",
      "1 Recruiter seat",
      "Email support (48h SLA)",
    ],
    hasInterviewTools: false,
    hasAssessments: false,
    hasEmployerBranding: false,
    hasCustomATS: false,
    hasDedicatedSupport: false,
  },
  {
    code: "GROWTH",
    name: "Growth Partnership",
    description: "For scaling product teams with regular hiring needs across multiple roles.",
    badge: "Most Popular",
    monthlyPriceInr: 6999,
    annualPriceInr: 5499,
    jobPostingLimit: 10,
    searchCreditsMonthly: 250,
    aiCreditsMonthly: 150,
    recruiterSeatsLimit: 5,
    featuredJobCredits: 2,
    features: [
      "10 Active job listings",
      "250 Candidate search credits / month",
      "Evidence-based AI candidate matching & skill gap analysis",
      "5 Recruiter seats & role delegation",
      "Integrated interview scheduler & feedback",
      "Priority talent search placement",
      "2 Featured job slots included",
      "Hiring funnel analytics",
      "Priority support (24h SLA)",
    ],
    hasInterviewTools: true,
    hasAssessments: true,
    hasEmployerBranding: true,
    hasCustomATS: false,
    hasDedicatedSupport: false,
  },
  {
    code: "PROFESSIONAL",
    name: "Professional Partnership",
    description: "For established companies with continuous recruitment and active hiring teams.",
    badge: "Best Value",
    monthlyPriceInr: 14999,
    annualPriceInr: 11999,
    jobPostingLimit: 30,
    searchCreditsMonthly: 1000,
    aiCreditsMonthly: 500,
    recruiterSeatsLimit: 15,
    featuredJobCredits: 6,
    features: [
      "30 Active job listings",
      "1,000 Candidate search credits / month",
      "Full Recruiter AI suite & auto-summaries",
      "15 Recruiter seats & custom team roles",
      "Interview management + scorecards",
      "Offer letter generation & tracking",
      "Custom employer branding & career page",
      "Hiring funnel analytics & SLA insights",
      "6 Featured job slots included",
      "Dedicated account manager",
    ],
    hasInterviewTools: true,
    hasAssessments: true,
    hasEmployerBranding: true,
    hasCustomATS: false,
    hasDedicatedSupport: true,
  },
  {
    code: "ENTERPRISE",
    name: "Enterprise Partnership",
    description: "For large organizations with multi-department volume hiring, ATS sync, and SSO.",
    badge: "Enterprise Grade",
    monthlyPriceInr: 39999,
    annualPriceInr: 31999,
    jobPostingLimit: 100,
    searchCreditsMonthly: 5000,
    aiCreditsMonthly: 2500,
    recruiterSeatsLimit: 50,
    featuredJobCredits: 20,
    features: [
      "100+ Active job listings",
      "5,000+ Candidate search credits / month",
      "Custom ATS integration & Webhook API",
      "Single Sign-On (SAML / Okta)",
      "Custom skill assessment workflows",
      "Offer approval matrices & digital sign-offs",
      "Enterprise hiring compliance & audit logs",
      "Custom employer branding & talent community",
      "Dedicated talent acquisition advisor",
      "24/7 Phone & Slack support with 1h SLA",
    ],
    hasInterviewTools: true,
    hasAssessments: true,
    hasEmployerBranding: true,
    hasCustomATS: true,
    hasDedicatedSupport: true,
  },
];

const industries = [
  "IT & Software",
  "Digital Marketing",
  "Sales & Business Development",
  "BPO & Customer Support",
  "Finance & Accounting",
  "Healthcare",
  "Manufacturing",
  "Retail & E-commerce",
  "Education",
  "Logistics & Supply Chain",
  "Hospitality",
  "Construction & Real Estate",
  "Startups",
  "Enterprise",
];

async function main() {
  console.log("Seeding Employer Plans...");

  for (const p of plans) {
    const existing = await db.employerPlan.findUnique({ where: { code: p.code } });
    let planId = existing?.id;

    if (existing) {
      await db.employerPlan.update({
        where: { code: p.code },
        data: {
          name: p.name,
          description: p.description,
          badge: p.badge,
          monthlyPriceInr: p.monthlyPriceInr,
          annualPriceInr: p.annualPriceInr,
          jobPostingLimit: p.jobPostingLimit,
          searchCreditsMonthly: p.searchCreditsMonthly,
          aiCreditsMonthly: p.aiCreditsMonthly,
          recruiterSeatsLimit: p.recruiterSeatsLimit,
          featuredJobCredits: p.featuredJobCredits,
          features: p.features,
          hasInterviewTools: p.hasInterviewTools,
          hasAssessments: p.hasAssessments,
          hasEmployerBranding: p.hasEmployerBranding,
          hasCustomATS: p.hasCustomATS,
          hasDedicatedSupport: p.hasDedicatedSupport,
        },
      });
      console.log(`Updated plan: ${p.name}`);
    } else {
      const created = await db.employerPlan.create({ data: p });
      planId = created.id;
      console.log(`Created plan: ${p.name}`);
    }

    if (planId) {
      for (const ind of industries) {
        let adjustment = 0;
        if (ind === "IT & Software" && p.code === "GROWTH") adjustment = 500;
        if (ind === "Enterprise" && p.code === "ENTERPRISE") adjustment = 5000;
        if (ind === "Startups" && p.code === "STARTER") adjustment = -500;

        await db.industryPricing.upsert({
          where: {
            industry_planId: {
              industry: ind,
              planId,
            },
          },
          update: { priceAdjustment: adjustment },
          create: {
            industry: ind,
            planId,
            priceAdjustment: adjustment,
          },
        });
      }
    }
  }

  // Ensure initial candidate search credits for existing companies
  const allCompanies = await db.company.findMany();
  const currentMonth = "2026-09";
  for (const company of allCompanies) {
    await db.candidateSearchCredit.upsert({
      where: {
        companyId_month: {
          companyId: company.id,
          month: currentMonth,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        month: currentMonth,
        total: 250,
        used: 12,
      },
    });
  }

  console.log(`Seeded plans & credits successfully for ${allCompanies.length} companies.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
