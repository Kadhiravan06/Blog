"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CoverUpload } from "@/components/cover-upload";
import { DeleteButton } from "@/components/delete-button";
import { Markdown } from "@/components/markdown";
import type { PostStatus } from "@/lib/types";

type EditorPost = {
  slug: string;
  title: string;
  excerpt: string;
  contentMd: string;
  coverUrl: string | null;
  tags: string[];
  status: PostStatus;
};

type ApiPayload = { error?: { message?: string; fields?: Record<string, string> } };

export function PostEditor({ post }: { post?: EditorPost }) {
  const router = useRouter();
  const editing = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.contentMd ?? "");
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(post?.coverUrl ?? null);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<PostStatus | null>(null);

  async function save(status: PostStatus) {
    setBusy(status);
    setError(null);
    setFields({});

    const payload = {
      title,
      excerpt,
      contentMd: content,
      tags: tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
      status,
      coverUrl,
    };

    const response = await fetch(editing ? `/api/posts/${post!.slug}` : "/api/posts", {
      method: editing ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiPayload | null;
      setError(body?.error?.message ?? "The essay could not be saved.");
      setFields(body?.error?.fields ?? {});
      setBusy(null);
      return;
    }

    const saved = (await response.json()) as { slug: string };
    router.push(`/posts/${saved.slug}`);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-rust">{editing ? "Editing" : "New essay"}</p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight">{editing ? "Back to the draft" : "Write something worth keeping"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="rounded-full px-4 py-2 text-sm text-muted hover:bg-wash hover:text-ink">
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => save("draft")}
            disabled={busy !== null}
            className="rounded-full border border-rule px-4 py-2 text-sm transition-colors hover:border-ink disabled:opacity-50"
          >
            {busy === "draft" ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => save("published")}
            disabled={busy !== null}
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {busy === "published" ? "Publishing…" : post?.status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {error ? (
        <div role="alert" className="mt-6 rounded-lg border border-rust/30 bg-rust/5 px-4 py-3 text-sm text-rust-ink">
          <p>{error}</p>
          {Object.keys(fields).length > 0 ? (
            <ul className="mt-1 list-inside list-disc text-xs">
              {Object.entries(fields).map(([field, message]) => (
                <li key={field}>
                  {field}: {message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="A title that earns the click"
              className="w-full rounded-lg border border-rule bg-card px-3.5 py-3 font-serif text-2xl outline-none transition-colors placeholder:text-muted/50 focus:border-rust"
            />
            <p className="mt-1 text-right text-xs text-muted">{title.length}/120</p>
          </div>

          <div>
            <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium">
              Standfirst
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              maxLength={240}
              rows={2}
              placeholder="One or two sentences that make the reader stay."
              className="w-full resize-y rounded-lg border border-rule bg-card px-3.5 py-3 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-muted/50 focus:border-rust"
            />
            <p className="mt-1 text-right text-xs text-muted">{excerpt.length}/240</p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="content" className="block text-sm font-medium">
                Body (Markdown)
              </label>
              <button
                type="button"
                onClick={() => setPreview((value) => !value)}
                className="text-xs text-rust-ink underline underline-offset-2"
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>

            {preview ? (
              <div className="min-h-96 rounded-lg border border-rule bg-card px-6 py-6">
                {content.trim() ? <Markdown>{content}</Markdown> : <p className="text-sm text-muted">Nothing to preview yet.</p>}
              </div>
            ) : (
              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={22}
                placeholder={"## A heading\n\nWrite the essay. Markdown works: **bold**, _italic_, lists, quotes, links."}
                className="w-full resize-y rounded-lg border border-rule bg-card px-4 py-4 font-mono text-sm leading-relaxed outline-none transition-colors placeholder:text-muted/50 focus:border-rust"
              />
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <CoverUpload value={coverUrl} onChange={setCoverUrl} />

          <div>
            <label htmlFor="tags" className="mb-1.5 block text-sm font-medium">
              Tags
            </label>
            <input
              id="tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="reading, habits"
              className="w-full rounded-lg border border-rule bg-card px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/50 focus:border-rust"
            />
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Up to five, lowercase, separated by commas. They become the filters on the home page.
            </p>
          </div>

          <div className="rounded-sm border border-rule bg-card px-4 py-4 text-xs leading-relaxed text-muted">
            <p className="font-medium text-ink">Before you publish</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Drafts are visible only to you.</li>
              <li>The first publish sets the date; later edits keep it.</li>
              <li>Replacing the cover deletes the old image.</li>
            </ul>
          </div>

          {editing ? (
            <div className="border-t border-rule pt-4">
              <DeleteButton
                url={`/api/posts/${post!.slug}`}
                label="Delete this essay"
                confirmText="Delete this essay and its notes? This cannot be undone."
                redirectTo="/dashboard"
                className="text-xs text-muted underline underline-offset-2 hover:text-rust-ink disabled:opacity-50"
              />
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
