import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/admin/audit";
import { createTransporter } from "@/lib/email/mailer";
import { resolveNotificationRecipient } from "@/lib/notifications";
import crypto from "crypto";

export interface ScheduleInterviewParams {
  companyId: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  applicationId: string;
  jobId?: string;
  stageId?: string;
  title: string;
  interviewType?: string;
  subtype?: string;
  mode?: "VIDEO" | "PHONE" | "IN_PERSON";
  scheduledAt: string | Date;
  durationMinutes?: number;
  meetingLink?: string;
  location?: string;
  phoneDetails?: string;
  hiringManagerId?: string;
  candidateConfirmation?: boolean;
  candidateRescheduling?: boolean;
  feedbackRequired?: boolean;
  notes?: string;
  interviewers: Array<{
    userId?: string;
    name: string;
    email: string;
    roleTitle?: string;
  }>;
  ipAddress?: string;
  userAgent?: string;
}

export async function scheduleInterview(params: ScheduleInterviewParams) {
  const {
    companyId,
    actorId,
    actorName,
    actorEmail,
    actorRole,
    applicationId,
    stageId,
    title,
    interviewType = "TECHNICAL",
    subtype,
    mode = "VIDEO",
    scheduledAt,
    durationMinutes = 45,
    meetingLink,
    location,
    phoneDetails,
    hiringManagerId,
    candidateConfirmation = true,
    candidateRescheduling = true,
    feedbackRequired = true,
    notes,
    interviewers = [],
    ipAddress,
    userAgent,
  } = params;

  // 1. Verify application belongs to employer company
  const application = await db.application.findFirst({
    where: { id: applicationId, job: { companyId } },
    include: {
      job: { include: { company: true } },
    },
  });

  if (!application) {
    throw new Error("Application not found or unauthorized for your company.");
  }

  const targetJobId = application.jobId;
  const secureToken = crypto.randomBytes(24).toString("hex");
  const parsedDate = new Date(scheduledAt);

  // 2. Create Interview Record
  const interview = await db.interview.create({
    data: {
      applicationId: application.id,
      jobId: targetJobId,
      companyId,
      stageId: stageId || application.currentStageId,
      title: title || `${subtype || interviewType} Round - ${application.candidateName}`,
      interviewType: (interviewType as any) || "TECHNICAL",
      subtype: subtype || "Technical Interview",
      status: "SCHEDULED",
      mode,
      scheduledAt: parsedDate,
      durationMinutes: Number(durationMinutes) || 45,
      meetingLink: mode === "VIDEO" ? (meetingLink || "https://meet.google.com/xyz-careerbridge") : null,
      location: mode === "IN_PERSON" ? location : null,
      phoneDetails: mode === "PHONE" ? phoneDetails : null,
      hiringManagerId,
      candidateConfirmation,
      candidateRescheduling,
      feedbackRequired,
      secureToken,
      notes,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      interviewerId: interviewers[0]?.userId || actorId,
      participants: {
        create: interviewers.map((inv) => ({
          userId: inv.userId || null,
          name: inv.name,
          email: inv.email,
          roleTitle: inv.roleTitle || "Interviewer",
          attendance: "PENDING",
        })),
      },
    },
    include: {
      participants: true,
      stage: true,
      job: true,
    },
  });

  // 3. Update application status
  await db.application.update({
    where: { id: application.id },
    data: { status: "INTERVIEW_SCHEDULED" },
  });

  // 4. Log timeline event
  await db.applicationEvent.create({
    data: {
      applicationId: application.id,
      actorId,
      actorName,
      actorRole,
      action: "INTERVIEW_SCHEDULED",
      metadata: {
        interviewId: interview.id,
        title: interview.title,
        subtype: interview.subtype,
        scheduledAt: parsedDate.toISOString(),
        durationMinutes: interview.durationMinutes,
        mode: interview.mode,
        meetingLink: interview.meetingLink,
        location: interview.location,
        interviewers: interviewers.map((i) => i.name),
      },
    },
  });

  // 5. Create in-app notifications
  await db.notification.create({
    data: {
      companyId,
      recipientEmail: application.candidateEmail,
      title: `Interview Scheduled: ${interview.title}`,
      message: `Your interview with ${application.job.company.name} has been scheduled for ${parsedDate.toLocaleString("en-IN")}.`,
      type: "INTERVIEW_SCHEDULED",
      link: `/candidate/interviews/${secureToken}`,
    },
  }).catch(() => {});

  // 6. Dispatch live email via SMTP
  try {
    const transporter = createTransporter();
    if (transporter && application.candidateEmail.includes("@")) {
      const formattedDate = parsedDate.toLocaleString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
      const confirmUrl = `${baseUrl}/candidate/interviews/${secureToken}`;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"${application.job.company.name} Recruitment" <${process.env.SMTP_USER}>`,
        to: application.candidateEmail,
        subject: `🗓️ Interview Scheduled: ${interview.title} (${application.job.company.name})`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; color: #1e293b;">
            <div style="max-width: 540px; margin: 0 auto; background: #ffffff; padding: 28px; border-radius: 16px; border: 1px solid #e2e8f0;">
              <h2 style="color: #2563eb; margin-top: 0;">Interview Scheduled</h2>
              <p>Dear <strong>${application.candidateName}</strong>,</p>
              <p>You have been invited for an interview for the <strong>${application.job.title}</strong> role at <strong>${application.job.company.name}</strong>.</p>
              <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; margin: 20px 0; font-size: 14px;">
                <p style="margin: 4px 0;"><strong>Round:</strong> ${interview.title}</p>
                <p style="margin: 4px 0;"><strong>Date &amp; Time:</strong> ${formattedDate}</p>
                <p style="margin: 4px 0;"><strong>Duration:</strong> ${interview.durationMinutes} Minutes</p>
                <p style="margin: 4px 0;"><strong>Mode:</strong> ${interview.mode}</p>
                ${interview.meetingLink ? `<p style="margin: 4px 0;"><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>` : ""}
                ${interview.location ? `<p style="margin: 4px 0;"><strong>Location:</strong> ${interview.location}</p>` : ""}
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${confirmUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">View, Confirm or Reschedule Interview &rarr;</a>
              </div>
            </div>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error("[EMAIL ERROR] Failed to dispatch interview schedule email:", err);
  }

  // 7. Audit log
  await recordAuditLog({
    actorId,
    actorEmail,
    actorRole: actorRole as any,
    action: "INTERVIEW_SCHEDULED",
    entityType: "INTERVIEW",
    entityId: interview.id,
    reason: `Scheduled ${interview.title} for ${application.candidateName}`,
    afterJson: JSON.stringify({ scheduledAt: parsedDate, mode, interviewers: interviewers.map((i) => i.name) }),
    ipAddress,
    userAgent,
  }).catch(() => {});

  return interview;
}

export async function confirmInterview(param: string | { token?: string; id?: string } | null | undefined) {
  if (!param) {
    throw new Error("Interview token or ID is required.");
  }
  const tokenOrId = typeof param === "string" ? param : param.token || param.id;
  if (!tokenOrId) {
    throw new Error("Interview token or ID is required.");
  }
  const interview = await db.interview.findFirst({
    where: {
      OR: [{ secureToken: tokenOrId }, { id: tokenOrId }],
    },
    include: { application: true, company: true, job: { include: { company: true } } },
  });

  if (!interview) {
    throw new Error("Interview not found.");
  }

  const updated = await db.interview.update({
    where: { id: interview.id },
    data: {
      status: "CONFIRMED",
      candidateConfirmedAt: new Date(),
    },
  });

  await db.applicationEvent.create({
    data: {
      applicationId: interview.applicationId,
      actorName: interview.candidateName,
      actorRole: "CANDIDATE",
      action: "CANDIDATE_CONFIRMED_INTERVIEW",
      metadata: {
        interviewId: interview.id,
        confirmedAt: new Date().toISOString(),
      },
    },
  });

  // Fetch proper employer user / recruiter email for notification
  const recipient = await resolveNotificationRecipient({
    companyId: interview.companyId,
    applicationId: interview.applicationId,
    preferredUserId: interview.interviewerId,
  });

  await db.notification.create({
    data: {
      companyId: interview.companyId,
      applicationId: interview.applicationId,
      userId: recipient.userId,
      recipientEmail: recipient.email,
      isUnrouted: recipient.isUnrouted,
      title: `Interview Confirmed: ${interview.candidateName}`,
      message: `${interview.candidateName} has confirmed attendance for ${interview.title}.`,
      type: "INTERVIEW_CONFIRMED",
      link: `/employer/interviews/${interview.id}`,
    },
  }).catch(() => {});

  return { success: true, interview: updated };
}

export async function requestInterviewReschedule(
  param: string | { token?: string; id?: string; reason?: string; preferredDate?: string; preferredTime?: string } | null | undefined,
  reasonArg?: string,
  preferredDateArg?: string,
  preferredTimeArg?: string
) {
  if (!param) {
    throw new Error("Interview token or ID is required.");
  }
  const tokenOrId = typeof param === "string" ? param : param.token || param.id;
  const reason = (typeof param === "string" ? reasonArg : param.reason) || "Candidate requested reschedule";
  const preferredDate = typeof param === "string" ? preferredDateArg : param.preferredDate;
  const preferredTime = typeof param === "string" ? preferredTimeArg : param.preferredTime;

  if (!tokenOrId) {
    throw new Error("Interview token or ID is required.");
  }

  const interview = await db.interview.findFirst({
    where: {
      OR: [{ secureToken: tokenOrId }, { id: tokenOrId }],
    },
    include: { application: true, company: true, job: { include: { company: true } } },
  });

  if (!interview) {
    throw new Error("Interview not found.");
  }

  const req = await db.interviewRescheduleRequest.create({
    data: {
      interviewId: interview.id,
      reason,
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      preferredTime,
      status: "PENDING",
    },
  });

  await db.interview.update({
    where: { id: interview.id },
    data: { status: "RESCHEDULE_REQUESTED" },
  });

  await db.applicationEvent.create({
    data: {
      applicationId: interview.applicationId,
      actorName: interview.candidateName,
      actorRole: "CANDIDATE",
      action: "RESCHEDULE_REQUESTED",
      metadata: {
        interviewId: interview.id,
        reason,
        preferredDate,
        preferredTime,
      },
    },
  });

  // Fetch proper employer user / recruiter email for notification
  let recipientEmail = "recruiter@careerbridge.com";
  let recipientUserId: string | null = null;

  // Fetch proper employer user / recruiter email for notification
  const recipient = await resolveNotificationRecipient({
    companyId: interview.companyId,
    applicationId: interview.applicationId,
    preferredUserId: interview.interviewerId,
  });

  await db.notification.create({
    data: {
      companyId: interview.companyId,
      applicationId: interview.applicationId,
      userId: recipient.userId,
      recipientEmail: recipient.email,
      isUnrouted: recipient.isUnrouted,
      title: `Reschedule Request: ${interview.candidateName}`,
      message: `${interview.candidateName} requested to reschedule ${interview.title}: "${reason}".`,
      type: "RESCHEDULE_REQUESTED",
      link: `/employer/interviews/${interview.id}`,
    },
  }).catch(() => {});

  return { success: true, rescheduleRequest: req };
}

export async function approveInterviewReschedule(params: {
  companyId: string;
  interviewId: string;
  action?: "APPROVE" | "REJECT";
  requestId?: string;
  newDate?: string | Date;
  newTime?: string;
  durationMinutes?: number;
  newDuration?: number;
  meetingLink?: string;
  decisionNote?: string;
  rejectionReason?: string;
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
}) {
  const {
    companyId,
    interviewId,
    action = "APPROVE",
    requestId,
    newDate,
    newTime,
    durationMinutes,
    newDuration,
    meetingLink,
    decisionNote,
    rejectionReason,
    actorId = "system",
    actorName = "Recruiter",
    actorEmail = "recruiter@careerbridge.com",
    actorRole = "EMPLOYER",
  } = params;

  const interview = await db.interview.findFirst({
    where: { id: interviewId, companyId },
    include: { application: true, job: { include: { company: true } } },
  });

  if (!interview) {
    throw new Error("Interview not found or unauthorized.");
  }

  if (action === "REJECT") {
    await db.interviewRescheduleRequest.updateMany({
      where: {
        interviewId,
        ...(requestId ? { id: requestId } : {}),
        status: "PENDING",
      },
      data: {
        status: "REJECTED",
        decidedBy: actorName,
        decidedAt: new Date(),
        decisionNote: rejectionReason || decisionNote || "Cannot reschedule due to panel constraints.",
      },
    });

    await db.interview.update({
      where: { id: interviewId },
      data: { status: "SCHEDULED" },
    });

    return { success: true, interview };
  }

  const effectiveDate = newDate ? new Date(newDate) : new Date();
  const effectiveDuration = durationMinutes || newDuration || interview.durationMinutes;

  const updated = await db.interview.update({
    where: { id: interviewId },
    data: {
      status: "RESCHEDULED",
      scheduledAt: effectiveDate,
      durationMinutes: Number(effectiveDuration),
      meetingLink: meetingLink || interview.meetingLink,
      candidateConfirmedAt: null, // Reset so candidate confirms new slot
    },
  });

  await db.interviewRescheduleRequest.updateMany({
    where: {
      interviewId,
      ...(requestId ? { id: requestId } : {}),
      status: "PENDING",
    },
    data: {
      status: "APPROVED",
      decidedBy: actorName,
      decidedAt: new Date(),
      decisionNote,
    },
  });

  await db.applicationEvent.create({
    data: {
      applicationId: interview.applicationId,
      actorId,
      actorName,
      actorRole,
      action: "INTERVIEW_RESCHEDULED",
      metadata: {
        interviewId,
        newDate: effectiveDate.toISOString(),
        meetingLink: meetingLink || interview.meetingLink,
        note: decisionNote,
      },
    },
  });

  // Notify candidate via email
  try {
    const transporter = createTransporter();
    if (transporter && interview.candidateEmail.includes("@")) {
      const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"${interview.job.company.name}" <${process.env.SMTP_USER}>`,
        to: interview.candidateEmail,
        subject: `🔄 Interview Rescheduled: ${interview.title} (${interview.job.company.name})`,
        html: `
          <div style="font-family: sans-serif; padding: 24px;">
            <h3>Interview Rescheduled</h3>
            <p>Your interview has been rescheduled to <strong>${effectiveDate.toLocaleString("en-IN")}</strong>.</p>
            <p><a href="${baseUrl}/candidate/interviews/${interview.secureToken}">Confirm New Interview Schedule &rarr;</a></p>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error("Reschedule email err:", err);
  }

  return { success: true, interview: updated };
}

export async function cancelInterview(params: {
  companyId: string;
  interviewId: string;
  reason: string;
  notifyCandidate?: boolean;
  cancelledById?: string;
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
}) {
  const {
    companyId,
    interviewId,
    reason,
    notifyCandidate = true,
    cancelledById,
    actorId = cancelledById || "system",
    actorName = "Recruiter",
    actorRole = "EMPLOYER",
  } = params;

  const interview = await db.interview.findFirst({
    where: { id: interviewId, companyId },
    include: { application: true, job: { include: { company: true } } },
  });

  if (!interview) {
    throw new Error("Interview not found or unauthorized.");
  }

  const updated = await db.interview.update({
    where: { id: interviewId },
    data: {
      status: "CANCELLED",
      cancellationReason: reason,
      cancelledBy: actorName,
      cancelledAt: new Date(),
    },
  });

  await db.applicationEvent.create({
    data: {
      applicationId: interview.applicationId,
      actorId,
      actorName,
      actorRole,
      action: "INTERVIEW_CANCELLED",
      metadata: { interviewId, reason },
    },
  });

  if (notifyCandidate && interview.candidateEmail.includes("@")) {
    try {
      const transporter = createTransporter();
      if (transporter) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"${interview.job.company.name}" <${process.env.SMTP_USER}>`,
          to: interview.candidateEmail,
          subject: `⚠️ Interview Cancelled: ${interview.title} (${interview.job.company.name})`,
          html: `<p>Your interview for ${interview.job.title} has been cancelled. Reason: ${reason}</p>`,
        });
      }
    } catch (e) {
      console.error("Cancel email err:", e);
    }
  }

  return { success: true, interview: updated };
}

