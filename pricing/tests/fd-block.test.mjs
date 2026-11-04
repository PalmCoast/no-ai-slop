import { test } from "node:test";
import assert from "node:assert/strict";
import { homeHtml, llmsTxt, llmsFull } from "../src/site.mjs";

const FD_PRICES = /\$(1,750|875|500|250|100)\b/;
const TRADE = /\bdirt\b|\bplants\b|\bshop\b|field operator|\btrades?\b|whiteboard|this week|after-hours/i;

test("First Deploy block: funded-team copy, no prices, no trade words, one founding CTA", () => {
  const home = homeHtml();
  const block = home.slice(home.indexOf('id="first-deploy"'), home.indexOf("</section>", home.indexOf('id="first-deploy"')));
  assert.match(block, /funded teams of 30 to 200/);
  assert.doesNotMatch(block, FD_PRICES);
  assert.doesNotMatch(block, /\$\d/);
  assert.doesNotMatch(block, TRADE);
  const hrefs = [...block.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, ["https://firstdeploy.ai/founding"]);
});

test("homepage and llms keep First Deploy prices, trade words and the street address out", () => {
  const home = homeHtml();
  for (const txt of [home, llmsTxt(), llmsFull()]) {
    assert.doesNotMatch(txt, /First Deploy[^.\n<]*\$\d/);
    assert.doesNotMatch(txt, /\$1,750|\$875\b/);
    assert.doesNotMatch(txt, /Barrington|32137/);
  }
  assert.doesNotMatch(home, TRADE);
  assert.doesNotMatch(llmsTxt(), TRADE);
  assert.doesNotMatch(llmsTxt(), /\$(500|250|100)\b/);
  assert.doesNotMatch(home, /firstdeploy\.ai\/go\//);
});
