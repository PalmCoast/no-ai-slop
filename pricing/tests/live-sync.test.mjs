import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { sitemapXml } from "../src/site.mjs";

const root = new URL("..", import.meta.url).pathname;

test("repo carries the live-only static files from aipricingcalculators.com", () => {
  assert.ok(existsSync(root + "static/ai-video-generator-pricing/index.html"));
  assert.equal(readFileSync(root + "static/indexnow-key.txt", "utf8"), "40602f6b-ecf3-406b-a8e5-2e9f601462b6");
  assert.match(sitemapXml(), /aipricingcalculators\.com\/ai-video-generator-pricing\//);
});

test("ai-video page footer is city-only", () => {
  assert.doesNotMatch(readFileSync(root + "static/ai-video-generator-pricing/index.html", "utf8"), /Barrington|32137/);
});
