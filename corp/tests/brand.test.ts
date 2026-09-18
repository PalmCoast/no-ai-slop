import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  BRAND_NAME,
  CONSULT_DISPLAY,
  CONTACT_EMAIL,
  CALENDLY_URL,
  FD_NAME,
  FD_PRICE,
  FD_PROMISE,
  FD_URL,
  INDEXME_BLURB,
  INDEXME_NAME,
  INDEXME_URL,
  LEGAL_NAME,
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
    expect(FD_PRICE).toBe("$1,500 setup, then $250/mo");
    expect(FD_PROMISE).toMatch(/Live this week/i);
    expect(INDEXME_NAME).toBe("IndexMe.lol");
    expect(INDEXME_URL).toBe("https://indexme.lol/");
    expect(INDEXME_BLURB).toMatch(/IndexNow/);
    expect(CALENDLY_URL).toBe("https://calendly.com/coltsinsider/30min");
  });

  it("homepage teaches the consultant shop, not the 12-bot swarm", () => {
    const home = readFileSync(join(fileURLToPath(new URL("../src/pages/Home.tsx", import.meta.url))), "utf8");
    expect(home).toMatch(/AI consultant who builds/);
    expect(home).toMatch(/FD_NAME|First Deploy AI/);
    expect(home).toMatch(/INDEXME_NAME|IndexMe/);
    expect(home).toMatch(/INDEXME_BLURB|IndexNow/);
    expect(home).toMatch(/firstdeploy\.ai/);
    expect(home).not.toMatch(/12 Grok Bots|The Swarm Roster|Recruit your first Grok Bot|bootstrapped/i);
    expect(home).not.toMatch(/14 apps|\$70k/i);
  });

  it("About keeps Inc vs LLC, Calendly, and the 320 consult line", () => {
    const about = readFileSync(join(fileURLToPath(new URL("../src/pages/About.tsx", import.meta.url))), "utf8");
    expect(about).toMatch(/CALENDLY_URL|calendly\.com\/coltsinsider\/30min/);
    expect(about).toMatch(/CONSULT_DISPLAY|320-335-6186/);
    expect(about).toMatch(/LEGAL_NAME|AGENTHIVEINCCOM LLC/);
    expect(about).toMatch(/QpiAI|insurance hive|OSS/);
    expect(about).not.toMatch(/14 apps|\$70k|bootstrapped/i);
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
        .replace(/FD_CONSULT_URL/g, "")
        .replace(/FD_PRICE/g, "");
      if (/First Deploy(?! AI)/.test(text)) hits.push(file);
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });
});
