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
});
