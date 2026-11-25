import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

export function NavSkeleton() {
  return (
    <header className="border-b border-rule/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <span className="font-serif text-2xl tracking-tight">The Margin<span className="text-rust">.</span></span>
        <span className="h-8 w-28" />
      </div>
    </header>
  );
}

export async function SiteNav() {
  const viewer = await getViewer();

  return (
    <header className="sticky top-0 z-40 border-b border-rule/70 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          The Margin<span className="text-rust">.</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm sm:gap-2" aria-label="Main">
          <Link
            href="/"
            className="hidden rounded-full px-3 py-2 text-muted transition-colors hover:bg-wash hover:text-ink sm:block"
          >
            Essays
          </Link>

          {viewer ? (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-full px-3 py-2 text-muted transition-colors hover:bg-wash hover:text-ink sm:block"
              >
                Dashboard
              </Link>
              <Link
                href="/write"
                className="rounded-full bg-ink px-4 py-2 font-medium text-paper transition-opacity hover:opacity-85"
              >
                Write
              </Link>
              <ThemeToggle />
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 text-muted transition-colors hover:bg-wash hover:text-ink">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-ink px-4 py-2 font-medium text-paper transition-opacity hover:opacity-85"
              >
                Start writing
              </Link>
              <ThemeToggle />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
