import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { AEO_PAGES, RETIRED_AEO_PAGES } from "../shared/aeo";
import { PAGE_SEO, sitemapXml } from "../shared/seo";

const corpRoot = fileURLToPath(new URL("..", import.meta.url));

describe("premium buyer pages", () => {
  it("retires all eight old-ladder question pages from routes, sitemap and llms.txt (B2B reset 2026-11-24)", () => {
    expect(AEO_PAGES).toHaveLength(0);
    expect(RETIRED_AEO_PAGES).toHaveLength(8);
    const xml = sitemapXml();
    const llms = readFileSync(join(corpRoot, "public/llms.txt"), "utf8");
    const routes = readFileSync(join(corpRoot, "scripts/write-route-html.ts"), "utf8");
    expect(routes).toContain("RETIRED_AEO_PAGES.flatMap");
    for (const r of RETIRED_AEO_PAGES) {
      expect(xml).not.toContain(r.path);
      expect(llms).not.toContain(r.path);
      expect(PAGE_SEO.some((p) => p.path === r.path)).toBe(false);
      expect(["/consult", "/concierge"]).toContain(r.to);
    }
  });

  it("hosts a separate 32-hex IndexNow key and keeps the shared key", () => {
    const key = "4f4286e18692cde11b1e47a38c8478d8";
    expect(key).toMatch(/^[0-9a-f]{32}$/);
    expect(readFileSync(join(corpRoot, "public", `${key}.txt`), "utf8").trim()).toBe(key);
    expect(readFileSync(join(corpRoot, "netlify.toml"), "utf8")).toContain(`/${key}.txt`);
    expect(readFileSync(join(corpRoot, "public/40602f6b-ecf3-406b-a8e5-2e9f601462b6.txt"), "utf8").trim()).toBe(
      "40602f6b-ecf3-406b-a8e5-2e9f601462b6",
    );
  });
});
