import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentEmployer } from "@/lib/employer/auth";
import { getCurrentCandidate } from "@/lib/candidate/auth";
import { hashToken } from "@/lib/employer/offers";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const offer = await db.offer.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        job: true,
        application: true,
      },
    });

    if (!offer) {
      return new NextResponse("Offer Not Found", { status: 404 });
    }

    // Auth check: Either employer of company, candidate who owns offer, or valid token
    let isAuthorized = false;

    if (token) {
      const computedHash = hashToken(token);
      if (offer.tokenHash === computedHash && (!offer.tokenExpiresAt || new Date() <= new Date(offer.tokenExpiresAt))) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      const employer = await getCurrentEmployer();
      if (employer && employer.companyId === offer.companyId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      const candidate = await getCurrentCandidate();
      if (candidate && (candidate.email.toLowerCase() === offer.candidateEmail.toLowerCase() || candidate.id === offer.application?.candidateId)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new NextResponse("Unauthorized access to offer PDF document", { status: 403 });
    }

    // Build formal PDF HTML document without ANY internal notes
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Employment Offer Letter - ${offer.candidateName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #ffffff; line-height: 1.6; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .company-name { font-size: 24px; font-weight: bold; color: #1e3a8a; }
            .doc-title { font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #2563eb; margin-top: 15px; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 18px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .value { font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 2px; }
            .terms { font-size: 13px; color: #334155; white-space: pre-wrap; }
            .signature-block { margin-top: 60px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .sig-line { border-top: 1px solid #94a3b8; width: 220px; padding-top: 8px; font-size: 12px; font-weight: bold; text-align: center; color: #334155; }
            .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 12px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company-name">${offer.company.displayName || offer.company.name}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${offer.company.address || offer.company.location || "Headquarters"}</div>
            </div>
            ${offer.company.logo ? `<img src="${offer.company.logo}" alt="Logo" style="max-height: 48px;"/>` : ""}
          </div>

          <div class="doc-title">Formal Offer of Employment</div>
          <p style="font-size: 12px; color: #64748b;">Date: ${new Date(offer.createdAt).toLocaleDateString("en-IN")}</p>

          <p>Dear <strong>${offer.candidateName}</strong>,</p>
          <p>We are pleased to offer you the position of <strong>${offer.roleTitle}</strong> at <strong>${offer.company.name}</strong>. We were very impressed with your background and believe your expertise will be invaluable to our team.</p>

          <div class="section">
            <div class="section-title">Compensation & Benefits Breakdown</div>
            <div class="grid">
              <div>
                <div class="label">Fixed CTC (Annual)</div>
                <div class="value">${offer.currency} ${(offer.fixedCtc || offer.baseSalaryLpa).toLocaleString("en-IN")} LPA</div>
              </div>
              <div>
                <div class="label">Variable Component</div>
                <div class="value">${offer.currency} ${(offer.variableCtc || 0).toLocaleString("en-IN")} LPA</div>
              </div>
              <div>
                <div class="label">Joining Bonus</div>
                <div class="value">${offer.joiningBonus ? `${offer.currency} ${offer.joiningBonus.toLocaleString("en-IN")}` : "N/A"}</div>
              </div>
              <div>
                <div class="label">Employment Type</div>
                <div class="value">${offer.employmentType.replace("_", " ")}</div>
              </div>
              <div>
                <div class="label">Proposed Start Date</div>
                <div class="value">${new Date(offer.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
              <div>
                <div class="label">Offer Expiry Date</div>
                <div class="value">${new Date(offer.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
            </div>
          </div>

          ${offer.benefits ? `
          <div class="section">
            <div class="section-title">Benefits & Perks</div>
            <div class="terms">${offer.benefits}</div>
          </div>
          ` : ""}

          <div class="section">
            <div class="section-title">Terms & Conditions of Employment</div>
            <div class="terms">${offer.terms || "Standard employment agreement applies."}</div>
          </div>

          <div class="signature-block">
            <div>
              <div class="sig-line">Authorized Signatory<br/>${offer.company.name}</div>
            </div>
            <div>
              <div class="sig-line">Candidate Acceptance<br/>${offer.candidateName}</div>
            </div>
          </div>

          <div class="footer">
            Official Employment Offer • Version ${offer.version} • Strictly Confidential
          </div>
        </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="Offer_Letter_${offer.candidateName.replace(/\s+/g, "_")}.html"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating offer PDF HTML:", error);
    return new NextResponse("Failed to generate offer document", { status: 500 });
  }
}
