import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { JobStatus } from "@prisma/client";
import { queueAndSendEmail } from "@/lib/email/outbox";

export async function GET(req: NextRequest) {
  return handleJobAlertCron(req);
}

export async function POST(req: NextRequest) {
  return handleJobAlertCron(req);
}

async function handleJobAlertCron(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secretParam = searchParams.get("secret");
    const secretHeader = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET || "careerbridge_cron_secret_2026";

    if (secretParam !== expectedSecret && secretHeader !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized cron execution secret" }, { status: 401 });
    }

    const alerts = await db.jobAlert.findMany({
      where: { active: true },
      include: { user: { select: { id: true, email: true, name: true, status: true } } },
    });

    let sentCount = 0;
    const now = new Date();
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    for (const alert of alerts) {
      // Never send alerts to unverified or suspended candidate accounts!
      if (alert.user.status !== "ACTIVE") continue;

      const where: any = {
        status: JobStatus.PUBLISHED,
        expiresAt: { gt: now },
        company: { verified: true },
      };

      if (alert.lastSentAt) {
        where.postedAt = { gt: alert.lastSentAt };
      }

      if (alert.query) {
        where.OR = [
          { title: { contains: alert.query, mode: "insensitive" } },
          { description: { contains: alert.query, mode: "insensitive" } },
        ];
      }

      if (alert.location) {
        where.location = { contains: alert.location, mode: "insensitive" };
      }

      const matchingJobs = await db.job.findMany({
        where,
        take: 5,
        include: { company: { select: { name: true } } },
      });

      if (matchingJobs.length > 0) {
        const jobListHtml = matchingJobs
          .map(
            (j) => `
          <div style="border-bottom: 1px solid #e2e8f0; padding: 12px 0;">
            <strong style="color: #1e293b; font-size: 15px;">${j.title}</strong> — ${j.company.name}<br/>
            <span style="font-size: 12px; color: #64748b;">${j.location} • ${j.jobType} • ₹${j.salaryMaxLpa || j.salaryMinLpa || "Confidential"} LPA</span><br/>
            <a href="${appUrl}/jobs/${j.id}" style="font-size: 12px; color: #2563eb; font-weight: bold; text-decoration: none;">View Job Posting →</a>
          </div>
        `
          )
          .join("");

        const emailHtml = `
          <div style="font-family: sans-serif; padding: 24px; background: #f8fafc; color: #1e293b;">
            <div style="max-width: 540px; margin: 0 auto; background: #ffffff; padding: 28px; border-radius: 16px; border: 1px solid #e2e8f0;">
              <h3 style="color: #2563eb; margin-top: 0;">New Matching Job Opportunities</h3>
              <p>Hi <strong>${alert.user.name}</strong>,</p>
              <p>We found <strong>${matchingJobs.length}</strong> new job postings matching your saved alert ("${alert.query || alert.location || "General"}"):</p>
              
              <div style="margin: 20px 0;">
                ${jobListHtml}
              </div>

              <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px;">
                You received this because of your active job alert on CareerBridge.
              </p>
            </div>
          </div>
        `;

        await queueAndSendEmail({
          to: alert.user.email,
          subject: `Job Alert: ${matchingJobs.length} new matches on CareerBridge`,
          html: emailHtml,
          template: "JOB_ALERT",
        }).catch(() => {});

        await db.jobAlert.update({
          where: { id: alert.id },
          data: { lastSentAt: now },
        });

        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processedAlerts: alerts.length,
      emailsSent: sentCount,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Job alert cron execution error:", error);
    return NextResponse.json({ error: "Failed to execute job alert cron" }, { status: 500 });
  }
}
