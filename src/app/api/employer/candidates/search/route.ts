import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    // Check search credits
    const currentMonth = new Date().toISOString().slice(0, 7);
    const searchCredit = await db.candidateSearchCredit.findUnique({
      where: { companyId_month: { companyId: employer.companyId, month: currentMonth } },
    });
    if (searchCredit && searchCredit.used >= searchCredit.total) {
      return NextResponse.json({ error: "Candidate search credits exhausted for this month" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("q") || "";
    const skill = searchParams.get("skill") || "";
    const location = searchParams.get("location") || "";
    const minExp = parseFloat(searchParams.get("minExp") || "0");
    const maxExp = parseFloat(searchParams.get("maxExp") || "100");
    const noticePeriod = searchParams.get("noticePeriod") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    // STRICT CONSENT RULE: Search only candidates where searchableByEmployers = true!
    const where: any = {
      searchableByEmployers: true,
      user: { status: "ACTIVE" },
    };

    if (query) {
      where.OR = [
        { headline: { contains: query, mode: "insensitive" } },
        { currentRole: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { user: { name: { contains: query, mode: "insensitive" } } },
      ];
    }

    if (skill) {
      where.skills = { has: skill };
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (minExp > 0 || maxExp < 100) {
      where.totalExperienceYears = { gte: minExp, lte: maxExp };
    }

    if (noticePeriod) {
      where.noticePeriod = { contains: noticePeriod, mode: "insensitive" };
    }

    const [profiles, total] = await Promise.all([
      db.candidateProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
        orderBy: { profileCompleteness: "desc" },
        skip,
        take: limit,
      }),
      db.candidateProfile.count({ where }),
    ]);

    // Format output cleanly respecting privacy settings (no direct resume URL leak!)
    const sanitizedResults = profiles.map((p) => {
      const isSalaryHidden = p.hideSalaryFromEmployers;
      return {
        id: p.id,
        userId: p.userId,
        name: p.user.name,
        headline: p.headline || p.currentRole || "Candidate Profile",
        location: p.location || "India",
        totalExperienceYears: p.totalExperienceYears,
        currentCompany: p.currentCompany,
        currentRole: p.currentRole,
        skills: p.skills || [],
        noticePeriod: p.noticePeriod || "Immediate",
        availability: p.availability,
        profileCompleteness: p.profileCompleteness || 75,
        contactableByEmployers: p.contactableByEmployers,
        hasResume: Boolean(p.resumeUrl || p.resumeFileName), // Boolean only - NO DIRECT FILE LINK LEAK!
        expectedCtc: isSalaryHidden ? null : p.expectedCtc,
        currentCtc: isSalaryHidden ? null : p.currentCtc,
        hideSalaryFromEmployers: isSalaryHidden,
      };
    });

    return NextResponse.json({
      success: true,
      candidates: sanitizedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error searching candidates:", error);
    return NextResponse.json({ error: "Failed to search candidate profiles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    // Check search credits
    const currentMonth = new Date().toISOString().slice(0, 7);
    const searchCredit = await db.candidateSearchCredit.findUnique({
      where: { companyId_month: { companyId: employer.companyId, month: currentMonth } },
    });
    if (searchCredit && searchCredit.used >= searchCredit.total) {
      return NextResponse.json({ error: "Candidate search credits exhausted for this month" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const query = body.query || body.q || "";
    const skill = body.skill || (typeof body.skills === "string" ? body.skills.split(",")[0].trim() : "");
    const location = body.location || "";
    const minExp = parseFloat(body.minExp || "0");
    const maxExp = parseFloat(body.maxExp || "100");
    const noticePeriod = body.noticePeriod || "";
    const page = parseInt(body.page || "1");
    const limit = parseInt(body.limit || "15");
    const skip = (page - 1) * limit;

    const where: any = {
      searchableByEmployers: true,
      user: { status: "ACTIVE" },
    };

    if (query) {
      where.OR = [
        { headline: { contains: query, mode: "insensitive" } },
        { currentRole: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { user: { name: { contains: query, mode: "insensitive" } } },
      ];
    }

    if (skill) {
      where.skills = { has: skill };
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (minExp > 0 || maxExp < 100) {
      where.totalExperienceYears = { gte: minExp, lte: maxExp };
    }

    if (noticePeriod) {
      where.noticePeriod = { contains: noticePeriod, mode: "insensitive" };
    }

    const [profiles, total] = await Promise.all([
      db.candidateProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
        orderBy: { profileCompleteness: "desc" },
        skip,
        take: limit,
      }),
      db.candidateProfile.count({ where }),
    ]);

    const sanitizedResults = profiles.map((p) => {
      const isSalaryHidden = p.hideSalaryFromEmployers;
      return {
        id: p.id,
        userId: p.userId,
        name: p.user.name,
        email: p.contactableByEmployers ? p.user.email : null,
        headline: p.headline || p.currentRole || "Candidate Profile",
        location: p.location || "India",
        totalExperienceYears: p.totalExperienceYears,
        experienceYears: p.totalExperienceYears,
        currentCompany: p.currentCompany,
        currentRole: p.currentRole,
        skills: p.skills || [],
        noticePeriod: p.noticePeriod || "Immediate",
        availability: p.availability,
        profileCompleteness: p.profileCompleteness || 75,
        contactableByEmployers: p.contactableByEmployers,
        hasResume: Boolean(p.resumeUrl || p.resumeFileName),
        expectedCtc: isSalaryHidden ? null : p.expectedCtc,
        currentCtc: isSalaryHidden ? null : p.currentCtc,
        hideSalaryFromEmployers: isSalaryHidden,
      };
    });

    return NextResponse.json({
      success: true,
      candidates: sanitizedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error searching candidates via POST:", error);
    return NextResponse.json({ error: "Failed to search candidate profiles" }, { status: 500 });
  }
}

