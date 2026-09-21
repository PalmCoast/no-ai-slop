import { compress, expand, permille, type Method } from "./compress.ts";
import { BraidError } from "./error.ts";
import { toBytes, type Val } from "./ops.ts";
import { sha256, sha256Hex } from "./sha256.ts";

export type Stamp = {
  version: 1;
  note: string;
  method: Method;
  rawLen: number;
  packedLen: number;
  saved: number;
  ratioPermille: number;
  sha256: string;
  blob: Uint8Array;
};

const METHODS: Method[] = ["raw", "rle", "lzss"];

function u16(n: number): [number, number] {
  return [n & 255, (n >> 8) & 255];
}
function u32(n: number): number[] {
  return [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255];
}

export function seal(raw: Uint8Array, note: string, method?: Method, packedBytes?: Uint8Array): Stamp {
  const chosen = method && packedBytes ? { method, packed: packedBytes } : compress(raw);
  const hash = sha256(raw);
  const noteBytes = new TextEncoder().encode(note);
  const body = [
    66, 82, 68, 49, 1, METHODS.indexOf(chosen.method),
    ...u32(raw.length),
    ...u32(chosen.packed.length),
    ...u16(noteBytes.length),
    ...noteBytes,
    ...chosen.packed,
    ...hash,
  ];
  return {
    version: 1,
    note,
    method: chosen.method,
    rawLen: raw.length,
    packedLen: chosen.packed.length,
    saved: raw.length - chosen.packed.length,
    ratioPermille: permille(raw.length, chosen.packed.length),
    sha256: sha256Hex(raw),
    blob: Uint8Array.from(body),
  };
}

export function sealValue(v: Val, note: string, line: number): Stamp {
  if (v.t === "pack") return seal(v.raw, note, v.method, v.packed);
  if (v.t === "bytes" || v.t === "list") return seal(toBytes(v, line), note);
  throw new BraidError("seal needs bytes or a pack", line);
}

export function openSeal(blob: Uint8Array): Stamp & { raw: Uint8Array } {
  if (blob.length < 16 || blob[0] !== 66 || blob[1] !== 82 || blob[2] !== 68 || blob[3] !== 49) {
    throw new Error("not a braid stamp");
  }
  if (blob[4] !== 1) throw new Error("unsupported stamp version");
  const method = METHODS[blob[5] ?? 255];
  if (!method) throw new Error("bad stamp method");
  const view = new DataView(blob.buffer, blob.byteOffset, blob.byteLength);
  const rawLen = view.getUint32(6, true);
  const packedLen = view.getUint32(10, true);
  const noteLen = view.getUint16(14, true);
  const noteStart = 16;
  const packedStart = noteStart + noteLen;
  const hashStart = packedStart + packedLen;
  if (hashStart + 32 !== blob.length) throw new Error("truncated stamp");
  const note = new TextDecoder().decode(blob.slice(noteStart, packedStart));
  const packed = blob.slice(packedStart, hashStart);
  const raw = expand(method, packed, rawLen);
  const hash = sha256Hex(raw);
  const stored = [...blob.slice(hashStart)].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (hash !== stored) throw new Error("stamp hash does not match the bytes");
  return {
    version: 1,
    note,
    method,
    rawLen,
    packedLen,
    saved: rawLen - packedLen,
    ratioPermille: permille(rawLen, packedLen),
    sha256: hash,
    blob,
    raw,
  };
}

export function certificate(stamp: Stamp): string {
  return [
    "BRAID STAMP",
    `note: ${stamp.note || "(none)"}`,
    `method: ${stamp.method}`,
    `raw: ${stamp.rawLen} bytes`,
    `packed: ${stamp.packedLen} bytes`,
    `saved: ${stamp.saved} bytes`,
    `ratio: ${stamp.ratioPermille} / 1000`,
    `sha256: ${stamp.sha256}`,
  ].join("\n");
}
