import { describe, expect, it } from "vitest";
import { AI_CREDIT_OFFERS, AI_CREDIT_PARTNERS, CREDIT_CATEGORIES, CREDIT_TOOLS, VERIFIED_ON } from "../shared/ai-credits";
import { applyRouteHtml, jsonLdFor, pageForPath, sitemapXml } from "../shared/seo";

const all = JSON.stringify({ AI_CREDIT_OFFERS, AI_CREDIT_PARTNERS });

describe("/ai-credits", () => {
  it("lists 20-30 verified offers with official https links and valid filters", () => {
    expect(AI_CREDIT_OFFERS.length).toBeGreaterThanOrEqual(20);
    expect(AI_CREDIT_OFFERS.length).toBeLessThanOrEqual(30);
    expect(new Set(AI_CREDIT_OFFERS.map((o) => o.id)).size).toBe(AI_CREDIT_OFFERS.length);
    for (const o of AI_CREDIT_OFFERS) {
      expect(o.url).toMatch(/^https:\/\//);
      expect(o.lastVerified).toBe(VERIFIED_ON);
      expect(CREDIT_CATEGORIES).toContain(o.category);
      for (const t of o.tools) expect(CREDIT_TOOLS).toContain(t);
      expect(o.amount.length).toBeGreaterThan(0);
      expect(o.qualifies.length).toBeGreaterThan(0);
    }
  });

  it("never carries Stripe buy links, /go/ redirects, Reddit, or guarantee copy", () => {
    expect(all).not.toMatch(/buy\.stripe\.com|\/go\/|reddit/i);
    expect(all).not.toMatch(/guarantee|money.back|risk.free/i);
    expect(all).not.toMatch(/smith/i);
  });

  it("tags partner links with src=aicredits and keeps micro1", () => {
    const urls = AI_CREDIT_PARTNERS.map((p) => p.url);
    expect(urls).toContain("https://jobproof.firstdeploy.ai/?src=aicredits");
    expect(urls).toContain("https://agenthiveinc.com/consult?src=aicredits");
    expect(urls).toContain("https://www.micro1.ai/company-referral");
  });

  it("ships SEO: title, canonical, sitemap and page FAQ JSON-LD", () => {
    const page = pageForPath("/ai-credits/");
    expect(page.path).toBe("/ai-credits");
    expect(page.title).toContain("Free AI credits");
    expect(sitemapXml()).toContain("https://askyard.firstdeploy.ai/ai-credits");
    const ld = JSON.stringify(jsonLdFor(page));
    expect(ld).toContain("Are these AI credits really free?");
    const shell = `<!doctype html><html><head><title>x</title><meta name="description" content="x" /><link rel="canonical" href="x" /></head><body><div id="root"></div></body></html>`;
    const html = applyRouteHtml(shell, page);
    expect(html).toContain('<link rel="canonical" href="https://askyard.firstdeploy.ai/ai-credits" />');
    expect(html).toContain("FAQPage");
    expect(html).toContain("route-ai-credits");
  });
});
