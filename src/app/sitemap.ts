import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  // Fetch verified published jobs
  const jobs = await db.job.findMany({
    where: {
      status: "PUBLISHED",
      expiresAt: { gt: new Date() },
      company: { verified: true },
    },
    select: { id: true, updatedAt: true },
  });

  const jobUrls = jobs.map((job) => ({
    url: `${appUrl}/jobs/${job.id}`,
    lastModified: job.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${appUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${appUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...jobUrls,
  ];
}
