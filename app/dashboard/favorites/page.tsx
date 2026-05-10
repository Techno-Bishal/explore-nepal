import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FavoritesClient } from "./_components/favorites-client";

export default function FavoritesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <FavoritesClient />
      </main>
      <SiteFooter />
    </div>
  );
}
