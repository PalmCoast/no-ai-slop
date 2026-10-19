import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "../src/entry-server";
import { GO_LINKS, goTarget } from "../shared/go-links";
import { PAGE_SEO, jsonLdFor, sitemapXml } from "../shared/seo";
import {
  FD_DEPOSIT_STRIPE_URL,
  FD_LIST_YEAR_ONE,
  FD_MONTHLY,
  FD_SETUP_LIST,
  SWITCH_ENDS,
  SWITCH_ENDS_ISO,
  SWITCH_OFFERS,
  SWITCH_PATH,
  SWITCH_SETUP,
  SWITCH_TERMS,
  SWITCH_YEAR_ONE,
  SWITCH_YEAR_TWO,
  switchGoPath,
  switchOffer,
} from "../shared/switch";

const corpRoot = fileURLToPath(new URL("..", import.meta.url));

describe("switch offers", () => {
  it("prices the switch as half the published setup and the same flat monthly", () => {
    expect(FD_SETUP_LIST).toBe(1750);
    expect(FD_MONTHLY).toBe(250);
    expect(SWITCH_SETUP).toBe(875);
    expect(SWITCH_SETUP * 2).toBe(FD_SETUP_LIST);
    expect(SWITCH_YEAR_ONE).toBe(875 + 250 * 12);
    expect(SWITCH_YEAR_TWO).toBe(3000);
    expect(FD_LIST_YEAR_ONE).toBe(4750);
    expect(SWITCH_ENDS).toBe("November 30, 2026");
    expect(SWITCH_ENDS_ISO).toBe("2026-11-30");
  });

  it("names exactly the two competitors and keeps the competitor math honest", () => {
    expect(SWITCH_OFFERS.map((o) => o.slug)).toEqual(["smith-ai", "ruby"]);
    const smith = switchOffer("smith-ai");
    const ruby = switchOffer("ruby");
    // Smith.ai AI Receptionist, smith.ai/pricing/ai-receptionist, read 2026-10-19.
    expect(smith.plans.map((p) => p.price)).toEqual(["$0/mo", "$150/mo", "$500/mo"]);
    expect(smith.math.find((r) => r.label.includes("Pro"))?.yearOne).toBe("$1,800");
    expect(smith.math.find((r) => r.label.includes("Enterprise"))?.yearOne).toBe("$6,000");
    // Ruby, rubyhelpcenter billing plans + ruby.com/terms, read 2026-10-19.
    expect(ruby.plans.map((p) => p.price)).toEqual(["$250/mo", "$395/mo", "$720/mo", "$1,210/mo", "$1,725/mo"]);
    expect(ruby.plans[0].over).toBe("$5.40 per extra minute");
    expect(ruby.math.map((r) => r.yearOne)).toEqual(["$3,000", "$4,740", "$8,640", "$3,875"]);
    for (const offer of SWITCH_OFFERS) {
      const ours = offer.math.at(-1)!;
      expect(ours.yearOne).toBe("$3,875");
      expect(ours.yearTwo).toBe("$3,000");
      expect(offer.whenTheyWin.length).toBeGreaterThan(80);
      expect(offer.sources.length).toBeGreaterThanOrEqual(3);
      expect(offer.faqs.length).toBeGreaterThanOrEqual(4);
      expect(offer.compareUrl).toMatch(/^https:\/\/firstdeploy\.ai\/vs\//);
      expect(offer.description.length).toBeLessThanOrEqual(160);
      expect(offer.pageTitle).toMatch(/AgentHive Inc/);
    }
  });

  it("spells out the terms a buyer needs: proof, deadline, flat monthly, refund", () => {
    const text = SWITCH_TERMS.join(" ");
    expect(text).toContain("$875");
    expect(text).toContain("balance is waived");
    expect(text).toContain("$250/mo");
    expect(text).toContain("daniel@agenthiveinc.com");
    expect(text).toContain(SWITCH_ENDS);
    expect(text).toMatch(/go-live date/);
    expect(text).not.toMatch(/coltsinsider|agentmail/);
  });

  it("routes checkout through /go with the live First Deploy $875 link", () => {
    expect(FD_DEPOSIT_STRIPE_URL).toBe("https://buy.stripe.com/9B68wP92Qe5layV8ie2ZO1w");
    for (const slug of ["smith-ai", "ruby"] as const) {
      const link = GO_LINKS[`switch-${slug}`];
      expect(link.url).toBe(FD_DEPOSIT_STRIPE_URL);
      expect(link.kind).toBe("stripe");
      expect(link.label).toContain("$875");
      expect(switchGoPath(slug)).toBe(`/go/switch-${slug}?from=switch`);
      const target = new URL(goTarget(`switch-${slug}`, "switch-hero")!);
      expect(target.origin + target.pathname).toBe(FD_DEPOSIT_STRIPE_URL);
      expect(target.searchParams.get("client_reference_id")).toBe(`ah_switch-hero_switch-${slug}`);
      expect(target.searchParams.get("utm_campaign")).toBe(`switch-${slug}`);
    }
  });

  it("publishes the hub and both offer pages with SEO, JSON-LD, sitemap, and redirects", () => {
    const paths = [SWITCH_PATH, "/switch/smith-ai", "/switch/ruby"];
    for (const path of paths) {
      const page = PAGE_SEO.find((p) => p.path === path);
      expect(page, path).toBeDefined();
      expect(page!.noindex).toBeFalsy();
      expect(page!.description.length).toBeLessThanOrEqual(160);
      expect(sitemapXml()).toContain(`https://agenthiveinc.com${path}</loc>`);
      expect(readFileSync(join(corpRoot, "public/sitemap.xml"), "utf8")).toContain(`https://agenthiveinc.com${path}</loc>`);
      const ld = JSON.stringify(jsonLdFor(page!));
      expect(ld).toContain("Daniel Graham");
      expect(ld).toContain("AGENTHIVEINCCOM LLC");
    }
    const smithLd = JSON.stringify(jsonLdFor(PAGE_SEO.find((p) => p.path === "/switch/smith-ai")!));
    expect(smithLd).toContain('"price":"875.00"');
    expect(smithLd).toContain('"validThrough":"2026-11-30"');
    expect(smithLd).toContain("UnitPriceSpecification");
    expect(smithLd).toContain("FAQPage");
    expect(smithLd).toContain("Article");
    const hubLd = JSON.stringify(jsonLdFor(PAGE_SEO.find((p) => p.path === SWITCH_PATH)!));
    expect(hubLd).toContain("CollectionPage");
    expect(hubLd).toContain("https://agenthiveinc.com/switch/ruby");

    const toml = readFileSync(join(corpRoot, "netlify.toml"), "utf8");
    const script = readFileSync(join(corpRoot, "scripts/write-route-html.ts"), "utf8");
    for (const path of paths) {
      expect(toml).toContain(`from = "${path}"`);
      expect(toml).toContain(`to = "${path}/index.html"`);
      expect(script).toContain(`"${path} ${path}/index.html 200!"`);
    }
    const llms = readFileSync(join(corpRoot, "public/llms.txt"), "utf8");
    expect(llms).toContain("https://agenthiveinc.com/switch/smith-ai");
    expect(llms).toContain("https://agenthiveinc.com/switch/ruby");
    expect(llms).not.toContain("buy.stripe.com");
  });

  it("prerenders the offer copy, the competitor tables, and the checkout path", () => {
    const smith = render("/switch/smith-ai");
    expect(smith.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length).toBeGreaterThan(400);
    expect(smith).toContain("Switch from Smith.ai");
    expect(smith).toContain("$150/mo");
    expect(smith).toContain("$500/mo");
    expect(smith).toContain("30 days’ notice");
    expect(smith).toContain("/go/switch-smith-ai?from=switch-smith-ai-hero");
    expect(smith).toContain("https://smith.ai/pricing/ai-receptionist");
    expect(smith).toContain("October 19, 2026");
    expect(smith).toContain("When Smith.ai is the better choice");
    expect(smith).toContain("First Deploy AI vs Smith.ai");

    const ruby = render("/switch/ruby");
    expect(ruby.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length).toBeGreaterThan(400);
    expect(ruby).toContain("Switch from Ruby");
    expect(ruby).toContain("$5.40 per extra minute");
    expect(ruby).toContain("60-second");
    expect(ruby).toContain("/go/switch-ruby?from=switch-ruby-hero");
    expect(ruby).toContain("https://www.ruby.com/terms/");
    expect(ruby).toContain("When Ruby is the better choice");

    const hub = render(SWITCH_PATH);
    expect(hub.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length).toBeGreaterThan(250);
    expect(hub).toContain('href="/switch/smith-ai"');
    expect(hub).toContain('href="/switch/ruby"');
    expect(hub).toContain("$3,875");

    const home = render("/");
    expect(home).toContain('href="/switch"');
    expect(home).toContain("Smith.ai or Ruby");
    expect(home).not.toContain("buy.stripe.com");
    expect(smith).not.toContain("buy.stripe.com");
    expect(ruby).not.toContain("buy.stripe.com");
  });
});
