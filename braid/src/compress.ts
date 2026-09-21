export type Method = "raw" | "rle" | "lzss";

const WIN = 4096;
const MIN = 3;
const MAX = 258;

function packRle(raw: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < raw.length) {
    let j = i + 1;
    const value = raw[i] ?? 0;
    while (j < raw.length && raw[j] === value && j - i < 255) j++;
    out.push(j - i, value);
    i = j;
  }
  return Uint8Array.from(out);
}

function unpackRle(packed: Uint8Array): Uint8Array {
  if (packed.length % 2 !== 0) throw new Error("truncated rle");
  const out: number[] = [];
  for (let i = 0; i < packed.length; i += 2) {
    const count = packed[i] ?? 0;
    const value = packed[i + 1] ?? 0;
    if (count === 0) throw new Error("empty rle run");
    for (let k = 0; k < count; k++) out.push(value);
  }
  return Uint8Array.from(out);
}

function packLzss(raw: Uint8Array): Uint8Array {
  const out: number[] = [];
  const head = new Map<number, number>();
  const prev = new Int32Array(raw.length);
  prev.fill(-1);
  const keyAt = (i: number): number => {
    if (i + 2 >= raw.length) return -1;
    return ((raw[i] ?? 0) << 16) | ((raw[i + 1] ?? 0) << 8) | (raw[i + 2] ?? 0);
  };
  let i = 0;
  while (i < raw.length) {
    const key = keyAt(i);
    let bestLen = 0;
    let bestOff = 0;
    if (key !== -1) {
      let j = head.get(key) ?? -1;
      let guard = 0;
      while (j >= 0 && i - j <= WIN && guard < 64) {
        let len = 0;
        const max = Math.min(MAX, raw.length - i);
        while (len < max && raw[j + len] === raw[i + len]) len++;
        if (len > bestLen) {
          bestLen = len;
          bestOff = i - j;
        }
        j = prev[j] ?? -1;
        guard++;
      }
    }
    if (key !== -1) {
      prev[i] = head.get(key) ?? -1;
      head.set(key, i);
    }
    if (bestLen >= MIN) {
      out.push(1, bestOff & 0xff, (bestOff >> 8) & 0xff, bestLen - MIN);
      i += bestLen;
    } else {
      out.push(0, raw[i] ?? 0);
      i++;
    }
  }
  return Uint8Array.from(out);
}

function unpackLzss(packed: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < packed.length) {
    const tag = packed[i++];
    if (tag === 0) {
      const lit = packed[i++];
      if (lit === undefined) throw new Error("truncated lzss literal");
      out.push(lit);
    } else if (tag === 1) {
      const lo = packed[i++];
      const hi = packed[i++];
      const ln = packed[i++];
      if (lo === undefined || hi === undefined || ln === undefined) throw new Error("truncated lzss match");
      const off = lo | (hi << 8);
      const len = ln + MIN;
      if (off < 1 || off > out.length) throw new Error("bad lzss offset");
      for (let k = 0; k < len; k++) {
        const b = out[out.length - off];
        if (b === undefined) throw new Error("bad lzss copy");
        out.push(b);
      }
    } else {
      throw new Error("bad lzss tag");
    }
  }
  return Uint8Array.from(out);
}

const RANK: Record<Method, number> = { raw: 0, rle: 1, lzss: 2 };

/** Pick the smallest of raw, run-length, and LZSS. Ties keep the simpler method. */
export function compress(raw: Uint8Array): { method: Method; packed: Uint8Array } {
  const cands: { method: Method; packed: Uint8Array }[] = [
    { method: "raw", packed: raw.slice() },
    { method: "rle", packed: packRle(raw) },
    { method: "lzss", packed: packLzss(raw) },
  ];
  cands.sort((a, b) => a.packed.length - b.packed.length || RANK[a.method] - RANK[b.method]);
  const best = cands[0];
  if (!best) return { method: "raw", packed: raw.slice() };
  return best;
}

export function expand(method: Method, packed: Uint8Array, rawLen: number): Uint8Array {
  const out = method === "raw" ? packed.slice() : method === "rle" ? unpackRle(packed) : unpackLzss(packed);
  if (out.length !== rawLen) throw new Error(`expand length ${out.length} != ${rawLen}`);
  return out;
}

/** Packed size over raw size, in thousandths. 1000 means no saving. Empty input is 1000. */
export function permille(rawLen: number, packedLen: number): number {
  if (rawLen === 0) return 1000;
  return Math.round((packedLen * 1000) / rawLen);
}
