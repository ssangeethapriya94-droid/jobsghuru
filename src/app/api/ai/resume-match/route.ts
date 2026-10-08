import { NextRequest, NextResponse } from "next/server";
import { processCareerCopilotQuery } from "@/lib/ai/careerAssistant";
import { checkRateLimit } from "@/lib/ai/usage";

const COMMON_SKILLS = [
  "React",
  "React.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Next.js",
  "Express",
  "Python",
  "PostgreSQL",
  "Postgres",
  "MySQL",
  "MongoDB",
  "SQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Git",
  "REST APIs",
  "GraphQL",
  "Figma",
  "Tailwind",
  "CSS",
  "HTML",
  "Redux",
  "Java",
  "Spring Boot",
  "C++",
  "Go",
  "Golang",
  "DevOps",
  "Power BI",
  "Excel",
];

function extractResumeData(text: string) {
  const textLower = text.toLowerCase();

  // 1. Extract Skills
  const extractedSkills: string[] = [];
  for (const skill of COMMON_SKILLS) {
    const pattern = new RegExp(`\\b${skill.replace(".", "\\.")}\\b`, "i");
    if (pattern.test(textLower)) {
      const normalized = skill === "React.js" ? "React" : skill === "Postgres" ? "PostgreSQL" : skill;
      if (!extractedSkills.includes(normalized)) {
        extractedSkills.push(normalized);
      }
    }
  }

  // 2. Extract Experience (years)
  let yearsOfExp = 0;
  const expMatch = textLower.match(/(\d+)\+?\s*(years|yrs)\s*(of\s*)?experience/i);
  if (expMatch && expMatch[1]) {
    yearsOfExp = parseInt(expMatch[1], 10);
  } else {
    const yearMatches = text.match(/\b(20\d\d)\b/g);
    if (yearMatches && yearMatches.length >= 2) {
      const years = yearMatches.map((y) => parseInt(y, 10)).sort((a, b) => a - b);
      const span = years[years.length - 1] - years[0];
      if (span > 0 && span <= 25) {
        yearsOfExp = span;
      }
    }
  }

  // 3. Extract Role / Job Title
  let detectedRole = "";
  if (/full\s*stack/i.test(textLower)) detectedRole = "Full Stack Developer";
  else if (/frontend|react|web developer/i.test(textLower)) detectedRole = "Frontend Developer";
  else if (/backend|node|python|java engineer/i.test(textLower)) detectedRole = "Backend Engineer";
  else if (/devops|cloud|aws/i.test(textLower)) detectedRole = "DevOps Engineer";
  else if (/data analyst|power bi|excel/i.test(textLower)) detectedRole = "Data Analyst";

  return {
    skills: extractedSkills.length > 0 ? extractedSkills : ["JavaScript", "HTML", "CSS"],
    yearsOfExp: Math.max(yearsOfExp, 1),
    detectedRole,
  };
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    let resumeText = "";
    let resumeFileName = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (file) {
        resumeFileName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract printable ASCII/UTF-8 text chunks from binary PDF/DOCX or text buffer
        const rawText = buffer.toString("binary");
        // Extract plain text inside PDF parenthesis (e.g. (React) Tj) or printable text
        const pdfTextMatches = rawText.match(/\(([^()]{2,50})\)/g) || [];
        const extractedPdfWords = pdfTextMatches
          .map((m) => m.replace(/[()]/g, "").trim())
          .filter(Boolean)
          .join(" ");

        const printableText = rawText
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ")
          .replace(/\s+/g, " ");

        // Combine extracted text with filename for extra skill signal
        resumeText = `${file.name} ${extractedPdfWords} ${printableText}`;
      }
    } else {
      const body = await req.json();
      resumeText = body.resumeText || "";
    }

    // Extract skills and experience from resume text
    const parsedResume = extractResumeData(resumeText);

    // Formulate search query
    const query = parsedResume.detectedRole
      ? `Jobs matching ${parsedResume.detectedRole}`
      : `Jobs matching skills ${parsedResume.skills.slice(0, 3).join(", ")}`;

    let assistantResponse: any = null;
    try {
      assistantResponse = await processCareerCopilotQuery({
        query,
        previousFilters: {
          skills: parsedResume.skills,
          experienceMin: parsedResume.yearsOfExp,
          location: [],
          verifiedOnly: false,
        },
        clientIp: ip,
      });
    } catch (queryErr) {
      console.warn("Primary AI resume query failed, running fallback search:", queryErr);
      // Fallback query with broader criteria
      assistantResponse = await processCareerCopilotQuery({
        query: "Software Developer jobs",
        clientIp: ip,
      });
    }

    // Generate Skill Development Guides for each matched job missing skills
    const jobsWithDevelopmentPlans = (assistantResponse?.jobs || []).map((job: any) => {
      const missingSkills = job.skillGaps || [];
      const skillGuides = missingSkills.map((skill: string) => {
        let guide = `Learn ${skill} fundamentals and build a mini-project.`;
        let time = "1 week";
        if (["AWS", "Docker", "Kubernetes", "DevOps"].includes(skill)) {
          guide = `Learn containerization and deployment with ${skill}. Set up a sample cloud app on AWS EC2 or free-tier hosting.`;
          time = "1–2 weeks";
        } else if (["PostgreSQL", "SQL", "MongoDB"].includes(skill)) {
          guide = `Practice database schema design, indexing, and writing queries with ${skill} integrated into Node.js/Python backend.`;
          time = "4–5 days";
        } else if (["TypeScript", "React", "Next.js"].includes(skill)) {
          guide = `Convert an existing JavaScript project to ${skill} using modern strict types and component patterns.`;
          time = "3–5 days";
        }

        return {
          skill,
          learningGuide: guide,
          estimatedTime: time,
        };
      });

      return {
        ...job,
        developmentPlan: skillGuides,
      };
    });

    return NextResponse.json(
      {
        success: true,
        resumeFileName: resumeFileName || "Uploaded_Resume.pdf",
        extractedSkills: parsedResume.skills,
        extractedExp: parsedResume.yearsOfExp,
        detectedRole: parsedResume.detectedRole,
        queryUsed: query,
        response: {
          ...assistantResponse,
          jobs: jobsWithDevelopmentPlans,
        },
      },
      {
        status: 200,
        headers: { "X-RateLimit-Remaining": String(remaining) },
      }
    );
  } catch (error: any) {
    console.error("Resume Match API Critical Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process resume matching.",
      },
      { status: 500 }
    );
  }
}
