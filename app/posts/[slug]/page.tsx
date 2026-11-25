import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { Markdown } from "@/components/markdown";
import { ArticleSkeleton } from "@/components/skeletons";
import { getViewer } from "@/lib/auth";
import { listComments } from "@/lib/db/comments";
import { getPostForViewer } from "@/lib/db/posts";
import { getProfileById } from "@/lib/db/profiles";
import { formatDate, readingTime } from "@/lib/format";
import { canEditPost } from "@/lib/permissions";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostForViewer(slug, null);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
  };
}

export default function PostPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <Article params={params} />
    </Suspense>
  );
}

async function Article({ params }: { params: Params }) {
  const { slug } = await params;
  const viewer = await getViewer();
  const post = await getPostForViewer(slug, viewer);
  if (!post) notFound();

  const [commentPage, author] = await Promise.all([
    post.status === "published" ? listComments(post.id, 1, 50) : Promise.resolve({ items: [], total: 0, page: 1 }),
    getProfileById(post.authorId),
  ]);

  const editable = canEditPost(post, viewer);

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      {post.status === "draft" ? (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-rust/30 bg-rust/5 px-4 py-3 text-sm text-rust-ink">
          <span>This is a draft. Only you and the editors can see it.</span>
          {editable ? (
            <Link href={`/posts/${post.slug}/edit`} className="font-medium underline underline-offset-2">
              Continue editing
            </Link>
          ) : null}
        </div>
      ) : null}

      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← All essays
      </Link>

      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.16em] text-muted">
        {post.tags.map((tag) => (
          <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`} className="text-rust-ink hover:underline">
            {tag}
          </Link>
        ))}
        <span aria-hidden className="text-rule">
          /
        </span>
        <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
        <span aria-hidden className="text-rule">
          /
        </span>
        <span>{readingTime(post.contentMd)}</span>
      </div>

      <h1 className="mt-5 font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl">{post.title}</h1>
      <p className="mt-5 font-serif text-xl italic leading-relaxed text-muted sm:text-2xl">{post.excerpt}</p>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-y border-rule py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-wash font-serif text-sm">
            {post.author.displayName.slice(0, 1)}
          </span>
          <div className="text-sm">
            <Link href={`/authors/${post.author.username}`} className="font-medium hover:text-rust-ink">
              {post.author.displayName}
            </Link>
            {author?.bio ? <p className="max-w-xs text-xs leading-snug text-muted">{author.bio}</p> : null}
          </div>
        </div>
        {editable ? (
          <Link
            href={`/posts/${post.slug}/edit`}
            className="rounded-full border border-rule px-4 py-2 text-sm text-muted transition-colors hover:border-ink hover:text-ink"
          >
            Edit essay
          </Link>
        ) : null}
      </div>

      {post.coverUrl ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-sm bg-wash">
          <Image
            src={post.coverUrl}
            alt={`Cover for ${post.title}`}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-10">
        <Markdown>{post.contentMd}</Markdown>
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/?tag=${encodeURIComponent(tag)}`}
            className="rounded-full border border-rule px-3 py-1 text-xs uppercase tracking-[0.12em] text-muted hover:border-ink hover:text-ink"
          >
            {tag}
          </Link>
        ))}
      </div>

      {post.status === "published" ? (
        <section className="mt-16" aria-labelledby="notes-heading">
          <h2 id="notes-heading" className="font-serif text-3xl tracking-tight">
            Notes <span className="text-muted">({commentPage.total})</span>
          </h2>
          <p className="mt-2 text-sm text-muted">A margin for the next reader.</p>

          <div className="mt-8 space-y-8">
            <CommentForm slug={post.slug} signedIn={viewer !== null} nextPath={`/posts/${post.slug}`} />
            <CommentList comments={commentPage.items} viewer={viewer} postAuthorId={post.authorId} />
          </div>
        </section>
      ) : null}
    </article>
  );
}
