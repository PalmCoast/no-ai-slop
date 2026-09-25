import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  bumpQuestion,
  computeTotals,
  findMatch,
  normalizeQuestion,
  overlapScore,
  pickOfferSlug,
  rankQuestions,
  SEED_QUESTIONS,
  slugifyQuestion,
} from "../shared/ask";
import { askAiLinks } from "../shared/reputation";
import { ASK_AI_PROMPT, HOME_DESCRIPTION, HOME_TITLE } from "../shared/brand";
import { SALE_APPS } from "../shared/catalog";
import { HUNT_SEED } from "../shared/hunt";
import { applyRouteHtml, canonicalFor, pageForPath, PAGE_SEO, sitemapEntries, sitemapXml } from "../shared/seo";

const layoutSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/components/Layout.tsx"),
  "utf8",
);

describe("question ranking", () => {
  it("normalizes and slugs a shop-floor question", () => {
    expect(normalizeQuestion("  How do I stop missing night calls?? ")).toBe("how do i stop missing night calls");
    expect(slugifyQuestion("How do I stop missing night calls?")).toBe("how-do-i-stop-missing-night-calls");
  });

  it("matches a close rephrase to the seeded night-call question", () => {
    const match = findMatch("how do we stop missing night calls", SEED_QUESTIONS);
    expect(match?.slug).toBe("stop-missing-night-calls");
    expect(overlapScore("stop missing night calls", "How do I stop missing night calls?")).toBeGreaterThan(0.55);
  });

  it("ranks by ask count and keeps a running total", () => {
    const ranked = rankQuestions(SEED_QUESTIONS);
    expect(ranked[0].asks).toBeGreaterThanOrEqual(ranked[1].asks);
    expect(ranked[0].slug).toBe("stop-missing-night-calls");
    const totals = computeTotals(ranked);
    expect(totals.questionsAsked).toBe(SEED_QUESTIONS.reduce((sum, q) => sum + q.asks, 0));
    expect(totals.uniqueQuestions).toBe(SEED_QUESTIONS.length);
    expect(totals.answersGiven).toBe(totals.questionsAsked);
  });

  it("increments an existing question instead of duplicating it", () => {
    const next = bumpQuestion(SEED_QUESTIONS, "How do I stop missing night calls?");
    const row = next.find((item) => item.slug === "stop-missing-night-calls");
    const seed = SEED_QUESTIONS.find((item) => item.slug === "stop-missing-night-calls");
    expect(row?.asks).toBe((seed?.asks ?? 0) + 1);
    expect(next.length).toBe(SEED_QUESTIONS.length);
  });

  it("routes offers to the priced product", () => {
    expect(pickOfferSlug("How do I stop missing night calls?")).toBe("first-deploy");
    expect(pickOfferSlug("prove the crew showed up with photos")).toBe("jobproof");
    expect(pickOfferSlug("get found on Google without more ads")).toBe("indexme");
    expect(pickOfferSlug("record my screen and send a link")).toBe("flick");
  });
});

describe("reputation search", () => {
  it("encodes AskYard into LLM and Google Search deep links", () => {
    const links = askAiLinks();
    const encoded = encodeURIComponent(ASK_AI_PROMPT);
    expect(links.map((link) => link.name)).toEqual(["ChatGPT", "Claude", "Perplexity", "Gemini", "Grok", "Google"]);
    expect(links[5].href).toBe(`https://www.google.com/search?q=${encoded}`);
    for (const link of links) {
      expect(link.href).toContain(encoded);
      expect(link.href).not.toContain(" ");
    }
    expect(ASK_AI_PROMPT).toMatch(/askyard\.firstdeploy\.ai/);
    expect(ASK_AI_PROMPT).toMatch(/First Deploy AI/);
    expect(ASK_AI_PROMPT).toMatch(/Palm Coast/);
  });
});

describe("directory listing badges", () => {
  it("embeds the official twelve.tools free badge markup in the footer", () => {
    expect(layoutSource).toContain('href="https://twelve.tools"');
    expect(layoutSource).toContain('target="_blank"');
    expect(layoutSource).toContain('rel="noopener"');
    expect(layoutSource).toContain('src="https://twelve.tools/badge0-white.svg"');
    expect(layoutSource).toContain('alt="Featured on Twelve Tools"');
    expect(layoutSource).toContain("width={200}");
    expect(layoutSource).toContain("height={54}");
  });

  it("embeds the official Fazier launch badge next to twelve.tools", () => {
    expect(layoutSource).toContain('href="https://fazier.com"');
    expect(layoutSource).toContain(
      'src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light"',
    );
    expect(layoutSource).toContain('alt="Fazier badge"');
    expect(layoutSource).toContain("width={120}");
  });
});

