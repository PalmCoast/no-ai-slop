#!/usr/bin/env node
/**
 * Fail the build if Grok-bot junk lands back on First Deploy pages:
 * ad units, duplicate shop strips, payment-footer scripts, fake hive comments.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pages = readdirSync(root).filter((name) => name.endsWith(".html"));

const banned = [
  { re: /hiveads/i, why: "HiveAds unit or script" },
  { re: /jobproof-strip/i, why: "JobProof promo strip" },
  { re: /flick-strip/i, why: "Flick promo strip" },
  { re: /id=["']hive-notes["']/i, why: "injected hive comments block" },
  { re: /firstdeploy-pay\.netlify\.app\/footer/i, why: "pay-site footer.js inject" },
  { re: /You do not get/i, why: "negative-listing copy" },
  { re: /★★★★★/, why: "star-rating hive comments" },
];

const requiredHome = [
  { re: /Setup: \$1,500/, why: "setup price on the home page" },
  { re: /\$250/, why: "monthly price on the home page" },
  { re: /tel:\+13203356186/, why: "First Deploy phone" },
];

let failed = 0;

for (const page of pages) {
  const html = readFileSync(join(root, page), "utf8");
  for (const rule of banned) {
    if (rule.re.test(html)) {
      console.error(`${page}: found ${rule.why}`);
      failed += 1;
    }
  }
}

const home = readFileSync(join(root, "index.html"), "utf8");
for (const rule of requiredHome) {
  if (!rule.re.test(home)) {
    console.error(`index.html: missing ${rule.why}`);
    failed += 1;
  }
}

const hiveadsCount = (home.match(/hiveads/gi) || []).length;
if (hiveadsCount !== 0) {
  console.error(`index.html: hiveads mention count ${hiveadsCount}, expected 0`);
  failed += 1;
}

if (failed) {
  console.error(`check-clean: ${failed} problem(s)`);
  process.exit(1);
}

console.log(`check-clean: ${pages.length} pages clean`);