export async function recordInterviewAttendance(params: {
  companyId: string;
  interviewId: string;
  candidateAttendance: "ATTENDED" | "NO_SHOW" | "LATE" | "LEFT_EARLY" | "CANCELLED" | "RESCHEDULED" | string;
  actualStart?: string | Date;
  actualEnd?: string | Date;
  actualDuration?: number;
  notes?: string;
  attendanceNotes?: string;
  recordedById?: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  interviewerAttendances?: Array<{ participantId: string; attendanceStatus?: string; attendance?: string }>;
}) {
  const {
    companyId,
    interviewId,
    candidateAttendance,
    actualStart,
    actualEnd,
    actualDuration: customDuration,
    notes,
    attendanceNotes = notes,
    recordedById,
    actorId = recordedById || "system",
    actorName = "Recruiter",
    actorRole = "EMPLOYER",
    interviewerAttendances = [],
  } = params;

  const interview = await db.interview.findFirst({
    where: { id: interviewId, companyId },
    include: { application: true },
  });

  if (!interview) {
    throw new Error("Interview not found.");
  }

  const pStart = actualStart ? new Date(actualStart) : null;
  const pEnd = actualEnd ? new Date(actualEnd) : null;
  const calcDuration =
    customDuration !== undefined
      ? customDuration
      : pStart && pEnd
      ? Math.round((pEnd.getTime() - pStart.getTime()) / 60000)
      : null;

  const newStatus =
    candidateAttendance === "NO_SHOW"
      ? "NO_SHOW"
      : candidateAttendance === "ATTENDED"
      ? "COMPLETED"
      : interview.status;

  const updated = await db.interview.update({
    where: { id: interviewId },
    data: {
      status: newStatus as any,
      candidateAttendance,
      actualStart: pStart,
      actualEnd: pEnd,
      actualDuration: calcDuration,
      attendanceRecordedAt: new Date(),
      attendanceRecordedBy: actorName,
      attendanceNotes,
    },
  });

  // Record interviewer attendances
  for (const ia of interviewerAttendances) {
    const statusVal = ia.attendanceStatus || ia.attendance || "ATTENDED";
    await db.interviewParticipant
      .update({
        where: { id: ia.participantId },
        data: {
          attendance: statusVal,
          attendanceRecordedAt: new Date(),
        },
      })
      .catch(() => {});
  }

  await db.applicationEvent.create({
    data: {
      applicationId: interview.applicationId,
      actorId,
      actorName,
      actorRole,
      action: candidateAttendance === "NO_SHOW" ? "CANDIDATE_NO_SHOW" : "INTERVIEW_ATTENDANCE_RECORDED",
      metadata: {
        interviewId,
        candidateAttendance,
        actualStart: pStart?.toISOString(),
        actualEnd: pEnd?.toISOString(),
        actualDuration: calcDuration,
        notes: attendanceNotes,
      },
    },
  });

  return { success: true, interview: updated };
}

