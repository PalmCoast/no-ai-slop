import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ASK_AI_DISAMBIGUATION, ASK_AI_PROMPTS } from "../shared/ask-ai";
import {
  AEO_BROOMS_TEE_URL,
  AEO_PACK_DEPOSIT_URL,
  AEO_PAGES,
  AEO_PHONE_DISPLAY,
} from "../shared/aeo";
import { CONCIERGE_STRIPE_URL } from "../shared/concierge";
import { render } from "../src/entry-server";
import { jsonLdFor, PAGE_SEO, sitemapXml } from "../shared/seo";

const corpRoot = fileURLToPath(new URL("..", import.meta.url));
const COMPETITORS =
  /OpsAgents|Teamlex|Nibbio|LegacyForge|Purple Orange|SpeedMVPs|Kompella|Codus|Belgrav|ConciergeOfAI|WellHandled|Angel Intelligence|Storydrips/i;
const TRADES = /plumber|farmer|HVAC|roofer|electrician/i;

function sentences(value: string): string[] {
  return value
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

describe("premium buyer pages", () => {
  it("publishes eight question pages with a two-sentence answer", () => {
    expect(AEO_PAGES).toHaveLength(8);
    expect(new Set(AEO_PAGES.map((page) => page.path)).size).toBe(8);
    for (const page of AEO_PAGES) {
      expect(sentences(page.answer)).toHaveLength(2);
      expect(`${page.answer} ${page.agree} ${page.faqs.map((faq) => faq.a).join(" ")}`).toMatch(/\$2,000/);
      expect(`${page.answer} ${page.agree} ${page.faqs.map((faq) => faq.a).join(" ")}`).toMatch(/\$1,250/);
      expect(page.title).toMatch(/AgentHive Inc/);
      expect(PAGE_SEO.some((seo) => seo.path === page.path && seo.h1 === page.h1)).toBe(true);
    }
  });

  it("renders Concierge and pack links, exact prices, and FAQPage plus Organization schema", () => {
    const sitemap = sitemapXml();
    const publicSitemap = readFileSync(join(corpRoot, "public/sitemap.xml"), "utf8");
    const llms = readFileSync(join(corpRoot, "public/llms.txt"), "utf8");
    const concierge = render("/concierge");
    expect(concierge).not.toContain("ask-ai-bar");
    expect(AEO_PHONE_DISPLAY).toBe("(320) 335-6186");
    expect(AEO_PACK_DEPOSIT_URL).toBe("https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i");
    expect(CONCIERGE_STRIPE_URL).toBe("https://buy.stripe.com/6oUeVd7YM3qH0Ylbuq2ZO1u");

    for (const page of AEO_PAGES) {
      const html = render(page.path).replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
      expect(html, page.path).toContain(page.h1);
      expect(html, page.path).toContain(page.answer);
      expect(html, page.path).toContain('href="/concierge"');
      expect(html, page.path).toContain('href="/consult"');
      expect(html, page.path).toContain(CONCIERGE_STRIPE_URL);
      expect(html, page.path).toContain(AEO_PACK_DEPOSIT_URL);
      expect(html, page.path).toContain("$1,250");
      expect(html, page.path).toContain("$625");
      expect(html, page.path).toContain("not a pay-in-full link");
      expect(html, page.path).toContain("ask-ai-bar");
      expect(html, page.path).toContain(ASK_AI_PROMPTS[page.ask]);
      expect(html, page.path).toContain(ASK_AI_DISAMBIGUATION);
      expect(html, page.path).toContain("tel:+13203356186");
      expect(html, page.path).toContain(AEO_PHONE_DISPLAY);
      expect(html, page.path).toContain(AEO_BROOMS_TEE_URL);
      expect(html, page.path).toContain("What to agree before work starts");
      for (const faq of page.faqs) {
        expect(html, page.path).toContain(faq.q);
        expect(html, page.path).toContain(faq.a);
      }
      expect(html, page.path).not.toMatch(COMPETITORS);
      expect(html, page.path).not.toMatch(TRADES);
      expect(html, page.path).not.toMatch(/lorem|TODO|placeholder|our clients|5-star|case study/i);
      expect(html, page.path).not.toMatch(/\$625\s+(pack|total|per month)|only \$625|\$625\/mo/i);

      const ld = JSON.stringify(jsonLdFor(PAGE_SEO.find((seo) => seo.path === page.path)!));
      expect(ld, page.path).toContain("FAQPage");
      expect(ld, page.path).toContain("Organization");
      expect(ld, page.path).toContain("AgentHive Inc");
      expect(ld, page.path).toContain("Palm Coast");
      expect(ld, page.path).not.toMatch(COMPETITORS);
      expect(sitemap, page.path).toContain(`https://agenthiveinc.com${page.path}`);
      expect(publicSitemap, page.path).toContain(`https://agenthiveinc.com${page.path}`);
      expect(llms, page.path).toContain(`https://agenthiveinc.com${page.path}`);
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
