import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="font-serif text-xl tracking-tight">
            The Margin<span className="text-rust">.</span>
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
            A small publication about attention, craft, and the web. Built with Next.js and Supabase.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <Link href="/" className="hover:text-ink">
            Essays
          </Link>
          <Link href="/write" className="hover:text-ink">
            Write
          </Link>
          <Link href="/login" className="hover:text-ink">
            Sign in
          </Link>
          <span className="text-rule">·</span>
          <span>2026</span>
        </div>
      </div>
    </footer>
  );
}
