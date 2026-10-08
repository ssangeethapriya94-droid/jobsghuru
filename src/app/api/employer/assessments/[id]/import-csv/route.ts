import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireEmployer } from "@/lib/employer/auth";
import { UserRole } from "@prisma/client";

interface RouteParams {
  params: {
    id: string;
  };
}

const MAX_CSV_SIZE_BYTES = 2 * 1024 * 1024; // 2MB limit
const MAX_CSV_ROWS = 200; // 200 questions max per import

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, employer, response } = await requireEmployer([
      UserRole.COMPANY_ADMIN,
      UserRole.RECRUITER,
    ]);
    if (!authorized) return response!;

    const assessment = await db.assessment.findFirst({
      where: { id: params.id, companyId: employer.companyId },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";
    let csvText = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
      }
      if (file.size > MAX_CSV_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File size exceeds maximum limit of 2MB (${(file.size / 1024 / 1024).toFixed(2)}MB uploaded).` },
          { status: 400 }
        );
      }
      csvText = await file.text();
    } else {
      const body = await req.json();
      csvText = body.csvText || body.csvContent || "";
    }

    if (!csvText.trim()) {
      return NextResponse.json({ error: "CSV content is empty." }, { status: 400 });
    }

    // Parse CSV rows safely
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      return NextResponse.json({ error: "CSV must contain a header and at least one data row." }, { status: 400 });
    }

    if (lines.length - 1 > MAX_CSV_ROWS) {
      return NextResponse.json(
        { error: `CSV exceeds maximum limit of ${MAX_CSV_ROWS} rows (${lines.length - 1} rows found).` },
        { status: 400 }
      );
    }

    // Simple CSV Line Parser handling quotes
    function parseCsvLine(line: string): string[] {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    }

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const qIndex = headers.indexOf("question");
    const typeIndex = headers.indexOf("type") !== -1 ? headers.indexOf("type") : headers.indexOf("questiontype");
    const optionsIndex = headers.indexOf("options");
    const correctIndex = headers.indexOf("correctanswer");
    const pointsIndex = headers.indexOf("points");
    const negPointsIndex = headers.indexOf("negativepoints");
    const expIndex = headers.indexOf("explanation");

    if (qIndex === -1) {
      return NextResponse.json(
        { error: "CSV must contain a 'question' header column." },
        { status: 400 }
      );
    }

    const validQuestions: any[] = [];
    const validationErrors: { row: number; error: string; data: any }[] = [];

    const currentCount = await db.assessmentQuestion.count({ where: { assessmentId: params.id } });

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      const rowNum = i + 1;
      const questionText = cols[qIndex] || "";

      if (!questionText.trim()) {
        validationErrors.push({ row: rowNum, error: "Question text is required", data: cols });
        continue;
      }

      let qType = (cols[typeIndex] || "SINGLE_CHOICE").toUpperCase().trim();
      const allowedTypes = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_TEXT", "LONG_TEXT", "CODE"];
      if (!allowedTypes.includes(qType)) {
        qType = "SINGLE_CHOICE";
      }

      // Options parsing (separated by | or ;)
      let rawOptions = cols[optionsIndex] || "";
      let optionsList: string[] = [];
      if (rawOptions) {
        optionsList = rawOptions.split(/[|;]/).map((o) => o.trim()).filter(Boolean);
      }

      const correctAnswer = cols[correctIndex] || null;
      const points = Number(cols[pointsIndex]) > 0 ? Number(cols[pointsIndex]) : 10;
      const negativePoints = Number(cols[negPointsIndex]) >= 0 ? Number(cols[negPointsIndex]) : 0;
      const explanation = cols[expIndex] || null;

      validQuestions.push({
        assessmentId: params.id,
        question: questionText.trim(),
        questionType: qType,
        options: optionsList,
        correctAnswer: correctAnswer?.trim() || null,
        points,
        negativePoints,
        orderIndex: currentCount + validQuestions.length,
        explanation: explanation?.trim() || null,
      });
    }

    if (validQuestions.length > 0) {
      await db.assessmentQuestion.createMany({
        data: validQuestions,
      });
    }

    const totalQuestions = await db.assessmentQuestion.count({ where: { assessmentId: params.id } });

    return NextResponse.json({
      success: true,
      report: {
        totalRows: lines.length - 1,
        importedCount: validQuestions.length,
        failedCount: validationErrors.length,
        errors: validationErrors,
        currentTotalQuestions: totalQuestions,
      },
    });
  } catch (error: any) {
    console.error("Error importing questions CSV:", error);
    return NextResponse.json({ error: "Failed to import CSV questions" }, { status: 500 });
  }
}
