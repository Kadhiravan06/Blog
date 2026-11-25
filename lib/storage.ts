import { ApiError, isOwnCoverUrl } from "@/lib/http";
import { sniffImageType, type ImageType } from "@/lib/images";
import { createAdminClient } from "@/lib/supabase/server";

const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS: Record<ImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadCover(file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new ApiError("payload_too_large", 413, "Images must be 2 MB or smaller.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) {
    throw new ApiError("unsupported_media_type", 415, "Only JPEG, PNG or WebP images are allowed.");
  }

  const key = `${crypto.randomUUID()}.${EXTENSIONS[type]}`;
  const db = createAdminClient();
  const { error } = await db.storage.from("covers").upload(key, bytes, {
    contentType: type,
    upsert: false,
  });

  if (error) throw new ApiError("internal", 500, "The image could not be stored.");

  return db.storage.from("covers").getPublicUrl(key).data.publicUrl;
}

export async function deleteCover(url: string | null): Promise<void> {
  if (!url || !isOwnCoverUrl(url)) return;
  const key = url.split("/covers/")[1];
  if (!key) return;
  try {
    await createAdminClient().storage.from("covers").remove([key]);
  } catch {
    // Best effort: an orphaned image is harmless.
  }
}
