import { SiteHeader } from "@/components/site-header";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
