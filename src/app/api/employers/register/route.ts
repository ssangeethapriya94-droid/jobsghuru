import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole, UserStatus, VerificationStatus } from "@prisma/client";
import { hashPassword } from "@/lib/employer/auth";
import { recordAuditLog } from "@/lib/admin/audit";
import { sendEmployerRegistrationReceivedEmail } from "@/lib/email/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyType,
      industry,
      legalName,
      displayName,
      cinNumber,
      taxId,
      website,
      corporateDomain,
      businessEmail,
      businessPhone,
      country,
      state,
      city,
      postalCode,
      address,
      operatingHubs,
      size,
      yearFounded,
      description,
      recruiterName,
      recruiterDesignation,
      recruiterPhone,
      staffId,
      linkedinUrl,
      department,
      hiringDepartments,
      hiringRoles,
      techStack,
      expectedHires,
      hiringUrgency,
      workMode,
      employmentType,
      hiringVolume,
      hiringFrequency,
      benefits,
      selectedPlanCode,
      billingCycle,
      password,
      termsAccepted,
      authorizationCertified,
      slaAgreed,
      documents, // Array of { type, title, fileName, fileSize, url, uploadedAt }
      paymentMethod,
      paymentTransactionId,
      paymentAmount,
    } = body;

    // Validation
    if (!displayName || !businessEmail || !password || !recruiterName) {
      return NextResponse.json(
        { error: "Company brand name, official work email, password, and authorized staff name are required." },
        { status: 400 }
      );
    }

    // Check if user email or company already exists
    const existingUser = await db.user.findUnique({
      where: { email: businessEmail.toLowerCase().trim() },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this official work email already exists. Please log in at /employer/login." },
        { status: 409 }
      );
    }

    const companySlug = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existingCompany = await db.company.findFirst({
      where: { OR: [{ slug: companySlug }, { name: displayName }] },
    });

    const uniqueSlug = existingCompany
      ? `${companySlug}-${Math.floor(1000 + Math.random() * 9000)}`
      : companySlug;

    // Resolve plan
    const plan = await db.employerPlan.findFirst({
      where: { code: selectedPlanCode || "GROWTH" },
    });

    const planPrice =
      billingCycle === "ANNUAL"
        ? (plan?.annualPriceInr || 5499) * 12
        : plan?.monthlyPriceInr || 6999;

    const fullAddress = [
      address,
      postalCode ? `PIN: ${postalCode}` : null,
      city,
      state,
      country || "India",
    ]
      .filter(Boolean)
      .join(", ");

    // Create Company
    const company = await db.company.create({
      data: {
        name: displayName,
        slug: uniqueSlug,
        legalName: legalName || displayName,
        displayName,
        companyType: companyType || "Private Limited",
        industry: industry || "IT & Software",
        size: size || "51-200",
        location: city ? `${city}, ${state || country || "India"}` : "Bengaluru, India",
        website: website || null,
        businessPhone: businessPhone || recruiterPhone || null,
        country: country || "India",
        state: state || null,
        city: city || null,
        address: fullAddress || null,
        foundedYear: yearFounded ? parseInt(yearFounded, 10) : new Date().getFullYear(),
        description: description || `${displayName} is an accredited employer on CareerBridge hiring top engineering, product, and leadership talent.`,
        verified: false, // Verification begins as PENDING admin audit
        hiringAreas: Array.isArray(hiringRoles) && hiringRoles.length > 0 ? hiringRoles : ["Engineering", "Product"],
        benefits: Array.isArray(benefits) && benefits.length > 0
          ? benefits
          : [
              "Comprehensive Health Insurance",
              "Stock Options / ESOPs",
              "Performance Bonus",
              "Flexible Work Hours",
              "Learning & Certifications Stipend",
            ],
        socialLinks: {
          linkedin: linkedinUrl || null,
          cin: cinNumber || null,
          gst: taxId || null,
          staffId: staffId || null,
          workMode: workMode || "HYBRID",
          techStack: Array.isArray(techStack) ? techStack : [],
          operatingHubs: Array.isArray(operatingHubs) ? operatingHubs : [],
          documents: Array.isArray(documents) ? documents : [],
        },
      },
    });

    // Create Recruiter User (Company Admin) - initially pending admin verification
    const user = await db.user.create({
      data: {
        name: recruiterName,
        email: businessEmail.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        role: UserRole.COMPANY_ADMIN,
        status: UserStatus.PENDING_VERIFICATION,
        phone: recruiterPhone || businessPhone || null,
        companyId: company.id,
      },
    });

    // Process and format documents array
    const serializedDocs = Array.isArray(documents)
      ? documents.map((doc: any) =>
          typeof doc === "string" ? doc : JSON.stringify(doc)
        )
      : [];

    // Submit Verification Record
    await db.companyVerification.create({
      data: {
        companyId: company.id,
        legalName: legalName || displayName,
        taxId: taxId || null,
        businessRegister: cinNumber || website || null,
        domain: corporateDomain || businessEmail.split("@")[1] || null,
        recruiterProof: `${recruiterDesignation || "Talent Acquisition Lead"}${staffId ? ` (Staff ID: ${staffId})` : ""}${linkedinUrl ? ` | ${linkedinUrl}` : ""}`,
        status: VerificationStatus.PENDING,
        notes: `Enterprise Registration: Entity Type: ${companyType || "Private Limited"}, CIN: ${cinNumber || "N/A"}, Tax/GST: ${taxId || "N/A"}, Headcount: ${size || "51-200"}, Plan: ${selectedPlanCode || "GROWTH"}, Documents: ${serializedDocs.length} attached`,
        documents: serializedDocs,
      },
    });

    // Seed Initial Candidate Search Credits
    const currentMonth = new Date().toISOString().slice(0, 7);
    const searchCreditsAllowance = plan?.searchCreditsMonthly || 250;
    await db.candidateSearchCredit.create({
      data: {
        companyId: company.id,
        month: currentMonth,
        total: searchCreditsAllowance,
        used: 0,
      },
    });

    // Create Initial Payment & Subscription
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    await db.payment.create({
      data: {
        companyId: company.id,
        amountInr: paymentAmount || planPrice,
        currency: "INR",
        status: "SUCCESS",
        invoiceNumber,
        planName: plan?.name || "Growth Partnership",
        paymentMethod: paymentMethod || "Corporate UPI / NetBanking (Verified)",
      },
    });

    // Link matching Plan model with exact jobPostingLimit
    const planName = plan?.name || (selectedPlanCode === "STARTER" ? "Starter Trial" : selectedPlanCode === "SCALE" ? "Enterprise Scale" : "Growth Partnership");
    const planPostingLimit = plan?.jobPostingLimit || (selectedPlanCode === "STARTER" ? 3 : selectedPlanCode === "SCALE" ? 50 : 10);

    let specificPlan = await db.plan.findFirst({ where: { name: planName, type: "EMPLOYER" } });
    if (!specificPlan) {
      specificPlan = await db.plan.create({
        data: {
          name: planName,
          type: "EMPLOYER",
          priceInr: planPrice,
          billingCycle: billingCycle || "MONTHLY",
          features: plan?.features || [],
          jobLimit: planPostingLimit,
        },
      });
    }

    await db.subscription.create({
      data: {
        companyId: company.id,
        planId: specificPlan.id,
        status: "ACTIVE",
        currentStart: new Date(),
        currentEnd: new Date(Date.now() + (billingCycle === "ANNUAL" ? 365 : 30) * 86400000),
      },
    });

    // Record Immutable Audit Log
    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "COMPANY_REGISTERED",
      entityType: "COMPANY",
      entityId: company.id,
      reason: `Company registered via wizard with plan ${selectedPlanCode || "GROWTH"}. Pending Admin approval.`,
      afterJson: JSON.stringify({ companyId: company.id, name: company.name, plan: selectedPlanCode }),
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") || undefined,
    }).catch((err) => console.error("Audit log error:", err));

    // Send confirmation email that registration was received and is under review
    await sendEmployerRegistrationReceivedEmail({
      toEmail: user.email,
      recipientName: user.name,
      companyName: company.displayName || company.name,
    }).catch((e) => console.error("Error sending registration received email:", e));

    return NextResponse.json({
      success: true,
      companyId: company.id,
      companyName: company.name,
      companySlug: company.slug,
      verificationStatus: "PENDING",
      invoiceNumber,
      registeredEmail: user.email,
      message: "Company registered successfully and submitted for admin review. Once approved, your login credentials will be emailed to your official email.",
    });
  } catch (error: any) {
    console.error("Error registering company:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete company registration." },
      { status: 500 }
    );
  }
}
