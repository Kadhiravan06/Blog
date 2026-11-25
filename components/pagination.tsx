import Link from "next/link";

export function Pagination({
  page,
  total,
  perPage,
  hrefFor,
}: {
  page: number;
  total: number;
  perPage: number;
  hrefFor: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;

  return (
    <nav className="mt-14 flex items-center justify-between border-t border-rule pt-6 text-sm" aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="text-rust-ink hover:underline">
          ← Newer
        </Link>
      ) : (
        <span className="text-muted/50">← Newer</span>
      )}
      <span className="text-muted">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={hrefFor(page + 1)} className="text-rust-ink hover:underline">
          Older →
        </Link>
      ) : (
        <span className="text-muted/50">Older →</span>
      )}
    </nav>
  );
}
