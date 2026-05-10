import { SiteHeader } from "@/components/site-header";
import { ResetPasswordForm } from "./_components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <ResetPasswordForm />
      </main>
    </div>
  );
}
