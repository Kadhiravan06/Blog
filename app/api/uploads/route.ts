import type { NextRequest } from "next/server";
import { requireApiViewer } from "@/lib/auth";
import { ApiError, route } from "@/lib/http";
import { uploadCover } from "@/lib/storage";

export const POST = route(async (req: NextRequest) => {
  await requireApiViewer(req);

  const origin = req.headers.get("origin");
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (origin && site && origin !== site) {
    throw new ApiError("forbidden", 403, "That request came from another site.");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new ApiError("validation_failed", 422, "Expected a multipart form with an image.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    throw new ApiError("validation_failed", 422, "Choose an image to upload.", { file: "An image is required." });
  }

  const url = await uploadCover(file);
  return Response.json({ url }, { status: 201 });
});
