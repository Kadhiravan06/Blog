import { Suspense } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Pick up where you left off. Your drafts and comments are waiting."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-rust-ink underline underline-offset-2">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-64" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
