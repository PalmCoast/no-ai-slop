import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const corpRoot = join(__dirname, "..");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const files = [
  ...walk(join(corpRoot, "public")).filter((f) => /\.(html|txt)$/.test(f)),
  ...walk(join(corpRoot, "src")).filter((f) => /\.tsx?$/.test(f)),
  ...walk(join(corpRoot, "shared")).filter((f) => /\.ts$/.test(f)),
  join(corpRoot, "index.html"),
];

describe("retired First Deploy founding offer", () => {
  it("is gone from every page, source file and llms.txt", () => {
    for (const f of files) {
      const s = readFileSync(f, "utf8");
      expect(s, f).not.toMatch(/founding offer|founding spots|first 5 businesses|first five|firstdeploy\.ai\/(go\/)?founding|\$250 (one-time )?setup|\$500 setup/i);
    }
  });
});

describe("shared footer", () => {
  it("drops the dead join.netlify.com partner link", () => {
    expect(readFileSync(join(corpRoot, "src/components/Layout.tsx"), "utf8")).not.toContain("join.netlify.com");
    const picks = readFileSync(join(corpRoot, "public/picks/index.html"), "utf8");
    const footer = picks.slice(picks.lastIndexOf("<footer"));
    expect(footer).not.toContain("join.netlify.com");
  });
});
