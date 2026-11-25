import type { NextRequest } from "next/server";
import { getViewer, requireApiViewer } from "@/lib/auth";
import { deletePost, getPostForViewer, updatePost } from "@/lib/db/posts";
import { ApiError, isOwnCoverUrl, readJson, route } from "@/lib/http";
import { canEditPost } from "@/lib/permissions";
import { postPatchSchema } from "@/lib/validation";

type Context = { params: Promise<{ slug: string }> };

export const GET = route(async (req: NextRequest, ctx: Context) => {
  const { slug } = await ctx.params;
  const post = await getPostForViewer(slug, await getViewer(req));
  if (!post) throw new ApiError("not_found", 404, "Post not found.");
  return Response.json(post);
});

export const PATCH = route(async (req: NextRequest, ctx: Context) => {
  const { slug } = await ctx.params;
  const viewer = await requireApiViewer(req);
  const post = await getPostForViewer(slug, viewer);
  if (!post) throw new ApiError("not_found", 404, "Post not found.");
  if (!canEditPost(post, viewer)) throw new ApiError("forbidden", 403, "That post is not yours to edit.");

  const patch = await readJson(req, postPatchSchema);
  if (patch.coverUrl && !isOwnCoverUrl(patch.coverUrl)) {
    throw new ApiError("validation_failed", 422, "That cover image is not from this site.", {
      coverUrl: "Upload the image instead of linking to it.",
    });
  }

  const updated = await updatePost(post.id, patch);
  return Response.json(updated);
});

export const DELETE = route(async (req: NextRequest, ctx: Context) => {
  const { slug } = await ctx.params;
  const viewer = await requireApiViewer(req);
  const post = await getPostForViewer(slug, viewer);
  if (!post) throw new ApiError("not_found", 404, "Post not found.");
  if (!canEditPost(post, viewer)) throw new ApiError("forbidden", 403, "That post is not yours to delete.");

  await deletePost(post.id);
  return Response.json({ ok: true });
});
