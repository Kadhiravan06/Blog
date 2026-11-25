import type { NextRequest } from "next/server";
import { requireApiViewer } from "@/lib/auth";
import { listPublishedPosts, createPost } from "@/lib/db/posts";
import { ApiError, isOwnCoverUrl, parseWith, readJson, route } from "@/lib/http";
import { assertRateLimit } from "@/lib/rate-limit";
import { pageQuerySchema, postInputSchema } from "@/lib/validation";

const PER_PAGE = 6;

export const GET = route(async (req: NextRequest) => {
  const query = parseWith(pageQuerySchema, Object.fromEntries(req.nextUrl.searchParams));
  const result = await listPublishedPosts({ tag: query.tag, page: query.page, limit: PER_PAGE });
  return Response.json(result);
});

export const POST = route(async (req: NextRequest) => {
  const viewer = await requireApiViewer(req);
  await assertRateLimit("posts", viewer.id, 3, 60);

  const input = await readJson(req, postInputSchema);
  if (input.coverUrl && !isOwnCoverUrl(input.coverUrl)) {
    throw new ApiError("validation_failed", 422, "That cover image is not from this site.", {
      coverUrl: "Upload the image instead of linking to it.",
    });
  }

  const post = await createPost(viewer.id, input);
  return Response.json(post, { status: 201 });
});
