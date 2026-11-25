import type { NextRequest } from "next/server";
import { requireApiViewer } from "@/lib/auth";
import { deleteComment, getCommentWithPost } from "@/lib/db/comments";
import { ApiError, route } from "@/lib/http";
import { canDeleteComment } from "@/lib/permissions";

type Context = { params: Promise<{ id: string }> };

export const DELETE = route(async (req: NextRequest, ctx: Context) => {
  const { id } = await ctx.params;
  const viewer = await requireApiViewer(req);

  const row = await getCommentWithPost(id);
  if (!row) throw new ApiError("not_found", 404, "Comment not found.");
  if (!canDeleteComment(row.comment, row.post, viewer)) {
    throw new ApiError("forbidden", 403, "That comment is not yours to delete.");
  }

  await deleteComment(id);
  return Response.json({ ok: true });
});
