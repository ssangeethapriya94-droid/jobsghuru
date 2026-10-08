import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer } from "@/lib/employer/auth";
import { scheduleInterview } from "@/lib/interview/service";

export async function GET(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const jobIdParam = searchParams.get("jobId");
    const typeParam = searchParams.get("type");
    const searchParam = searchParams.get("search")?.toLowerCase().trim();

    const whereClause: any = { companyId: employer.companyId };

    if (employer.role === "INTERVIEWER") {
      whereClause.OR = [
        { interviewerId: employer.id },
        { participants: { some: { userId: employer.id } } },
        { participants: { some: { email: employer.email } } },
      ];
    }

    if (statusParam && statusParam !== "ALL") {
      whereClause.status = statusParam;
    }
    if (jobIdParam && jobIdParam !== "ALL") {
      whereClause.jobId = jobIdParam;
    }
    if (typeParam && typeParam !== "ALL") {
      whereClause.interviewType = typeParam;
    }
    if (searchParam) {
      const searchConditions = [
        { candidateName: { contains: searchParam, mode: "insensitive" } },
        { candidateEmail: { contains: searchParam, mode: "insensitive" } },
        { title: { contains: searchParam, mode: "insensitive" } },
      ];
      if (whereClause.OR) {
        whereClause.AND = [{ OR: whereClause.OR }, { OR: searchConditions }];
        delete whereClause.OR;
      } else {
        whereClause.OR = searchConditions;
      }
    }

    const [interviews, allCompanyInterviews] = await Promise.all([
      db.interview.findMany({
        where: whereClause,
        include: {
          job: { select: { id: true, title: true, department: true } },
          application: {
            select: { id: true, currentRole: true, experienceYears: true, matchScore: true, currentStageId: true },
          },
          interviewer: { select: { id: true, name: true, email: true } },
          stage: { select: { id: true, name: true, stageType: true, interviewSubtype: true } },
          participants: true,
          feedbacks: true,
          rescheduleRequests: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { scheduledAt: "asc" },
      }),
      db.interview.findMany({
        where: { companyId: employer.companyId },
        select: {
          status: true,
          scheduledAt: true,
          candidateAttendance: true,
          feedbacks: { select: { id: true } },
          participants: { select: { id: true } },
        },
      }),
    ]);

    // Calculate metrics
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    let upcomingCount = 0;
    let todayCount = 0;
    let pendingFeedbackCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let noShowCount = 0;

    for (const item of allCompanyInterviews) {
      const sDate = new Date(item.scheduledAt);
      if (item.status === "SCHEDULED" || item.status === "CONFIRMED" || item.status === "RESCHEDULED") {
        if (sDate >= now) upcomingCount++;
        if (sDate >= startOfToday && sDate <= endOfToday) todayCount++;
      }
      if (item.status === "COMPLETED") completedCount++;
      if (item.status === "CANCELLED") cancelledCount++;
      if (item.status === "NO_SHOW" || item.candidateAttendance === "NO_SHOW") noShowCount++;

      // Pending feedback: interview is completed or past, but participant feedbacks are missing
      if (sDate < now && item.status !== "CANCELLED" && item.status !== "NO_SHOW") {
        if (item.feedbacks.length < Math.max(item.participants.length, 1)) {
          pendingFeedbackCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      interviews: interviews.map((i) => ({
        id: i.id,
        applicationId: i.applicationId,
        candidateName: i.candidateName,
        candidateEmail: i.candidateEmail,
        title: i.title,
        interviewType: i.interviewType,
        subtype: i.subtype,
        status: i.status,
        mode: i.mode,
        scheduledAt: i.scheduledAt,
        durationMinutes: i.durationMinutes,
        meetingLink: i.meetingLink,
        location: i.location,
        phoneDetails: i.phoneDetails,
        notes: i.notes,
        feedback: i.feedback,
        rating: i.rating,
        jobTitle: i.job?.title || "Role Interview",
        interviewerName: i.interviewer?.name || "Hiring Team",
        stageName: i.stage?.name || "Interview Stage",
        candidateConfirmation: i.candidateConfirmation,
        candidateConfirmedAt: i.candidateConfirmedAt,
        candidateAttendance: i.candidateAttendance,
        actualStart: i.actualStart,
        actualEnd: i.actualEnd,
        actualDuration: i.actualDuration,
        participants: i.participants,
        feedbacks: i.feedbacks,
        rescheduleRequests: i.rescheduleRequests,
        secureToken: i.secureToken,
      })),
      metrics: {
        upcomingCount,
        todayCount,
        pendingFeedbackCount,
        completedCount,
        cancelledCount,
        noShowCount,
        total: allCompanyInterviews.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      applicationId,
      jobId,
      stageId,
      candidateName,
      candidateEmail,
      title,
      interviewType,
      subtype,
      mode,
      scheduledAt,
      durationMinutes,
      meetingLink,
      location,
      phoneDetails,
      hiringManagerId,
      candidateConfirmation,
      candidateRescheduling,
      feedbackRequired,
      notes,
      interviewers = [],
    } = body;

    if (!applicationId && (!candidateName || !jobId)) {
      return NextResponse.json(
        { error: "Application or candidate name and job are required." },
        { status: 400 }
      );
    }

    if (!scheduledAt) {
      return NextResponse.json({ error: "Scheduled date/time is required." }, { status: 400 });
    }

    // Resolve or auto-create application if scheduling directly by candidate name
    let targetAppId = applicationId;
    if (!targetAppId) {
      const anyJob = await db.job.findFirst({ where: { companyId: employer.companyId } });
      if (!anyJob) {
        return NextResponse.json({ error: "Please post a job before scheduling an interview." }, { status: 400 });
      }
      const newApp = await db.application.create({
        data: {
          jobId: jobId || anyJob.id,
          candidateName,
          candidateEmail: candidateEmail || "candidate@example.com",
          candidatePhone: "+91 98400 00000",
          status: "INTERVIEW_SCHEDULED",
        },
      });
      targetAppId = newApp.id;
    }

    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Use primary interviewer if interviewers list is empty
    const resolvedInterviewers = interviewers.length > 0
      ? interviewers
      : [{ userId: employer.id, name: employer.name, email: employer.email, roleTitle: "Lead Interviewer" }];

    const interview = await scheduleInterview({
      companyId: employer.companyId,
      actorId: employer.id,
      actorName: employer.name,
      actorEmail: employer.email,
      actorRole: employer.role,
      applicationId: targetAppId,
      jobId,
      stageId,
      title: title || `${subtype || "Technical"} Round - ${candidateName || "Candidate"}`,
      interviewType,
      subtype,
      mode,
      scheduledAt,
      durationMinutes,
      meetingLink,
      location,
      phoneDetails,
      hiringManagerId,
      candidateConfirmation,
      candidateRescheduling,
      feedbackRequired,
      notes,
      interviewers: resolvedInterviewers,
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      interview,
      message: "Interview scheduled successfully and invitation dispatched.",
    });
  } catch (error: any) {
    console.error("Error scheduling interview:", error);
    return NextResponse.json({ error: error.message || "Failed to schedule interview" }, { status: 500 });
  }
}
