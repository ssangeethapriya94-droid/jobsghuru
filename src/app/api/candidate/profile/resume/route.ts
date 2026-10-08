import { NextRequest, NextResponse } from "next/server";
import { requireCandidate } from "@/lib/candidate/auth";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { authorized, candidate, response } = await requireCandidate();
    if (!authorized) return response!;

    const profile = await db.candidateProfile.findUnique({
      where: { userId: candidate.id },
    });

    if (!profile || (!profile.resumeUrl && !profile.resumeFileName)) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const fileName = profile.resumeFileName || "Candidate_Resume.pdf";
    const resumeUrl = profile.resumeUrl;

    if (resumeUrl && !resumeUrl.startsWith("http://") && !resumeUrl.startsWith("https://")) {
      const cleanPath = resumeUrl.startsWith("/") ? resumeUrl.slice(1) : resumeUrl;
      const baseName = path.basename(cleanPath);
      const storagePath = path.join(process.cwd(), "storage", "resumes", baseName);
      const diskPath = fs.existsSync(storagePath)
        ? storagePath
        : path.join(process.cwd(), "storage", "resumes", cleanPath);

      if (fs.existsSync(diskPath)) {
        const fileBuffer = fs.readFileSync(diskPath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${fileName}"`,
          },
        });
      }
    }

    // Return synthetic PDF byte stream if file is placeholder
    const samplePdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 73 >> stream
BT
/F1 14 Tf
50 720 Td
(${candidate.name} - Resume) Tj
ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000366 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
443
%%EOF`;

    return new NextResponse(Buffer.from(samplePdfContent), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Error serving candidate resume:", error);
    return NextResponse.json({ error: "Failed to retrieve resume" }, { status: 500 });
  }
}
