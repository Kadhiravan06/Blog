import type { NextRequest } from "next/server";
import { getViewer, requireApiViewer } from "@/lib/auth";
import { createComment, listComments } from "@/lib/db/comments";
import { getPostForViewer } from "@/lib/db/posts";
import { ApiError, readJson, route } from "@/lib/http";
import { assertRateLimit } from "@/lib/rate-limit";
import { commentInputSchema } from "@/lib/validation";

type Context = { params: Promise<{ slug: string }> };
const PER_PAGE = 50;

export const GET = route(async (req: NextRequest, ctx: Context) => {
  const { slug } = await ctx.params;
  const post = await getPostForViewer(slug, await getViewer(req));
  if (!post) throw new ApiError("not_found", 404, "Post not found.");

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1") || 1);
  const result = await listComments(post.id, page, PER_PAGE);
  return Response.json(result);
});

export const POST = route(async (req: NextRequest, ctx: Context) => {
  const { slug } = await ctx.params;
  const viewer = await requireApiViewer(req);
  const post = await getPostForViewer(slug, viewer);
  if (!post || post.status !== "published") throw new ApiError("not_found", 404, "Post not found.");

  await assertRateLimit("comments", viewer.id, 5, 60);
  const input = await readJson(req, commentInputSchema);
  const comment = await createComment(post.id, viewer.id, input.body);
  return Response.json(comment, { status: 201 });
});
