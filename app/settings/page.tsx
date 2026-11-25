import Link from "next/link";
import { Suspense } from "react";
import { ProfileForm } from "@/components/profile-form";
import { requireViewer } from "@/lib/auth";
import { getProfileById } from "@/lib/db/profiles";
import { notFound } from "next/navigation";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-xl px-5 py-24 text-sm text-muted sm:px-8">Loading your profile…</div>}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const viewer = await requireViewer("/settings");
  const profile = await getProfileById(viewer.id);
  if (!profile) notFound();

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-rust">Settings</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Your corner of the margin</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        This is what readers see on your author page.{" "}
        <Link href={`/authors/${profile.username}`} className="text-rust-ink underline underline-offset-2">
          View it
        </Link>
        .
      </p>

      <div className="mt-10">
        <ProfileForm
          initial={{ username: profile.username, displayName: profile.displayName, bio: profile.bio }}
        />
      </div>

      <p className="mt-10 border-t border-rule pt-6 text-xs leading-relaxed text-muted">
        Signed in as {profile.username}. Email and password changes are handled by the sign-in provider for now.
      </p>
    </div>
  );
}
