import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  BOOK_CTA_LABEL,
  BRAND_NAME,
  CONSULT_DISPLAY,
  CONSULT_RATES,
  CONTACT_EMAIL,
  BOOK_HREF,
  FD_CHECK_LABEL,
  FD_CHECK_URL,
  FD_CONSULT_URL,
  HIVE_CONSULT_PATH,
  HIVE_CONSULT_URL,
  FD_CTA_LABEL,
  FD_NAME,
  FD_PRICE,
  FD_PRICE_LINE,
  FD_PROMISE,
  FD_URL,
  FOOTER_LINE,
  FREE_30_LABEL,
  HERO_H1,
  HERO_WHAT,
  HERO_WHY,
  INDEXME_BLURB,
  INDEXME_NAME,
  INDEXME_URL,
  LEGAL_NAME,
  MONEY_FOOTER_LINKS,
  PRODUCT_FOOTER_LINKS,
  SEAT_CIRCUIT_NAME,
  SEAT_CIRCUIT_URL,
} from "../shared/brand";

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(tsx|ts|html|txt|md)$/.test(name)) acc.push(full);
  }
  return acc;
}

describe("AgentHive Inc brand facts", () => {
  it("keeps legal name, consult contact, and First Deploy AI price", () => {
    expect(BRAND_NAME).toBe("AgentHive Inc");
    expect(LEGAL_NAME).toBe("AGENTHIVEINCCOM LLC");
    expect(CONTACT_EMAIL).toBe("daniel@agenthiveinc.com");
    expect(CONSULT_DISPLAY).toBe("+1 320-335-6186");
    expect(FD_NAME).toBe("First Deploy AI");
    expect(FD_URL).toBe("https://firstdeploy.ai/");
    expect(FD_CHECK_URL).toBe("https://firstdeploy.ai/#check");
    expect(FD_CONSULT_URL).toBe("https://firstdeploy.ai/consult");
    expect(HIVE_CONSULT_PATH).toBe("/consult");
    expect(HIVE_CONSULT_URL).toBe("https://agenthiveinc.com/consult");
    expect(FD_PRICE).toBe("$150 burn-audit hour, then a $1,250 operator pack ($625 deposit) or Concierge at $2,000/mo");
    expect(FD_PRICE_LINE).not.toMatch(/founding|first 5|\$250/i);
    expect(FD_PRICE_LINE).not.toContain("1" + ",750");
    expect(FD_PRICE_LINE).not.toContain("$" + "250/mo");
    expect(FD_PROMISE).not.toMatch(/live this week|you don.t pay|guarantee/i);
    expect(INDEXME_NAME).toBe("IndexMe.lol");
    expect(INDEXME_URL).toBe("https://indexme.lol/");
    expect(INDEXME_BLURB).toMatch(/IndexNow/);
    expect(BOOK_HREF).toBe("https://calendly.com/coltsinsider/30min");
    expect(FD_CTA_LABEL).toBe("Start First Deploy");
    expect(BOOK_CTA_LABEL).toBe("Book the free 30");
    expect(FREE_30_LABEL).toBe("Free 30");
    expect(FD_CHECK_LABEL).toBe("2-minute check");
    expect(SEAT_CIRCUIT_NAME).toBe("Seat & Circuit");
    expect(SEAT_CIRCUIT_URL).toBe("https://infrastructure.agenthiveinc.com/");
    expect(CONSULT_RATES).toBe("$75 / 30 min · $150 / hour");
    expect(HERO_H1).toMatch(/done-for-you AI operator/);
    expect(HERO_WHAT).toMatch(/funded companies and 30–200 person teams/);
    expect(`${HERO_H1} ${HERO_WHAT} ${HERO_WHY}`).not.toMatch(/field|dirt|shop|crew|whiteboard|missed/i);
    expect(FOOTER_LINE).toBe("AgentHive Inc · Palm Coast, FL · firstdeploy.ai");
  });

  it("homepage teaches the consultant shop, not the 12-bot swarm", () => {
    const home = readFileSync(join(fileURLToPath(new URL("../src/pages/Home.tsx", import.meta.url))), "utf8");
    expect(home).toMatch(/AI consultant who builds/);
    expect(home).toMatch(/HERO_H1/);
    expect(home).toMatch(/FD_NAME|First Deploy AI/);
    expect(home).toMatch(/FD_CTA_LABEL|Start First Deploy/);
    expect(home).toMatch(/BOOK_CTA_LABEL|Book the free 30/);
    expect(home).toMatch(/INDEXME_NAME|IndexMe/);
    expect(home).toMatch(/INDEXME_BLURB|IndexNow/);
    expect(home).toMatch(/FD_URL|firstdeploy\.ai/);
    expect(home).toMatch(/PICKS_PATH/);
    expect(home).not.toMatch(/commercial earth mover|dirty physical businesses|field owners|crew|whiteboard/i);
    expect(home).toMatch(/AskAiBar/);
    expect(home).toMatch(/queen-full\.webp/);
    expect(home).not.toMatch(/consult-operator/);
    expect(home).not.toMatch(/12 Grok Bots|The Swarm Roster|Recruit your first Grok Bot|bootstrapped/i);
    expect(home).not.toMatch(/14 apps|\$70k/i);
    expect(home).not.toMatch(/netlify\.app/);
    const primaryHrefs = [...home.matchAll(/className="btn btn-primary"[^>]*href=\{([^}]+)\}/g)].map((m) => m[1]);
    expect(new Set(primaryHrefs)).toEqual(new Set(["BOOK_HREF", "PICKS_PATH"]));
  });

  it("About keeps Inc vs LLC, the shop line, and the 320 consult line", () => {
    const about = readFileSync(join(fileURLToPath(new URL("../src/pages/About.tsx", import.meta.url))), "utf8");
    expect(about).toMatch(/BOOK_HREF|tel:/);
    expect(about).not.toMatch(/calendly|grok/i);
    expect(about).toMatch(/CONSULT_DISPLAY|320-335-6186/);
    expect(about).toMatch(/LEGAL_NAME|AGENTHIVEINCCOM LLC/);
    expect(about).not.toMatch(/QpiAI|agenthive\.io|agenthive\.co\b|insurance|OTHER_HIVES/i);
    expect(about).toMatch(/The hive/);
    expect(about).toMatch(/queen-portrait\.webp/);
    expect(about).toMatch(/\/consult/);
    expect(about).not.toMatch(/14 apps|\$70k|bootstrapped/i);
    expect(about).not.toMatch(/hivebriefcase\.netlify\.app/);
  });

  it("footer disambiguates AgentHive Inc from other AgentHives", () => {
    const layout = readFileSync(join(fileURLToPath(new URL("../src/components/Layout.tsx", import.meta.url))), "utf8");
    expect(layout).toMatch(/FOOTER_LINE/);
    expect(layout).not.toMatch(/OTHER_HIVES|agenthive\.io|agenthive\.co\b/);
  });

  it("footer ships the FD-first money links and no netlify.app destinations", () => {
    const layout = readFileSync(join(fileURLToPath(new URL("../src/components/Layout.tsx", import.meta.url))), "utf8");
    expect(layout).toMatch(/MONEY_FOOTER_LINKS/);
    expect(layout).not.toMatch(/netlify\.app/);
    expect(layout).not.toMatch(/INDEXME_|Live work|WriteHive|Bot Lock/);
    expect(MONEY_FOOTER_LINKS).toHaveLength(5);
    expect(MONEY_FOOTER_LINKS.map((link) => link.href)).toEqual([
      "/picks/",
      "/ads",
      "/concierge",
      "/consult",
      "https://calendly.com/coltsinsider/30min",
    ]);
    expect(MONEY_FOOTER_LINKS.map((link) => link.label)).toEqual([
      "Picks",
      "AI Ad Sprint",
      "AI Concierge",
      "Consult",
      "Free 30",
    ]);
    expect(MONEY_FOOTER_LINKS.every((link) => !link.href.includes("netlify.app"))).toBe(true);
    expect(layout).toMatch(/footer-products/);
    expect(layout).toMatch(/PRODUCT_FOOTER_LINKS/);
    expect(PRODUCT_FOOTER_LINKS.map((link) => link.href)).toEqual([
      "/picks/",
      "/ads",
      "/concierge",
      "https://firstdeploy.ai",
      "https://burnbook.firstdeploy.ai/",
      "https://cardbutler.firstdeploy.ai/",
      "/ram-deals/",
    ]);
    expect(PRODUCT_FOOTER_LINKS.map((link) => link.label)).toEqual([
      "Picks",
      "AI Ad Sprint",
      "AI Concierge",
      "First Deploy",
      "Burn Book",
      "Card Butler",
      "RAM & rig deals",
    ]);
  });

  it("does not ship delivery promises or guarantee wording", () => {
    const files = walk(join(fileURLToPath(new URL("..", import.meta.url))));
    const hits: string[] = [];
    for (const file of files) {
      if (file.includes("/tests/")) continue;
      const text = readFileSync(file, "utf8");
      if (/live this week|or you don.t pay|money.back|guarantee/i.test(text)) hits.push(file);
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });

  it("does not ship stale First Deploy prices or firstdeploy.dev", () => {
    const files = walk(join(fileURLToPath(new URL("..", import.meta.url))));
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (file.includes("/tests/")) continue;
      if (
        /\$2,?500/.test(text) ||
        /\$1,?500\s*\/\s*mo/.test(text) ||
        /firstdeploy\.dev/.test(text)
      ) {
        hits.push(file);
      }
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });

  it("uses First Deploy AI on public marketing copy, not a bare First Deploy", () => {
    const publicFiles = [
      "src/pages/Home.tsx",
      "src/pages/About.tsx",
      "src/pages/Build.tsx",
      "src/pages/Consult.tsx",
      "src/pages/Rankings.tsx",
      "src/components/Layout.tsx",
      "shared/seo.ts",
      "shared/portfolio.ts",
      "index.html",
      "public/llms.txt",
    ].map((rel) => join(fileURLToPath(new URL("..", import.meta.url)), rel));
    const hits: string[] = [];
    for (const file of publicFiles) {
      const text = readFileSync(file, "utf8")
        .replace(/https:\/\/firstdeploy\.ai[^\s"'`]*/g, "")
        .replace(/firstdeploy\.ai/g, "")
        .replace(/FD_NAME/g, "First Deploy AI")
        .replace(/FD_URL/g, "")
        .replace(/FD_CHECK_URL/g, "")
        .replace(/FD_CONSULT_URL/g, "")
        .replace(/HIVE_CONSULT_URL/g, "")
        .replace(/HIVE_CONSULT_PATH/g, "")
        .replace(/FD_PRICE/g, "")
        .replace(/FD_CTA_LABEL/g, "")
        .replace(/FD_CHECK_LABEL/g, "")
        .replace(/MONEY_FOOTER_LINKS/g, "")
        .replace(/Start First Deploy(?! AI)/g, "");
      if (/First Deploy(?! AI)/.test(text)) hits.push(file);
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });
});
