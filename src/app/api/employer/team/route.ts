import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer, hashPassword } from "@/lib/employer/auth";
import { UserRole, UserStatus } from "@prisma/client";
import { sendTeamInviteEmail } from "@/lib/email/mailer";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await db.user.findMany({
      where: { companyId: employer.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    console.error("Error fetching team members:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only COMPANY_ADMIN or SUPER_ADMIN can invite team members
    if (employer.role !== "COMPANY_ADMIN" && employer.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Company Admins can invite team members." }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role, phone } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const assignedRole = (role as UserRole) || UserRole.RECRUITER;
    const tempPassword = "CareerBridgeInvite2026!";

    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
      include: { company: true },
    });

    let targetMember;
    let message = "";

    if (existing) {
      if (existing.companyId === employer.companyId) {
        // Already in team -> update role and name
        targetMember = await db.user.update({
          where: { id: existing.id },
          data: {
            name: name.trim() || existing.name,
            role: assignedRole,
            phone: phone || existing.phone,
            status: UserStatus.ACTIVE,
          },
        });
        message = `${targetMember.name} is already part of your team. Their role has been updated to ${assignedRole}.`;
      } else {
        // User exists in system -> reassign to this company team
        targetMember = await db.user.update({
          where: { id: existing.id },
          data: {
            companyId: employer.companyId,
            name: name.trim() || existing.name,
            role: assignedRole,
            phone: phone || existing.phone,
            status: UserStatus.ACTIVE,
          },
        });
        message = `${targetMember.name} (${cleanEmail}) has been successfully added to ${employer.companyName} as ${assignedRole}.`;
      }
    } else {
      // Create new user record
      targetMember = await db.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash: hashPassword(tempPassword),
          role: assignedRole,
          status: UserStatus.ACTIVE,
          phone: phone || null,
          companyId: employer.companyId,
        },
      });
      message = `Invited ${targetMember.name} with role ${assignedRole}.`;
    }

    // Determine login link
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const loginUrl = `${protocol}://${host}/employer/login`;

    // Dispatch formatted invite email with login credentials
    await sendTeamInviteEmail({
      toEmail: cleanEmail,
      recipientName: targetMember.name,
      companyName: employer.companyName,
      role: assignedRole,
      temporaryPassword: tempPassword,
      loginUrl,
    }).catch((err) => console.error("Failed to send team invitation email:", err));

    // Audit log
    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role as any,
      action: "TEAM_MEMBER_INVITED",
      entityType: "USER",
      entityId: targetMember.id,
      reason: `Invited/Updated team member ${targetMember.name} (${cleanEmail}) as ${assignedRole}`,
      afterJson: JSON.stringify({ email: cleanEmail, role: assignedRole, companyId: employer.companyId }),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      member: targetMember,
      message,
    });
  } catch (error: any) {
    console.error("Error inviting team member:", error);
    return NextResponse.json({ error: error.message || "Failed to invite member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const employer = await getCurrentEmployer();
    if (!employer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (employer.role !== "COMPANY_ADMIN" && employer.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Company Admins can remove team members." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("id");

    if (!memberId) {
      return NextResponse.json({ error: "Member ID required" }, { status: 400 });
    }

    if (memberId === employer.id) {
      return NextResponse.json({ error: "You cannot remove yourself from the organization." }, { status: 400 });
    }

    // Verify member belongs to employer's company
    const member = await db.user.findFirst({
      where: { id: memberId, companyId: employer.companyId },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found in your team." }, { status: 404 });
    }

    // Unassign member from company
    await db.user.update({
      where: { id: memberId },
      data: { companyId: null, role: UserRole.CANDIDATE },
    });

    await recordAuditLog({
      actorId: employer.id,
      actorEmail: employer.email,
      actorRole: employer.role as any,
      action: "TEAM_MEMBER_REMOVED",
      entityType: "USER",
      entityId: memberId,
      reason: `Removed ${member.name} (${member.email}) from company team`,
    }).catch(() => {});

    return NextResponse.json({ success: true, message: `Removed ${member.name} from team.` });
  } catch (error: any) {
    console.error("Error removing member:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
