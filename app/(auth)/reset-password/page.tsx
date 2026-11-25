import { AuthCard } from "@/components/auth-card";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthCard
      eyebrow="Almost there"
      title="Choose a new password"
      subtitle="Pick something you haven't used here before. You'll be signed out and asked to sign in again."
    >
      <ResetForm />
    </AuthCard>
  );
}
