"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await createBrowserSupabase().auth.signOut();
    router.push("/");
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="hidden rounded-full px-3 py-2 text-muted transition-colors hover:bg-wash hover:text-ink disabled:opacity-50 sm:block"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
