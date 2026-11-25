// End-to-end smoke test against a running server.
// Usage: BASE_URL=http://localhost:3000 npm run smoke
// Optional authenticated CRUD: SMOKE_EMAIL=... SMOKE_PASSWORD=... npm run smoke

import { readFileSync } from "node:fs";

function loadEnv() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // No .env.local; rely on the shell environment.
  }
}

loadEnv();

const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "ok" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
}

async function get(path, token) {
  const response = await fetch(`${base}${path}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  return { status: response.status, body: await response.json().catch(() => null) };
}

const health = await get("/api/health");
check("health", health.status === 200 && health.body?.ok === true, `status ${health.status}`);

const feed = await get("/api/posts");
check("feed", feed.status === 200 && Array.isArray(feed.body?.items), `status ${feed.status}`);

if (process.env.SMOKE_EMAIL && process.env.SMOKE_PASSWORD) {
  const auth = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "content-type": "application/json" },
    body: JSON.stringify({ email: process.env.SMOKE_EMAIL, password: process.env.SMOKE_PASSWORD }),
  });
  const session = await auth.json().catch(() => null);
  check("sign in", auth.ok && Boolean(session?.access_token), `status ${auth.status}`);

  if (session?.access_token) {
    const token = session.access_token;
    const created = await fetch(`${base}/api/posts`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        title: `Smoke test ${new Date().toISOString()}`,
        excerpt: "Temporary post created by the smoke script.",
        contentMd: "This post is deleted by the smoke script.",
        tags: ["smoke"],
        status: "draft",
      }),
    });
    const post = await created.json().catch(() => null);
    check("create draft", created.status === 201 && Boolean(post?.slug), `status ${created.status}`);

    if (post?.slug) {
      const read = await get(`/api/posts/${post.slug}`, token);
      check("read own draft", read.status === 200, `status ${read.status}`);

      const removed = await fetch(`${base}/api/posts/${post.slug}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      check("delete draft", removed.status === 200, `status ${removed.status}`);
    }
  }
} else {
  console.log("skip  authenticated CRUD (set SMOKE_EMAIL and SMOKE_PASSWORD to enable)");
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nSmoke test passed");
