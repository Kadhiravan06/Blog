"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { safePath } from "@/lib/safe-path";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safePath(params.get("next"));
  const linkError = params.get("error") === "link";
  const [error, setError] = useState<string | null>(linkError ? "That sign-in link has expired. Try again." : null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const { error: authError } = await createBrowserSupabase().auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });

    if (authError) {
      setError(authError.message);
      setBusy(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <p role="alert" className="rounded-lg border border-rust/30 bg-rust/5 px-4 py-3 text-sm text-rust-ink">
          {error}
        </p>
      ) : null}

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
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-muted underline underline-offset-2 hover:text-ink">
            Forgot?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-rule bg-card px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-rust"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
