import { canViewPost } from "@/lib/permissions";
import { slugWithSuffix, slugify } from "@/lib/slug";
import { deleteCover } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/server";
import type { Paginated, Post, Viewer } from "@/lib/types";
import { mapPost, type PostRow } from "@/lib/db/map";
import type { PostInput, PostPatch } from "@/lib/validation";

const POST_SELECT =
  "id, author_id, slug, title, excerpt, content_md, cover_url, tags, status, published_at, created_at, updated_at, author:profiles(id, username, display_name)";

export async function listPublishedPosts(opts: {
  tag?: string;
  page: number;
  limit: number;
}): Promise<Paginated<Post>> {
  const db = createAdminClient();
  let query = db
    .from("posts")
    .select(POST_SELECT, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("id", { ascending: false });

  if (opts.tag) query = query.contains("tags", [opts.tag]);

  const from = (opts.page - 1) * opts.limit;
  const { data, count, error } = await query.range(from, from + opts.limit - 1);
  if (error) throw new Error(error.message);

  return {
    items: ((data ?? []) as unknown as PostRow[]).map(mapPost),
    page: opts.page,
    total: count ?? 0,
  };
}

export async function listPublishedTags(): Promise<string[]> {
  const { data, error } = await createAdminClient()
    .from("posts")
    .select("tags")
    .eq("status", "published")
    .limit(200);
  if (error) throw new Error(error.message);

  const tags = new Set<string>();
  for (const row of data ?? []) {
    for (const tag of (row as { tags: string[] }).tags) tags.add(tag);
  }
  return [...tags].sort();
}

export async function getPostForViewer(slug: string, viewer: Viewer): Promise<Post | null> {
  const { data, error } = await createAdminClient()
    .from("posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const post = mapPost(data as unknown as PostRow);
  return canViewPost(post, viewer) ? post : null;
}

export async function getPostById(id: string): Promise<Post | null> {
  const { data, error } = await createAdminClient()
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapPost(data as unknown as PostRow) : null;
}

export async function listPostsByAuthorId(authorId: string, limit = 50): Promise<Post[]> {
  const { data, error } = await createAdminClient()
    .from("posts")
    .select(POST_SELECT)
    .eq("author_id", authorId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as PostRow[]).map(mapPost);
}

export async function listMyPosts(authorId: string): Promise<Post[]> {
  const { data, error } = await createAdminClient()
    .from("posts")
    .select(POST_SELECT)
    .eq("author_id", authorId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as PostRow[]).map(mapPost);
}

export async function listRecentPosts(limit = 30): Promise<Post[]> {
  const { data, error } = await createAdminClient()
    .from("posts")
    .select(POST_SELECT)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as PostRow[]).map(mapPost);
}

export async function createPost(authorId: string, input: PostInput): Promise<Post> {
  const db = createAdminClient();
  const base = slugify(input.title);

  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const slug = attempt === 1 ? base : slugWithSuffix(base, attempt);
    const { data, error } = await db
      .from("posts")
      .insert({
        author_id: authorId,
        slug,
        title: input.title,
        excerpt: input.excerpt,
        content_md: input.contentMd,
        cover_url: input.coverUrl ?? null,
        tags: input.tags,
        status: input.status,
        published_at: input.status === "published" ? new Date().toISOString() : null,
      })
      .select(POST_SELECT)
      .single();

    if (!error) return mapPost(data as unknown as PostRow);
    if (error.code !== "23505") throw new Error(error.message);
  }

  throw new Error("Could not find an available slug");
}

export async function updatePost(id: string, patch: PostPatch): Promise<Post> {
  const db = createAdminClient();
  const { data: current, error: currentError } = await db
    .from("posts")
    .select("cover_url, published_at")
    .eq("id", id)
    .single();
  if (currentError) throw new Error(currentError.message);

  const update: Record<string, unknown> = {};
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.excerpt !== undefined) update.excerpt = patch.excerpt;
  if (patch.contentMd !== undefined) update.content_md = patch.contentMd;
  if (patch.coverUrl !== undefined) update.cover_url = patch.coverUrl;
  if (patch.tags !== undefined) update.tags = patch.tags;
  if (patch.status !== undefined) {
    update.status = patch.status;
    if (patch.status === "published" && !current.published_at) update.published_at = new Date().toISOString();
    if (patch.status === "draft") update.published_at = null;
  }

  const { data, error } = await db.from("posts").update(update).eq("id", id).select(POST_SELECT).single();
  if (error) throw new Error(error.message);

  const post = mapPost(data as unknown as PostRow);
  if (post.coverUrl !== current.cover_url) await deleteCover(current.cover_url);
  return post;
}

export async function deletePost(id: string): Promise<void> {
  const db = createAdminClient();
  const { data: current } = await db.from("posts").select("cover_url").eq("id", id).maybeSingle();
  const { error } = await db.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await deleteCover(current?.cover_url ?? null);
}
