import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RAM_GUIDE_URLS, sitemapXml } from "../shared/seo.ts";

const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");
const finder = readFileSync(new URL("../public/ram-deals/index.html", import.meta.url), "utf8");

describe("static RAM buying guides under /ram-deals/", () => {
  for (const url of RAM_GUIDE_URLS) {
    const slug = url.replace("https://agenthiveinc.com/", "");
    it(`${slug} is indexable, structured, sourced and linked`, () => {
      const html = readFileSync(new URL(`../public/${slug}index.html`, import.meta.url), "utf8");
      expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
      expect(html).toContain(`<link rel="canonical" href="${url}">`);
      expect(html).toContain(`<meta property="og:url" content="${url}">`);
      expect(html).toContain(`<meta property="og:image" content="${url}og.png">`);
      expect(html).toContain("<strong>Picks</strong>");
      expect(html).toContain("Disclosure:");
      expect(html).toMatch(/href="https:\/\/brooms\.ai\/collections\/come-and-take-it-tees\?utm_campaign=bfmerch&amp;utm_source=dir&amp;utm_medium=page&amp;utm_content=blackfriday-[^"]+"/);
      expect(html).toContain('href="/ram-deals/"');
      for (const other of RAM_GUIDE_URLS) {
        if (other !== url) expect(html).toContain(`href="${other.replace("https://agenthiveinc.com", "")}"`);
      }
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      expect(blocks.length).toBe(1);
      const graph = JSON.parse(blocks[0][1])["@graph"] as { "@type": string }[];
      expect(graph.map((n) => n["@type"])).toEqual(expect.arrayContaining(["WebPage", "BreadcrumbList", "FAQPage"]));
      expect(html).not.toMatch(/AggregateRating|"Review"|only \d+ left|order soon|hurry|guarantee|selfish|spacex|\borange\b/i);
      expect(html).not.toMatch(new RegExp(String.fromCharCode(71, 114, 111, 107), "i"));
      expect(sitemapXml()).toContain(`<loc>${url}</loc>`);
      expect(llms).toContain(url);
      expect(finder).toContain(`href="${url.replace("https://agenthiveinc.com", "")}"`);
    });
  }
  it("hub links the in-stock tee collection with bfmerch UTMs", () => {
    expect(finder).toContain('href="https://brooms.ai/collections/come-and-take-it-tees?utm_campaign=bfmerch&amp;utm_source=dir&amp;utm_medium=page&amp;utm_content=ram-deals-hub"');
  });
});
