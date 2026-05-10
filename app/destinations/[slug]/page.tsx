import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DestinationDetail } from "./_components/destination-detail";

export default function DestinationPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <DestinationDetail slug={params?.slug ?? ""} />
      </main>
      <SiteFooter />
    </div>
  );
}
