import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { recordAuditLog } from "@/lib/admin/audit";
import { UserRole } from "@prisma/client";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
      UserRole.HIRING_MANAGER,
      UserRole.INTERVIEWER,
    ]);
    if (!authorized) return response!;

    const candidateIdentifier = params.id;
    if (!candidateIdentifier) {
      return NextResponse.json({ error: "Candidate identifier required" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const timelinePage = Math.max(1, parseInt(searchParams.get("timelinePage") || "1", 10));
    const timelineLimit = Math.max(1, Math.min(50, parseInt(searchParams.get("timelineLimit") || "10", 10)));
    const commPage = Math.max(1, parseInt(searchParams.get("commPage") || "1", 10));
    const commLimit = Math.max(1, Math.min(50, parseInt(searchParams.get("commLimit") || "10", 10)));

    // 1. Resolve candidate by User ID (registered) or Application ID (guest or direct)
    let candidateUser: any = null;
    let candidateEmail = "";
    let candidateName = "";
    let candidatePhone = "";

    // Check if identifier is a User
    const userMatch = await db.user.findUnique({
      where: { id: candidateIdentifier },
      include: {
        candidateProfile: true,
      },
    });

    if (userMatch && userMatch.role === "CANDIDATE") {
      // SECURITY: Verify this candidate actually has at least one application at THIS company.
      // Without this check, any authenticated employer from any company could look up
      // any registered candidate by their userId and receive a 200.
      const hasAppAtCompany = await db.application.findFirst({
        where: {
          deletedAt: null,
          OR: [
            { candidateId: userMatch.id },
            { candidateEmail: userMatch.email.toLowerCase() },
          ],
          job: { companyId: employer.companyId },
        },
        select: { id: true },
      });

      if (!hasAppAtCompany) {
        return NextResponse.json({ error: "Candidate record not found" }, { status: 404 });
      }

      candidateUser = userMatch;
      candidateEmail = userMatch.email;
      candidateName = userMatch.name;
      candidatePhone = userMatch.phone || "";
    } else {
      // Check if identifier is an Application ID (guest applicant or direct link)
      const appMatch = await db.application.findUnique({
        where: { id: candidateIdentifier },
        include: {
          job: { select: { companyId: true } },
          candidate: {
            include: { candidateProfile: true },
          },
        },
      });

      if (!appMatch || appMatch.deletedAt !== null) {
        return NextResponse.json({ error: "Candidate record not found" }, { status: 404 });
      }

      // Tenant isolation on initial application match
      if (appMatch.job.companyId !== employer.companyId) {
        return NextResponse.json({ error: "Candidate record not found" }, { status: 404 });
      }

      candidateEmail = appMatch.candidateEmail;
      candidateName = appMatch.candidateName;
      candidatePhone = appMatch.candidatePhone;
      if (appMatch.candidate) {
        candidateUser = appMatch.candidate;
      }
    }

    // 2. Fetch all non-deleted applications for this candidate in THIS company only
    const applications = await db.application.findMany({
      where: {
        job: { companyId: employer.companyId },
        deletedAt: null,
        OR: [
          ...(candidateUser ? [{ candidateId: candidateUser.id }] : []),
          { candidateEmail: candidateEmail },
        ],
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
            workMode: true,
            jobType: true,
            status: true,
          },
        },
        currentStage: {
          select: {
            id: true,
            name: true,
            stageType: true,
          },
        },
        interviews: {
          where: { companyId: employer.companyId },
          include: {
            interviewer: { select: { id: true, name: true, email: true } },
            participants: true,
            feedbacks: true,
          },
          orderBy: { scheduledAt: "desc" },
        },
        notes: {
          where: { companyId: employer.companyId },
          orderBy: { createdAt: "desc" },
        },
        candidateAssessments: {
          include: {
            assessment: {
              select: { id: true, title: true, durationMinutes: true, passingScore: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        offers: {
          where: { companyId: employer.companyId },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    if (applications.length === 0) {
      return NextResponse.json({ error: "Candidate record not found" }, { status: 404 });
    }

    const companyAppIds = applications.map((a) => a.id);

    // 3. INTERVIEWER Scope Enforcement
    const isInterviewer = employer.role === UserRole.INTERVIEWER;
    const isHiringManager = employer.role === UserRole.HIRING_MANAGER;

    if (isInterviewer) {
      // Check if this interviewer is assigned to ANY interview for this candidate in this company
      const hasAssignedInterview = applications.some((app) =>
        app.interviews.some(
          (inv) =>
            inv.interviewerId === employer.id ||
            inv.participants.some(
              (p) => p.userId === employer.id || (p.email && p.email.toLowerCase() === employer.email.toLowerCase())
            )
        )
      );

      // Rule: INTERVIEWER on an unlinked candidate gets 404, not 403
      if (!hasAssignedInterview) {
        return NextResponse.json({ error: "Candidate record not found" }, { status: 404 });
      }
    }

    // 4. Record Immutable AuditLog entry (Opaque ID logged, NO raw emails)
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role,
      action: "CANDIDATE_360_VIEWED",
      entityType: "CANDIDATE",
      entityId: candidateIdentifier,
      reason: `Viewed Candidate 360 record: ${candidateIdentifier}`,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || undefined,
    }).catch(() => {});

    // 5. Fetch Paginated Timeline Events for this company's applications
    const [timelineEvents, totalTimelineCount] = await Promise.all([
      db.applicationEvent.findMany({
        where: {
          applicationId: { in: companyAppIds },
        },
        orderBy: { createdAt: "desc" },
        skip: (timelinePage - 1) * timelineLimit,
        take: timelineLimit,
      }),
      db.applicationEvent.count({
        where: {
          applicationId: { in: companyAppIds },
        },
      }),
    ]);

    // 6. Fetch Paginated Communication Log (Only linked to this company's applications)
    let emailOutboxRows: any[] = [];
    let notificationRows: any[] = [];
    let totalCommCount = 0;

    if (!isInterviewer) {
      const [emails, notifications, emailCount, notifCount] = await Promise.all([
        db.emailOutbox.findMany({
          where: {
            companyId: employer.companyId,
            applicationId: { in: companyAppIds },
          },
          orderBy: { createdAt: "desc" },
          skip: (commPage - 1) * commLimit,
          take: commLimit,
        }),
        db.notification.findMany({
          where: {
            companyId: employer.companyId,
            applicationId: { in: companyAppIds },
          },
          orderBy: { createdAt: "desc" },
          skip: (commPage - 1) * commLimit,
          take: commLimit,
        }),
        db.emailOutbox.count({
          where: {
            companyId: employer.companyId,
            applicationId: { in: companyAppIds },
          },
        }),
        db.notification.count({
          where: {
            companyId: employer.companyId,
            applicationId: { in: companyAppIds },
          },
        }),
      ]);

      emailOutboxRows = emails;
      notificationRows = notifications;
      totalCommCount = emailCount + notifCount;
    }

    // 7. Process Profile & Salary Rules
    const profile = candidateUser?.candidateProfile || null;
    const hideSalaryProfileLevel = profile?.hideSalaryFromEmployers ?? true;

    // Profile-level salary: hidden from all roles if hideSalaryFromEmployers is true
    let profileCurrentCtc: number | null = null;
    let profileExpectedCtc: number | null = null;

    if (!hideSalaryProfileLevel && !isInterviewer) {
      profileCurrentCtc = profile?.currentCtc || null;
      profileExpectedCtc = profile?.expectedCtc || null;
    }

    // Candidate Profile Summary Block
    const profileSummary = {
      id: candidateUser?.id || candidateIdentifier,
      name: candidateName || applications[0]?.candidateName,
      email: candidateEmail || applications[0]?.candidateEmail,
      phone: candidatePhone || applications[0]?.candidatePhone,
      headline: profile?.headline || applications[0]?.currentRole || "Applicant",
      summary: profile?.summary || applications[0]?.coverNote || null,
      location: profile?.location || null,
      totalExperienceYears: profile?.totalExperienceYears || applications[0]?.experienceYears || 0,
      skills: profile?.skills || [],
      education: profile?.education || null,
      experience: profile?.experience || null,
      certifications: profile?.certifications || null,
      resumeUrl: `/api/employer/applications/${applications[0]?.id}/resume`,
      resumeFileName: applications[0]?.resumeFileName || profile?.resumeFileName || "resume.pdf",
      portfolioUrl: profile?.portfolioUrl || null,
      linkedinUrl: profile?.linkedinUrl || null,
      githubUrl: profile?.githubUrl || null,
      profileCompleteness: profile?.profileCompleteness || 0,
      hideSalaryFromEmployers: hideSalaryProfileLevel,
      currentCtc: profileCurrentCtc,
      expectedCtc: profileExpectedCtc,
    };

    // 8. Format Applications according to RBAC
    const formattedApplications = applications.map((app) => {
      // Application-level salary: typed into this company's application
      // Shown to ADMIN, RECRUITER, HIRING_MANAGER only; NEVER INTERVIEWER
      const appCurrentCtc = !isInterviewer ? app.currentCtc : null;
      const appExpectedCtc = !isInterviewer ? app.expectedCtc : null;

      // Filter interviews & feedback for INTERVIEWER
      let appInterviews: any[] = app.interviews;
      if (isInterviewer) {
        appInterviews = app.interviews
          .filter(
            (inv) =>
              inv.interviewerId === employer.id ||
              inv.participants.some(
                (p) => p.userId === employer.id || (p.email && p.email.toLowerCase() === employer.email.toLowerCase())
              )
          )
          .map((inv) => ({
            ...inv,
            feedback: inv.feedbacks.filter(
              (fb) =>
                fb.interviewerId === employer.id ||
                (fb.interviewerEmail && fb.interviewerEmail.toLowerCase() === employer.email.toLowerCase())
            ),
          }));
      } else {
        appInterviews = app.interviews.map((inv) => ({
          ...inv,
          feedback: inv.feedbacks,
        }));
      }

      return {
        id: app.id,
        jobId: app.jobId,
        jobTitle: app.job.title,
        department: app.job.department,
        location: app.job.location,
        workMode: app.job.workMode,
        jobType: app.job.jobType,
        status: app.status,
        currentStage: app.currentStage?.name || "Application Submitted",
        currentStageType: app.currentStage?.stageType || "SCREENING",
        experienceYears: app.experienceYears,
        currentCompany: app.currentCompany,
        currentRole: app.currentRole,
        noticePeriod: app.noticePeriod,
        matchScore: app.matchScore,
        currentCtc: appCurrentCtc,
        expectedCtc: appExpectedCtc,
        coverNote: app.coverNote,
        resumeUrl: `/api/employer/applications/${app.id}/resume`,
        resumeFileName: app.resumeFileName || "resume.pdf",
        appliedAt: app.appliedAt,
        interviews: appInterviews,
        notes: !isInterviewer ? app.notes : [],
        assessments: !isInterviewer ? app.candidateAssessments : [],
        offers: !isInterviewer
          ? app.offers.map((o) => ({
              id: o.id,
              roleTitle: o.roleTitle,
              baseSalaryLpa: o.baseSalaryLpa,
              variableLpa: o.variableLpa,
              currency: o.currency,
              startDate: o.startDate,
              expiryDate: o.expiryDate,
              status: o.status,
              terms: o.terms,
              createdAt: o.createdAt,
            }))
          : [],
      };
    });

    // 9. Consolidate Read-Only Offers
    const allOffers = !isInterviewer
      ? applications.flatMap((a) =>
          a.offers.map((o) => ({
            id: o.id,
            applicationId: a.id,
            jobTitle: a.job.title,
            roleTitle: o.roleTitle,
            baseSalaryLpa: o.baseSalaryLpa,
            variableLpa: o.variableLpa,
            currency: o.currency,
            startDate: o.startDate,
            expiryDate: o.expiryDate,
            status: o.status,
            terms: o.terms,
            createdAt: o.createdAt,
          }))
        )
      : [];

    return NextResponse.json({
      success: true,
      candidate: profileSummary,
      applications: formattedApplications,
      offers: allOffers,
      timeline: {
        events: timelineEvents.map((e) => ({
          id: e.id,
          applicationId: e.applicationId,
          action: e.action,
          actorName: e.actorName,
          actorRole: e.actorRole,
          metadata: e.metadata,
          createdAt: e.createdAt,
        })),
        pagination: {
          page: timelinePage,
          limit: timelineLimit,
          total: totalTimelineCount,
          totalPages: Math.ceil(totalTimelineCount / timelineLimit),
        },
      },
      communication: !isInterviewer
        ? {
            emails: emailOutboxRows.map((e) => ({
              id: e.id,
              to: e.to,
              subject: e.subject,
              template: e.template,
              status: e.status,
              sentAt: e.sentAt,
              createdAt: e.createdAt,
            })),
            notifications: notificationRows.map((n) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type,
              read: n.read,
              createdAt: n.createdAt,
            })),
            pagination: {
              page: commPage,
              limit: commLimit,
              total: totalCommCount,
              totalPages: Math.ceil(totalCommCount / commLimit),
            },
          }
        : null,
      accessRole: employer.role,
      isViewOnly: isHiringManager || isInterviewer,
    });
  } catch (error: any) {
    console.error("Error fetching Candidate 360:", error);
    return NextResponse.json({ error: "Failed to fetch candidate 360 profile" }, { status: 500 });
  }
}
