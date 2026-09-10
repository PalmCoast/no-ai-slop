import { describe, expect, it } from "vitest";
import { cameraBubble, coverRect } from "../src/lib/compose";
import { formatBytes, formatDuration } from "../src/lib/format";
import { pickMimeType } from "../src/lib/mime";

describe("format", () => {
  it("formats mm:ss and bytes", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65_000)).toBe("1:05");
    expect(formatDuration(3_600_000)).toBe("1:00:00");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
  });
});

describe("mime pick", () => {
  it("picks the first supported candidate", () => {
    expect(pickMimeType((t) => t.startsWith("video/mp4"))).toBe("video/mp4");
    expect(pickMimeType(() => false)).toBe("");
  });
});

describe("compose geometry", () => {
  it("puts the camera bubble in the bottom-right", () => {
    const b = cameraBubble(1280, 720);
    expect(b.x + b.r).toBeLessThanOrEqual(1280);
    expect(b.y + b.r).toBeLessThanOrEqual(720);
    expect(b.x).toBeGreaterThan(640);
    expect(b.y).toBeGreaterThan(360);
  });

  it("covers the destination without distorting", () => {
    const box = coverRect(640, 480, 200, 200);
    expect(box.sw).toBeCloseTo(box.sh);
    expect(box.sx).toBeGreaterThan(0);
  });
});
