import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";
import { FeedSkeleton } from "@/components/skeletons";
import { listPostsByAuthorId } from "@/lib/db/posts";
import { getProfileByUsername } from "@/lib/db/profiles";
import { formatDate } from "@/lib/format";

type Params = Promise<{ username: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  return profile ? { title: profile.displayName } : { title: "Author not found" };
}

export default function AuthorPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <Author params={params} />
    </Suspense>
  );
}

async function Author({ params }: { params: Params }) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const posts = await listPostsByAuthorId(profile.id);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <header className="flex flex-col gap-6 border-b border-rule pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-5">
          <span className="flex size-16 items-center justify-center rounded-full bg-wash font-serif text-2xl">
            {profile.displayName.slice(0, 1)}
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-rust">Author</p>
            <h1 className="mt-1 font-serif text-4xl tracking-tight sm:text-5xl">{profile.displayName}</h1>
            <p className="mt-1 text-sm text-muted">@{profile.username}</p>
          </div>
        </div>
        <p className="text-sm text-muted">Writing here since {formatDate(profile.createdAt)}</p>
      </header>

      {profile.bio ? <p className="mt-6 max-w-2xl font-serif text-xl leading-relaxed text-muted">{profile.bio}</p> : null}

      <div className="mt-12">
        {posts.length === 0 ? (
          <EmptyState title="No essays yet." body="This author has not published anything. The margin is patient." />
        ) : (
          <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
