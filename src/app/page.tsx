import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import LiveJobFeed from "@/components/LiveJobFeed";
import LocationExplorer from "@/components/LocationExplorer";
import PromisesSection from "@/components/PromisesSection";
import { db } from "@/lib/db";

export const revalidate = 60;

export default async function HomePage() {
  let jobs: any[] = [];
  try {
    jobs = await db.job.findMany({
      where: {
        status: "PUBLISHED",
        expiresAt: { gt: new Date() },
      },
      orderBy: { postedAt: "desc" },
      take: 20,
      include: {
        company: true,
      },
    });
  } catch (err) {
    console.error("Failed to fetch jobs for homepage feed:", err);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div className="flex-1 space-y-12 pb-16">
        <HeroSection />
        <CategoryGrid />
        <LiveJobFeed jobs={jobs} />
        <LocationExplorer />
        <PromisesSection />
      </div>
    </div>
  );
}

