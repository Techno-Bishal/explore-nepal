import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroSection } from "./_components/hero-section";
import { FeaturedSection } from "./_components/featured-section";
import { CategoriesSection } from "./_components/categories-section";
import { TrendingSection } from "./_components/trending-section";
import { StatsSection } from "./_components/stats-section";
import { MoodDiscovery } from "./_components/mood-discovery";
import { CTASection } from "./_components/cta-section";
import { QuickToolsSection } from "./_components/quick-tools-section";
import { HiddenGemSection } from "./_components/hidden-gem-section";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturedSection />
        <QuickToolsSection />
        <MoodDiscovery />
        <HiddenGemSection />
        <CategoriesSection />
        <StatsSection />
        <TrendingSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
