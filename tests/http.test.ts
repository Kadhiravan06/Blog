import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, isOwnCoverUrl, readJson, route } from "@/lib/http";
import { safePath } from "@/lib/safe-path";
import { z } from "zod";

describe("route", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("maps an ApiError to the error envelope", async () => {
    const handler = route(async () => {
      throw new ApiError("not_found", 404, "Missing.");
    });
    const response = await handler();
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: { code: "not_found", message: "Missing." } });
  });

  it("maps an unknown error to a 500 without leaking details", async () => {
    const handler = route(async () => {
      throw new Error("database exploded");
    });
    const response = await handler();
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("internal");
    expect(JSON.stringify(body)).not.toContain("exploded");
  });
});

describe("readJson", () => {
  const schema = z.object({ title: z.string().min(3) });

  it("returns parsed data", async () => {
    const req = new Request("http://localhost/api", { method: "POST", body: JSON.stringify({ title: "Hello" }) });
    await expect(readJson(req, schema)).resolves.toEqual({ title: "Hello" });
  });

  it("throws a 422 with field details for invalid data", async () => {
    const req = new Request("http://localhost/api", { method: "POST", body: JSON.stringify({ title: "ab" }) });
    await expect(readJson(req, schema)).rejects.toMatchObject({
      code: "validation_failed",
      status: 422,
      fields: { title: expect.any(String) },
    });
  });

  it("throws a 422 for malformed JSON", async () => {
    const req = new Request("http://localhost/api", { method: "POST", body: "{" });
    await expect(readJson(req, schema)).rejects.toMatchObject({ code: "validation_failed", status: 422 });
  });
});

describe("isOwnCoverUrl", () => {
  const original = process.env.NEXT_PUBLIC_SUPABASE_URL;
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
  });
  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = original;
  });

  it("accepts only this project's public covers bucket", () => {
    expect(isOwnCoverUrl("https://demo.supabase.co/storage/v1/object/public/covers/a.webp")).toBe(true);
    expect(isOwnCoverUrl("https://evil.test/storage/v1/object/public/covers/a.webp")).toBe(false);
    expect(isOwnCoverUrl("https://demo.supabase.co/storage/v1/object/public/other/a.webp")).toBe(false);
  });
});

describe("safePath", () => {
  it("allows same-origin paths and rejects everything else", () => {
    expect(safePath("/posts/hello")).toBe("/posts/hello");
    expect(safePath("//evil.test")).toBe("/");
    expect(safePath("https://evil.test")).toBe("/");
    expect(safePath(null, "/login")).toBe("/login");
  });
});
