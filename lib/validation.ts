import { z } from "zod";

const tagSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(24)
  .regex(/^[a-z0-9-]+$/, "Tags use lowercase letters, numbers and hyphens");

export const postInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  excerpt: z.string().trim().max(240).default(""),
  contentMd: z.string().min(1).max(50_000),
  tags: z.array(tagSchema).max(5).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  coverUrl: z.url().max(2048).nullable().optional(),
});

export const postPatchSchema = postInputSchema.partial();

export const commentInputSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export const profileInputSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3)
      .max(24)
      .regex(/^[a-z0-9_]+$/, "Usernames use lowercase letters, numbers and underscores"),
    displayName: z.string().trim().min(1).max(60),
    bio: z.string().trim().max(280),
  })
  .partial();

export type PostInput = z.input<typeof postInputSchema>;
export type PostPatch = z.infer<typeof postPatchSchema>;
export type CommentInput = z.infer<typeof commentInputSchema>;
export type ProfileInput = z.infer<typeof profileInputSchema>;
