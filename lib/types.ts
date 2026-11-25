export type Role = "user" | "admin";
export type Viewer = { id: string; role: Role } | null;
export type PostStatus = "draft" | "published";

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  role: Role;
  createdAt: string;
};

export type Author = Pick<Profile, "id" | "username" | "displayName">;

export type Post = {
  id: string;
  authorId: string;
  slug: string;
  title: string;
  excerpt: string;
  contentMd: string;
  coverUrl: string | null;
  tags: string[];
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author: Author;
};

export type Paginated<T> = { items: T[]; page: number; total: number };
