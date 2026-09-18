import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LEGAL_NAME, LINKEDIN_URL } from "../shared/brand";
import { applyRouteHtml, canonicalFor, organizationJsonLd, PAGE_SEO } from "../shared/seo";

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
    expect(about).toContain("<h1 class=\"display\">About AgentHive Inc</h1>");
    expect(home).toContain('rel="canonical" href="https://agenthiveinc.com/"');
    expect(about).not.toContain('rel="canonical" href="https://agenthiveinc.com/" />');
    expect(about).toContain("application/ld+json");
    expect(about).toContain(LEGAL_NAME);
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
    const xml = readFileSync(join(corpRoot, "public/sitemap.xml"), "utf8");
    expect(xml).toContain("https://agenthiveinc.com/</loc>");
    expect(xml).toContain("https://agenthiveinc.com/about");
    expect(xml).toContain("https://agenthiveinc.com/buzz");
    expect(xml).toContain("https://agenthiveinc.com/rankings");
    expect(xml).toContain("https://agenthiveinc.com/build");
    expect(xml).not.toContain("firstdeploy.ai");
    expect(xml).not.toContain("llms.txt");
  });
});
