import { describe, expect, it } from "vitest";
import { findIndexMeLinks, indexMeHref, judgeLinks, normalizeUrl } from "../shared/check-link";

describe("indexMeHref", () => {
  it("accepts the desk host and rejects lookalikes and relative links", () => {
    expect(indexMeHref("https://indexme.lol/")).toBe("https://indexme.lol/");
    expect(indexMeHref("https://www.indexme.lol/desk/")).toBe("https://www.indexme.lol/desk/");
    expect(indexMeHref("//indexme.lol/")).toBe("https://indexme.lol/");
    expect(indexMeHref("https://indexme.lol.evil.com/")).toBeNull();
    expect(indexMeHref("https://notindexme.lol/")).toBeNull();
    expect(indexMeHref("https://evil.com/?next=https://indexme.lol/")).toBeNull();
    expect(indexMeHref("/desk/")).toBeNull();
    expect(indexMeHref("javascript:alert(1)")).toBeNull();
  });
});

describe("findIndexMeLinks", () => {
  it("reads a named follow link and ignores script text", () => {
    const html = `
      <script>var x = '<a href="https://indexme.lol/">IndexMe</a>';</script>
      <a href="https://indexme.lol/" rel="noopener">IndexMe.lol</a>
    `;
    const links = findIndexMeLinks(html);
    expect(links).toEqual([
      {
        href: "https://indexme.lol/",
        text: "IndexMe.lol",
        nofollow: false,
        named: true,
      },
    ]);
    expect(judgeLinks(links)).toBe("linked");
  });

  it("counts an image alt and an aria-label as the visible name", () => {
    const html = `<a href="https://indexme.lol/"><img alt="IndexMe.lol" src="/badge.svg"></a>`;
    expect(judgeLinks(findIndexMeLinks(html))).toBe("linked");
  });

  it("reports nofollow, unnamed, and missing separately", () => {
    expect(
      judgeLinks(findIndexMeLinks(`<a href="https://indexme.lol/" rel="nofollow noopener">IndexMe</a>`)),
    ).toBe("nofollow");
    expect(judgeLinks(findIndexMeLinks(`<a href="https://indexme.lol/">click here</a>`))).toBe("unnamed");
    expect(judgeLinks(findIndexMeLinks(`<p>No link on this page.</p>`))).toBe("missing");
  });

  it("lets a named follow link outrank a nofollow link", () => {
    const html = `
      <a href="https://indexme.lol/" rel="nofollow">IndexMe</a>
      <a href="https://www.indexme.lol/desk/">IndexMe desk</a>
    `;
    expect(judgeLinks(findIndexMeLinks(html))).toBe("linked");
  });
});

describe("normalizeUrl", () => {
  it("adds https when the scheme is missing", () => {
    expect(normalizeUrl(" indexme.lol/desk ")).toBe("https://indexme.lol/desk");
    expect(normalizeUrl("http://indexme.lol")).toBe("http://indexme.lol");
    expect(normalizeUrl("")).toBe("");
  });
});
