import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { getCompanyPlanInfo, canSearchCandidates } from "@/lib/employer/entitlements";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
    ]);
    if (!authorized) return response!;

    const companyId = employer.companyId;

    // Fetch live company data in parallel
    const [
      company,
      activeJobsCount,
      allJobs,
      applications,
      interviews,
      offers,
      planInfo,
      searchCreditInfo,
    ] = await Promise.all([
      db.company.findUnique({
        where: { id: companyId },
        include: {
          verifications: {
            orderBy: { submittedAt: "desc" },
            take: 1,
          },
        },
      }),
      db.job.count({
        where: {
          companyId,
          status: "PUBLISHED",
          expiresAt: { gt: new Date() },
        },
      }),
      db.job.findMany({
        where: { companyId },
        select: { id: true, title: true, department: true, status: true, responseRatePct: true },
        take: 10,
        orderBy: { postedAt: "desc" },
      }),
      db.application.findMany({
        where: {
          job: { companyId },
        },
        include: {
          job: { select: { title: true, department: true } },
        },
        orderBy: { appliedAt: "desc" },
      }),
      db.interview.findMany({
        where: { companyId },
        include: { job: { select: { title: true } } },
        orderBy: { scheduledAt: "asc" },
        take: 6,
      }),
      db.offer.findMany({
        where: { companyId },
        include: { job: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      getCompanyPlanInfo(companyId),
      canSearchCandidates(companyId),
    ]);

    // Compute live funnel counts
    const funnel = {
      applied: applications.length,
      screening: applications.filter((a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW").length,
      shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
      interview: applications.filter((a) => a.status === "INTERVIEW_SCHEDULED").length + interviews.length,
      offer: applications.filter((a) => a.status === "OFFER_EXTENDED").length + offers.length,
      hired: applications.filter((a) => a.status === "HIRED").length,
    };

    // Calculate onboarding progress based on real completed milestones
    const onboarding = [
      { step: "Company Registered", done: true },
      { step: "Company Verification", done: company?.verified || false },
      { step: "Profile Bio & Benefits", done: (company?.benefits?.length || 0) > 0 },
      { step: "First Job Created", done: allJobs.length > 0 },
      { step: "First Application Received", done: applications.length > 0 },
      { step: "Candidate Search Initiated", done: searchCreditInfo.used > 0 },
    ];

    const completedSteps = onboarding.filter((s) => s.done).length;
    const onboardingProgress = Math.round((completedSteps / onboarding.length) * 100);

    return NextResponse.json({
      success: true,
      company: {
        id: company?.id,
        name: company?.name,
        slug: company?.slug,
        verified: company?.verified,
        verificationStatus: company?.verifications[0]?.status || (company?.verified ? "VERIFIED" : "PENDING"),
        industry: company?.industry,
        size: company?.size,
        location: company?.location,
      },
      employerUser: {
        id: employer.id,
        name: employer.name,
        email: employer.email,
        role: employer.role,
      },
      kpis: {
        activeJobs: activeJobsCount,
        maxJobs: planInfo.jobLimit,
        totalApplications: applications.length,
        shortlisted: funnel.shortlisted,
        interviews: interviews.length,
        offers: offers.length,
        hires: funnel.hired,
      },
      usage: {
        planName: planInfo.planName,
        planCode: planInfo.planCode,
        jobsUsed: activeJobsCount,
        jobsLimit: planInfo.jobLimit,
        searchCreditsUsed: searchCreditInfo.used,
        searchCreditsTotal: searchCreditInfo.total,
        searchCreditsRemaining: searchCreditInfo.remaining,
      },
      funnel,
      recentApplications: applications.slice(0, 6).map((a) => ({
        id: a.id,
        candidateName: a.candidateName,
        candidateEmail: a.candidateEmail,
        jobTitle: a.job.title,
        experienceYears: a.experienceYears,
        expectedCtc: a.expectedCtc,
        matchScore: a.matchScore,
        status: a.status,
        appliedAt: a.appliedAt,
      })),
      upcomingInterviews: interviews.map((i) => ({
        id: i.id,
        candidateName: i.candidateName,
        jobTitle: i.job.title,
        scheduledAt: i.scheduledAt,
        durationMinutes: i.durationMinutes,
        interviewType: i.interviewType,
        status: i.status,
        meetingLink: i.meetingLink,
      })),
      onboarding: {
        progress: onboardingProgress,
        steps: onboarding,
      },
    });
  } catch (error: any) {
    console.error("Employer dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch employer dashboard stats" }, { status: 500 });
  }
}
