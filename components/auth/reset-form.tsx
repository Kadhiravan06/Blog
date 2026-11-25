"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function ResetForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password !== confirm) {
      setError("Those passwords do not match.");
      setBusy(false);
      return;
    }

    const supabase = createBrowserSupabase();
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setError(authError.message);
      setBusy(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login?reset=1");
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
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          New password
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
      </div>

      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-lg border border-rule bg-card px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-rust"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
