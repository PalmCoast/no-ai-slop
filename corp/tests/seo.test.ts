import { stripFreightPrice } from "./freight-price";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DANIEL_LINKEDIN_URL, LEGAL_NAME, LINKEDIN_URL } from "../shared/brand";
import { render } from "../src/entry-server";
import { applyRouteHtml, canonicalFor, jsonLdFor, organizationJsonLd, PAGE_SEO, sitemapIndexXml, sitemapXml } from "../shared/seo";
import { RETIRED_CONSULT_PATHS } from "../shared/consultCompare";

const corpRoot = fileURLToPath(new URL("..", import.meta.url));

describe("per-route SEO", () => {
  it("gives every HTML route a unique title, description, h1, and canonical", () => {
    const titles = PAGE_SEO.map((page) => page.title);
    const h1s = PAGE_SEO.map((page) => page.h1);
    const canonicals = PAGE_SEO.map((page) => canonicalFor(page.path));
    expect(new Set(titles).size).toBe(PAGE_SEO.length);
    expect(new Set(h1s).size).toBe(PAGE_SEO.length);
    expect(new Set(canonicals).size).toBe(PAGE_SEO.length);
    for (const page of PAGE_SEO) {
      expect(canonicalFor(page.path)).toMatch(/^https:\/\/agenthiveinc\.com/);
      expect(page.title).toMatch(/AgentHive Inc/);
      expect(page.h1.length).toBeGreaterThan(3);
      expect(page.title).not.toMatch(/THE HIVE|We SWARM/i);
    }
    expect(PAGE_SEO.map((page) => page.path)).toEqual(
      expect.arrayContaining(["/", "/about", "/buzz", "/rankings", "/build", "/consult", "/concierge", "/disclosure"]),
    );
  });

  it("writes distinct head tags and a server h1 into HTML", () => {
    const shell = `<!doctype html><html><head>
      <title>AgentHive Inc — THE HIVE. We SWARM.</title>
      <meta name="description" content="shared" />
      <link rel="canonical" href="https://agenthiveinc.com/" />
      <meta property="og:title" content="shared" />
      <meta property="og:description" content="shared" />
      <meta property="og:url" content="https://agenthiveinc.com/" />
      <meta name="twitter:title" content="shared" />
      <meta name="twitter:description" content="shared" />
    </head><body><div id="root"></div></body></html>`;
    const about = applyRouteHtml(shell, PAGE_SEO.find((page) => page.path === "/about")!);
    const home = applyRouteHtml(shell, PAGE_SEO.find((page) => page.path === "/")!);
    expect(about).toContain("<title>About AgentHive Inc — AGENTHIVEINCCOM LLC, Palm Coast</title>");
    expect(about).toContain('rel="canonical" href="https://agenthiveinc.com/about"');
    expect(about).toContain('property="og:url" content="https://agenthiveinc.com/about"');
    expect(about).toContain('id="route-about"');
    expect(about).toContain("<h1 class=\"display\">About AgentHive Inc</h1>");
    expect(about).not.toContain("@agenthiveinc.com");
    expect(home).toContain('id="route-home"');
    expect(home).toContain("First Deploy");
    expect(home).toContain("IndexMe.lol");
    expect(home).toContain("70+ live AI apps in production");
    expect(home).toContain("funded");
    expect(home).not.toMatch(/field operations|dirt, plants|HVAC|plumb|roofing|Flagler|Volusia/i);
    expect(home).not.toMatch(/href="\/picks\/"|AI Ad Sprint|RAM &amp; rig|\$75|\$150 |\$2,000|whop/i);
    expect(home).toContain("Book the free 30-minute Architecture & Spend Triage");
    expect(home).toContain("$2,500");
    expect(home).toContain("$3,500/mo");
    expect(home).toContain(
      'Products: <a href="https://firstdeploy.ai">First Deploy AI</a> · <a href="/consult">Agent Audit &amp; Stabilization Sprint</a> · <a href="/concierge">Fractional AI Ops Retainer</a> · <a href="https://firstdeploy.ai/deploy-agent/">Deploy Agent</a> · <a href="https://firstdeploy.ai/freight-ops-ai-agent/">Freight Ops AI Agent</a> · <a href="https://burnbook.firstdeploy.ai/">Burn Book</a> · <a href="https://cardbutler.firstdeploy.ai/">Card Butler</a>',
    );
    expect(home).toContain("IndexNow");
    expect(about).toContain("tel:+13203356186");
    expect(about).not.toMatch(/calendly/i);
    const consult = applyRouteHtml(shell, PAGE_SEO.find((page) => page.path === "/consult")!);
    expect(consult).toContain('id="route-consult"');
    expect(consult).toContain('rel="canonical" href="https://agenthiveinc.com/consult"');
    expect(consult).toContain("<h1 class=\"display\">Cut agent spend and stop the loops. $2,500, 5 business days.</h1>");
    expect(consult).toContain("/go/sprint");
    expect(consult).not.toMatch(/\$75|\$150|\$1,250/);
    expect(consult).toContain("https://agenthiveinc.com/concierge");
    const concierge = applyRouteHtml(shell, PAGE_SEO.find((page) => page.path === "/concierge")!);
    expect(concierge).toContain('id="route-concierge"');
    expect(concierge).toContain('rel="canonical" href="https://agenthiveinc.com/concierge"');
    expect(concierge).toContain('property="og:url" content="https://agenthiveinc.com/concierge"');
    expect(concierge).toContain('property="og:title" content="Fractional AI Ops Retainer, $3,500/mo | AgentHive Inc"');
    expect(concierge).toContain("/go/retainer");
    expect(concierge).not.toContain("https://buy.stripe.com/6oUeVd7YM3qH0Ylbuq2ZO1u");
    expect(concierge).toContain("$3,500/mo");
    expect(concierge).not.toContain("$2,000");
    expect(concierge).toContain("funded teams");
    expect(concierge).not.toMatch(/Slack|owners|didn’t stick/);
    expect(JSON.stringify(jsonLdFor(PAGE_SEO.find((page) => page.path === "/concierge")!))).not.toMatch(/Slack|owners/);
    expect(concierge).not.toMatch(/Holistic Consulting|SmallBizStrategy|iternal\.ai/);
    expect(home).toContain('rel="canonical" href="https://agenthiveinc.com/"');
    expect(about).not.toContain('rel="canonical" href="https://agenthiveinc.com/" />');
    expect(about).toContain("application/ld+json");
    expect(about).toContain(LEGAL_NAME);
    expect(createHash("sha256").update(home).digest("hex")).not.toBe(createHash("sha256").update(about).digest("hex"));
  });

  it("builds a unique HTML body for every public route", () => {
    const shell = `<!doctype html><html><head>
      <title>x</title>
      <meta name="description" content="shared" />
      <link rel="canonical" href="https://agenthiveinc.com/" />
      <meta property="og:title" content="shared" />
      <meta property="og:description" content="shared" />
      <meta property="og:url" content="https://agenthiveinc.com/" />
      <meta name="twitter:title" content="shared" />
      <meta name="twitter:description" content="shared" />
    </head><body><div id="root"></div></body></html>`;
    const pages = PAGE_SEO.map((page) => applyRouteHtml(shell, page));
    const hashes = pages.map((html) => createHash("sha256").update(html).digest("hex"));
    const ids = pages.map((html) => html.match(/id="route-[a-z]+"/)?.[0]);
    expect(new Set(hashes).size).toBe(PAGE_SEO.length);
    expect(new Set(ids).size).toBe(PAGE_SEO.length);
    expect(pages[0]).toContain("$2,500 Agent Audit &amp; Stabilization Sprint");
    expect(pages[0]).toContain("/go/sprint");
    expect(pages[0]).not.toContain("https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g");
    expect(pages.filter((html) => !html.includes('id="route-ads')).join("")).not.toMatch(/\$75 |\$150 |\$2,000|10-hour pack|burn-audit hour/);
    expect(pages.join("")).not.toMatch(/founding|first 5 businesses|\$250 one-time/i);
    expect(pages[0]).not.toContain("1" + ",750");
    expect(pages[0]).not.toContain("$" + "250/mo");
    expect(stripFreightPrice(pages.join(""))).not.toMatch(/\$1,?500\s*\/\s*mo|firstdeploy\.dev/);
    expect(pages[1]).toContain("Palm Coast, FL");
    expect(pages.join("")).not.toContain("32137");
    expect(pages.join("")).not.toContain("Barrington");
    expect(pages[2]).toContain("briefing");
    expect(pages.join("")).not.toMatch(/14 apps|\$70k|coltsinsider@gmail/i);
  });

  it("ships Organization + LocalBusiness JSON-LD with the Palm Coast address", () => {
    const graph = organizationJsonLd();
    const json = JSON.stringify(graph);
    expect(json).toContain("Organization");
    expect(json).toContain("LocalBusiness");
    expect(json).not.toContain("32137");
    expect(json).toContain("Palm Coast");
    expect(json).not.toContain("Barrington");
    expect(json).toContain(LEGAL_NAME);
    expect(json).toContain(LINKEDIN_URL);
    expect(json).not.toContain(DANIEL_LINKEDIN_URL);
    expect(json).toContain("https://firstdeploy.ai/");
    expect(json).toContain("https://indexme.lol/");
    expect(json).toContain("https://x.com/AgentHiveAI");
    expect(json).toContain("https://clutch.co/profile/agenthive");
    expect(json).toContain("https://www.goodfirms.co/company/agenthive-inc");
    expect(json).not.toMatch(/USPTO|14 apps|\$70k/i);
    expect(json).not.toContain("@agenthiveinc.com");
  });

  it("keeps @agenthiveinc.com out of every page JSON-LD block", () => {
    expect(JSON.stringify(organizationJsonLd())).not.toContain("@agenthiveinc.com");
    for (const page of PAGE_SEO) {
      const block = jsonLdFor(page);
      const json = block ? JSON.stringify(block) : "";
      expect(json).not.toContain("@agenthiveinc.com");
    }
  });

  it("keeps gmail off llms.txt contact and prefers custom product domains", () => {
    const txt = readFileSync(join(corpRoot, "public/llms.txt"), "utf8");
    expect(txt).not.toMatch(/mailto:|daniel@agenthiveinc\.com/);
    expect(txt).not.toMatch(/coltsinsider@gmail\.com/);
    expect(txt).toContain("https://flick.firstdeploy.ai/");
    expect(txt).not.toContain("https://agenthiveinc.com/picks/");
    expect(txt).not.toMatch(/HVAC|plumb|roofer|roofing|electrician|landscap|Flagler|Volusia|field operations|dirt/i);
    expect(txt).not.toMatch(/askyard|claudefarm/i);
    // Raw Payment Links stay out of llms.txt. $150 audit uses the existing /go/ads-sprint route;
    // the $625 pack has no /go route yet, so the text points at the on-site consult pricing section.
    const stripe = txt.match(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g) ?? [];
    expect(stripe).toEqual([]);
    expect(txt).toContain("https://agenthiveinc.com/disclosure");
    expect(txt).toContain("https://firstdeploy.ai/");
    expect(txt).toContain("https://agenthiveinc.com/go/sprint");
    expect(txt).toContain("https://agenthiveinc.com/go/retainer");
    expect(txt).not.toContain("https://agenthiveinc.com/ads)");
    expect(txt).not.toContain("$297 one time");
    expect(txt).toContain("+1 320-335-6186");
    expect(txt).not.toMatch(/calendly|grok/i);
    expect(txt).not.toContain("1" + ",750");
    expect(txt).not.toContain("$" + "250/mo");
    expect(txt).toContain("IndexNow");
    expect(txt).toContain("funded teams of 30 to 200");
    expect(txt).toContain("70+ live AI apps in production");
    expect(txt).not.toMatch(/\$75|\$150|\$2,000|10-hour pack|burn-audit/);
    expect(txt).toContain("https://agenthiveinc.com/concierge");
    expect(txt).not.toMatch(/whop\.com/i);
    expect(txt).not.toMatch(/founding|first 5|\$250/i);
    expect(txt).toContain("https://firstdeploy.ai");
    expect(txt).toContain("https://agenthiveinc.com/consult");
    expect(txt).not.toMatch(/agenthive\.io|agenthive\.co\b|insurance|QpiAI/i);
    expect(txt).toContain("AgentHive Inc · Palm Coast, FL · firstdeploy.ai");
  });

  it("keeps sitemap.xml to agenthiveinc.com HTML routes only", () => {
    const xml = sitemapXml();
    expect(readFileSync(join(corpRoot, "public/sitemap.xml"), "utf8")).toContain("https://agenthiveinc.com/about");
    expect(xml).toContain("https://agenthiveinc.com/</loc>");
    expect(xml).toContain("https://agenthiveinc.com/about");
    expect(xml).toContain("https://agenthiveinc.com/buzz");
    expect(xml).not.toContain("https://agenthiveinc.com/rankings");
    expect(xml).not.toContain("https://agenthiveinc.com/build");
    expect(xml).toContain("https://agenthiveinc.com/consult");
    expect(xml).toContain("https://agenthiveinc.com/concierge");
    expect(xml).toContain("https://agenthiveinc.com/concierge/vs-hiring");
    expect(xml).toContain("https://agenthiveinc.com/disclosure");
    expect(readFileSync(join(corpRoot, "public/sitemap.xml"), "utf8")).toContain("https://agenthiveinc.com/concierge");
    expect(xml).not.toContain("firstdeploy.ai");
    expect(xml).not.toContain("llms.txt");
    expect(xml).toContain("<lastmod>");
    const index = sitemapIndexXml();
    expect(index).toContain("<sitemapindex");
    expect(index).toContain("https://agenthiveinc.com/sitemap.xml");
    expect(index).not.toContain("askyard.firstdeploy.ai");
    expect(index).not.toContain("https://firstdeploy.ai/sitemap.xml");
    expect(readFileSync(join(corpRoot, "public/sitemaps.xml"), "utf8")).not.toContain("askyard.firstdeploy.ai");
    const robots = readFileSync(join(corpRoot, "public/robots.txt"), "utf8");
    expect(robots).toContain("User-agent: GPTBot");
    expect(robots).toContain("User-agent: Claude-SearchBot");
    expect(robots).toContain("Disallow: /go/");
    expect(robots).toContain("Sitemap: https://agenthiveinc.com/sitemap.xml");
    expect(robots).not.toContain("sitemaps.xml");
    expect(robots.split("User-agent:").length - 1).toBe((robots.match(/Disallow: \/go\//g) || []).length);
  });

  it("keeps home and concierge descriptions short and puts offers on the right routes", () => {
    const home = PAGE_SEO.find((page) => page.path === "/")!;
    const concierge = PAGE_SEO.find((page) => page.path === "/concierge")!;
    const consult = PAGE_SEO.find((page) => page.path === "/consult")!;
    const about = PAGE_SEO.find((page) => page.path === "/about")!;
    expect(home.description.length).toBeLessThanOrEqual(155);
    expect(about.description.length).toBeLessThanOrEqual(155);
    expect(concierge.description.length).toBeLessThanOrEqual(155);
    expect(consult.description).toContain("$2,500");
    expect(consult.description.length).toBeLessThanOrEqual(175);
    expect(PAGE_SEO.find((page) => page.path === "/rankings")?.noindex).toBe(true);
    expect(PAGE_SEO.find((page) => page.path === "/build")?.noindex).toBe(true);
    const consultLd = JSON.stringify(jsonLdFor(consult));
    expect(consultLd).toContain("ProfessionalService");
    expect(consultLd).toContain('"price":"0.00"');
    expect(consultLd).toContain('"price":"2500.00"');
    expect(consultLd).toContain('"price":"3500.00"');
    expect(consultLd).not.toMatch(/"price":"(75|150|1250|2000)\.00"/);
    expect(consultLd).toContain("Daniel Graham");
    expect(consultLd).not.toContain("LocalBusiness");
    const conciergeLd = JSON.stringify(jsonLdFor(concierge));
    expect(conciergeLd).toContain("UnitPriceSpecification");
    expect(conciergeLd).toContain("3500.00");
    expect(conciergeLd).toContain("FAQPage");
    const homeLd = JSON.stringify(jsonLdFor(home));
    expect(homeLd).toContain("Organization");
    expect(homeLd).toContain("Palm Coast");
    expect(homeLd).toContain("OfferCatalog");
    expect(homeLd).toContain("2500.00");
    expect(homeLd).toContain("3500.00");
  });

  it("prerenders the main copy into static HTML", () => {
    for (const path of ["/", "/about", "/consult", "/concierge", "/concierge/vs-hiring"]) {
      const html = render(path);
      const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean);
      expect(words.length).toBeGreaterThan(250);
    }
    const consult = render("/consult");
    expect(consult).toContain("What we fix");
    expect(consult).toContain("How the 5 days run");
    expect(consult).toContain("Pricing");
    for (const path of RETIRED_CONSULT_PATHS) {
      expect(consult).not.toContain(`href="${path}"`);
      expect(sitemapXml()).not.toContain(`https://agenthiveinc.com${path}<`);
      expect(PAGE_SEO.some((page) => page.path === path)).toBe(false);
    }
    expect(readFileSync(join(corpRoot, "public/llms.txt"), "utf8")).not.toContain("/consult/ai-");
    const redirects = [
      readFileSync(join(corpRoot, "scripts/write-route-html.ts"), "utf8"),
      readFileSync(join(corpRoot, "netlify.toml"), "utf8"),
    ].join("\n");
    expect(redirects).toContain("RETIRED_CONSULT_PATHS.flatMap");
    expect(redirects).toContain("/audit /consult 301!");
    expect(redirects).toContain('from = "/audit"');
    expect(redirects).toContain('to = "/consult"');
    expect(redirects).toContain('from = "/triage"');
    expect(redirects).toContain("/triage https://calendar.google.com/calendar/appointments/schedules/AcZssZ08PSsZYPUrigPxN1Ax27CJh01QY8fjWo1mGYVhlX5vh0QUTqBzXF4NSNwDyLw487B8fNegD8JV 302!");
    expect(consult).not.toMatch(/live this week|or you don.t pay|guarantee/i);
    for (const href of [
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ08PSsZYPUrigPxN1Ax27CJh01QY8fjWo1mGYVhlX5vh0QUTqBzXF4NSNwDyLw487B8fNegD8JV",
      "tel:+13203356186",
      "/go/sprint",
      "/go/retainer",
    ]) expect(consult).toContain(href);
    for (const old of ["https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h", "https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g", "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i", "/go/ads-sprint"]) {
      expect(consult).not.toContain(old);
    }
    expect(consult).toContain("$2,500");
    expect(consult).toContain("5 business days");
    expect(consult).toContain("Illustration: gold honeycomb boardroom");
    const concierge = render("/concierge");
    expect(concierge).toContain("1 business day");
    expect(concierge).toContain("$3,500/mo");
    expect(concierge).not.toContain("$2,000");
    expect(concierge).toContain("Daniel Graham");
    expect(concierge).not.toContain("consult-operator.jpg");
    const hiring = render("/concierge/vs-hiring");
    expect(hiring).toContain("$135,980");
    expect(hiring).toContain("$175,140");
    expect(hiring).toContain("$42,000");
    expect(hiring).toContain("bls.gov");
    expect(hiring).toContain("does not quote an agency price");
  });

  it("reuses the NetYard IndexNow key at the corp public root", () => {
    const keyName = "40602f6b-ecf3-406b-a8e5-2e9f601462b6.txt";
    const netyard = readFileSync(join(corpRoot, "../netyard/public", keyName), "utf8").trim();
    const corp = readFileSync(join(corpRoot, "public", keyName), "utf8").trim();
    expect(netyard).toBe("40602f6b-ecf3-406b-a8e5-2e9f601462b6");
    expect(corp).toBe(netyard);
  });
});

describe("never names other companies", () => {
  it("keeps other AgentHive names out of every prerendered route, JSON-LD and llms.txt", () => {
    const shell = readFileSync(join(corpRoot, "index.html"), "utf8");
    const banned = /agenthive\.io|agenthive\.co\b|QpiAI|insurance/i;
    for (const page of PAGE_SEO) {
      expect(applyRouteHtml(shell, page), page.path).not.toMatch(banned);
      expect(JSON.stringify(jsonLdFor(page)), page.path).not.toMatch(banned);
      expect(render(page.path), page.path).not.toMatch(banned);
    }
    expect(readFileSync(join(corpRoot, "public/llms.txt"), "utf8")).not.toMatch(banned);
    expect(readFileSync(join(corpRoot, "../pricing/src/site.mjs"), "utf8")).not.toMatch(/agenthive\.io|agenthive\.co\b/);
  });
});

describe("consult and vs-hiring drop Slack/owners framing", () => {
  it("keeps Slack and owners out of /consult and /concierge/vs-hiring head, schema and render", () => {
    const shell = readFileSync(join(corpRoot, "index.html"), "utf8");
    for (const path of ["/consult", "/concierge/vs-hiring"]) {
      const page = PAGE_SEO.find((p) => p.path === path)!;
      expect(applyRouteHtml(shell, page), path).not.toMatch(/Slack|owners/);
      expect(JSON.stringify(jsonLdFor(page)), path).not.toMatch(/Slack|owners/);
      expect(render(path), path).not.toMatch(/Slack|\bowners\b/);
    }
  });
});

describe("city-only address", () => {
  it("keeps Barrington and the ZIP out of every route, schema, llms.txt and static page", () => {
    const shell = readFileSync(join(corpRoot, "index.html"), "utf8");
    for (const page of PAGE_SEO) {
      expect(applyRouteHtml(shell, page), page.path).not.toMatch(/Barrington|32137/);
      expect(JSON.stringify(jsonLdFor(page)), page.path).not.toMatch(/Barrington|32137/);
    }
    for (const f of ["public/llms.txt", "public/picks/index.html", "public/ram-deals/index.html"]) {
      expect(readFileSync(join(corpRoot, f), "utf8"), f).not.toMatch(/Barrington|32137/);
    }
  });
});

