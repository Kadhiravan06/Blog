"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CommentForm({ slug, signedIn, nextPath }: { slug: string; signedIn: boolean; nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!signedIn) {
    return (
      <div className="rounded-sm border border-rule bg-card px-5 py-6">
        <p className="font-serif text-xl tracking-tight">Leave a note</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Notes are written by signed-in readers.{" "}
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="text-rust-ink underline underline-offset-2"
          >
            Sign in
          </Link>{" "}
          or{" "}
          <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="text-rust-ink underline underline-offset-2">
            create an account
          </Link>
          .
        </p>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError(null);

    const body = String(new FormData(form).get("body") ?? "").trim();
    const response = await fetch(`/api/posts/${slug}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      setError(payload?.error?.message ?? "That note could not be posted.");
      setBusy(false);
      return;
    }

    form.reset();
    router.refresh();
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-sm border border-rule bg-card px-5 py-6">
      <label htmlFor="body" className="font-serif text-xl tracking-tight">
        Leave a note
      </label>
      <p className="mt-1 text-xs text-muted">Addressed to the next reader. Be specific, be kind.</p>
      <textarea
        id="body"
        name="body"
        required
        maxLength={2000}
        rows={4}
        placeholder="The sentence I underlined was…"
        className="mt-4 w-full resize-y rounded-lg border border-rule bg-paper px-3.5 py-3 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-muted/60 focus:border-rust"
      />
      {error ? (
        <p role="alert" className="mt-2 text-sm text-rust-ink">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted">Up to 2,000 characters.</span>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {busy ? "Posting…" : "Post note"}
        </button>
      </div>
    </form>
  );
}
