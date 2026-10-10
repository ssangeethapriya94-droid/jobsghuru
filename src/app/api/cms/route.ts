import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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
    return NextResponse.json({ error: error.message || "Failed to load public CMS page" }, { status: 500 });
  }
}
