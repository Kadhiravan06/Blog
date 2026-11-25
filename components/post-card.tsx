import Image from "next/image";
import Link from "next/link";
import { formatDate, readingTime } from "@/lib/format";
import type { Post } from "@/lib/types";

function Cover({ post, priority }: { post: Post; priority?: boolean }) {
  if (post.coverUrl) {
    return (
      <Image
        src={post.coverUrl}
        alt={`Cover for ${post.title}`}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 640px, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-end bg-wash p-6">
      <span className="font-serif text-3xl italic text-muted">{post.tags[0] ?? "essay"}</span>
    </div>
  );
}

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const cover = (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative block aspect-[16/10] overflow-hidden rounded-sm bg-wash"
      tabIndex={-1}
      aria-hidden
    >
      <Cover post={post} priority={featured} />
    </Link>
  );

  const body = (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.14em] text-muted">
        {post.tags.slice(0, 3).map((tag) => (
          <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`} className="text-rust-ink hover:underline">
            {tag}
          </Link>
        ))}
        <span aria-hidden className="text-rule">
          /
        </span>
        <span>{formatDate(post.publishedAt)}</span>
      </div>

      <h2 className={featured ? "mt-4 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl" : "mt-3 font-serif text-2xl leading-tight tracking-tight"}>
        <Link href={`/posts/${post.slug}`} className="decoration-rule decoration-1 underline-offset-4 hover:underline">
          {post.title}
        </Link>
      </h2>

      <p className={featured ? "mt-4 max-w-2xl text-lg leading-relaxed text-muted" : "mt-2.5 line-clamp-3 text-[15px] leading-relaxed text-muted"}>
        {post.excerpt}
      </p>

      <p className="mt-5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
        <Link href={`/authors/${post.author.username}`} className="font-medium text-ink hover:text-rust-ink">
          {post.author.displayName}
        </Link>
        <span aria-hidden>·</span>
        <span>{readingTime(post.contentMd)}</span>
      </p>
    </div>
  );

  if (!featured) {
    return (
      <article className="group flex flex-col gap-5">
        {cover}
        {body}
      </article>
    );
  }

  return (
    <article className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
      {cover}
      {body}
    </article>
  );
}
