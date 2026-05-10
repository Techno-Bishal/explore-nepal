import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DestinationsClient } from "./_components/destinations-client";

export default function DestinationsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <DestinationsClient />
      </main>
      <SiteFooter />
    </div>
  );
}
