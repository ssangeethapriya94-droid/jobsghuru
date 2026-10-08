import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import LiveJobFeed from "@/components/LiveJobFeed";
import LocationExplorer from "@/components/LocationExplorer";
import PromisesSection from "@/components/PromisesSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header />
      <main className="flex-1 space-y-12 pb-16">
        <HeroSection />
        <CategoryGrid />
        <LiveJobFeed jobs={[]} />
        <LocationExplorer />
        <PromisesSection />
      </main>
      <Footer />
    </div>
  );
}
