import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SOURCE_ROOTS = ["src", "shared", "index.html"];
const TEXT_EXT = new Set([".ts", ".tsx", ".html", ".md"]);

function collectFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) out.push(...collectFiles(path));
    else if (TEXT_EXT.has(extname(name))) out.push(path);
  }
  return out;
}

function sourceFiles(): string[] {
  return SOURCE_ROOTS.flatMap((rel) => {
    const path = join(ROOT, rel);
    const st = statSync(path);
    return st.isDirectory() ? collectFiles(path) : [path];
  });
}

const BANNED = [
  /payment gate/i,
  /open the payment gate/i,
  /opening the gate/i,
  /\bthe gate\b/i,
  /publish is the gate/i,
  /publish is the ticket/i,
  /back to the gate/i,
];

describe("buyer-facing copy", () => {
  it("does not use payment-gate or ticket jargon", () => {
    const hits: string[] = [];
    for (const file of sourceFiles()) {
      const text = readFileSync(file, "utf8");
      const lines = text.split("\n");
      lines.forEach((line, i) => {
        if (BANNED.some((re) => re.test(line))) {
          hits.push(`${file.replace(ROOT, "flick/")}:${i + 1}: ${line.trim()}`);
        }
      });
    }
    expect(hits).toEqual([]);
  });

  it("does not put STRIPE_SECRET_KEY in client source", () => {
    const hits: string[] = [];
    for (const file of sourceFiles()) {
      const text = readFileSync(file, "utf8");
      if (text.includes("STRIPE_SECRET_KEY")) hits.push(file.replace(ROOT, "flick/"));
    }
    expect(hits).toEqual([]);
  });

  it("does not ship public /launch or /marketing routes", () => {
    const main = readFileSync(join(ROOT, "src/main.tsx"), "utf8");
    expect(main).not.toMatch(/path="\/launch"/);
    expect(main).not.toMatch(/path="\/marketing"/);
    expect(main).not.toMatch(/pages\/Launch/);
    expect(main).not.toMatch(/pages\/Marketing/);
  });

  it("301s /launch and /marketing home before the SPA fallback", () => {
    const toml = readFileSync(join(ROOT, "netlify.toml"), "utf8");
    const launch = toml.indexOf('from = "/launch"');
    const marketing = toml.indexOf('from = "/marketing"');
    const spa = toml.indexOf('from = "/*"');
    expect(launch).toBeGreaterThan(-1);
    expect(marketing).toBeGreaterThan(-1);
    expect(spa).toBeGreaterThan(-1);
    expect(launch).toBeLessThan(spa);
    expect(marketing).toBeLessThan(spa);
    expect(toml).toMatch(/from = "\/launch"[\s\S]*?status = 301[\s\S]*?force = true/);
    expect(toml).toMatch(/from = "\/marketing"[\s\S]*?status = 301[\s\S]*?force = true/);
  });
});
