import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "../src/entry-server";
import { GO_LINKS } from "../shared/go-links";
import { PAGE_SEO, jsonLdFor, sitemapXml } from "../shared/seo";
import {
  FD_LIST_YEAR_ONE,
  FD_MONTHLY,
  FD_SETUP_LIST,
  SWITCH_DESCRIPTION,
  SWITCH_ENDS,
  SWITCH_ENDS_ISO,
  SWITCH_H1,
  SWITCH_MONTHLY,
  SWITCH_PATH,
  SWITCH_SETUP,
  SWITCH_TERMS,
  SWITCH_TITLE,
  SWITCH_YEAR_ONE,
  SWITCH_YEAR_TWO,
} from "../shared/switch";

const corpRoot = fileURLToPath(new URL("..", import.meta.url));

/**
 * Ceilings from the paid plans checked 2026-10-19.
 * The vendor names are intel and are not stored in this repo.
 */
const LOWEST_PAID_MONTHLY = 150;
const LOWEST_PAID_YEAR = 1_800;
const NEXT_PAID_MONTHLY = 250;
const NEXT_PAID_YEAR = 3_000;
const FULL_SERVICE_YEAR = 6_000;

const NAMED_VENDORS = [/smith\.ai/i, /\bsmith\b/i, /\bruby\b/i];

describe("desk offer", () => {
  it("prices the offer under every paid plan we checked", () => {
    expect(FD_SETUP_LIST).toBe(1750);
    expect(FD_MONTHLY).toBe(250);
    expect(FD_LIST_YEAR_ONE).toBe(1750 + 250 * 12);
    expect(SWITCH_SETUP).toBe(0);
    expect(SWITCH_MONTHLY).toBe(125);
    expect(SWITCH_YEAR_ONE).toBe(1_500);
    expect(SWITCH_YEAR_TWO).toBe(1_500);
    expect(SWITCH_MONTHLY).toBeLessThan(LOWEST_PAID_MONTHLY);
    expect(SWITCH_MONTHLY).toBeLessThan(NEXT_PAID_MONTHLY);
    expect(SWITCH_YEAR_ONE).toBeLessThan(LOWEST_PAID_YEAR);
    expect(SWITCH_YEAR_ONE).toBeLessThan(NEXT_PAID_YEAR);
    expect(SWITCH_YEAR_ONE).toBeLessThan(FULL_SERVICE_YEAR);
    expect(SWITCH_YEAR_TWO).toBeLessThan(LOWEST_PAID_YEAR);
    expect(SWITCH_ENDS).toBe("November 30, 2026");
    expect(SWITCH_ENDS_ISO).toBe("2026-11-30");
  });

  it("states the offer in the terms and names no other product", () => {
    const text = SWITCH_TERMS.join(" ");
    expect(text).toContain("$125/mo");
    expect(text).toContain("$1,500");
    expect(text).toContain("No setup fee");
    expect(text).toContain("first month is on us");
    expect(text).toContain(SWITCH_ENDS);
    expect(text).not.toMatch(/per-call charge of/);
    for (const pattern of NAMED_VENDORS) expect(text).not.toMatch(pattern);
  });

  it("does not route the offer through the $875 deposit link", () => {
    expect(GO_LINKS["switch-smith-ai"]).toBeUndefined();
    expect(GO_LINKS["switch-ruby"]).toBeUndefined();
    const labels = Object.values(GO_LINKS).map((link) => link.label).join(" ");
    for (const pattern of NAMED_VENDORS) expect(labels).not.toMatch(pattern);
  });

  it("publishes one offer page, with SEO, JSON-LD, sitemap, and a redirect", () => {
    const page = PAGE_SEO.find((p) => p.path === SWITCH_PATH);
    expect(page).toBeDefined();
    expect(page!.title).toBe(SWITCH_TITLE);
    expect(page!.h1).toBe(SWITCH_H1);
    expect(page!.description).toBe(SWITCH_DESCRIPTION);
    expect(page!.description.length).toBeLessThanOrEqual(160);
    expect(page!.noindex).toBeFalsy();
    expect(PAGE_SEO.filter((p) => p.path.startsWith("/switch"))).toHaveLength(1);

    expect(sitemapXml()).toContain("https://agenthiveinc.com/switch</loc>");
    expect(sitemapXml()).not.toContain("/switch/smith-ai");
    expect(sitemapXml()).not.toContain("/switch/ruby");
    const publicSitemap = readFileSync(join(corpRoot, "public/sitemap.xml"), "utf8");
    expect(publicSitemap).toContain("https://agenthiveinc.com/switch</loc>");
    expect(publicSitemap).not.toContain("/switch/smith-ai");
    expect(publicSitemap).not.toContain("/switch/ruby");

    const ld = JSON.stringify(jsonLdFor(page!));
    expect(ld).toContain("Daniel Graham");
    expect(ld).toContain("AGENTHIVEINCCOM LLC");
    expect(ld).toContain('"price":"0.00"');
    expect(ld).toContain('"price":"125.00"');
    expect(ld).toContain('"validThrough":"2026-11-30"');
    expect(ld).toContain("UnitPriceSpecification");
    expect(ld).toContain("FAQPage");
    expect(ld).toContain("Article");
    for (const pattern of NAMED_VENDORS) expect(ld).not.toMatch(pattern);

    const toml = readFileSync(join(corpRoot, "netlify.toml"), "utf8");
    const script = readFileSync(join(corpRoot, "scripts/write-route-html.ts"), "utf8");
    expect(toml).toContain('from = "/switch"');
    expect(toml).toContain('to = "/switch/index.html"');
    expect(toml).not.toContain("/switch/smith-ai");
    expect(toml).not.toContain("/switch/ruby");
    expect(script).toContain('"/switch /switch/index.html 200!"');
    expect(script).not.toContain("/switch/smith-ai");
    expect(script).not.toContain("/switch/ruby");

    const llms = readFileSync(join(corpRoot, "public/llms.txt"), "utf8");
    expect(llms).toContain("https://agenthiveinc.com/switch");
    expect(llms).toContain("$125");
    expect(llms).not.toContain("buy.stripe.com");
    for (const pattern of NAMED_VENDORS) expect(llms).not.toMatch(pattern);
  });

  it("prerenders the offer and keeps other products off the page and the homepage", () => {
    const page = render(SWITCH_PATH);
    const text = page.replace(/<[^>]+>/g, " ");
    expect(text.split(/\s+/).filter(Boolean).length).toBeGreaterThan(250);
    expect(page).toContain(SWITCH_H1);
    expect(page).toContain("$125/mo");
    expect(page).toContain("$1,500");
    expect(page).toContain("No setup fee");
    expect(page).toContain("first month is on us");
    expect(page).not.toContain("buy.stripe.com");
    expect(page).not.toContain("/go/switch");
    for (const pattern of NAMED_VENDORS) expect(page).not.toMatch(pattern);

    const home = render("/");
    expect(home).toContain('href="/switch"');
    expect(home).toContain("$125/mo");
    expect(home).not.toContain("buy.stripe.com");
    for (const pattern of NAMED_VENDORS) expect(home).not.toMatch(pattern);
  });
});
