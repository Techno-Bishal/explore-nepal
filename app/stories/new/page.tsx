import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewStoryClient } from "./_components/new-story-client";

export default function NewStoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <NewStoryClient />
      </main>
      <SiteFooter />
    </div>
  );
}