describe("apps for sale", () => {
  it("lists First Deploy AI first and keeps live prices", () => {
    expect(SALE_APPS[0].name).toBe("First Deploy AI");
    expect(SALE_APPS[0].price).toBe("$1,500 setup, then $250/mo");
    expect(SALE_APPS.some((app) => app.slug === "jobproof")).toBe(true);
    expect(SALE_APPS.some((app) => app.slug === "flick")).toBe(true);
    expect(SALE_APPS.every((app) => app.url.startsWith("https://"))).toBe(true);
  });
});

describe("hunt replies", () => {
  it("puts an AskYard backlink in every copied reply", () => {
    expect(HUNT_SEED.length).toBeGreaterThanOrEqual(5);
    for (const hit of HUNT_SEED) {
      expect(hit.reply).toMatch(/askyard\.firstdeploy\.ai/);
    }
  });
});

describe("seo", () => {
  it("keeps unique titles and askyard.firstdeploy.ai canonicals", () => {
    const titles = PAGE_SEO.map((page) => page.title);
    expect(new Set(titles).size).toBe(PAGE_SEO.length);
    for (const page of PAGE_SEO) {
      expect(canonicalFor(page.path)).toMatch(/^https:\/\/askyard\.firstdeploy\.ai/);
    }
    expect(PAGE_SEO.some((page) => page.path === "/about")).toBe(true);
    expect(PAGE_SEO.find((page) => page.path === "/")?.title).toBe(HOME_TITLE);
    expect(PAGE_SEO.find((page) => page.path === "/")?.description).toBe(HOME_DESCRIPTION);
    expect(sitemapXml()).toContain("https://askyard.firstdeploy.ai/board");
    expect(sitemapXml()).toContain("https://askyard.firstdeploy.ai/about");
    expect(sitemapXml()).toContain("https://askyard.firstdeploy.ai/apps");
    expect(sitemapXml()).toContain("https://askyard.firstdeploy.ai/q/stop-missing-night-calls");
    expect(sitemapXml()).not.toContain("https://askyard.firstdeploy.ai/launch");
    expect(sitemapXml()).not.toContain("netlify.app");
    expect(sitemapXml()).not.toContain("#");
    expect(PAGE_SEO.some((page) => page.path === "/launch")).toBe(false);
  });

  it("lists only money 200 URLs with real lastmod", () => {
    const entries = sitemapEntries();
    const locs = entries.map((entry) => entry.loc);
    expect(locs).toEqual([
      "https://askyard.firstdeploy.ai/",
      "https://askyard.firstdeploy.ai/about",
      "https://askyard.firstdeploy.ai/board",
      "https://askyard.firstdeploy.ai/apps",
      "https://askyard.firstdeploy.ai/check",
      ...SEED_QUESTIONS.map((q) => `https://askyard.firstdeploy.ai/q/${q.slug}`),
    ]);
    expect(entries.every((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod))).toBe(true);
    expect(sitemapXml()).toContain("<lastmod>");
    expect(sitemapXml()).not.toContain("/rep");
    expect(sitemapXml()).not.toContain("/marquee");
    expect(sitemapXml()).not.toContain("/hunt");
  });

  it("puts AskYard facts in the first HTML for money pages and /q/", () => {
    const shell = `<!doctype html><html><head>
      <title>x</title>
      <meta name="description" content="shared" />
      <link rel="canonical" href="https://askyard.firstdeploy.ai/" />
      <meta property="og:title" content="shared" />
      <meta property="og:description" content="shared" />
      <meta property="og:url" content="https://askyard.firstdeploy.ai/" />
      <meta name="twitter:title" content="shared" />
      <meta name="twitter:description" content="shared" />
    </head><body><div id="root"></div></body></html>`;
    const paths = ["/", "/board", "/apps", "/about", "/q/stop-missing-night-calls"];
    for (const path of paths) {
      const page = path.startsWith("/q/") ? pageForPath(path) : PAGE_SEO.find((item) => item.path === path)!;
      const html = applyRouteHtml(shell, page);
      expect(html).toContain("AskYard");
      expect(html).toContain("AgentHive Inc");
      expect(html).toContain("Palm Coast");
      expect(html).toContain("$1,500");
      expect(html).toContain("$250");
      expect(html).toContain("+1-320-335-6186");
      expect(html).toContain("https://firstdeploy.ai/");
      expect(html).toContain("How do I stop missing night calls?");
      expect(html).toContain("Put one number on the truck");
      expect(html).not.toMatch(/14 apps|\$70k/);
      if (path === "/") {
        expect(html).toContain(`<title>${HOME_TITLE}</title>`);
        expect(html).toContain(HOME_DESCRIPTION);
        expect(html).toContain('rel="canonical" href="https://askyard.firstdeploy.ai/"');
      }
      if (path === "/q/stop-missing-night-calls") {
        expect(html).toContain('rel="canonical" href="https://askyard.firstdeploy.ai/q/stop-missing-night-calls"');
        expect(html).toContain("Need the night line installed?");
        expect(html).toContain("$1,500 setup, then $250/month");
      }
    }
  });

  it("writes distinct home and board HTML", () => {
    const shell = `<!doctype html><html><head>
      <title>x</title>
      <meta name="description" content="shared" />
      <link rel="canonical" href="https://askyard.firstdeploy.ai/" />
      <meta property="og:title" content="shared" />
      <meta property="og:description" content="shared" />
      <meta property="og:url" content="https://askyard.firstdeploy.ai/" />
      <meta name="twitter:title" content="shared" />
      <meta name="twitter:description" content="shared" />
    </head><body><div id="root"></div></body></html>`;
    const home = applyRouteHtml(shell, PAGE_SEO[0]);
    const board = applyRouteHtml(shell, PAGE_SEO[1]);
    expect(home).toContain("id=\"route-home\"");
    expect(board).toContain("id=\"route-board\"");
    expect(home).not.toBe(board);
  });

  it("allows GPT-class bots in robots.txt and names the host sitemap", () => {
    const robots = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../public/robots.txt"), "utf8");
    for (const bot of [
      "GPTBot",
      "ChatGPT-User",
      "OAI-SearchBot",
      "ClaudeBot",
      "Claude-SearchBot",
      "PerplexityBot",
      "Google-Extended",
      "Googlebot",
      "Bingbot",
    ]) {
      expect(robots).toContain(`User-agent: ${bot}`);
    }
    expect(robots).toMatch(/User-agent: \*\nAllow: \//);
    expect(robots).toContain("Sitemap: https://askyard.firstdeploy.ai/sitemap.xml");
  });

  it("reuses the NetYard IndexNow key on AskYard, corp, and the First Deploy drop", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const keyName = "40602f6b-ecf3-406b-a8e5-2e9f601462b6.txt";
    const netyard = readFileSync(join(root, "netyard/public", keyName), "utf8").trim();
    expect(netyard).toBe("40602f6b-ecf3-406b-a8e5-2e9f601462b6");
    for (const rel of ["askyard/public", "corp/public", "firstdeploy"]) {
      expect(readFileSync(join(root, rel, keyName), "utf8").trim()).toBe(netyard);
    }
  });

  it("ships a First Deploy sitemap index and GPT-class robots for Reed to copy onto firstdeploy.ai", () => {
    const fd = join(dirname(fileURLToPath(import.meta.url)), "../../firstdeploy");
    const robots = readFileSync(join(fd, "robots.txt"), "utf8");
    const index = readFileSync(join(fd, "sitemap-index.xml"), "utf8");
    for (const bot of [
      "GPTBot",
      "ChatGPT-User",
      "OAI-SearchBot",
      "ClaudeBot",
      "Claude-SearchBot",
      "PerplexityBot",
      "Google-Extended",
      "Googlebot",
      "Bingbot",
    ]) {
      expect(robots).toContain(`User-agent: ${bot}`);
    }
    expect(robots).toMatch(/User-agent: \*\nAllow: \//);
    expect(robots).toContain("Sitemap: https://firstdeploy.ai/sitemap-index.xml");
    expect(index).toContain("<sitemapindex");
    expect(index).toContain("https://firstdeploy.ai/sitemap.xml");
    expect(index).toContain("https://askyard.firstdeploy.ai/sitemap.xml");
    expect(index).toContain("https://aisle.firstdeploy.ai/sitemap.xml");
    expect(index).toContain("https://agenthiveinc.com/sitemap.xml");
  });

  it("tells models AskYard is free and AgentHive Inc is not agenthive.io", () => {
    const txt = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../public/llms.txt"), "utf8");
    expect(txt).toMatch(/free Q&A front door/i);
    expect(txt).toMatch(/not the paid after-hours desk/i);
    expect(txt).toContain("agenthive.io");
    expect(txt).toContain("insurance leads");
    expect(txt).toContain("agenthive.co");
    expect(txt).toContain("$1,500");
    expect(txt).toContain("$250");
    expect(txt).not.toMatch(/14 apps|\$70k/);
  });
});
