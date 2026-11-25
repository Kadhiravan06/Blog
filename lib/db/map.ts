import type { Author, Comment, Post, Profile } from "@/lib/types";

export type AuthorRow = { id: string; username: string; display_name: string };

export type PostRow = {
  id: string;
  author_id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  cover_url: string | null;
  tags: string[];
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author: AuthorRow | AuthorRow[] | null;
};

export type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author: AuthorRow | AuthorRow[] | null;
};

export type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  role: "user" | "admin";
  created_at: string;
};

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapAuthor(row: AuthorRow | AuthorRow[] | null): Author {
  const author = one(row);
  return {
    id: author?.id ?? "",
    username: author?.username ?? "unknown",
    displayName: author?.display_name ?? "Unknown",
  };
}

export function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    contentMd: row.content_md,
    coverUrl: row.cover_url,
    tags: row.tags,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: mapAuthor(row.author),
  };
}

export function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    body: row.body,
    createdAt: row.created_at,
    author: mapAuthor(row.author),
  };
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio,
    role: row.role,
    createdAt: row.created_at,
  };
}
