import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CREATIVE_CALCULATOR_URL, PAGE_SEO, sitemapXml } from "../shared/seo";

const corpRoot = fileURLToPath(new URL("..", import.meta.url));
const pageFile = join(corpRoot, "public/ads/creative-calculator/index.html");

describe("free creative planner at /ads/creative-calculator/", () => {
  it("ships as a static file with its canonical, /ph.js and the ads_cta_click links", () => {
    expect(existsSync(pageFile)).toBe(true);
    const html = readFileSync(pageFile, "utf8");
    expect(html).toContain(`<link rel="canonical" href="${CREATIVE_CALCULATOR_URL}">`);
    expect(html).toContain('<script src="/ph.js" defer></script>');
    expect(html.match(/<a [^>]*data-ah-event="ads_cta_click"/g)?.length).toBe(3);
    expect(html).not.toMatch(/@agenthiveinc\.com|mailto:|buy\.stripe\.com|AggregateRating|tel:/i);
    expect(html).not.toMatch(new RegExp(String.fromCharCode(71, 114, 111, 107), "i"));
  });

  it("is a fixed sitemap entry next to /ram-deals, not a PAGE_SEO route", () => {
    const xml = sitemapXml();
    expect(xml).toContain(`<loc>${CREATIVE_CALCULATOR_URL}</loc>`);
    expect(xml.match(/<loc>/g)?.length).toBe(32);
    expect(xml.indexOf("/ram-deals/</loc>")).toBeLessThan(xml.indexOf(`${CREATIVE_CALCULATOR_URL}</loc>`));
    expect(PAGE_SEO.some((page) => page.path.startsWith("/ads/creative-calculator"))).toBe(false);
  });
});
