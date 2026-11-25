"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function ForgotForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
    const { error: authError } = await createBrowserSupabase().auth.resetPasswordForEmail(email, { redirectTo });

    if (authError) {
      setError(authError.message);
      setBusy(false);
      return;
    }

    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-rule bg-wash px-4 py-4 text-sm leading-relaxed">
        If that address has an account, a reset link is on its way. Check your inbox and spam folder.
      </div>
    );
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

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
