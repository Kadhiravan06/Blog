import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeleteButton } from "@/components/delete-button";
import { requireViewer } from "@/lib/auth";
import { listRecentComments } from "@/lib/db/comments";
import { listRecentPosts } from "@/lib/db/posts";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Moderation" };

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-5 py-24 text-sm text-muted sm:px-8">Opening the moderation desk…</div>}>
      <Admin />
    </Suspense>
  );
}

async function Admin() {
  const viewer = await requireViewer("/admin");
  if (viewer.role !== "admin") notFound();

  const [posts, comments] = await Promise.all([listRecentPosts(30), listRecentComments(40)]);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-rust">Moderation</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Keep the margin civil</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Recent posts and notes across the site. Deleting is permanent, and it is a tool, not a punishment.
      </p>

      <section className="mt-12" aria-labelledby="posts-heading">
        <h2 id="posts-heading" className="font-serif text-2xl tracking-tight">
          Recent posts <span className="text-muted">({posts.length})</span>
        </h2>
        <ul className="mt-4 divide-y divide-rule border-t border-rule">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  {post.status} · {post.author.displayName} · {formatDate(post.updatedAt)}
                </p>
                <Link href={`/posts/${post.slug}`} className="font-serif text-xl leading-tight tracking-tight hover:text-rust-ink">
                  {post.title}
                </Link>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link href={`/posts/${post.slug}/edit`} className="text-muted hover:text-ink">
                  Edit
                </Link>
                <DeleteButton
                  url={`/api/posts/${post.slug}`}
                  label="Delete"
                  confirmText={`Delete “${post.title}” and all of its notes?`}
                  className="text-xs text-muted underline underline-offset-2 hover:text-rust-ink disabled:opacity-50"
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="comments-heading">
        <h2 id="comments-heading" className="font-serif text-2xl tracking-tight">
          Recent notes <span className="text-muted">({comments.length})</span>
        </h2>
        <ul className="mt-4 divide-y divide-rule border-t border-rule">
          {comments.map((comment) => (
            <li key={comment.id} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  {comment.author.displayName} on{" "}
                  <Link href={`/posts/${comment.post.slug}`} className="text-rust-ink hover:underline">
                    {comment.post.title}
                  </Link>{" "}
                  · {formatDate(comment.createdAt)}
                </p>
                <DeleteButton
                  url={`/api/comments/${comment.id}`}
                  label="Delete"
                  confirmText="Delete this note?"
                  className="text-xs text-muted underline underline-offset-2 hover:text-rust-ink disabled:opacity-50"
                />
              </div>
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed">{comment.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
