import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LEGAL_NAME, LINKEDIN_URL } from "../shared/brand";
import { applyRouteHtml, canonicalFor, organizationJsonLd, PAGE_SEO, sitemapXml } from "../shared/seo";

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
    expect(about).toContain("daniel@agenthiveinc.com");
    expect(home).toContain('id="route-home"');
    expect(home).toContain("First Deploy AI");
    expect(home).toContain("IndexMe.lol");
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
    expect(pages[0]).toContain("$1,500");
    expect(pages[0]).toContain("$250/mo");
    expect(pages.join("")).not.toMatch(/\$2,?500|\$1,?500\s*\/\s*mo|firstdeploy\.dev/);
    expect(pages[1]).toContain("95 Barrington Drive");
    expect(pages[2]).toContain("briefing");
    expect(pages.join("")).not.toMatch(/14 apps|\$70k|coltsinsider@gmail/i);
  });

  it("ships Organization + LocalBusiness JSON-LD with the Palm Coast address", () => {
    const graph = organizationJsonLd();
    const json = JSON.stringify(graph);
    expect(json).toContain("Organization");
    expect(json).toContain("LocalBusiness");
    expect(json).toContain("95 Barrington Drive");
    expect(json).toContain(LEGAL_NAME);
    expect(json).toContain(LINKEDIN_URL);
    expect(json).toContain("https://firstdeploy.ai/");
    expect(json).toContain("https://indexme.lol/");
    expect(json).not.toMatch(/USPTO|14 apps|\$70k/i);
  });

  it("keeps gmail off llms.txt contact and prefers custom product domains", () => {
    const txt = readFileSync(join(corpRoot, "public/llms.txt"), "utf8");
    expect(txt).toContain("daniel@agenthiveinc.com");
    expect(txt).not.toMatch(/coltsinsider@gmail\.com/);
    expect(txt).toContain("https://flick.firstdeploy.ai/");
    expect(txt).toContain("https://jobproof.firstdeploy.ai/");
    expect(txt).toContain("https://firstdeploy.ai/");
  });

  it("keeps sitemap.xml to agenthiveinc.com HTML routes only", () => {
    const xml = sitemapXml();
    expect(readFileSync(join(corpRoot, "public/sitemap.xml"), "utf8")).toContain("https://agenthiveinc.com/about");
    expect(xml).toContain("https://agenthiveinc.com/</loc>");
    expect(xml).toContain("https://agenthiveinc.com/about");
    expect(xml).toContain("https://agenthiveinc.com/buzz");
    expect(xml).toContain("https://agenthiveinc.com/rankings");
    expect(xml).toContain("https://agenthiveinc.com/build");
    expect(xml).not.toContain("firstdeploy.ai");
    expect(xml).not.toContain("llms.txt");
  });
});
