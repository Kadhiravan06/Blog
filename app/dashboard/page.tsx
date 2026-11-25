import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { requireViewer } from "@/lib/auth";
import { listMyPosts } from "@/lib/db/posts";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-5 py-24 text-sm text-muted sm:px-8">Opening the drawer…</div>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const viewer = await requireViewer("/dashboard");
  const posts = await listMyPosts(viewer.id);

  const published = posts.filter((post) => post.status === "published").length;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-rust">Your desk</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Drafts and published</h1>
          <p className="mt-2 text-sm text-muted">
            {posts.length} {posts.length === 1 ? "essay" : "essays"} · {published} published
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:bg-wash hover:text-ink"
          >
            Settings
          </Link>
          <Link
            href="/write"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-85"
          >
            New essay
          </Link>
        </div>
      </header>

      <div className="mt-10">
        {posts.length === 0 ? (
          <EmptyState
            title="Nothing on the desk yet."
            body="Start with a title and one honest paragraph. You can keep it as a draft until it is ready."
            action={{ href: "/write", label: "Write the first draft" }}
          />
        ) : (
          <ul className="divide-y divide-rule">
            {posts.map((post) => (
              <li key={post.id} className="flex flex-wrap items-baseline justify-between gap-4 py-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted">
                    <span
                      className={
                        post.status === "published"
                          ? "rounded-full bg-wash px-2 py-0.5 text-ink"
                          : "rounded-full border border-rule px-2 py-0.5"
                      }
                    >
                      {post.status}
                    </span>
                    <span>{formatDate(post.updatedAt)}</span>
                  </div>
                  <h2 className="mt-2 font-serif text-2xl leading-tight tracking-tight">
                    <Link href={`/posts/${post.slug}`} className="hover:text-rust-ink">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-1 line-clamp-1 text-sm text-muted">{post.excerpt || "No standfirst yet."}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Link href={`/posts/${post.slug}`} className="text-muted hover:text-ink">
                    View
                  </Link>
                  <Link href={`/posts/${post.slug}/edit`} className="text-rust-ink hover:underline">
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
