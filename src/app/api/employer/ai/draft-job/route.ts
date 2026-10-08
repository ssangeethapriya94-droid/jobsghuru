import { NextRequest, NextResponse } from "next/server";
import { getCurrentEmployer } from "@/lib/employer/auth";
import { canUseAI } from "@/lib/employer/entitlements";

export async function POST(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aiEntitlement = await canUseAI(employer.companyId);
    if (!aiEntitlement.allowed) {
      return NextResponse.json({ error: aiEntitlement.reason }, { status: 403 });
    }

    const body = await req.json();
    const { title, department, skills, experienceYears, workMode } = body;

    if (!title) {
      return NextResponse.json({ error: "Job title is required to draft requisition." }, { status: 400 });
    }

    const skillList = Array.isArray(skills)
      ? skills
      : (skills || "").split(",").map((s: string) => s.trim()).filter(Boolean);

    const primarySkillsStr = skillList.length > 0 ? skillList.join(", ") : "modern engineering practices";
    const expStr = experienceYears ? `${experienceYears}+ years` : "relevant industry experience";
    const mode = workMode || "Hybrid";

    const description = `We are seeking an experienced and collaborative ${title} to join our growing ${department || "Engineering"} organization at ${employer.companyName}. In this role, you will lead the implementation of mission-critical systems, collaborate closely with cross-functional product stakeholders, and drive high technical excellence across our team in a ${mode} work model.`;

    const responsibilities = [
      `Design, build, and maintain scalable and reliable software services utilizing ${primarySkillsStr}.`,
      `Collaborate with product managers, UX designers, and peer engineers to define technical specs and feature milestones.`,
      `Conduct thoughtful code reviews, uphold clean code principles, and mentor junior teammates.`,
      `Diagnose performance bottlenecks, improve test coverage, and champion automated CI/CD practices.`,
      `Participate in agile sprint ceremonies, technical roadmap planning, and architectural reviews.`,
    ];

    const requirements = [
      `${expStr} of hands-on professional experience delivering production systems.`,
      `Proficiency in core technologies including ${primarySkillsStr}.`,
      `Solid understanding of software design patterns, system architecture, and API design.`,
      `Experience with relational databases, automated testing frameworks, and cloud deployment pipelines.`,
      `Strong written and verbal communication skills with a track record of cross-functional team delivery.`,
    ];

    const preferredSkills = [
      "Microservices & Event-Driven Architecture",
      "CI/CD Pipelines & Cloud Infrastructure (AWS / GCP)",
      "Performance Profiling & Observability",
    ];

    return NextResponse.json({
      success: true,
      draft: {
        description,
        responsibilities: responsibilities.join("\n"),
        requirements: requirements.join("\n"),
        preferredSkills: preferredSkills.join(", "),
      },
    });
  } catch (error: any) {
    console.error("Error generating job draft:", error);
    return NextResponse.json({ error: "Failed to generate AI job draft." }, { status: 500 });
  }
}
