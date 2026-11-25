import { redirect } from "next/navigation";
import { ApiError } from "@/lib/http";
import { createAdminClient, createCookieClient } from "@/lib/supabase/server";
import type { Viewer } from "@/lib/types";

export async function getViewer(request?: Request): Promise<Viewer> {
  const admin = createAdminClient();
  let userId: string | null = null;

  const bearer = request?.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) {
    const { data } = await admin.auth.getUser(bearer.slice(7).trim());
    userId = data.user?.id ?? null;
  } else {
    const supabase = await createCookieClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  }

  if (!userId) return null;

  const { data: profile } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  return { id: userId, role: profile?.role === "admin" ? "admin" : "user" };
}

export async function requireViewer(next: string) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  return viewer;
}

export async function requireApiViewer(request: Request) {
  const viewer = await getViewer(request);
  if (!viewer) throw new ApiError("unauthorized", 401, "Sign in to continue.");
  return viewer;
}
