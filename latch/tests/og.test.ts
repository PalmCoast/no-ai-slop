import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const html = readFileSync(resolve(__dirname, "../index.html"), "utf8");
const meta = (attr: string, key: string) =>
  html.match(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="([^"]+)"`))?.[1];

describe("share preview tags", () => {
  it("has Open Graph and Twitter large-image tags on the production host", () => {
    for (const key of ["og:title", "og:description", "og:image", "og:url"]) {
      expect(meta("property", key), key).toBeTruthy();
    }
    expect(meta("name", "twitter:card")).toBe("summary_large_image");
    expect(meta("property", "og:image")).toBe("https://latch.agenthiveinc.com/og.png");
    expect(meta("name", "twitter:image")).toBe("https://latch.agenthiveinc.com/og.png");
    expect(html.replace(/\s+/g, " ")).toMatch(/does not treat autism, ADHD, or CPTSD/);
  });

  it("ships a 1200x630 PNG", () => {
    const buf = readFileSync(resolve(__dirname, "../public/og.png"));
    expect(buf.subarray(1, 4).toString()).toBe("PNG");
    expect(buf.readUInt32BE(16)).toBe(1200);
    expect(buf.readUInt32BE(20)).toBe(630);
    expect(statSync(resolve(__dirname, "../public/og.png")).size).toBeLessThan(5_000_000);
  });
});
