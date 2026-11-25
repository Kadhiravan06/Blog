import { route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";

export const GET = route(async () => {
  const { error } = await createAdminClient().from("posts").select("id", { head: true, count: "exact" });
  if (error) {
    return Response.json({ ok: false }, { status: 503 });
  }
  return Response.json({ ok: true });
});