export async function submitInterviewFeedback(params: {
  companyId: string;
  interviewId: string;
  participantId?: string;
  interviewerId?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  technicalScore?: number;
  technicalRating?: number;
  problemSolvingScore?: number;
  problemSolvingRating?: number;
  communicationScore?: number;
  communicationRating?: number;
  roleKnowledgeScore?: number;
  roleKnowledgeRating?: number;
  overallRating: number;
  strengths?: string;
  concerns?: string;
  recommendation: "STRONG_HIRE" | "HIRE" | "MAYBE" | "NO_HIRE" | string;
  comments?: string;
}) {
  const {
    companyId,
    interviewId,
    participantId,
    interviewerId,
    interviewerName = "Interviewer",
    interviewerEmail = "interviewer@careerbridge.com",
    technicalScore = params.technicalRating,
    problemSolvingScore = params.problemSolvingRating,
    communicationScore = params.communicationRating,
    roleKnowledgeScore = params.roleKnowledgeRating,
    overallRating,
    strengths,
    concerns,
    recommendation,
    comments,
  } = params;

  const interview = await db.interview.findFirst({
    where: { id: interviewId, companyId },
  });

  if (!interview) {
    throw new Error("Interview not found or unauthorized.");
  }

  const feedback = await db.interviewFeedback.create({
    data: {
      interviewId,
      participantId,
      interviewerId,
      interviewerName,
      interviewerEmail,
      technicalScore: technicalScore ? Number(technicalScore) : null,
      problemSolvingScore: problemSolvingScore ? Number(problemSolvingScore) : null,
      communicationScore: communicationScore ? Number(communicationScore) : null,
      roleKnowledgeScore: roleKnowledgeScore ? Number(roleKnowledgeScore) : null,
      overallRating: Number(overallRating) || 3,
      strengths,
      concerns,
      recommendation,
      comments,
    },
  });

  // Check aggregate rating
  const allFeedbacks = await db.interviewFeedback.findMany({ where: { interviewId } });
  const avgRating = Math.round(allFeedbacks.reduce((acc, f) => acc + f.overallRating, 0) / allFeedbacks.length);

  await db.interview.update({
    where: { id: interviewId },
    data: {
      rating: avgRating,
      feedback: `Recommendation: ${recommendation}. ${comments || ""}`,
    },
  });

  await db.applicationEvent.create({
    data: {
      applicationId: interview.applicationId,
      actorName: interviewerName,
      actorRole: "INTERVIEWER",
      action: "INTERVIEW_FEEDBACK_SUBMITTED",
      metadata: {
        interviewId,
        overallRating,
        recommendation,
        interviewerName,
      },
    },
  });

  return { success: true, feedback };
}

