import { NextResponse, type NextRequest } from "next/server";
import { safePath } from "@/lib/safe-path";
import { createCookieClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safePath(url.searchParams.get("next"), "/reset-password");
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;

  if (code) {
    const supabase = await createCookieClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=link`);
}
