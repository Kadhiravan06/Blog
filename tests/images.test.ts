import { describe, expect, it } from "vitest";
import { sniffImageType } from "@/lib/images";

const bytes = (...values: number[]) => new Uint8Array(values);
const text = (value: string) => new TextEncoder().encode(value);

describe("sniffImageType", () => {
  it("recognizes JPEG, PNG and WebP by signature", () => {
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png");
    expect(sniffImageType(text("RIFF0000WEBP"))).toBe("image/webp");
  });

  it("rejects HTML, SVG, PDF and GIF", () => {
    expect(sniffImageType(text("<html>"))).toBeNull();
    expect(sniffImageType(text("<svg xmlns"))).toBeNull();
    expect(sniffImageType(text("%PDF-1.7"))).toBeNull();
    expect(sniffImageType(text("GIF89a"))).toBeNull();
  });
});
