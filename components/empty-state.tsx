import Link from "next/link";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-sm border border-dashed border-rule bg-card/50 px-6 py-14 text-center">
      <p className="font-serif text-2xl tracking-tight">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">{body}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-85"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
