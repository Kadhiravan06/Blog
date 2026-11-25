"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-start px-5 py-24 sm:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-rust">Something broke</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">The press is jammed.</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        This is on us, not on you. Try again; if it keeps happening, the database may be waking up.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-85"
      >
        Try again
      </button>
    </div>
  );
}
