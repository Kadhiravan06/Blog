import type { PostStatus, Viewer } from "@/lib/types";

export function canViewPost(post: { status: PostStatus; authorId: string }, viewer: Viewer): boolean {
  if (post.status === "published") return true;
  return viewer !== null && (viewer.id === post.authorId || viewer.role === "admin");
}

export function canEditPost(post: { authorId: string }, viewer: Viewer): boolean {
  return viewer !== null && (viewer.id === post.authorId || viewer.role === "admin");
}

export function canDeleteComment(
  comment: { authorId: string },
  post: { authorId: string },
  viewer: Viewer,
): boolean {
  if (viewer === null) return false;
  return viewer.id === comment.authorId || viewer.id === post.authorId || viewer.role === "admin";
}
