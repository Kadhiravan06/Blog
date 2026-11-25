import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostEditor } from "@/components/post-editor";
import { requireViewer } from "@/lib/auth";
import { getPostForViewer } from "@/lib/db/posts";
import { canEditPost } from "@/lib/permissions";

export const metadata = { title: "Edit essay" };

type Params = Promise<{ slug: string }>;

export default function EditPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-5 py-24 text-sm text-muted sm:px-8">Loading the draft…</div>}>
      <Gate params={params} />
    </Suspense>
  );
}

async function Gate({ params }: { params: Params }) {
  const { slug } = await params;
  const viewer = await requireViewer(`/posts/${slug}/edit`);
  const post = await getPostForViewer(slug, viewer);
  if (!post || !canEditPost(post, viewer)) notFound();

  return (
    <PostEditor
      post={{
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        contentMd: post.contentMd,
        coverUrl: post.coverUrl,
        tags: post.tags,
        status: post.status,
      }}
    />
  );
}
