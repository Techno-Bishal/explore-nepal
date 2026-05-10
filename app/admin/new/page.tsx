import { SiteHeader } from "@/components/site-header";
import { NewDestinationForm } from "./_components/new-destination-form";

export default function NewDestinationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <NewDestinationForm />
      </main>
    </div>
  );
}
