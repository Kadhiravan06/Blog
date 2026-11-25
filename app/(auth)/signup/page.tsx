import { Suspense } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <AuthCard
      eyebrow="Join the margin"
      title="Start writing"
      subtitle="Create an account to publish essays, keep drafts, and leave notes for the next reader."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-rust-ink underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-80" />}>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
