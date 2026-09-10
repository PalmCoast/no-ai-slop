import { describe, expect, it } from "vitest";
import { chunkCountForSize, concatBytes, splitBytes, assertChunkPlan } from "../shared/chunks";
import { isAllowedMime, isClipId, makeClipId, normalizeTitle } from "../shared/types";

describe("clip ids", () => {
  it("makes 10-character ids from the alphabet", () => {
    const id = makeClipId(() => 0);
    expect(id).toHaveLength(10);
    expect(isClipId(id)).toBe(true);
  });

  it("rejects short or punctuated ids", () => {
    expect(isClipId("abc")).toBe(false);
    expect(isClipId("abcdefghij!")).toBe(false);
  });
});

describe("titles and mime", () => {
  it("fills a blank title", () => {
    expect(normalizeTitle("")).toBe("Untitled Flick");
    expect(normalizeTitle("  Hello  ")).toBe("Hello");
  });

  it("allows webm and mp4 families", () => {
    expect(isAllowedMime("video/webm;codecs=vp9,opus")).toBe(true);
    expect(isAllowedMime("video/mp4")).toBe(true);
    expect(isAllowedMime("application/octet-stream")).toBe(false);
  });
});

describe("chunking", () => {
  it("splits and reassembles bytes", () => {
    const data = new Uint8Array(10).map((_, i) => i + 1);
    const parts = splitBytes(data, 4);
    expect(parts.map((p) => Array.from(p))).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10],
    ]);
    expect(Array.from(concatBytes(parts))).toEqual(Array.from(data));
  });

  it("counts chunks for a given size", () => {
    expect(chunkCountForSize(3_500_000)).toBe(1);
    expect(chunkCountForSize(3_500_001)).toBe(2);
    expect(assertChunkPlan(100, 1)).toBeNull();
    expect(assertChunkPlan(100, 2)).toMatch(/does not match/);
  });
});
