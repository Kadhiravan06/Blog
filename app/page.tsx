import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import { FeedSkeleton } from "@/components/skeletons";
import { TagLinks } from "@/components/tag-links";
import { listPublishedPosts, listPublishedTags } from "@/lib/db/posts";

type SearchParams = Promise<{ tag?: string | string[]; page?: string | string[] }>;

export default function HomePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <section className="border-b border-rule/70">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-rust">A small publication</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">
            Notes on attention, craft, and the web.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Essays worth keeping, and a margin for the next reader. No feed, no algorithm — just the latest thing
            someone finished.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Suspense fallback={<FeedSkeleton />}>
          <Feed searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Feed({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const tag = typeof params.tag === "string" ? params.tag : undefined;
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1);

  const [result, tags] = await Promise.all([
    listPublishedPosts({ tag, page, limit: 6 }),
    listPublishedTags(),
  ]);

  if (result.items.length === 0) {
    return (
      <div className="space-y-10">
        <TagLinks tags={tags} active={tag} />
        <EmptyState
          title={tag ? `Nothing filed under “${tag}” yet.` : "The first page is blank."}
          body="Publish an essay and it will appear here. The margin fills up faster than you think."
          action={{ href: "/write", label: "Write the first essay" }}
        />
      </div>
    );
  }

  const [featured, ...rest] = result.items;
  const showFeatured = page === 1 && !tag;

  function hrefFor(nextPage: number) {
    const query = new URLSearchParams();
    if (tag) query.set("tag", tag);
    if (nextPage > 1) query.set("page", String(nextPage));
    const suffix = query.toString();
    return suffix ? `/?${suffix}` : "/";
  }

  return (
    <div className="space-y-12">
      <TagLinks tags={tags} active={tag} />

      {showFeatured ? <PostCard post={featured} featured /> : null}

      {rest.length > 0 ? (
        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2">
          {(showFeatured ? rest : result.items).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : null}

      <Pagination page={page} total={result.total} perPage={6} hrefFor={hrefFor} />
    </div>
  );
}
