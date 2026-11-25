import { ApiError } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { mapProfile, type ProfileRow } from "@/lib/db/map";
import type { ProfileInput } from "@/lib/validation";

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await createAdminClient()
    .from("profiles")
    .select("id, username, display_name, bio, role, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProfile(data as unknown as ProfileRow) : null;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await createAdminClient()
    .from("profiles")
    .select("id, username, display_name, bio, role, created_at")
    .eq("username", username)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProfile(data as unknown as ProfileRow) : null;
}

export async function updateProfile(id: string, input: ProfileInput): Promise<Profile> {
  const update: Record<string, unknown> = {};
  if (input.username !== undefined) update.username = input.username;
  if (input.displayName !== undefined) update.display_name = input.displayName;
  if (input.bio !== undefined) update.bio = input.bio;

  const { data, error } = await createAdminClient()
    .from("profiles")
    .update(update)
    .eq("id", id)
    .select("id, username, display_name, bio, role, created_at")
    .single();

  if (error) {
    if (error.code === "23505") throw new ApiError("conflict", 409, "That username is already taken.");
    throw new Error(error.message);
  }
  return mapProfile(data as unknown as ProfileRow);
}
