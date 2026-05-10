import { SignupForm } from "./_components/signup-form";
import { SiteHeader } from "@/components/site-header";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <SignupForm />
      </main>
    </div>
  );
}
