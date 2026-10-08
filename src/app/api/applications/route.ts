import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCandidate } from "@/lib/candidate/auth";
import { sendCandidateApplicationReceivedEmail } from "@/lib/email/mailer";
import { queueAndSendEmail } from "@/lib/email/outbox";
import { getCompanyStaffEmail } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const loggedInCandidate = await getCurrentCandidate();

    const body = await req.json();
    let {
      jobId,
      fullName,
      email,
      phone,
      location,
      currentCompany,
      currentRole,
      totalExpYears,
      currentCtc,
      expectedCtc,
      noticePeriod,
      resumeFileName,
      resumeUrl,
      coverNote,
      matchScore = 88,
    } = body;

    // Prefill from authenticated candidate session if available
    if (loggedInCandidate) {
      if (!fullName) fullName = loggedInCandidate.name;
      if (!email) email = loggedInCandidate.email;
    }

    if (!jobId || !fullName || !email) {
      return NextResponse.json(
        { error: "Missing required fields: jobId, fullName, email" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify job exists and is actively published
    const job = await db.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        pipeline: {
          include: {
            versions: {
              where: { isPublished: true },
              orderBy: { version: "desc" },
              include: {
                stages: { orderBy: { orderIndex: "asc" } },
              },
            },
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    if (job.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: `This job posting is not accepting applications (Status: ${job.status}).` },
        { status: 400 }
      );
    }

    // 2. Candidate User resolution
    let candidateUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!candidateUser) {
      candidateUser = await db.user.create({
        data: {
          email: normalizedEmail,
          name: fullName.trim(),
          passwordHash: "candidate_unclaimed_profile",
          role: "CANDIDATE",
          phone: phone || null,
        },
      });
    }

    const candidateId = loggedInCandidate?.id || candidateUser.id;

    // 3. Block duplicate applications to the same job
    const existingApplication = await db.application.findFirst({
      where: {
        jobId: job.id,
        OR: [
          { candidateId },
          { candidateEmail: normalizedEmail },
        ],
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 400 }
      );
    }

    // Determine initial stage and pipeline version
    const activeVersion = job.pipeline?.versions?.[0];
    const firstStage = activeVersion?.stages?.[0];

    // Parse numeric fields safely
    const expYears = parseFloat(totalExpYears) || 0;
    const currCtcNum = currentCtc ? parseFloat(currentCtc) : null;
    const expCtcNum = expectedCtc ? parseFloat(expectedCtc) : null;

    // 4. Create Application record
    const application = await db.application.create({
      data: {
        jobId: job.id,
        candidateId,
        candidateName: fullName.trim(),
        candidateEmail: normalizedEmail,
        candidatePhone: phone || "+91 90000 00000",
        currentCompany: currentCompany || null,
        currentRole: currentRole || null,
        experienceYears: expYears,
        currentCtc: currCtcNum,
        expectedCtc: expCtcNum,
        noticePeriod: noticePeriod || "30 Days",
        resumeFileName: resumeFileName || "Candidate_Resume.pdf",
        resumeUrl: resumeUrl || null,
        coverNote: coverNote || null,
        matchScore: typeof matchScore === "number" ? matchScore : 88,
        status: "SUBMITTED",
        pipelineVersionId: activeVersion?.id || null,
        currentStageId: firstStage?.id || null,
      },
      include: {
        job: {
          select: {
            title: true,
            company: { select: { id: true, name: true } },
          },
        },
      },
    });

    // 5. Create Chronological ApplicationEvent (APPLIED)
    await db.applicationEvent.create({
      data: {
        applicationId: application.id,
        actorId: candidateId,
        actorName: fullName.trim(),
        actorRole: "CANDIDATE",
        action: "APPLIED",
        metadata: {
          jobTitle: job.title,
          companyName: job.company.name,
          resumeFileName: application.resumeFileName,
          matchScore: application.matchScore,
        },
      },
    });

    // 6. Create in-app Notification for Employer
    const staff = await getCompanyStaffEmail(job.companyId, null, application.id);
    await db.notification.create({
      data: {
        companyId: job.companyId,
        applicationId: application.id,
        userId: staff.userId,
        recipientEmail: staff.email,
        isUnrouted: staff.isUnrouted || false,
        title: `New Application for ${job.title}`,
        message: `${fullName} has submitted an application for ${job.title}.`,
        type: "APPLICATION_SUBMITTED",
        link: `/employer/applications/${application.id}`,
      },
    }).catch(() => {});

    // 7. Dispatch emails (confirmation to candidate & notice to recruiter outbox)
    await sendCandidateApplicationReceivedEmail({
      toEmail: normalizedEmail,
      candidateName: fullName,
      jobTitle: job.title,
      companyName: job.company.name,
      applicationId: application.id,
    }).catch((err) => console.error("Failed to send candidate application email:", err));

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      application,
    });
  } catch (error: any) {
    console.error("Application submission failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, reason = "Status updated via Admin Dashboard" } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields: id, status" }, { status: 400 });
    }

    const updated = await db.application.update({
      where: { id },
      data: { status },
      include: {
        job: {
          select: {
            title: true,
            company: { select: { name: true } },
          },
        },
      },
    });

    // Create an immutable audit log entry
    await db.auditLog.create({
      data: {
        actorEmail: "superadmin@careerbridge.com",
        actorRole: "PLATFORM_ADMIN",
        action: "APPLICATION_STATUS_UPDATED",
        entityType: "APPLICATION",
        entityId: id,
        reason: `${reason} -> ${status}`,
        afterJson: JSON.stringify({
          applicationId: id,
          status,
          candidateName: updated.candidateName,
          jobTitle: updated.job.title,
        }),
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    console.error("Failed to update application status:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update status" },
      { status: 500 }
    );
  }
}
