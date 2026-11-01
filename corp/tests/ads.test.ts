import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setJSON = vi.fn(async () => {});
vi.mock("../netlify/lib/store.ts", () => ({
  hiveStore: () => ({ setJSON }),
}));

import handler, { config as intakeConfig } from "../netlify/functions/ads-intake.ts";
import { render } from "../src/entry-server";
import { ADS_OG_IMAGE } from "../shared/ads";
import { applyRouteHtml, jsonLdFor, PAGE_SEO, sitemapXml } from "../shared/seo";

const corpRoot = fileURLToPath(new URL("..", import.meta.url));
const BANNED =
  /refund|money-back|guarantee|free[- ]trial|buy\.stripe\.com|shopify|chatgpt|claude|reels|glossier|higgsfield|calendly|\+1[\s-]*320|335-6186/i;

function words(html: string): string[] {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean);
}

describe("AI Ad Sprint pages", () => {
  const ads = PAGE_SEO.find((page) => page.path === "/ads")!;
  const thanks = PAGE_SEO.find((page) => page.path === "/ads/thanks")!;

  it("indexes /ads with the share image and keeps /ads/thanks out of the sitemap", () => {
    expect(ads.noindex).toBeUndefined();
    expect(ads.ogImage).toBe(ADS_OG_IMAGE);
    expect(thanks.noindex).toBe(true);
    const xml = sitemapXml();
    expect(xml).toContain("https://agenthiveinc.com/ads</loc>");
    expect(xml).toContain("https://agenthiveinc.com/ads/og-ads.png");
    expect(xml).not.toContain("https://agenthiveinc.com/ads/thanks");
    expect(readFileSync(join(corpRoot, "public/sitemap.xml"), "utf8")).toContain("https://agenthiveinc.com/ads/og-ads.png");
    const shell = `<!doctype html><html><head>
      <title>x</title>
      <meta name="description" content="shared" />
      <link rel="canonical" href="https://agenthiveinc.com/" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <meta property="og:title" content="shared" />
      <meta property="og:description" content="shared" />
      <meta property="og:url" content="https://agenthiveinc.com/" />
      <meta property="og:image" content="https://agenthiveinc.com/og.jpg" />
      <meta name="twitter:title" content="shared" />
      <meta name="twitter:description" content="shared" />
      <meta name="twitter:image" content="https://agenthiveinc.com/og.jpg" />
    </head><body><div id="root"></div></body></html>`;
    const adsHtml = applyRouteHtml(shell, ads);
    const thanksHtml = applyRouteHtml(shell, thanks);
    expect(adsHtml).toContain('property="og:image" content="https://agenthiveinc.com/ads/og-ads.png"');
    expect(adsHtml).toContain('rel="canonical" href="https://agenthiveinc.com/ads"');
    expect(adsHtml).toContain('rel="icon" href="/ads/favicon.svg"');
    expect(thanksHtml).toContain('name="robots" content="noindex, follow"');
    expect(thanksHtml).not.toContain('rel="canonical"');
    expect(jsonLdFor(thanks)).toBeNull();
    expect(JSON.stringify(jsonLdFor(ads))).toContain("FAQPage");
    expect(JSON.stringify(jsonLdFor(ads))).toContain("297.00");
    expect(JSON.stringify(jsonLdFor(ads))).not.toContain("buy.stripe.com");
  });

  it("prerenders both pages with the offer copy and no banned wording", () => {
    const offer = render("/ads");
    const done = render("/ads/thanks");
    expect(words(offer).length).toBeGreaterThanOrEqual(80);
    expect(words(done).length).toBeGreaterThanOrEqual(80);
    expect(offer).toContain('id="route-ads"');
    expect(done).toContain('id="route-adsthanks"');
    expect(offer).toContain("Start my sprint — $297");
    expect(offer).toContain('href="/go/ads-sprint"');
    expect(offer).toContain('href="/go/ads-engine"');
    expect(offer.match(/href="\/go\/ads-sprint"/g)?.length).toBe(3);
    expect(offer.match(/href="\/go\/ads-engine"/g)?.length).toBe(1);
    expect(offer).not.toContain("data-slot=");
    expect(offer).not.toContain("data-hero-sample");
    expect(offer).not.toContain('id="samples"');
    expect(offer).not.toContain("/ads/samples/");
    expect(offer).not.toContain("ads-tag");
    expect(offer).not.toContain("See samples below");
    expect(offer).toContain("AI-generated people are always labeled as AI.");
    expect(offer).toContain('name="bot-field"');
    expect(offer).toContain('name="name"');
    expect(offer).toContain('action="/api/ads-intake"');
    expect(offer).not.toContain("data-netlify");
    expect(done).toContain("Back to AI Ad Sprint");
    expect(done).toContain("one round of revisions");
    const visible = `${offer}\n${done}`.replace(/<script[\s\S]*?<\/script>/g, " ");
    expect(visible).not.toMatch(BANNED);
    expect(visible).not.toMatch(/\(\d{3}\)\s*\d{3}-\d{4}/);
  });

  it("keeps the ads rewrites above the 404 catch-all", () => {
    const files = [
      readFileSync(join(corpRoot, "scripts/write-route-html.ts"), "utf8"),
      readFileSync(join(corpRoot, "netlify.toml"), "utf8"),
    ];
    for (const text of files) {
      const catchAll = text.lastIndexOf("/*");
      expect(catchAll).toBeGreaterThan(0);
      for (const rule of ["/ads/thanks/", "/ads/thanks", "/ads/", "/ads"]) {
        const at = text.indexOf(rule);
        expect(at).toBeGreaterThan(-1);
        expect(at).toBeLessThan(catchAll);
      }
    }
  });
});

