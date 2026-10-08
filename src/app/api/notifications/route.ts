import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer } from "@/lib/employer/auth";
import { getCurrentCandidate } from "@/lib/candidate/auth";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    const employer = await getCurrentEmployer();
    const candidate = await getCurrentCandidate();

    if (!employer && !candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let where: any = {};

    if (employer) {
      if (employer.role === UserRole.COMPANY_ADMIN) {
        // Company Admin sees company notifications + unrouted notifications
        where.OR = [
          { companyId: employer.companyId },
          { userId: employer.id },
          { recipientEmail: employer.email },
          { isUnrouted: true },
        ];
      } else {
        // Other employer roles see company notifications or their own user notifications
        where.OR = [
          { companyId: employer.companyId, isUnrouted: false },
          { userId: employer.id },
          { recipientEmail: employer.email },
        ];
      }
    } else if (candidate) {
      // Candidate sees only notifications routed to them
      where.OR = [
        { userId: candidate.id },
        { recipientEmail: candidate.email },
      ];
    }

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.notification.count({ where }),
      db.notification.count({ where: { ...where, read: false } }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    const candidate = await getCurrentCandidate();

    if (!employer && !candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      let where: any = {};
      if (employer) {
        where = { companyId: employer.companyId };
      } else if (candidate) {
        where = { OR: [{ userId: candidate.id }, { recipientEmail: candidate.email }] };
      }

      await db.notification.updateMany({
        where: { ...where, read: false },
        data: { read: true },
      });

      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (!notificationId) {
      return NextResponse.json({ error: "notificationId is required." }, { status: 400 });
    }

    const notification = await db.notification.findUnique({ where: { id: notificationId } });
    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Ownership check
    if (employer && notification.companyId && notification.companyId !== employer.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (candidate && notification.userId !== candidate.id && notification.recipientEmail !== candidate.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return NextResponse.json({ success: true, notification: updated });
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
