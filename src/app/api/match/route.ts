import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { explainMatch, Profile } from "@/lib/match";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const profile: Profile = {
      skills: Array.isArray(body.skills) ? body.skills : (body.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      years: Number(body.years ?? 3),
      minLpa: Number(body.minLpa ?? 0),
      mode: body.mode || undefined,
    };

    const jobs = await db.job.findMany({
      where: { status: "PUBLISHED", expiresAt: { gt: new Date() } },
      include: { company: true },
      orderBy: { postedAt: "desc" },
    });

    const evaluated = jobs.map((job) => {
      const match = explainMatch(job, profile);
      // Calculate match percentage score (0 - 100)
      let score = 0;
      const totalSkills = job.skills.length || 1;
      const skillScore = (match.covered.length / totalSkills) * 55; // 55% weight on skills
      const expScore = profile.years >= job.minExp ? 25 : Math.max(0, (profile.years / (job.minExp || 1)) * 20); // 25% weight on exp
      const modeScore = !profile.mode || profile.mode === "ANY" || profile.mode === job.workMode ? 10 : 0; // 10% weight on mode
      const salaryScore = !job.salaryMaxLpa || job.salaryMaxLpa >= profile.minLpa ? 10 : 5; // 10% weight on salary
      score = Math.min(100, Math.round(skillScore + expScore + modeScore + salaryScore));

      return {
        job,
        match,
        score,
      };
    });

    evaluated.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      profile,
      topMatches: evaluated.slice(0, 6),
      totalMatches: evaluated.length,
    });
  } catch (error) {
    console.error("Match API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to evaluate job match" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const skillsParam = url.searchParams.get("skills") || "React,TypeScript";
    const years = Number(url.searchParams.get("years") || 3);
    const mode = url.searchParams.get("mode") || undefined;

    const profile: Profile = {
      skills: skillsParam.split(",").map((s) => s.trim()).filter(Boolean),
      years,
      minLpa: 0,
      mode,
    };

    const jobs = await db.job.findMany({
      where: { status: "PUBLISHED", expiresAt: { gt: new Date() } },
      include: { company: true },
      take: 20,
    });

    const evaluated = jobs.map((job) => ({
      job,
      match: explainMatch(job, profile),
    }));

    return NextResponse.json({ success: true, count: evaluated.length, evaluated });
  } catch (error) {
    console.error("Match GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch matches" }, { status: 500 });
  }
}
