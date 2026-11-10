import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sitemapXml, TEMPLATE_PAGE_URLS } from "../shared/seo.ts";

const PAGES = [
  { slug: "muscle-memory-bot-template", whop: "https://whop.com/agenthive/muscle-memory-template/" },
  { slug: "github-repo-to-windows-exe", whop: "https://whop.com/agenthive/exe-builder/" },
];

describe("static Grok Bot template pages", () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const { slug, whop } of PAGES) {
    it(`${slug} has one H1, unique meta, OG, JSON-LD, disclosure and a Whop CTA`, () => {
      const html = readFileSync(new URL(`../public/${slug}/index.html`, import.meta.url), "utf8");
      const url = `https://agenthiveinc.com/${slug}/`;
      expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
      expect(html).toContain(`<link rel="canonical" href="${url}">`);
      expect(html).toContain(`<meta property="og:url" content="${url}">`);
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
      const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "";
      expect(title.length).toBeGreaterThan(20);
      expect(description.length).toBeGreaterThan(80);
      expect(titles.has(title)).toBe(false);
      expect(descriptions.has(description)).toBe(false);
      titles.add(title);
      descriptions.add(description);
      const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "{}");
      const types = (ld["@graph"] ?? []).map((node: { "@type": string }) => node["@type"]);
      expect(types).toEqual(expect.arrayContaining(["Article", "Product", "FAQPage", "BreadcrumbList"]));
      const product = ld["@graph"].find((node: { "@type": string }) => node["@type"] === "Product");
      expect(product.offers.price).toBe("49.00");
      expect(product.offers.url).toBe(whop);
      expect(html).toContain(`href="${whop}"`);
      expect(html).toContain("Disclosure:");
      expect(sitemapXml()).toContain(`<loc>${url}</loc>`);
      expect(TEMPLATE_PAGE_URLS).toContain(url);
      expect(html).not.toMatch(/plumb|hvac|roof|electrician|contractor|trades|crew|dispatch|orange|guarantee|lorem|TODO/i);
      // No phone number other than the one public line.
      for (const m of html.matchAll(/\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}/g)) {
        expect(m[0]).toBe("(320) 335-6186");
      }
    });
  }
});
