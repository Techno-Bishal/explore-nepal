import { SiteHeader } from "@/components/site-header";
import { AdminClient } from "./_components/admin-client";

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <AdminClient />
      </main>
    </div>
  );
}
