import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StoriesClient } from "./_components/stories-client";

export default function StoriesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <StoriesClient />
      </main>
      <SiteFooter />
    </div>
  );
}
