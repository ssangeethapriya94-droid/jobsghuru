import { NextRequest, NextResponse } from "next/server";
import { requireCandidate } from "@/lib/candidate/auth";
import { db } from "@/lib/db";
import { calculateProfileCompleteness } from "@/lib/candidate/profileCompleteness";

export async function GET() {
  try {
    const { authorized, candidate, response } = await requireCandidate();
    if (!authorized) return response!;

    const user = await db.user.findUnique({
      where: { id: candidate.id },
      include: { candidateProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    let profile = user.candidateProfile;
    if (!profile) {
      // Upsert default profile if none exists
      profile = await db.candidateProfile.create({
        data: {
          userId: user.id,
          phone: user.phone,
          profileCompleteness: calculateProfileCompleteness({
            name: user.name,
            email: user.email,
            phone: user.phone,
          }),
          searchableByEmployers: false,
          contactableByEmployers: false,
          hideSalaryFromEmployers: true,
          consentGivenAt: new Date(),
          consentVersion: "v1.0",
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
      profile,
    });
  } catch (err: any) {
    console.error("Fetch profile error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve profile." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { authorized, candidate, response } = await requireCandidate();
    if (!authorized) return response!;

    const body = await req.json();
    const {
      name,
      phone,
      headline,
      summary,
      location,
      skills,
      totalExperienceYears,
      currentCompany,
      currentRole,
      currentCtc,
      expectedCtc,
      noticePeriod,
      availability,
      resumeUrl,
      resumeFileName,
      portfolioUrl,
      linkedinUrl,
      githubUrl,
      education,
      experience,
      certifications,
      searchableByEmployers,
      contactableByEmployers,
      hideSalaryFromEmployers,
    } = body;

    // Update user identity fields if supplied
    if (name || phone) {
      await db.user.update({
        where: { id: candidate.id },
        data: {
          ...(name && { name: name.trim() }),
          ...(phone && { phone: phone.trim() }),
        },
      });
    }

    const expYearsNum =
      totalExperienceYears !== undefined && totalExperienceYears !== null
        ? parseFloat(totalExperienceYears)
        : undefined;
    const ctcNum = currentCtc !== undefined && currentCtc !== null ? parseFloat(currentCtc) : undefined;
    const expCtcNum = expectedCtc !== undefined && expectedCtc !== null ? parseFloat(expectedCtc) : undefined;

    // Recalculate profile completeness on server
    const completeness = calculateProfileCompleteness({
      name: name || candidate.name,
      email: candidate.email,
      phone: phone || candidate.phone,
      headline,
      summary,
      location,
      skills: Array.isArray(skills) ? skills : undefined,
      totalExperienceYears: expYearsNum,
      currentCompany,
      currentRole,
      resumeUrl,
      education,
      experience,
    });

    const updatedProfile = await db.candidateProfile.upsert({
      where: { userId: candidate.id },
      create: {
        userId: candidate.id,
        headline: headline || null,
        summary: summary || null,
        location: location || null,
        phone: phone || candidate.phone || null,
        skills: Array.isArray(skills) ? skills : [],
        totalExperienceYears: expYearsNum || 0,
        currentCompany: currentCompany || null,
        currentRole: currentRole || null,
        currentCtc: ctcNum || null,
        expectedCtc: expCtcNum || null,
        noticePeriod: noticePeriod || null,
        availability: availability || null,
        resumeUrl: resumeUrl || null,
        resumeFileName: resumeFileName || null,
        portfolioUrl: portfolioUrl || null,
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
        education: education || null,
        experience: experience || null,
        certifications: certifications || null,
        profileCompleteness: completeness,
        searchableByEmployers: searchableByEmployers ?? false,
        contactableByEmployers: contactableByEmployers ?? false,
        hideSalaryFromEmployers: hideSalaryFromEmployers ?? true,
        consentGivenAt: new Date(),
        consentVersion: "v1.0",
      },
      update: {
        ...(headline !== undefined && { headline }),
        ...(summary !== undefined && { summary }),
        ...(location !== undefined && { location }),
        ...(phone !== undefined && { phone }),
        ...(skills !== undefined && { skills: Array.isArray(skills) ? skills : [] }),
        ...(expYearsNum !== undefined && { totalExperienceYears: expYearsNum }),
        ...(currentCompany !== undefined && { currentCompany }),
        ...(currentRole !== undefined && { currentRole }),
        ...(ctcNum !== undefined && { currentCtc: ctcNum }),
        ...(expCtcNum !== undefined && { expectedCtc: expCtcNum }),
        ...(noticePeriod !== undefined && { noticePeriod }),
        ...(availability !== undefined && { availability }),
        ...(resumeUrl !== undefined && { resumeUrl }),
        ...(resumeFileName !== undefined && { resumeFileName }),
        ...(portfolioUrl !== undefined && { portfolioUrl }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(education !== undefined && { education }),
        ...(experience !== undefined && { experience }),
        ...(certifications !== undefined && { certifications }),
        ...(searchableByEmployers !== undefined && { searchableByEmployers }),
        ...(contactableByEmployers !== undefined && { contactableByEmployers }),
        ...(hideSalaryFromEmployers !== undefined && { hideSalaryFromEmployers }),
        profileCompleteness: completeness,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Candidate profile updated successfully.",
      profile: updatedProfile,
      profileCompleteness: completeness,
    });
  } catch (err: any) {
    console.error("Update profile error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
