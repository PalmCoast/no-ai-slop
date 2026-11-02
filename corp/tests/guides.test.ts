import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sitemapXml } from "../shared/seo.ts";

const GUIDES = [
  "founder-stack",
  "gifts-for-tech-founders",
  "ads/ai-video-ads-for-shopify",
  "startup-website-hosting",
  "business-email-new-domain",
];

describe("static picks guide pages", () => {
  for (const slug of GUIDES) {
    it(`${slug} has one H1, canonical, structured data, disclosure and a picks link`, () => {
      const html = readFileSync(new URL(`../public/${slug}/index.html`, import.meta.url), "utf8");
      const url = `https://agenthiveinc.com/${slug}/`;
      expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
      expect(html).toContain(`<link rel="canonical" href="${url}">`);
      expect(html).toContain(`<meta property="og:url" content="${url}">`);
      expect(html).toContain('"@type": "Article"');
      expect(html).toContain("Disclosure:");
      expect(html).toContain('href="/picks/"');
      expect(sitemapXml()).toContain(`<loc>${url}</loc>`);
      for (const m of html.matchAll(/<a [^>]*href="https:\/\/(join\.netlify\.com|mailcheap\.ai|higgsfield\.ai)[^"]*"[^>]*>/g)) {
        expect(m[0]).toContain('rel="sponsored nofollow"');
      }
      expect(html).not.toMatch(/plumb|hvac|roof|electrician|contractor|trades|field op|crew|dispatch|vercel|spacex|orange|guarantee|micro1|mercor/i);
    });
  }
});
