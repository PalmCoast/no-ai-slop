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
import { ASK_AI_PROMPT } from "../shared/brand";
import { SALE_APPS } from "../shared/catalog";
import { HUNT_SEED } from "../shared/hunt";
import { applyRouteHtml, canonicalFor, PAGE_SEO, sitemapXml } from "../shared/seo";

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
    expect(sitemapXml()).toContain("https://askyard.firstdeploy.ai/board");
    expect(sitemapXml()).toContain("https://askyard.firstdeploy.ai/rep");
    expect(sitemapXml()).toContain("https://askyard.firstdeploy.ai/marquee");
    expect(sitemapXml()).toContain("https://askyard.firstdeploy.ai/q/stop-missing-night-calls");
    expect(sitemapXml()).not.toContain("https://askyard.firstdeploy.ai/launch");
    expect(PAGE_SEO.some((page) => page.path === "/launch")).toBe(false);
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
});
