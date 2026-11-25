const MAX_SLUG = 60;
const MAX_SLUG_WITH_SUFFIX = 80;

export function slugify(title: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG)
    .replace(/-+$/g, "");

  return base || "post";
}

export function slugWithSuffix(base: string, n: number): string {
  const suffix = `-${n}`;
  const truncated = base.slice(0, MAX_SLUG_WITH_SUFFIX - suffix.length).replace(/-+$/g, "");
  return `${truncated}${suffix}`;
}
