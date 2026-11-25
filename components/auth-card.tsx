import Link from "next/link";

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-5 py-16 sm:px-8 sm:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-rust">{eyebrow}</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{subtitle}</p>
      <div className="mt-8">{children}</div>
      {footer ? <div className="mt-6 text-sm text-muted">{footer}</div> : null}
      <p className="mt-10 text-xs leading-relaxed text-muted">
        By continuing you agree to keep the margin civil.{" "}
        <Link href="/" className="text-rust-ink underline underline-offset-2">
          Back to the essays
        </Link>
        .
      </p>
    </div>
  );
}