export async function shortlistCandidate(params: {
  companyId: string;
  interviewId?: string;
  applicationId?: string;
  nextStageId?: string;
  sendEmail?: boolean;
  sendInAppNotification?: boolean;
  sendNotification?: boolean;
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  notes?: string;
}) {
  let targetAppId = params.applicationId;
  if (!targetAppId && params.interviewId) {
    const inv = await db.interview.findUnique({
      where: { id: params.interviewId },
      select: { applicationId: true },
    });
    if (inv) targetAppId = inv.applicationId;
  }

  if (!targetAppId) {
    throw new Error("Application ID or valid Interview ID required.");
  }

  const {
    companyId,
    nextStageId,
    sendEmail = true,
    sendInAppNotification = params.sendNotification !== false,
    actorId = "system",
    actorName = "Recruiter",
    actorRole = "EMPLOYER",
    notes,
  } = params;

  const application = await db.application.findFirst({
    where: { id: targetAppId, job: { companyId } },
    include: {
      job: { include: { company: true } },
      currentStage: true,
    },
  });

  if (!application) {
    throw new Error("Application not found.");
  }

  let nextStage = null;
  if (nextStageId) {
    nextStage = await db.pipelineStage.findUnique({ where: { id: nextStageId } });
  }

  const updated = await db.application.update({
    where: { id: targetAppId },
    data: {
      status: "SHORTLISTED",
      currentStageId: nextStageId || application.currentStageId,
      statusNotes: notes || "Candidate shortlisted after interview evaluation.",
    },
  });

  await db.applicationEvent.create({
    data: {
      applicationId: targetAppId,
      actorId,
      actorName,
      actorRole,
      action: "CANDIDATE_SHORTLISTED",
      metadata: {
        previousStage: application.currentStage?.name || "Interview",
        newStage: nextStage?.name || "Next Round",
        notes,
      },
    },
  });

  if (sendInAppNotification) {
    await db.notification
      .create({
        data: {
          companyId,
          recipientEmail: application.candidateEmail,
          title: `Congratulations! You're Shortlisted for ${application.job.title}`,
          message: `You have successfully progressed to ${nextStage?.name || "the next round"} at ${application.job.company.name}.`,
          type: "SHORTLISTED",
          link: `/candidate/applications/${application.id}`,
        },
      })
      .catch(() => {});
  }

  if (sendEmail && application.candidateEmail.includes("@")) {
    try {
      const transporter = createTransporter();
      if (transporter) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"${application.job.company.name}" <${process.env.SMTP_USER}>`,
          to: application.candidateEmail,
          subject: `🎉 You're Shortlisted – ${application.job.title} at ${application.job.company.name}`,
          html: `
            <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; color: #1e293b;">
              <div style="max-width: 520px; margin: 0 auto; background: #ffffff; padding: 28px; border-radius: 16px; border: 1px solid #e2e8f0;">
                <h2 style="color: #059669; margin-top: 0;">Congratulations ${application.candidateName}!</h2>
                <p>We are delighted to inform you that you have been <strong>shortlisted</strong> for the <strong>${application.job.title}</strong> role at <strong>${application.job.company.name}</strong>.</p>
                <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
                  <strong>Next Step:</strong> ${nextStage?.name || "Next Recruitment Stage"}<br/>
                  Our recruitment team will be in touch shortly with scheduling details.
                </div>
                <p style="font-size: 13px; color: #64748b;">Warm regards,<br/><strong>${application.job.company.name} Talent Acquisition</strong></p>
              </div>
            </div>
          `,
        });
      }
    } catch (e) {
      console.error("Shortlist email error:", e);
    }
  }

  return { success: true, application: updated };
}

