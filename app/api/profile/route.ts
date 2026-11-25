import type { NextRequest } from "next/server";
import { requireApiViewer } from "@/lib/auth";
import { updateProfile } from "@/lib/db/profiles";
import { readJson, route } from "@/lib/http";
import { profileInputSchema } from "@/lib/validation";

export const PATCH = route(async (req: NextRequest) => {
  const viewer = await requireApiViewer(req);
  const input = await readJson(req, profileInputSchema);
  const profile = await updateProfile(viewer.id, input);
  return Response.json(profile);
});
