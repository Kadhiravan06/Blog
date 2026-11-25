import { createAdminClient } from "@/lib/supabase/server";
import type { Comment, Paginated } from "@/lib/types";
import { mapComment, type CommentRow } from "@/lib/db/map";

const COMMENT_SELECT = "id, post_id, author_id, body, created_at, author:profiles(id, username, display_name)";

export async function listComments(postId: string, page: number, limit: number): Promise<Paginated<Comment>> {
  const from = (page - 1) * limit;
  const { data, count, error } = await createAdminClient()
    .from("comments")
    .select(COMMENT_SELECT, { count: "exact" })
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);
  return {
    items: ((data ?? []) as unknown as CommentRow[]).map(mapComment),
    page,
    total: count ?? 0,
  };
}

export async function createComment(postId: string, authorId: string, body: string): Promise<Comment> {
  const { data, error } = await createAdminClient()
    .from("comments")
    .insert({ post_id: postId, author_id: authorId, body })
    .select(COMMENT_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return mapComment(data as unknown as CommentRow);
}

export async function getCommentWithPost(
  id: string,
): Promise<{ comment: { id: string; authorId: string }; post: { authorId: string } } | null> {
  const { data, error } = await createAdminClient()
    .from("comments")
    .select("id, author_id, post:posts(author_id)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as unknown as {
    id: string;
    author_id: string;
    post: { author_id: string } | { author_id: string }[] | null;
  };
  const post = Array.isArray(row.post) ? row.post[0] : row.post;
  if (!post) return null;

  return { comment: { id: row.id, authorId: row.author_id }, post: { authorId: post.author_id } };
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await createAdminClient().from("comments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export type RecentComment = Comment & { post: { slug: string; title: string } };

export async function listRecentComments(limit = 40): Promise<RecentComment[]> {
  const { data, error } = await createAdminClient()
    .from("comments")
    .select(`${COMMENT_SELECT}, post:posts(slug, title)`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as (CommentRow & { post: { slug: string; title: string } })[]).map((row) => ({
    ...mapComment(row),
    post: row.post,
  }));
}
