import { describe, expect, it } from "vitest";
import { FEST_LINKS } from "../shared/board";
import { INDEXME_HOME, PAGE_DESCRIPTION, SITE_ORIGIN } from "../shared/brand";
import { festFallbackHtml, festJsonLd } from "../shared/fallback";
import { anchorSnippet, badgeSnippet, sentenceSnippet } from "../shared/credit";

describe("fest board", () => {
  it("links out over https with unique urls, including the desk", () => {
    const urls = FEST_LINKS.map((link) => link.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain(INDEXME_HOME);
    for (const link of FEST_LINKS) {
      expect(link.url.startsWith("https://")).toBe(true);
      expect(link.name.trim().length).toBeGreaterThan(1);
      expect(link.line.trim().length).toBeGreaterThan(10);
    }
    expect(FEST_LINKS.some((link) => link.group === "credit")).toBe(true);
  });

  it("puts every outbound link in the no-JS fallback and the item list", () => {
    const html = festFallbackHtml();
    const json = festJsonLd();
    expect(html).toContain("<h1>Link to us. We link back.</h1>");
    expect(html).toContain(PAGE_DESCRIPTION);
    for (const link of FEST_LINKS) {
      expect(html).toContain(`href="${link.url}"`);
      expect(json).toContain(link.url);
    }
    expect(json).toContain(SITE_ORIGIN);
  });
});

describe("credit snippets", () => {
  it("names IndexMe in the anchor and escapes a site name", () => {
    expect(anchorSnippet()).toBe('<a href="https://indexme.lol/">IndexMe.lol</a>');
    const sentence = sentenceSnippet(`<script>alert("x")</script>`);
    expect(sentence).toContain('<a href="https://indexme.lol/">IndexMe.lol</a>');
    expect(sentence).not.toContain("<script>");
    expect(sentence).toContain("&lt;script&gt;");
    const badge = badgeSnippet("https://linkfest.indexme.lol");
    expect(badge).toContain('href="https://indexme.lol/"');
    expect(badge).toContain('src="https://linkfest.indexme.lol/badge.svg"');
    expect(badge).toContain('alt="Link Fest. IndexMe.lol"');
  });
});
