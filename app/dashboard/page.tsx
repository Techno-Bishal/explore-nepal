import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DashboardClient } from "./_components/dashboard-client";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <DashboardClient />
      </main>
      <SiteFooter />
    </div>
  );
}
