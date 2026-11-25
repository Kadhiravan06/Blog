import { describe, expect, it } from "vitest";
import { slugify, slugWithSuffix } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates words", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("strips diacritics", () => {
    expect(slugify("Café Déjà Vu")).toBe("cafe-deja-vu");
  });

  it("caps the slug at 60 characters without a trailing hyphen", () => {
    const slug = slugify("a".repeat(70));
    expect(slug.length).toBe(60);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("falls back to post for an empty title", () => {
    expect(slugify("!!!")).toBe("post");
  });

  it("adds a numeric suffix within the length cap", () => {
    expect(slugWithSuffix("hello", 2)).toBe("hello-2");
    expect(slugWithSuffix("a".repeat(60), 12).length).toBeLessThanOrEqual(80);
  });
});