export async function rejectCandidate(params: {
  companyId: string;
  interviewId?: string;
  applicationId?: string;
  reason: string;
  internalNote?: string;
  sendEmail?: boolean;
  sendInAppNotification?: boolean;
  sendNotification?: boolean;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
}) {
  let targetAppId = params.applicationId;
  if (!targetAppId && params.interviewId) {
    const inv = await db.interview.findUnique({
      where: { id: params.interviewId },
      select: { applicationId: true },
    });
    if (inv) targetAppId = inv.applicationId;
  }

  if (!targetAppId) {
    throw new Error("Application ID or valid Interview ID required.");
  }

  const {
    companyId,
    reason,
    internalNote,
    sendEmail = true,
    sendInAppNotification = params.sendNotification !== false,
    actorId = "system",
    actorName = "Recruiter",
    actorRole = "EMPLOYER",
  } = params;

  const application = await db.application.findFirst({
    where: { id: targetAppId, job: { companyId } },
    include: { job: { include: { company: true } } },
  });

  if (!application) {
    throw new Error("Application not found.");
  }

  const updated = await db.application.update({
    where: { id: targetAppId },
    data: {
      status: "REJECTED",
      statusNotes: `Reason: ${reason}. Internal Note: ${internalNote || "N/A"}`,
    },
  });

  await db.applicationEvent.create({
    data: {
      applicationId: targetAppId,
      actorId,
      actorName,
      actorRole,
      action: "CANDIDATE_REJECTED",
      metadata: {
        reason,
        internalNote, // Kept strictly server-side / employer only
      },
    },
  });

  if (sendInAppNotification) {
    await db.notification
      .create({
        data: {
          companyId,
          recipientEmail: application.candidateEmail,
          title: `Update regarding your application for ${application.job.title}`,
          message: `Thank you for taking the time to participate in our recruitment process at ${application.job.company.name}.`,
          type: "REJECTED",
          link: `/candidate/applications/${application.id}`,
        },
      })
      .catch(() => {});
  }

  if (sendEmail && application.candidateEmail.includes("@")) {
    try {
      const transporter = createTransporter();
      if (transporter) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"${application.job.company.name}" <${process.env.SMTP_USER}>`,
          to: application.candidateEmail,
          subject: `Update on Your Application – ${application.job.title}`,
          html: `
            <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; color: #1e293b;">
              <div style="max-width: 520px; margin: 0 auto; background: #ffffff; padding: 28px; border-radius: 16px; border: 1px solid #e2e8f0;">
                <h3 style="color: #0f172a; margin-top: 0;">Application Update</h3>
                <p>Hi ${application.candidateName},</p>
                <p>Thank you for your interest in the <strong>${application.job.title}</strong> position at <strong>${application.job.company.name}</strong> and for taking the time to speak with our team.</p>
                <p>After careful consideration, we have decided not to proceed further with your application for this specific opening at this time.</p>
                <p>We appreciate your time, effort, and interest in our organization, and we wish you the very best in your professional career journey.</p>
                <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Sincerely,<br/><strong>${application.job.company.name} Hiring Team</strong><br/>via CareerBridge</p>
              </div>
            </div>
          `,
        });
      }
    } catch (e) {
      console.error("Rejection email error:", e);
    }
  }

  return { success: true, application: updated };
}

