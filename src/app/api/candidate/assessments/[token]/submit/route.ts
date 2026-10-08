import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { queueAndSendEmail } from "@/lib/email/outbox";
import { getCompanyStaffEmail } from "@/lib/notifications";
import crypto from "crypto";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rawToken = params.token;
    const tokenHash = hashToken(rawToken);

    const candidateAssessment = await db.candidateAssessment.findFirst({
      where: {
        OR: [{ tokenHash }, { token: rawToken }],
      },
      include: {
        assessment: {
          include: {
            questions: true,
            company: true,
          },
        },
        application: {
          include: {
            job: {
              include: { company: true },
            },
          },
        },
      },
    });

    if (!candidateAssessment) {
      return NextResponse.json({ error: "Invalid assessment token." }, { status: 404 });
    }

    if (["COMPLETED", "PENDING_REVIEW"].includes(candidateAssessment.status)) {
      return NextResponse.json(
        { error: "This assessment has already been submitted." },
        { status: 400 }
      );
    }

    // Deadline check (allow 30s grace period for submission payload transit)
    if (candidateAssessment.deadlineAt) {
      const graceDeadline = new Date(candidateAssessment.deadlineAt.getTime() + 30 * 1000);
      if (new Date() > graceDeadline) {
        return NextResponse.json(
          { error: "Submission rejected: Assessment time limit exceeded." },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { answers = {} } = body; // Map of questionId -> answer (string or string[])

    const questions: any[] =
      (candidateAssessment.questionsSnapshot as any[]) ||
      candidateAssessment.assessment.questions ||
      [];

    let totalPoints = 0;
    let totalEarned = 0;
    let needsManualReview = false;
    const scoredAnswers: Record<string, any> = {};

    for (const q of questions) {
      const qId = q.id;
      const qType = (q.questionType || "SINGLE_CHOICE").toUpperCase();
      const points = Number(q.points) > 0 ? Number(q.points) : 10;
      const negativePoints = Number(q.negativePoints) >= 0 ? Number(q.negativePoints) : 0;
      const candidateAns = answers[qId];

      totalPoints += points;

      if (qType === "SINGLE_CHOICE" || qType === "TRUE_FALSE") {
        const correctStr = String(q.correctAnswer || "").trim().toLowerCase();
        const candidateStr = String(candidateAns || "").trim().toLowerCase();

        let earned = 0;
        if (candidateStr && candidateStr === correctStr) {
          earned = points;
        } else if (candidateStr && negativePoints > 0) {
          earned = -negativePoints;
        }
        const clamped = Math.max(0, earned);
        totalEarned += clamped;
        scoredAnswers[qId] = {
          candidateAnswer: candidateAns || "",
          pointsAwarded: clamped,
          maxPoints: points,
          isAutoGraded: true,
        };
      } else if (qType === "MULTIPLE_CHOICE") {
        /**
         * MULTIPLE-CHOICE SCORING MODES:
         * 1. ALL_OR_NOTHING (Default for new questions):
         *    - Full marks awarded ONLY if the candidate selects ALL correct options AND ZERO wrong options.
         *    - If any wrong option is selected or any correct option is omitted:
         *      - If negativePoints > 0: penalty = wrongCount * negativePoints (floored at 0)
         *      - Otherwise: 0 marks.
         *    - A candidate ticking every option selects wrong options, so earns 0 marks (never full marks).
         * 
         * 2. PARTIAL (Partial credit with wrong option penalty):
         *    - When negativePoints > 0:
         *      earned = (correctCount * (points / totalCorrect)) - (wrongCount * negativePoints)
         *    - When negativePoints = 0:
         *      earned = points * max(0, (correctCount / totalCorrect) - (wrongCount / totalWrongOptions))
         *    - If a candidate ticks EVERY option: correctRatio = 1.0, wrongRatio = 1.0, net = 0 marks (never full marks).
         * 
         * Existing questions keep their previous PARTIAL credit formula unless explicitly updated by the recruiter.
         */
        // Parse correct answers
        let correctList: string[] = [];
        if (Array.isArray(q.correctAnswer)) {
          correctList = q.correctAnswer.map((s: any) => String(s).trim().toLowerCase());
        } else if (typeof q.correctAnswer === "string") {
          correctList = q.correctAnswer.split(/[|;,]/).map((s: string) => s.trim().toLowerCase()).filter(Boolean);
        }

        // Parse candidate answers
        let selectedList: string[] = [];
        if (Array.isArray(candidateAns)) {
          selectedList = candidateAns.map((s: any) => String(s).trim().toLowerCase());
        } else if (typeof candidateAns === "string" && candidateAns.trim()) {
          selectedList = [candidateAns.trim().toLowerCase()];
        }

        const scoringMode = q.scoringMode || "PARTIAL"; // Existing questions without explicit mode default to PARTIAL; new questions default to ALL_OR_NOTHING
        const totalCorrect = correctList.length;
        const totalOptions = Array.isArray(q.options) ? q.options.length : 4;
        const totalWrong = Math.max(1, totalOptions - totalCorrect);

        let correctCount = 0;
        let wrongCount = 0;

        for (const sel of selectedList) {
          if (correctList.includes(sel)) {
            correctCount++;
          } else {
            wrongCount++;
          }
        }

        let earned = 0;
        if (scoringMode === "ALL_OR_NOTHING") {
          if (correctCount === totalCorrect && wrongCount === 0) {
            earned = points;
          } else if (negativePoints > 0 && wrongCount > 0) {
            earned = -wrongCount * negativePoints;
          } else {
            earned = 0;
          }
        } else {
          // PARTIAL mode
          if (totalCorrect > 0) {
            if (negativePoints > 0) {
              const pointsPerCorrect = points / totalCorrect;
              earned = correctCount * pointsPerCorrect - wrongCount * negativePoints;
              // Ensure ticking all options never grants full marks
              if (wrongCount > 0 && earned >= points) {
                earned = points * (correctCount / (correctCount + wrongCount));
              }
            } else {
              // Negative marks OFF: proportional accuracy deduction so selecting all options gives 0
              if (wrongCount === 0) {
                earned = (correctCount / totalCorrect) * points;
              } else {
                const correctRatio = correctCount / totalCorrect;
                const wrongRatio = wrongCount / totalWrong;
                const netRatio = Math.max(0, correctRatio - wrongRatio);
                earned = netRatio * points;
              }
            }
          }
        }

        const clamped = Math.max(0, Math.min(points, Math.round(earned * 100) / 100));
        totalEarned += clamped;
        scoredAnswers[qId] = {
          candidateAnswer: candidateAns || [],
          pointsAwarded: clamped,
          maxPoints: points,
          isAutoGraded: true,
        };
      } else if (qType === "SHORT_TEXT") {
        const correctStr = String(q.correctAnswer || "").trim().toLowerCase();
        const candidateStr = String(candidateAns || "").trim().toLowerCase();

        // Exact match or keyword match
        if (correctStr && candidateStr && (candidateStr === correctStr || candidateStr.includes(correctStr))) {
          totalEarned += points;
          scoredAnswers[qId] = {
            candidateAnswer: candidateAns || "",
            pointsAwarded: points,
            maxPoints: points,
            isAutoGraded: true,
          };
        } else if (!correctStr) {
          // If no keyword match provided, queue for recruiter manual review
          needsManualReview = true;
          scoredAnswers[qId] = {
            candidateAnswer: candidateAns || "",
            pointsAwarded: null,
            maxPoints: points,
            isAutoGraded: false,
            needsReview: true,
          };
        } else {
          scoredAnswers[qId] = {
            candidateAnswer: candidateAns || "",
            pointsAwarded: 0,
            maxPoints: points,
            isAutoGraded: true,
          };
        }
      } else {
        // LONG_TEXT or CODE -> Manual Review Required
        needsManualReview = true;
        scoredAnswers[qId] = {
          candidateAnswer: candidateAns || "",
          pointsAwarded: null,
          maxPoints: points,
          isAutoGraded: false,
          needsReview: true,
        };
      }
    }

    const scorePct = totalPoints > 0 ? Math.round((totalEarned / totalPoints) * 100) : 0;
    const passingThreshold = candidateAssessment.assessment.passingScore || 70;
    const passed = !needsManualReview ? scorePct >= passingThreshold : null;
    const newStatus = needsManualReview ? "PENDING_REVIEW" : "COMPLETED";

    const company = candidateAssessment.application.job.company;
    const companyId = company.id;
    const applicationId = candidateAssessment.applicationId;
    const candidateName = candidateAssessment.application.candidateName;
    const candidateEmail = candidateAssessment.candidateEmail;

    // 1. Update CandidateAssessment record
    const updated = await db.candidateAssessment.update({
      where: { id: candidateAssessment.id },
      data: {
        status: newStatus,
        score: !needsManualReview ? scorePct : null,
        totalPoints,
        passed,
        answers: scoredAnswers,
        submittedAt: new Date(),
      },
    });

    // 2. Auto-reject rule enforcement
    let autoRejected = false;
    if (!needsManualReview && passed === false && company.autoRejectOnFail === true) {
      await db.application.update({
        where: { id: applicationId },
        data: { status: "REJECTED" },
      });
      autoRejected = true;

      await db.applicationEvent.create({
        data: {
          applicationId,
          actorId: null,
          actorName: "System Rule",
          actorRole: "SYSTEM",
          action: "APPLICATION_REJECTED",
          metadata: {
            reason: `Assessment failed with score ${scorePct}% (Passing: ${passingThreshold}%) - autoRejectOnFail enabled`,
          },
        },
      });
    }

    // 3. Record Application Timeline Event
    await db.applicationEvent.create({
      data: {
        applicationId,
        actorId: null,
        actorName: candidateName,
        actorRole: "CANDIDATE",
        action: needsManualReview ? "ASSESSMENT_SUBMITTED_PENDING_REVIEW" : "ASSESSMENT_COMPLETED",
        metadata: {
          assessmentTitle: candidateAssessment.assessment.title,
          score: !needsManualReview ? scorePct : "PENDING",
          passed: !needsManualReview ? passed : "PENDING_REVIEW",
          passingThreshold,
          autoRejected,
        },
      },
    });

    // 4. Create In-App Notifications with companyId and applicationId
    // Notification to Recruiter / Company Admin (real user email from DB or unrouted)
    const staff = await getCompanyStaffEmail(companyId, null, candidateAssessment.applicationId);
    await db.notification.create({
      data: {
        companyId,
        applicationId,
        userId: staff.userId,
        recipientEmail: staff.email,
        isUnrouted: staff.isUnrouted || false,
        title: needsManualReview
          ? `Assessment Pending Review: ${candidateName}`
          : `Assessment Completed: ${candidateName} (${scorePct}%)`,
        message: `${candidateName} has submitted ${candidateAssessment.assessment.title}.${
          needsManualReview ? " Manual review required for text/code questions." : ""
        }`,
        type: "ASSESSMENT_COMPLETED",
        link: `/employer/applications/${applicationId}`,
      },
    });

    // Notification to Candidate
    if (candidateAssessment.application.jobId) {
      await db.notification.create({
        data: {
          companyId,
          applicationId,
          recipientEmail: candidateEmail,
          title: "Assessment Submitted Successfully",
          message: `Your assessment for ${candidateAssessment.application.job.title} has been received.`,
          type: "APPLICATION_STATUS",
          link: `/candidate/applications/${applicationId}`,
        },
      });
    }

    // 5. Dispatch Email Outbox with companyId and applicationId
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #2563eb;">Assessment Submission Received</h2>
        <p style="color: #475569;">Hi ${candidateName},</p>
        <p style="color: #475569;">Thank you for completing the <strong>${candidateAssessment.assessment.title}</strong> assessment for <strong>${company.name}</strong>.</p>
        <p style="color: #64748b; font-size: 14px;">The recruiting team will review your application and provide next steps.</p>
      </div>
    `;

    await queueAndSendEmail({
      to: candidateEmail,
      companyId,
      applicationId,
      subject: `Assessment Completed – ${candidateAssessment.assessment.title}`,
      html,
      template: "ASSESSMENT_RESULT_READY",
      payload: { assessmentId: candidateAssessment.assessmentId, applicationId, companyId },
    });

    // Candidate gets only allowed response: no answer keys or explanations exposed
    return NextResponse.json({
      success: true,
      status: newStatus,
      score: !needsManualReview ? scorePct : null,
      passed: !needsManualReview ? passed : null,
      message: needsManualReview
        ? "Assessment submitted successfully and queued for recruiter review."
        : "Assessment submitted and scored successfully.",
    });
  } catch (error: any) {
    console.error("Error submitting candidate assessment:", error);
    return NextResponse.json({ error: "Failed to submit assessment" }, { status: 500 });
  }
}
