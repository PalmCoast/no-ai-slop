import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compress, expand } from "../src/compress.ts";
import { compile } from "../src/compile.ts";
import { parseBinDump, parseHexDump, parseOctDump } from "../src/dumps.ts";
import { BraidError } from "../src/error.ts";
import { decodeImage } from "../src/image.ts";
import { parse } from "../src/parse.ts";
import { run } from "../src/run.ts";
import { sha256Hex } from "../src/sha256.ts";
import { openSeal } from "../src/stamp.ts";
import { weave } from "../src/weave.ts";

const root = dirname(fileURLToPath(import.meta.url));
const example = (name: string) => readFileSync(join(root, "..", "examples", name), "utf8");

function both(source: string): { js: ReturnType<typeof run>; vm: ReturnType<typeof run> } {
  const js = run(source, "js");
  const vm = run(source, "vm");
  expect(vm.output).toEqual(js.output);
  expect(vm.agrees).toBe(js.agrees);
  expect(vm.seals.map((s) => s.sha256)).toEqual(js.seals.map((s) => s.sha256));
  return { js, vm };
}

describe("sha256", () => {
  it("matches node crypto", () => {
    const samples = [new Uint8Array(), new TextEncoder().encode("abc"), Uint8Array.from([0, 255, 16, 22])];
    for (const sample of samples) {
      expect(sha256Hex(sample)).toBe(createHash("sha256").update(sample).digest("hex"));
    }
  });
});

describe("compress", () => {
  it("roundtrips random bytes and shrinks a repeating buffer", () => {
    const random = Uint8Array.from({ length: 200 }, (_, i) => (i * 17 + 3) & 255);
    const packedRandom = compress(random);
    expect(expand(packedRandom.method, packedRandom.packed, random.length)).toEqual(random);
    const repeat = Uint8Array.from({ length: 4096 }, (_, i) => i % 4);
    const packed = compress(repeat);
    expect(packed.method).not.toBe("raw");
    expect(packed.packed.length).toBeLessThan(repeat.length / 10);
    expect(expand(packed.method, packed.packed, repeat.length)).toEqual(repeat);
  });
});

describe("dumps", () => {
  it("reads xxd, od, and binary as the same bytes", () => {
    const hex = parseHexDump(example("frame.hex"));
    const oct = parseOctDump(example("frame.oct"));
    const bin = parseBinDump(example("frame.bin"));
    expect([...hex]).toEqual([0xa5, 0x5a, 0x16, 0x00, 0x01, 0x02, 0x03, 0x04]);
    expect([...oct]).toEqual([...hex]);
    expect([...bin]).toEqual([...hex]);
    const dumped = parseHexDump("00000000  a5 5a 16 00  01 02 03 04  |.Z......|");
    expect([...dumped]).toEqual([...hex]);
  });
});

describe("language", () => {
  it("agrees across radices and runs the sensor frame on both backends", () => {
    const { js } = both(example("sensor.braid"));
    expect(js.output[0]).toBe("149");
    expect(js.output).toContain("42330");
    expect(js.output).toContain("22");
    expect(js.output).toContain("420");
    expect(js.agrees).toBe(4);
    expect(js.seals).toHaveLength(1);
    const opened = openSeal(js.seals[0]!.blob);
    expect(opened.raw.length).toBe(260);
    expect(opened.note).toBe("bench logger frame");
    expect(opened.packedLen).toBeLessThan(opened.rawLen);
  });

  it("rejects an agree mismatch", () => {
    expect(() => run("print agree[0x10, 0b1]\n", "js")).toThrow(BraidError);
    expect(() => run("print agree[0x10, 0b1]\n", "vm")).toThrow(/agree mismatch/);
  });

  it("does not evaluate the unused side of ||", () => {
    const source = `fn boom() {\n  print "boom"\n  return 1\n}\nprint 1 || boom()\nprint 0 || 4\n`;
    const { js } = both(source);
    expect(js.output).toEqual(["1", "4"]);
  });

  it("reads a global from a function and sums with for", () => {
    const source = `let g = 2\nfn addg(x) {\n  return x + g\n}\nprint addg(3)\nlet bytes = hex[ 01 02 03 ]\nlet s = 0\nfor b in bytes {\n  s = s + b\n}\nprint s\n`;
    const { js } = both(source);
    expect(js.output).toEqual(["5", "6"]);
  });

  it("weaves three dumps into one program that seals the same bytes", () => {
    const source = weave({
      hex: example("frame.hex"),
      oct: example("frame.oct"),
      bin: example("frame.bin"),
    });
    expect(source).toContain("agree[");
    expect(source).toContain("hex[");
    expect(source).toContain("oct[");
    expect(source).toContain("bin[");
    const { js } = both(source);
    expect(js.agrees).toBe(1);
    expect(js.seals[0]?.rawLen).toBe(8);
    expect(() =>
      weave({
        hex: "AA",
        oct: "000",
      }),
    ).toThrow(/differ at byte/);
  });

  it("stores a hex-heavy program in fewer image bytes than source characters", () => {
    const rows: string[] = [];
    for (let i = 0; i < 8; i++) {
      rows.push(Array.from({ length: 16 }, (_, j) => ((i * 16 + j) & 255).toString(16).padStart(2, "0")).join(" "));
    }
    const source = `let frame = hex[\n${rows.join("\n")}\n]\nprint len(frame)\n`;
    const { js } = both(source);
    expect(js.output).toEqual(["128"]);
    expect(js.imageBytes).toBeLessThan(source.length);
    const image = compile(parse(source));
    const decoded = decodeImage(image.bytes);
    expect(decoded.main.code.map((op) => op.op)).toEqual(image.main.code.map((op) => op.op));
    expect(decoded.main.consts.some((c) => c.t === "bytes" && c.v.length === 128)).toBe(true);
  });

  it("tampering with a stamp fails the hash", () => {
    const { js } = both(`let frame = hex[ 01 02 03 04 ]\nseal frame, "x"\n`);
    const blob = js.seals[0]!.blob.slice();
    blob[blob.length - 1] = (blob[blob.length - 1] ?? 0) ^ 0xff;
    expect(() => openSeal(blob)).toThrow(/hash/);
  });
});
