import { describe, expect, it } from "vitest";
import { commentInputSchema, postInputSchema, profileInputSchema } from "@/lib/validation";

const validPost = {
  title: "A reasonable title",
  excerpt: "A short summary.",
  contentMd: "Hello world",
  tags: ["reading", "habits"],
  status: "draft" as const,
};

describe("postInputSchema", () => {
  it("accepts a valid post and applies defaults", () => {
    const parsed = postInputSchema.parse({ title: validPost.title, contentMd: validPost.contentMd });
    expect(parsed.status).toBe("draft");
    expect(parsed.tags).toEqual([]);
    expect(parsed.excerpt).toBe("");
  });

  it("rejects a short title and a long excerpt", () => {
    expect(postInputSchema.safeParse({ ...validPost, title: "ab" }).success).toBe(false);
    expect(postInputSchema.safeParse({ ...validPost, excerpt: "x".repeat(241) }).success).toBe(false);
  });

  it("rejects too many tags and badly formatted tags", () => {
    expect(postInputSchema.safeParse({ ...validPost, tags: ["a", "b", "c", "d", "e", "f"] }).success).toBe(false);
    expect(postInputSchema.safeParse({ ...validPost, tags: ["Bad Tag"] }).success).toBe(false);
  });
});

describe("commentInputSchema", () => {
  it("accepts 1 to 2000 characters after trimming", () => {
    expect(commentInputSchema.parse({ body: "  a note  " }).body).toBe("a note");
  });

  it("rejects empty and oversized bodies", () => {
    expect(commentInputSchema.safeParse({ body: "   " }).success).toBe(false);
    expect(commentInputSchema.safeParse({ body: "x".repeat(2001) }).success).toBe(false);
  });
});

describe("profileInputSchema", () => {
  it("accepts a valid username, display name and bio", () => {
    expect(profileInputSchema.safeParse({ username: "ada_whitfield", displayName: "Ada", bio: "Hi" }).success).toBe(true);
  });

  it("rejects short or uppercase usernames", () => {
    expect(profileInputSchema.safeParse({ username: "ab" }).success).toBe(false);
    expect(profileInputSchema.safeParse({ username: "Ada" }).success).toBe(false);
  });
});
