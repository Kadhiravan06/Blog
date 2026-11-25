import { ApiError } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Serverless-safe window limit: counts rows written by this user in the window.
 * shortcut: two simultaneous requests can both pass the check; acceptable at this scale.
 */
export async function assertRateLimit(
  table: "posts" | "comments",
  userId: string,
  limit: number,
  windowSeconds: number,
) {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count, error } = await createAdminClient()
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .gte("created_at", since);

  if (error) throw new ApiError("internal", 500, "Could not check the rate limit.");
  if ((count ?? 0) >= limit) {
    throw new ApiError("rate_limited", 429, "That is a lot at once. Take a minute and try again.");
  }
}
