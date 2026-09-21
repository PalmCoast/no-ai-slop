import { BraidError } from "./error.ts";

function cutHexAscii(rest: string): string {
  const bar = rest.indexOf("|");
  const spaced = rest.search(/\s{2,}(?=[^0-9a-fA-F\s])/);
  let end = rest.length;
  if (bar !== -1) end = Math.min(end, bar);
  if (spaced !== -1) end = Math.min(end, spaced);
  return rest.slice(0, end);
}

/** Bytes from a hex row, an xxd line, or a `hexdump -C` line. */
export function parseHexDump(text: string): Uint8Array {
  const out: number[] = [];
  const lines = text.split(/\r?\n/);
  for (let li = 0; li < lines.length; li++) {
    const rawLine = lines[li] ?? "";
    const hash = rawLine.indexOf("#");
    const line = (hash === -1 ? rawLine : rawLine.slice(0, hash)).trim();
    if (!line) continue;
    let rest = line;
    const addrColon = /^[0-9a-fA-F]{6,8}:\s*/.exec(rest);
    if (addrColon) rest = rest.slice(addrColon[0].length);
    else {
      const addrSpace = /^[0-9a-fA-F]{8}\s{2,}/.exec(rest);
      if (addrSpace) rest = rest.slice(addrSpace[0].length);
    }
    rest = cutHexAscii(rest).trim();
    if (!rest) continue;
    for (const tok of rest.split(/\s+/)) {
      const raw = tok.replaceAll("_", "");
      if (!/^[0-9a-fA-F]+$/.test(raw) || raw.length % 2 !== 0) {
        throw new BraidError(`bad hex byte "${tok}"`, li + 1);
      }
      for (let k = 0; k < raw.length; k += 2) out.push(Number.parseInt(raw.slice(k, k + 2), 16));
    }
  }
  return Uint8Array.from(out);
}

/** Bytes from `od -b` output or a list of octal bytes (max 3 digits, 0–255). */
export function parseOctDump(text: string): Uint8Array {
  const out: number[] = [];
  const lines = text.split(/\r?\n/);
  for (let li = 0; li < lines.length; li++) {
    const rawLine = lines[li] ?? "";
    const hash = rawLine.indexOf("#");
    const line = (hash === -1 ? rawLine : rawLine.slice(0, hash)).trim();
    if (!line) continue;
    const toks = line.split(/\s+/);
    let start = 0;
    const head = toks[0] ?? "";
    if (/^[0-7]{4,}$/.test(head)) start = 1;
    for (let t = start; t < toks.length; t++) {
      const tok = toks[t] ?? "";
      const raw = tok.replaceAll("_", "");
      if (!/^[0-7]{1,3}$/.test(raw)) throw new BraidError(`bad octal byte "${tok}"`, li + 1);
      const v = Number.parseInt(raw, 8);
      if (v > 255) throw new BraidError(`octal byte out of range "${tok}"`, li + 1);
      out.push(v);
    }
  }
  return Uint8Array.from(out);
}

/** Bytes from groups of 8 bits. Longer groups must be a multiple of 8. */
export function parseBinDump(text: string): Uint8Array {
  const out: number[] = [];
  const lines = text.split(/\r?\n/);
  for (let li = 0; li < lines.length; li++) {
    const rawLine = lines[li] ?? "";
    const hash = rawLine.indexOf("#");
    const line = (hash === -1 ? rawLine : rawLine.slice(0, hash)).trim();
    if (!line) continue;
    for (const tok of line.split(/\s+/)) {
      const raw = tok.replaceAll("_", "");
      if (!/^[01]+$/.test(raw) || raw.length % 8 !== 0) {
        throw new BraidError(`bad binary byte "${tok}"`, li + 1);
      }
      for (let k = 0; k < raw.length; k += 8) out.push(Number.parseInt(raw.slice(k, k + 8), 2));
    }
  }
  return Uint8Array.from(out);
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function firstDiff(a: Uint8Array, b: Uint8Array): number {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return -1;
}

function hexByte(n: number): string {
  return n.toString(16).toUpperCase().padStart(2, "0");
}

export function emitHexLiteral(bytes: Uint8Array): string {
  const rows: string[] = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const row: string[] = [];
    for (let j = i; j < Math.min(i + 16, bytes.length); j++) row.push(hexByte(bytes[j] ?? 0));
    rows.push(`  ${row.join(" ")}`);
  }
  if (rows.length === 0) return "hex[ ]";
  return `hex[\n${rows.join("\n")}\n]`;
}

export function emitOctLiteral(bytes: Uint8Array): string {
  const rows: string[] = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const row: string[] = [];
    for (let j = i; j < Math.min(i + 16, bytes.length); j++) {
      row.push((bytes[j] ?? 0).toString(8).padStart(3, "0"));
    }
    rows.push(`  ${row.join(" ")}`);
  }
  if (rows.length === 0) return "oct[ ]";
  return `oct[\n${rows.join("\n")}\n]`;
}

export function emitBinLiteral(bytes: Uint8Array): string {
  const rows: string[] = [];
  for (let i = 0; i < bytes.length; i += 8) {
    const row: string[] = [];
    for (let j = i; j < Math.min(i + 8, bytes.length); j++) {
      row.push((bytes[j] ?? 0).toString(2).padStart(8, "0"));
    }
    rows.push(`  ${row.join(" ")}`);
  }
  if (rows.length === 0) return "bin[ ]";
  return `bin[\n${rows.join("\n")}\n]`;
}
