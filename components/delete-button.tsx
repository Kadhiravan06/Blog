"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({
  url,
  label = "Delete",
  confirmText = "Delete this? This cannot be undone.",
  redirectTo,
  className = "",
}: {
  url: string;
  label?: string;
  confirmText?: string;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setError(null);

    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      setError(body?.error?.message ?? "Could not delete that.");
      setBusy(false);
      return;
    }

    if (redirectTo) router.push(redirectTo);
    router.refresh();
    setBusy(false);
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={className || "text-xs text-muted underline underline-offset-2 hover:text-rust-ink disabled:opacity-50"}
      >
        {busy ? "Working…" : label}
      </button>
      {error ? <span className="text-xs text-rust-ink">{error}</span> : null}
    </span>
  );
}
