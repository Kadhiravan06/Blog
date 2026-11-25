import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="Enter the email on your account and we'll send a reset link. If the address is unknown, nothing is sent."
      footer={
        <Link href="/login" className="text-rust-ink underline underline-offset-2">
          Back to sign in
        </Link>
      }
    >
      <ForgotForm />
    </AuthCard>
  );
}
