import { PrismaClient, WorkMode, JobType } from "@prisma/client";
const db = new PrismaClient();
const day = 86_400_000;

const companies = [
  ["Northwind Labs", "Software", "201-500", "Chennai", true],
  ["Bluepeak Systems", "Fintech", "51-200", "Bengaluru", true],
  ["Kaveri Health", "Healthtech", "201-500", "Chennai", true],
  ["Orbit Commerce", "E-commerce", "501-1000", "Hyderabad", true],
  ["Lumen Analytics", "Data & AI", "11-50", "Pune", false],
  ["Coastline Logistics", "Logistics", "1000+", "Mumbai", true],
] as const;

const roles = [
  { t: "Frontend Developer", d: "Engineering", s: ["React", "TypeScript", "JavaScript", "CSS"], p: ["Next.js", "Testing"], e: [2, 5], pay: [8, 16] },
  { t: "Full Stack Developer", d: "Engineering", s: ["React", "Node.js", "PostgreSQL", "TypeScript"], p: ["AWS", "Docker"], e: [3, 6], pay: [12, 24] },
  { t: "Backend Engineer", d: "Engineering", s: ["Node.js", "PostgreSQL", "REST APIs", "Docker"], p: ["Redis", "AWS"], e: [3, 7], pay: [14, 28] },
  { t: "Data Analyst", d: "Data", s: ["SQL", "Excel", "Power BI", "Python"], p: ["Statistics"], e: [1, 4], pay: [6, 14] },
  { t: "Product Designer", d: "Design", s: ["Figma", "UX Research", "Prototyping"], p: ["Design Systems"], e: [2, 5], pay: [9, 20] },
  { t: "QA Engineer", d: "Engineering", s: ["Test Automation", "Selenium", "JavaScript"], p: ["Cypress"], e: [2, 5], pay: [6, 15] },
  { t: "DevOps Engineer", d: "Engineering", s: ["AWS", "Docker", "Kubernetes", "CI/CD"], p: ["Terraform"], e: [3, 7], pay: [16, 32] },
  { t: "Digital Marketing Executive", d: "Marketing", s: ["SEO", "Meta Ads", "Google Ads"], p: ["Analytics"], e: [1, 3], pay: [3, 8] },
  { t: "Software Engineering Intern", d: "Engineering", s: ["JavaScript", "Git", "Problem Solving"], p: ["React"], e: [0, 0], pay: [3, 5] },
] as const;

const modes: WorkMode[] = ["REMOTE", "HYBRID", "ONSITE"];

async function main() {
  await db.job.deleteMany();
  await db.company.deleteMany();
  const created = [];
  for (const [name, industry, size, location, verified] of companies) {
    created.push(await db.company.create({ data: {
      name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), industry, size, location, verified,
      website: `https://example.com/${name.split(" ")[0].toLowerCase()}`,
      description: `${name} is a fictional ${industry.toLowerCase()} company used as development seed data.`,
    }}));
  }
  let i = 0;
  for (const c of created) {
    for (let k = 0; k < 4; k++, i++) {
      const r = roles[i % roles.length];
      const age = (i * 3) % 20;
      const intern = r.t.includes("Intern");
      await db.job.create({ data: {
        title: r.t, department: r.d, companyId: c.id,
        description: `Join ${c.name} as a ${r.t}. You will work with a small, focused team and ship work that users see every week.`,
        responsibilities: ["Own features from design to release", "Collaborate with product and design", "Write clear, tested, maintainable work", "Share knowledge in reviews and demos"],
        requirements: [`${r.e[0]}+ years of relevant experience`, `Hands-on with ${r.s.slice(0, 3).join(", ")}`, "Clear written and verbal communication"],
        skills: [...r.s], preferredSkills: [...r.p],
        location: c.location, workMode: modes[i % 3], jobType: (intern ? "INTERNSHIP" : i % 7 === 0 ? "CONTRACT" : "FULL_TIME") as JobType,
        minExp: r.e[0], maxExp: r.e[1],
        salaryMinLpa: i % 5 === 4 ? null : r.pay[0], salaryMaxLpa: i % 5 === 4 ? null : r.pay[1],
        postedAt: new Date(Date.now() - age * day),
        lastActivityAt: new Date(Date.now() - (i % 4) * day),
        expiresAt: new Date(Date.now() + (30 - age) * day),
        responseRatePct: 55 + ((i * 7) % 43),
      }});
    }
  }
  console.log(`Seeded ${created.length} companies and ${i} jobs (fictional data).`);
}
main().finally(() => db.$disconnect());
