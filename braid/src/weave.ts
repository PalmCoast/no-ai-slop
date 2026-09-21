import {
  bytesEqual,
  emitBinLiteral,
  emitHexLiteral,
  emitOctLiteral,
  firstDiff,
  parseBinDump,
  parseHexDump,
  parseOctDump,
} from "./dumps.ts";
import { BraidError } from "./error.ts";

export type WeaveInput = {
  hex?: string;
  oct?: string;
  bin?: string;
  code?: string;
};

/** Turn separate hex, octal, and binary dumps into one Braid program. */
export function weave(input: WeaveInput): string {
  const parts: { label: string; literal: string; bytes: Uint8Array }[] = [];
  if (input.hex?.trim()) {
    const bytes = parseHexDump(input.hex);
    parts.push({ label: "hex", literal: emitHexLiteral(bytes), bytes });
  }
  if (input.oct?.trim()) {
    const bytes = parseOctDump(input.oct);
    parts.push({ label: "oct", literal: emitOctLiteral(bytes), bytes });
  }
  if (input.bin?.trim()) {
    const bytes = parseBinDump(input.bin);
    parts.push({ label: "bin", literal: emitBinLiteral(bytes), bytes });
  }
  if (parts.length === 0 && !input.code?.trim()) {
    throw new BraidError("weave needs a dump or some code", 1);
  }
  const first = parts[0];
  if (first) {
    for (const part of parts.slice(1)) {
      if (!bytesEqual(first.bytes, part.bytes)) {
        const at = firstDiff(first.bytes, part.bytes);
        throw new BraidError(
          `${first.label} and ${part.label} differ at byte ${at} (${first.bytes.length} vs ${part.bytes.length} bytes)`,
          1,
        );
      }
    }
  }
  let src = "";
  if (parts.length === 1 && first) {
    src += `let frame = ${first.literal}\n`;
  } else if (parts.length > 1) {
    src += "let frame = agree[\n";
    src += parts.map((part) => `  ${part.literal.split("\n").join("\n  ")}`).join(",\n");
    src += "\n]\n";
  }
  if (input.code?.trim()) {
    if (src) src += "\n";
    src += `${input.code.trim()}\n`;
  } else if (parts.length > 0) {
    src += `
let packed = compress frame
print packed.method
print packed.raw
print packed.size
print packed.saved
assert expand packed == frame
seal frame, "woven frame"
`;
  }
  return src;
}
