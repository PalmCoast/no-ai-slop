import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DEFAULT_QUERY,
  MODELS,
  comparisonStats,
  costFor,
  estimateTokens,
  modelAnswer,
  modelById,
  money,
  perM,
  ranked,
  seatBreakEven,
  selfHost,
  workedExample,
} from "../src/rates.mjs";
import { homeHtml, llmsFull, llmsTxt, modelHtml, robotsTxt, sitemapXml } from "../src/site.mjs";

test("GPT-5.6 Sol worked example matches the published arithmetic", () => {
  const example = workedExample();
  assert.equal(example.inputCost, 0.004);
  assert.equal(example.outputCost, 0.01);
  assert.equal(example.cost.perCall, 0.014);
  assert.equal(money(example.inputCost), "$0.004");
  assert.equal(money(example.outputCost), "$0.010");
  assert.equal(money(example.cost.perCall), "$0.014");
});

test("default workload ranks DeepSeek V4 Flash off-peak first", () => {
  const rows = ranked(DEFAULT_QUERY);
  assert.equal(rows[0].model.id, "ds-v4-flash-off");
  assert.ok(Math.abs(rows[0].monthly - 1.65) < 1e-9);
  const stats = comparisonStats(DEFAULT_QUERY);
  assert.equal(stats.requests, "3,000");
  assert.match(stats.cheap, /DeepSeek V4 Flash \(off-peak\)/);
});

test("cache and batch change the rate only when the card allows it", () => {
  const sol = modelById("gpt-56-sol");
  const grok = modelById("grok-46");
  const base = { inputTok: 1000, outputTok: 0, calls: 1, days: 1, cache: 0, batch: false };
  const cached = costFor(sol, { ...base, cache: 1 });
  assert.equal(cached.perCall, 0.0004);
  const batched = costFor(sol, { ...base, batch: true });
  assert.equal(batched.perCall, 0.002);
  assert.equal(batched.batchApplied, true);
  const grokBatch = costFor(grok, { ...base, inputTok: 1_000_000, batch: true });
  assert.equal(grokBatch.perCall, grok.input);
  assert.equal(grokBatch.batchApplied, false);
});

test("self-host floor counts capacity, not just the rent", () => {
  const result = selfHost({
    gpuPerHour: 3,
    tokensPerSec: 80,
    utilizationPct: 40,
    model: modelById("gpt-56-sol"),
  });
  assert.ok(Math.abs(result.selfPerM - (3 / (80 * 3600 * 0.4)) * 1e6) < 1e-6);
  assert.equal(result.apiPerM, 8);
  assert.equal(result.breakEven, (3 * 24 * 30 / 8) * 1e6);
  assert.ok(result.breakEven > result.capacity);
  assert.equal(result.boxes, 4);
  assert.match(result.note, /one box does not get there/i);
});

test("a $20 seat names the token volume where API spend meets it", () => {
  const luna = modelById("gpt-56-luna");
  const result = seatBreakEven(20, luna);
  const blended = (0.2 * 3 + 1.2) / 4;
  assert.equal(result.blended, blended);
  assert.equal(result.tokens, (20 / blended) * 1e6);
});

test("price formatting stays readable", () => {
  assert.equal(perM(4), "$4");
  assert.equal(perM(0.4), "$0.40");
  assert.equal(perM(0.25), "$0.25");
  assert.equal(perM(0.075), "$0.075");
  assert.equal(perM(0.007), "$0.007");
  assert.equal(money(1200), "$1,200");
  assert.equal(money(42), "$42.00");
});

test("token estimate is about four characters", () => {
  assert.deepEqual(estimateTokens("abcd"), { chars: 4, words: 1, tokens: 1 });
  assert.equal(estimateTokens("").tokens, 0);
});

test("every model has a crawlable page, a sitemap entry, and an llms line", () => {
  const sitemap = sitemapXml();
  const full = llmsFull();
  const robots = robotsTxt();
  assert.match(robots, /User-agent: GPTBot\nAllow: \//);
  assert.match(robots, /User-agent: PerplexityBot/);
  assert.match(robots, /40602f6b-ecf3-406b-a8e5-2e9f601462b6\.txt/);
  assert.match(sitemap, /<loc>https:\/\/aipricingcalculators\.com\/<\/loc>/);
  assert.match(sitemap, /<lastmod>2026-10-07<\/lastmod>/);
  for (const model of MODELS) {
    assert.match(sitemap, new RegExp(`/models/${model.id}/`));
    const html = modelHtml(model);
    assert.ok(html.includes(`<h1>${model.name} costs`));
    assert.match(html, /FAQPage/);
    assert.match(html, /agenthiveinc\.com\/#organization/);
    assert.match(html, /answer-lead/);
    assert.ok(full.includes(model.name));
    assert.ok(modelAnswer(model).includes(perM(model.input)));
  }
  assert.equal(sitemap.match(/<loc>/g).length, MODELS.length + 3);
});

test("homepage answers in HTML, uses the hive theme, and does not ship the old paper ledger", () => {
  const html = homeHtml();
  assert.match(html, /Know the API bill before you buy the desk/);
  assert.match(html, /FAQPage/);
  assert.match(html, /Is the calculator free\?/);
  assert.match(html, /id="cmp-body"/);
  assert.match(html, /DeepSeek V4 Flash \(off-peak\)/);
  assert.match(html, /hero\.jpg/);
  assert.match(html, /#e4b84a|#050403|theme-color" content="#050403"/);
  assert.match(html, /Space\+Grotesk/);
  assert.doesNotMatch(html, /#efe8d8|IBM\+Plex|Source\+Serif/);
  assert.doesNotMatch(html, /Daniel@agenthiveinc\.com/);
  assert.match(html, /daniel@agenthiveinc\.com/);
  assert.match(llmsTxt(), /llms-full\.txt/);
  assert.match(llmsTxt(), /\$1,750/);
  const css = readFileSync(new URL("../static/styles.css", import.meta.url), "utf8");
  assert.match(css, /--gold:\s*#e4b84a/);
  assert.match(css, /--bg:\s*#050403/);
});