describe("ads intake function", () => {
  beforeEach(() => setJSON.mockClear());

  it("is a POST function outside the SPA catch-all", () => {
    expect(intakeConfig).toMatchObject({ path: "/api/ads-intake", method: "POST" });
  });

  it("stores a valid intake in the agenthive-corp store and drops the honeypot", async () => {
    const ok = await handler(
      new Request("https://agenthiveinc.com/api/ads-intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Ada Brand",
          email: "ada@example.com",
          product_url: "https://example.com/products/pan",
          note: "Berry bundle",
          "form-name": "ads-intake",
        }),
      }),
      {} as never,
    );
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ ok: true });
    expect(setJSON).toHaveBeenCalledTimes(1);
    const [key, record] = setJSON.mock.calls[0] as unknown as [string, { email: string; productUrl: string }];
    expect(key.startsWith("ads-intake/")).toBe(true);
    expect(record.email).toBe("ada@example.com");
    expect(record.productUrl).toBe("https://example.com/products/pan");

    setJSON.mockClear();
    const bot = await handler(
      new Request("https://agenthiveinc.com/api/ads-intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Bot",
          email: "bot@example.com",
          product_url: "https://example.com",
          "bot-field": "filled",
        }),
      }),
      {} as never,
    );
    expect(bot.status).toBe(200);
    expect(setJSON).not.toHaveBeenCalled();
  });

  it("rejects a missing name and redirects a form post to the thanks page", async () => {
    const missing = await handler(
      new Request("https://agenthiveinc.com/api/ads-intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "", email: "ada@example.com", product_url: "https://example.com" }),
      }),
      {} as never,
    );
    expect(missing.status).toBe(400);
    expect(setJSON).not.toHaveBeenCalled();

    const form = await handler(
      new Request("https://agenthiveinc.com/api/ads-intake", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          name: "Ada Brand",
          email: "ada@example.com",
          product_url: "https://example.com/products/pan",
        }),
      }),
      {} as never,
    );
    expect(form.status).toBe(303);
    expect(form.headers.get("location")).toBe("/ads/thanks");
    expect(setJSON).toHaveBeenCalledTimes(1);
  });
});
