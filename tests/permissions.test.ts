import { describe, expect, it } from "vitest";
import { canDeleteComment, canEditPost, canViewPost } from "@/lib/permissions";
import type { Viewer } from "@/lib/types";

const author: Viewer = { id: "author-1", role: "user" };
const stranger: Viewer = { id: "user-2", role: "user" };
const admin: Viewer = { id: "admin-1", role: "admin" };

describe("canViewPost", () => {
  it("lets anyone see a published post", () => {
    expect(canViewPost({ status: "published", authorId: "author-1" }, null)).toBe(true);
  });

  it("hides drafts from anonymous visitors", () => {
    expect(canViewPost({ status: "draft", authorId: "author-1" }, null)).toBe(false);
  });

  it("hides drafts from other users", () => {
    expect(canViewPost({ status: "draft", authorId: "author-1" }, stranger)).toBe(false);
  });

  it("lets the author and admins see drafts", () => {
    expect(canViewPost({ status: "draft", authorId: "author-1" }, author)).toBe(true);
    expect(canViewPost({ status: "draft", authorId: "author-1" }, admin)).toBe(true);
  });
});

describe("canEditPost", () => {
  it("allows the author and admins only", () => {
    expect(canEditPost({ authorId: "author-1" }, author)).toBe(true);
    expect(canEditPost({ authorId: "author-1" }, admin)).toBe(true);
    expect(canEditPost({ authorId: "author-1" }, stranger)).toBe(false);
    expect(canEditPost({ authorId: "author-1" }, null)).toBe(false);
  });
});

describe("canDeleteComment", () => {
  const comment = { authorId: "commenter-1" };
  const post = { authorId: "post-author-1" };

  it("allows the comment author, the post author and admins", () => {
    expect(canDeleteComment(comment, post, { id: "commenter-1", role: "user" })).toBe(true);
    expect(canDeleteComment(comment, post, { id: "post-author-1", role: "user" })).toBe(true);
    expect(canDeleteComment(comment, post, admin)).toBe(true);
  });

  it("rejects everyone else", () => {
    expect(canDeleteComment(comment, post, stranger)).toBe(false);
    expect(canDeleteComment(comment, post, null)).toBe(false);
  });
});
