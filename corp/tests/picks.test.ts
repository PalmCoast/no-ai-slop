import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { sitemapXml } from "../shared/seo";

const corpRoot = fileURLToPath(new URL("..", import.meta.url));
const page = readFileSync(join(corpRoot, "public/picks/index.html"), "utf8");
const llms = readFileSync(join(corpRoot, "public/llms.txt"), "utf8");
const ram = readFileSync(join(corpRoot, "public/ram-deals/index.html"), "utf8");
const layout = readFileSync(join(corpRoot, "src/components/Layout.tsx"), "utf8");
const routes = readFileSync(join(corpRoot, "scripts/write-route-html.ts"), "utf8");

describe("/picks storefront", () => {
  it("is indexable with title, canonical, share card, and ItemList JSON-LD", () => {
    expect(page).toContain("<title>Picks:");
    expect(page).toContain('<link rel="canonical" href="https://agenthiveinc.com/picks/">');
    expect(page).toContain('content="index, follow"');
    expect(page).toContain('property="og:image" content="https://agenthiveinc.com/picks/og.png"');
    expect(page).toContain('<script src="/ph.js" defer></script>');
    const ld = JSON.parse(page.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1]);
    const list = ld["@graph"].find((n: { "@type": string }) => n["@type"] === "ItemList");
    expect(list.numberOfItems).toBe(list.itemListElement.length);
    expect(list.numberOfItems).toBeGreaterThanOrEqual(20);
  });

  it("groups by buyer want and discloses partner links", () => {
    for (const id of ["look-sharp", "beast-rig", "grow", "get-paid"]) expect(page).toContain(`id="${id}"`);
    expect(page).toContain("Come and Take It");
    expect(page).toContain("https://brooms.ai/products/come-and-take-it-tee");
    expect(page).toContain('href="/ads"');
    expect(page).toContain("https://whop.com/agenthive/ai-receptionist-kit/");
    expect(page).toContain('href="/ram-deals/"');
    expect(page).toMatch(/Disclosure\.<\/strong>/);
    for (const host of ["higgsfield.ai", "mailcheap.ai", "join.netlify.com", "t.mercor.com", "refer.micro1.ai"]) {
      const links = [...page.matchAll(new RegExp(`<a [^>]*href="https://${host.replace(/\./g, "\\.")}[^"]*"[^>]*>`, "g"))];
      expect(links.length, host).toBeGreaterThan(0);
      for (const [tag] of links) expect(tag, host).toContain('rel="sponsored noopener"');
    }
  });

  it("shows the guide-page disclosure line near the top, linking to /disclosure", () => {
    const guide = readFileSync(join(corpRoot, "public/founder-stack/index.html"), "utf8");
    const line = guide.match(/<p class="pk-disc">.*?<\/p>/)?.[0];
    expect(line).toBeTruthy();
    expect(line).toContain('href="/disclosure"');
    expect(page).toContain(line!);
    expect(page.indexOf(line!)).toBeLessThan(page.indexOf('id="brooms-tees"'));
  });

  it("keeps the deep-link anchors other pages use", () => {
    for (const id of ["netlify", "mailcheap", "higgsfield", "ad-sprint", "brooms-tees", "brooms-gear", "ram-deals"]) {
      expect(page.match(new RegExp(`id="${id}"`, "g"))?.length, id).toBe(1);
    }
  });

  it("carries no banned copy", () => {
    expect(page).not.toMatch(/refund|money-back|guarantee|coupon|promo code|™/i);
    expect(page).not.toMatch(/HVAC|plumb|roofer|roofing|electrician|landscap|Flagler|Volusia|missed call/i);
    expect(page).not.toMatch(new RegExp(String.fromCharCode(71, 114, 111, 107), "i"));
    expect(page).not.toMatch(/SpaceX|KloudStax|Colts/i);
  });

  it("is the hub: sitemap, llms.txt, nav, footer, ram-deals and a rewrite all point to it", () => {
    expect(sitemapXml()).toContain("<loc>https://agenthiveinc.com/picks/</loc>");
    expect(llms).toContain("https://agenthiveinc.com/picks/");
    expect(layout).toMatch(/PICKS_PATH/);
    expect(layout).toContain('rel="sponsored noopener"');
    expect(ram).toContain('href="/picks/"');
    expect(routes).toContain('"/picks /picks/index.html 200!"');
  });
});
