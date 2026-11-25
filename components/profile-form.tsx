"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ApiPayload = { error?: { message?: string; fields?: Record<string, string> } };

export function ProfileForm({
  initial,
}: {
  initial: { username: string; displayName: string; bio: string };
}) {
  const router = useRouter();
  const [username, setUsername] = useState(initial.username);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [bio, setBio] = useState(initial.bio);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});
    setSaved(false);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, displayName, bio }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as ApiPayload | null;
      setError(payload?.error?.message ?? "Your profile could not be saved.");
      setFields(payload?.error?.fields ?? {});
      setBusy(false);
      return;
    }

    setSaved(true);
    setBusy(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <div role="alert" className="rounded-lg border border-rust/30 bg-rust/5 px-4 py-3 text-sm text-rust-ink">
          <p>{error}</p>
          {Object.keys(fields).length > 0 ? (
            <ul className="mt-1 list-inside list-disc text-xs">
              {Object.entries(fields).map(([field, message]) => (
                <li key={field}>
                  {field}: {message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {saved ? (
        <p className="rounded-lg border border-rule bg-wash px-4 py-3 text-sm">Saved. Your public page is up to date.</p>
      ) : null}

      <div>
        <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium">
          Display name
        </label>
        <input
          id="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={60}
          required
          className="w-full rounded-lg border border-rule bg-card px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-rust"
        />
      </div>

      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
          Username
        </label>
        <div className="flex items-center rounded-lg border border-rule bg-card px-3.5 focus-within:border-rust">
          <span className="text-sm text-muted">@</span>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={24}
            required
            pattern="[a-z0-9_]+"
            className="w-full bg-transparent py-2.5 pl-1 text-[15px] outline-none"
          />
        </div>
        <p className="mt-1.5 text-xs text-muted">Lowercase letters, numbers and underscores. This is your public URL.</p>
      </div>

      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={280}
          rows={3}
          placeholder="One or two sentences for the author page."
          className="w-full resize-y rounded-lg border border-rule bg-card px-3.5 py-2.5 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-muted/60 focus:border-rust"
        />
        <p className="mt-1 text-right text-xs text-muted">{bio.length}/280</p>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
