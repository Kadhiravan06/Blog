import Link from "next/link";

export function TagLinks({ tags, active }: { tags: string[]; active?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Filter by tag">
      <Link
        href="/"
        aria-current={!active ? "page" : undefined}
        className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] transition-colors ${
          !active ? "border-ink bg-ink text-paper" : "border-rule text-muted hover:border-ink hover:text-ink"
        }`}
      >
        All
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/?tag=${encodeURIComponent(tag)}`}
          aria-current={active === tag ? "page" : undefined}
          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] transition-colors ${
            active === tag ? "border-ink bg-ink text-paper" : "border-rule text-muted hover:border-ink hover:text-ink"
          }`}
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
