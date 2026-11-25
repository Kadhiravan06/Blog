import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-start px-5 py-24 sm:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-rust">404</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">This page is blank.</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        The essay may have been unpublished, or the link was typed by hand. The margin does not hold grudges.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-85"
      >
        Back to the essays
      </Link>
    </div>
  );
}
