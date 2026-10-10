import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { DEFAULT_CMS_PAGES } from "@/lib/cms-defaults";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "about";

    const setting = await db.systemSetting.findUnique({
      where: { key: `CMS_PAGE_${slug}` },
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        return NextResponse.json({ success: true, slug, page: parsed });
      } catch (e) {
        console.error("Failed to parse CMS JSON", e);
      }
    }

    const defaultPage = DEFAULT_CMS_PAGES[slug] || DEFAULT_CMS_PAGES["about"];
    return NextResponse.json({ success: true, slug, page: defaultPage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load CMS page" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slug, title, metaDescription, contentHtml } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: "Slug and title are required" }, { status: 400 });
    }

    const pageData = {
      title,
      metaDescription: metaDescription || "",
      contentHtml: contentHtml || "",
      updatedAt: new Date().toISOString(),
      updatedBy: admin.email,
    };

    await db.systemSetting.upsert({
      where: { key: `CMS_PAGE_${slug}` },
      update: {
        value: JSON.stringify(pageData),
        category: "GENERAL",
        updatedBy: admin.email,
      },
      create: {
        key: `CMS_PAGE_${slug}`,
        value: JSON.stringify(pageData),
        category: "GENERAL",
        updatedBy: admin.email,
      },
    });

    return NextResponse.json({ success: true, slug, page: pageData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update CMS page" }, { status: 500 });
  }
}
