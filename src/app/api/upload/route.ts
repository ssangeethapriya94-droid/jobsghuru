import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string || "COMPANY_DOC";

    if (!file) {
      return NextResponse.json({ error: "No file provided in request." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file name
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${cleanName}`;

    // Check if document is resume -> store in private storage/resumes
    const isResume = documentType === "RESUME" || file.name.toLowerCase().endsWith(".pdf");
    const uploadDir = isResume
      ? path.join(process.cwd(), "storage", "resumes")
      : path.join(process.cwd(), "public", "uploads", "company-docs");

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = isResume
      ? `/api/candidate/profile/resume`
      : `/uploads/company-docs/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: file.type || "application/pdf",
      documentType,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file." },
      { status: 500 }
    );
  }
}
