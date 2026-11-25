"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { safePath } from "@/lib/safe-path";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const next = safePath(useSearchParams().get("next"));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (displayName.length < 2) {
      setError("Please use at least two characters for your name.");
      setBusy(false);
      return;
    }

    const { data, error: authError } = await createBrowserSupabase().auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (authError) {
      setError(authError.message);
      setBusy(false);
      return;
    }

    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }

    setNotice("Check your inbox to confirm your address, then sign in.");
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <p role="alert" className="rounded-lg border border-rust/30 bg-rust/5 px-4 py-3 text-sm text-rust-ink">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-lg border border-rule bg-wash px-4 py-3 text-sm text-ink">{notice}</p>
      ) : null}

      <div>
        <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium">
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
          maxLength={60}
          placeholder="Ada Whitfield"
          className="w-full rounded-lg border border-rule bg-card px-3.5 py-2.5 text-[15px] outline-none transition-colors placeholder:text-muted/60 focus:border-rust"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-rule bg-card px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-rust"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-lg border border-rule bg-card px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-rust"
        />
        <p className="mt-1.5 text-xs text-muted">At least 8 characters. Your username is generated, and you can change it in settings.</p>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {busy ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
