import { NextRequest, NextResponse } from "next/server";

// In-memory store for active session notifications
let sessionNotifications = [
  {
    id: "notif-1",
    type: "INTERVIEW_SCHEDULED",
    title: "📅 Interview Invitation Scheduled",
    message: "TechCorp India has scheduled a Technical Round interview for Senior Full-Stack Engineer on JobsGhuru.",
    link: "/candidate/applications",
    read: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "notif-2",
    type: "APPLICATION_STATUS",
    title: "🎉 Application Transmitted",
    message: "Your application for Lead Backend Developer at Acme Software was delivered to the hiring manager.",
    link: "/candidate/applications",
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "notif-3",
    type: "ASSESSMENT_ASSIGNED",
    title: "📝 AI Skills Assessment Assigned",
    message: "Complete your 30-minute System Design & Full Stack assessment to get verified for top recruiters.",
    link: "/career-ai",
    read: false,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: "notif-4",
    type: "OFFER_RECEIVED",
    title: "✨ High-Match Job Alert (98% Match)",
    message: "12 new Remote & Hybrid Engineering roles matching your CTC expectations were posted today.",
    link: "/jobs",
    read: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

export async function GET() {
  try {
    const unreadCount = sessionNotifications.filter((n) => !n.read).length;
    return NextResponse.json({
      success: true,
      notifications: sessionNotifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    if (body.markAllRead) {
      sessionNotifications = sessionNotifications.map((n) => ({ ...n, read: true }));
    } else if (body.notificationId) {
      sessionNotifications = sessionNotifications.map((n) =>
        n.id === body.notificationId ? { ...n, read: true } : n
      );
    }

    const unreadCount = sessionNotifications.filter((n) => !n.read).length;
    return NextResponse.json({
      success: true,
      notifications: sessionNotifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update notifications" }, { status: 500 });
  }
}
