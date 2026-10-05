import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { publishRedirectsFile, PUBLISH_REDIRECTS } from "../shared/publish-redirects";

const corpRoot = fileURLToPath(new URL("..", import.meta.url));

type Rule = { from: string; to: string; status: number };

const GAP_RULES: Rule[] = [
  { from: "/go", to: "/consult", status: 301 },
  { from: "/go/", to: "/consult", status: 301 },
  { from: "/book", to: "/consult", status: 301 },
  { from: "/book/", to: "/consult", status: 301 },
  { from: "/contact", to: "/about", status: 301 },
  { from: "/contact/", to: "/about", status: 301 },
  { from: "/pricing", to: "/concierge", status: 301 },
  { from: "/pricing/", to: "/concierge", status: 301 },
  { from: "/og.png", to: "/og.jpg", status: 301 },
  { from: "/hive", to: "/about", status: 301 },
  { from: "/hive/", to: "/about", status: 301 },
  { from: "/hive.html", to: "/about", status: 301 },
];

function tomlRedirects(text: string): Rule[] {
  return text
    .split("[[redirects]]")
    .slice(1)
    .map((block) => {
      const head = block.split("[[")[0];
      const from = head.match(/from = "([^"]+)"/)?.[1];
      const to = head.match(/to = "([^"]+)"/)?.[1];
      const status = Number(head.match(/status = (\d+)/)?.[1] ?? "301");
      if (!from || !to) throw new Error(`redirect block missing from/to:\n${head}`);
      return { from, to, status };
    });
}

describe("agenthiveinc.com 404 gaps", () => {
  const toml = tomlRedirects(readFileSync(join(corpRoot, "netlify.toml"), "utf8"));
  const published = publishRedirectsFile();

  it("lists each dead path before the splat, in both redirect sources", () => {
    const splatAt = published.indexOf("\n/* ");
    expect(splatAt).toBeGreaterThan(0);
    for (const rule of GAP_RULES) {
      const line = `${rule.from} ${rule.to} ${rule.status}`;
      const at = published.indexOf(line);
      expect(at, line).toBeGreaterThanOrEqual(0);
      expect(at, `${line} must precede the splat`).toBeLessThan(splatAt);
      expect(toml).toContainEqual(rule);
      expect(PUBLISH_REDIRECTS).toContainEqual(expect.objectContaining(rule));
    }
  });

  it("does not let a /go wildcard steal the click-tracker function", () => {
    const goRules = PUBLISH_REDIRECTS.filter((rule) => rule.from === "/go" || rule.from.startsWith("/go/"));
    expect(goRules.map((rule) => rule.from).sort()).toEqual(["/go", "/go/"]);
    expect(published).not.toMatch(/\/go\/\*/);
    expect(published).not.toMatch(/\/go\/:name/);
  });

  it("keeps /hive pointed at /about", () => {
    for (const from of ["/hive", "/hive/", "/hive.html"]) {
      expect(PUBLISH_REDIRECTS.find((rule) => rule.from === from)).toMatchObject({ to: "/about", status: 301 });
      expect(toml.find((rule) => rule.from === from)).toMatchObject({ to: "/about", status: 301 });
    }
  });

  it("ships a real favicon.ico and leaves the svg and og.jpg in place", () => {
    const ico = readFileSync(join(corpRoot, "public/favicon.ico"));
    expect(ico.subarray(0, 4)).toEqual(Buffer.from([0x00, 0x00, 0x01, 0x00]));
    const count = ico.readUInt16LE(4);
    expect(count).toBeGreaterThanOrEqual(2);
    const sizes = Array.from({ length: count }, (_, i) => ico[6 + i * 16]);
    expect(sizes).toEqual(expect.arrayContaining([16, 32]));
    expect(readFileSync(join(corpRoot, "public/favicon.svg"), "utf8")).toContain("<svg");
    expect(readFileSync(join(corpRoot, "public/og.jpg")).subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  });
});
