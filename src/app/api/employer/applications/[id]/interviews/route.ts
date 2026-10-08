import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";
import { queueAndSendEmail } from "@/lib/email/outbox";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    // Derive application directly from DB using companyId
    const application = await db.application.findFirst({
      where: {
        id: params.id,
        job: { companyId: employer.companyId },
      },
      include: {
        job: { include: { company: true } },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      interviewType = "TECHNICAL",
      subtype,
      mode = "VIDEO",
      scheduledAt,
      durationMinutes = 45,
      meetingLink,
      location,
      phoneDetails,
      notes,
      interviewers = [],
    } = body;

    if (!scheduledAt) {
      return NextResponse.json({ error: "scheduledAt is required." }, { status: 400 });
    }

    const parsedDate = new Date(scheduledAt);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid scheduledAt date format." }, { status: 400 });
    }

    if (parsedDate.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Interview scheduled time must be in the future." }, { status: 400 });
    }

    // Always derive jobId, candidateName, candidateEmail from application record
    const targetJobId = application.jobId;
    const secureToken = crypto.randomBytes(24).toString("hex");

    // Format interviewer participants
    const validatedInterviewers = Array.isArray(interviewers) && interviewers.length > 0
      ? interviewers
      : [{ userId: employer.id, name: employer.name, email: employer.email, roleTitle: employer.role }];

    const interview = await db.interview.create({
      data: {
        applicationId: application.id,
        jobId: targetJobId, // STRICTLY from application, never from client body
        companyId: employer.companyId,
        stageId: application.currentStageId,
        title: title || `${subtype || interviewType} Round - ${application.candidateName}`,
        interviewType: interviewType as any,
        subtype: subtype || "Technical Interview",
        status: "SCHEDULED",
        mode,
        scheduledAt: parsedDate,
        durationMinutes: Number(durationMinutes) || 45,
        meetingLink: mode === "VIDEO" ? (meetingLink || "https://meet.google.com/careerbridge-interview") : null,
        location: mode === "IN_PERSON" ? location : null,
        phoneDetails: mode === "PHONE" ? phoneDetails : null,
        secureToken,
        notes: notes || null,
        candidateName: application.candidateName,
        candidateEmail: application.candidateEmail,
        interviewerId: validatedInterviewers[0]?.userId || employer.id,
        participants: {
          create: validatedInterviewers.map((inv: any) => ({
            userId: inv.userId || null,
            name: inv.name || employer.name,
            email: inv.email || employer.email,
            roleTitle: inv.roleTitle || "Interviewer",
            attendance: "PENDING",
          })),
        },
      },
      include: {
        participants: true,
      },
    });

    // Update application status
    await db.application.update({
      where: { id: application.id },
      data: { status: "INTERVIEW_SCHEDULED" },
    });

    // Log timeline event
    await db.applicationEvent.create({
      data: {
        applicationId: application.id,
        actorId: employer.id,
        actorName: employer.name,
        actorRole: employer.role,
        action: "INTERVIEW_SCHEDULED",
        metadata: {
          interviewId: interview.id,
          title: interview.title,
          scheduledAt: parsedDate.toISOString(),
          durationMinutes: interview.durationMinutes,
          mode: interview.mode,
          meetingLink: interview.meetingLink,
          interviewers: validatedInterviewers.map((i: any) => i.name),
        },
      },
    });

    // Build public interview candidate URL
    const appBaseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const candidateInterviewUrl = `${appBaseUrl}/candidate/interviews/${secureToken}`;

    // Dispatch interview invitation to candidate through Outbox
    if (application.candidateEmail && application.candidateEmail.includes("@")) {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #2563eb; margin-bottom: 12px;">Interview Scheduled: ${interview.title}</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hi ${application.candidateName},</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">An interview has been scheduled for your application to <strong>${application.job.title}</strong> at <strong>${application.job.company.name}</strong>.</p>
          <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0; color: #1e293b;"><strong>Date & Time:</strong> ${parsedDate.toLocaleString()}</p>
            <p style="margin: 4px 0; color: #1e293b;"><strong>Duration:</strong> ${interview.durationMinutes} minutes</p>
            <p style="margin: 4px 0; color: #1e293b;"><strong>Format:</strong> ${interview.mode}</p>
            ${interview.meetingLink ? `<p style="margin: 4px 0; color: #1e293b;"><strong>Meeting Link:</strong> <a href="${interview.meetingLink}" style="color: #2563eb;">Join Video Call</a></p>` : ""}
          </div>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${candidateInterviewUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Interview Details & Access</a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Warm regards,<br/><strong>${application.job.company.name} Hiring Team</strong></p>
        </div>
      `;

      await queueAndSendEmail({
        to: application.candidateEmail,
        companyId: employer.companyId,
        applicationId: application.id,
        subject: `Interview Scheduled – ${interview.title} at ${application.job.company.name}`,
        html,
        template: "CANDIDATE_INTERVIEW_SCHEDULED",
        payload: { interviewId: interview.id, applicationId: application.id, companyId: employer.companyId },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Interview scheduled successfully.",
      interview,
      candidateInterviewUrl,
    });
  } catch (err: any) {
    console.error("Error scheduling interview:", err);
    return NextResponse.json(
      { error: err.message || "Failed to schedule interview." },
      { status: 500 }
    );
  }
}
