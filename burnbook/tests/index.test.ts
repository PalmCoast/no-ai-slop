import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PAYMENT_LINK } from "../shared/brand.ts";
import { INDEXNOW_KEY, INDEX_PATHS, indexNowBody, indexUrls } from "../shared/indexnow.ts";
import { LAUNCH_POST, SALES_NOTE } from "../shared/sales.ts";

describe("indexing", () => {
  it("publishes the IndexNow key and a sitemap of the public pages", () => {
    const keyFile = readFileSync(new URL(`../public/${INDEXNOW_KEY}.txt`, import.meta.url), "utf8").trim();
    const sitemap = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
    const robots = readFileSync(new URL("../public/robots.txt", import.meta.url), "utf8");
    expect(keyFile).toBe(INDEXNOW_KEY);
    expect(robots).toContain("Sitemap: https://burnbook.firstdeploy.ai/sitemap.xml");
    for (const url of indexUrls()) expect(sitemap).toContain(`<loc>${url}</loc>`);
    expect(sitemap).not.toContain("/thanks");
    expect(indexNowBody().urlList).toHaveLength(INDEX_PATHS.length);
  });
});

describe("sales note", () => {
  it("sells the packet at the live checkout and keeps Northline a sample", () => {
    expect(SALES_NOTE).toContain(PAYMENT_LINK);
    expect(SALES_NOTE).toContain("$750");
    expect(SALES_NOTE).toContain("worked example");
    expect(SALES_NOTE.toLowerCase()).not.toContain("our customer");
    expect(LAUNCH_POST).toContain(PAYMENT_LINK);
    expect(LAUNCH_POST.length).toBeLessThanOrEqual(280);
  });
});
