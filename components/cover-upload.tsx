"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export function CoverUpload({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setError("Images must be 2 MB or smaller.");
      return;
    }

    setBusy(true);
    setError(null);
    const form = new FormData();
    form.set("file", file);

    const response = await fetch("/api/uploads", { method: "POST", body: form });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      setError(payload?.error?.message ?? "That image could not be uploaded.");
      setBusy(false);
      return;
    }

    const payload = (await response.json()) as { url: string };
    onChange(payload.url);
    setBusy(false);
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">Cover image</span>

      {value ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-sm border border-rule bg-wash">
          <Image src={value} alt="Cover preview" fill sizes="640px" className="object-cover" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-rule bg-card/50 text-sm text-muted transition-colors hover:border-ink hover:text-ink"
        >
          <span className="font-serif text-lg">Add a cover</span>
          <span className="text-xs">JPEG, PNG or WebP · up to 2 MB</span>
        </button>
      )}

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />

      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="text-rust-ink underline underline-offset-2 disabled:opacity-50">
          {busy ? "Uploading…" : value ? "Replace image" : "Choose an image"}
        </button>
        {value ? (
          <button type="button" onClick={() => onChange(null)} className="text-muted underline underline-offset-2 hover:text-ink">
            Remove
          </button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-rust-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
