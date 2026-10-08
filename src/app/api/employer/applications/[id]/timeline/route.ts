import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer } from "@/lib/employer/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await db.application.findFirst({
      where: {
        id: params.id,
        job: { companyId: employer.companyId },
      },
      include: {
        events: {
          orderBy: { createdAt: "desc" },
        },
        interviews: {
          include: {
            participants: true,
            feedbacks: true,
          },
          orderBy: { createdAt: "desc" },
        },
        offers: {
          orderBy: { createdAt: "desc" },
        },
        candidateAssessments: {
          include: { assessment: { select: { title: true } } },
          orderBy: { createdAt: "desc" },
        },
        notes: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (employer.role === "INTERVIEWER") {
      const hasInterview = await db.interview.findFirst({
        where: {
          applicationId: params.id,
          companyId: employer.companyId,
          OR: [
            { interviewerId: employer.id },
            { participants: { some: { userId: employer.id } } },
            { participants: { some: { email: employer.email } } },
          ],
        },
      });
      if (!hasInterview) {
        return NextResponse.json(
          { error: "Forbidden: You are only permitted to view timeline for candidates you are scheduled to interview." },
          { status: 403 }
        );
      }
    }

    // Build unified chronological timeline (Newest First)
    const rawEvents: Array<{
      id: string;
      action: string;
      actorName: string;
      actorRole: string;
      timestamp: Date;
      metadata?: any;
    }> = [];

    // 1. Initial Application submission
    rawEvents.push({
      id: `applied-${application.id}`,
      action: "Candidate Applied",
      actorName: application.candidateName,
      actorRole: "CANDIDATE",
      timestamp: application.appliedAt,
      metadata: { matchScore: application.matchScore },
    });

    // 2. Database Timeline Events
    for (const ev of application.events) {
      // If INTERVIEWER, completely filter out note events or redact note content
      if (employer.role === "INTERVIEWER" && (ev.action.includes("NOTE") || ev.action === "RECRUITER_NOTE_ADDED")) {
        continue;
      }
      rawEvents.push({
        id: ev.id,
        action: ev.action.replace(/_/g, " "),
        actorName: ev.actorName,
        actorRole: ev.actorRole,
        timestamp: ev.createdAt,
        metadata: ev.metadata,
      });
    }

    // 3. Interviews
    for (const intv of application.interviews) {
      // Interviewers only see interviews they are scheduled for
      if (employer.role === "INTERVIEWER") {
        const isPart = intv.interviewerId === employer.id || intv.participants.some((p) => p.userId === employer.id || p.email === employer.email);
        if (!isPart) continue;
      }

      rawEvents.push({
        id: `intv-${intv.id}`,
        action: `Interview Scheduled (${intv.interviewType})`,
        actorName: intv.participants[0]?.name || "Hiring Team",
        actorRole: "RECRUITER",
        timestamp: intv.createdAt,
        metadata: {
          title: intv.title,
          scheduledAt: intv.scheduledAt,
          meetingLink: intv.meetingLink,
          status: intv.status,
          rating: intv.rating,
        },
      });

      for (const fb of intv.feedbacks) {
        if (employer.role === "INTERVIEWER" && fb.interviewerEmail !== employer.email) {
          continue;
        }
        rawEvents.push({
          id: `intv-fb-${fb.id}`,
          action: "Interview Feedback Submitted",
          actorName: fb.interviewerName,
          actorRole: "INTERVIEWER",
          timestamp: fb.submittedAt || fb.updatedAt,
          metadata: { rating: fb.overallRating, recommendation: fb.recommendation, comments: fb.comments },
        });
      }
    }

    // 4. Assessments
    for (const asg of application.candidateAssessments) {
      rawEvents.push({
        id: `ass-asg-${asg.id}`,
        action: `Assessment Assigned (${asg.assessment.title})`,
        actorName: "Recruiter",
        actorRole: "RECRUITER",
        timestamp: asg.createdAt,
        metadata: { status: asg.status },
      });

      if (asg.submittedAt) {
        rawEvents.push({
          id: `ass-sub-${asg.id}`,
          action: `Assessment Completed (${asg.assessment.title})`,
          actorName: application.candidateName,
          actorRole: "CANDIDATE",
          timestamp: asg.submittedAt,
          metadata: { score: asg.score, passed: asg.passed },
        });
      }
    }

    // 5. Offers (hidden from INTERVIEWER)
    if (employer.role !== "INTERVIEWER") {
      for (const off of application.offers) {
        rawEvents.push({
          id: `offer-${off.id}`,
          action: `Formal Offer Extended (₹${off.baseSalaryLpa} LPA)`,
          actorName: "Company Admin",
          actorRole: "COMPANY_ADMIN",
          timestamp: off.createdAt,
          metadata: { roleTitle: off.roleTitle, status: off.status },
        });
      }
    }

    // Sort all events newest first (descending timestamp)
    rawEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const startIndex = (page - 1) * limit;
    const paginatedEvents = rawEvents.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      timeline: paginatedEvents,
      total: rawEvents.length,
      page,
      totalPages: Math.ceil(rawEvents.length / limit),
      notes: employer.role === "INTERVIEWER" ? [] : application.notes,
    });
  } catch (error: any) {
    console.error("Error fetching application timeline:", error);
    return NextResponse.json({ error: "Failed to fetch timeline" }, { status: 500 });
  }
}
