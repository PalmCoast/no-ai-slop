import { compress, expand, permille, type Method } from "./compress.ts";
import { bytesEqual } from "./dumps.ts";
import { BraidError } from "./error.ts";

export type Val =
  | { t: "num"; v: number }
  | { t: "bool"; v: boolean }
  | { t: "str"; v: string }
  | { t: "bytes"; v: Uint8Array }
  | { t: "list"; v: Val[] }
  | { t: "pack"; method: Method; raw: Uint8Array; packed: Uint8Array }
  | { t: "nil" };

export const NIL: Val = { t: "nil" };

export function num(v: number): Val {
  return { t: "num", v };
}
export function bool(v: boolean): Val {
  return { t: "bool", v };
}
export function str(v: string): Val {
  return { t: "str", v };
}

export function truth(v: Val): boolean {
  switch (v.t) {
    case "bool":
      return v.v;
    case "num":
      return v.v !== 0;
    case "str":
    case "bytes":
    case "list":
      return v.v.length !== 0;
    case "pack":
      return true;
    case "nil":
      return false;
  }
}

export function format(v: Val): string {
  switch (v.t) {
    case "num":
      return String(v.v);
    case "bool":
      return v.v ? "true" : "false";
    case "str":
      return v.v;
    case "nil":
      return "nil";
    case "bytes": {
      let out = "";
      for (let i = 0; i < v.v.length; i++) {
        if (i) out += " ";
        out += (v.v[i] ?? 0).toString(16).toUpperCase().padStart(2, "0");
      }
      return out;
    }
    case "list":
      return `[${v.v.map(format).join(", ")}]`;
    case "pack": {
      const saved = v.raw.length - v.packed.length;
      return `${v.method} raw=${v.raw.length} size=${v.packed.length} saved=${saved} ratio=${permille(v.raw.length, v.packed.length)}`;
    }
  }
}

function needNum(v: Val, line: number, what: string): number {
  if (v.t !== "num" || !Number.isInteger(v.v)) throw new BraidError(`${what} needs an integer`, line);
  return v.v;
}

export function toBytes(v: Val, line: number): Uint8Array {
  if (v.t === "bytes") return v.v;
  if (v.t === "list") {
    const out = new Uint8Array(v.v.length);
    for (let i = 0; i < v.v.length; i++) {
      const item = v.v[i];
      if (!item || item.t !== "num" || !Number.isInteger(item.v) || item.v < 0 || item.v > 255) {
        throw new BraidError("expected a list of bytes 0..255", line);
      }
      out[i] = item.v;
    }
    return out;
  }
  throw new BraidError("expected bytes", line);
}

export function add(a: Val, b: Val, line: number): Val {
  if (a.t === "num" && b.t === "num") return num(a.v + b.v);
  if (a.t === "bytes" && b.t === "bytes") {
    const out = new Uint8Array(a.v.length + b.v.length);
    out.set(a.v, 0);
    out.set(b.v, a.v.length);
    return { t: "bytes", v: out };
  }
  if (a.t === "str" && b.t === "str") return str(a.v + b.v);
  if (a.t === "list" && b.t === "list") return { t: "list", v: a.v.concat(b.v) };
  throw new BraidError(`cannot add ${a.t} and ${b.t}`, line);
}

export function sub(a: Val, b: Val, line: number): Val {
  return num(needNum(a, line, "subtract") - needNum(b, line, "subtract"));
}
export function mul(a: Val, b: Val, line: number): Val {
  return num(needNum(a, line, "multiply") * needNum(b, line, "multiply"));
}
export function div(a: Val, b: Val, line: number): Val {
  const r = needNum(b, line, "divide");
  if (r === 0) throw new BraidError("division by zero", line);
  return num(Math.trunc(needNum(a, line, "divide") / r));
}
export function mod(a: Val, b: Val, line: number): Val {
  const r = needNum(b, line, "modulo");
  if (r === 0) throw new BraidError("modulo by zero", line);
  return num(needNum(a, line, "modulo") % r);
}

function bit(a: Val, b: Val, line: number, op: (x: number, y: number) => number): Val {
  const x = needNum(a, line, "bitwise");
  const y = needNum(b, line, "bitwise");
  return num(op(x, y) | 0);
}

export function band(a: Val, b: Val, line: number): Val {
  return bit(a, b, line, (x, y) => x & y);
}
export function bor(a: Val, b: Val, line: number): Val {
  return bit(a, b, line, (x, y) => x | y);
}
export function bxor(a: Val, b: Val, line: number): Val {
  return bit(a, b, line, (x, y) => x ^ y);
}
export function shl(a: Val, b: Val, line: number): Val {
  return bit(a, b, line, (x, y) => x << (y & 31));
}
export function shr(a: Val, b: Val, line: number): Val {
  return bit(a, b, line, (x, y) => x >> (y & 31));
}

export function neg(a: Val, line: number): Val {
  return num(-needNum(a, line, "negate"));
}
export function bitnot(a: Val, line: number): Val {
  return num(~needNum(a, line, "bitwise not") | 0);
}
export function lnot(a: Val): Val {
  return bool(!truth(a));
}

function cmpNum(op: string, x: number, y: number): boolean {
  switch (op) {
    case "==":
      return x === y;
    case "!=":
      return x !== y;
    case "<":
      return x < y;
    case ">":
      return x > y;
    case "<=":
      return x <= y;
    case ">=":
      return x >= y;
    default:
      return false;
  }
}

export function cmp(op: string, a: Val, b: Val, line: number): Val {
  if (a.t === "num" && b.t === "num") return bool(cmpNum(op, a.v, b.v));
  if ((op === "==" || op === "!=") && a.t === b.t && (a.t === "bool" || a.t === "str" || a.t === "nil")) {
    const same = a.t === "nil" || (a.t === "bool" && b.t === "bool" && a.v === b.v) || (a.t === "str" && b.t === "str" && a.v === b.v);
    return bool(op === "==" ? same : !same);
  }
  if ((op === "==" || op === "!=") && a.t === "bytes" && b.t === "bytes") {
    const same = bytesEqual(a.v, b.v);
    return bool(op === "==" ? same : !same);
  }
  if (op === "==" || op === "!=") {
    const same = false;
    return bool(op === "==" ? same : !same);
  }
  throw new BraidError(`cannot compare ${a.t} and ${b.t} with ${op}`, line);
}

type Piece = { kind: "num"; n: number } | { kind: "bytes"; b: Uint8Array } | { kind: "bool"; b: boolean } | { kind: "str"; s: string };

function piece(v: Val, line: number): Piece {
  if (v.t === "num") return { kind: "num", n: v.v };
  if (v.t === "bytes" && v.v.length === 1) return { kind: "num", n: v.v[0] ?? 0 };
  if (v.t === "bytes") return { kind: "bytes", b: v.v };
  if (v.t === "bool") return { kind: "bool", b: v.v };
  if (v.t === "str") return { kind: "str", s: v.v };
  throw new BraidError(`cannot agree a ${v.t}`, line);
}

function pieceEq(a: Piece, b: Piece): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "num" && b.kind === "num") return a.n === b.n;
  if (a.kind === "bytes" && b.kind === "bytes") return bytesEqual(a.b, b.b);
  if (a.kind === "bool" && b.kind === "bool") return a.b === b.b;
  if (a.kind === "str" && b.kind === "str") return a.s === b.s;
  return false;
}

/** One machine value written more than one way. A single byte matches its integer. */
export function agree(vals: Val[], line: number): Val {
  if (vals.length < 2) throw new BraidError("agree needs two or more values", line);
  const first = vals[0];
  if (!first) throw new BraidError("agree needs two or more values", line);
  const base = piece(first, line);
  for (let i = 1; i < vals.length; i++) {
    const other = vals[i];
    if (!other || !pieceEq(base, piece(other, line))) {
      throw new BraidError(`agree mismatch: ${format(first)} vs ${other ? format(other) : "nil"}`, line);
    }
  }
  if (base.kind === "num") return num(base.n);
  if (base.kind === "bytes") return { t: "bytes", v: base.b };
  if (base.kind === "bool") return bool(base.b);
  return str(base.s);
}

export function doCompress(v: Val, line: number): Val {
  const raw = toBytes(v, line);
  const packed = compress(raw);
  return { t: "pack", method: packed.method, raw, packed: packed.packed };
}

export function doExpand(v: Val, line: number): Val {
  if (v.t !== "pack") throw new BraidError("expand needs a pack", line);
  return { t: "bytes", v: expand(v.method, v.packed, v.raw.length) };
}

export function len(v: Val, line: number): Val {
  if (v.t === "bytes" || v.t === "list" || v.t === "str") return num(v.v.length);
  throw new BraidError(`len() does not apply to ${v.t}`, line);
}

export function index(a: Val, i: Val, line: number): Val {
  const at = needNum(i, line, "index");
  if (a.t === "bytes") {
    if (at < 0 || at >= a.v.length) throw new BraidError("index out of range", line);
    return num(a.v[at] ?? 0);
  }
  if (a.t === "list") {
    if (at < 0 || at >= a.v.length) throw new BraidError("index out of range", line);
    return a.v[at] ?? NIL;
  }
  if (a.t === "str") {
    if (at < 0 || at >= a.v.length) throw new BraidError("index out of range", line);
    return str(a.v[at] ?? "");
  }
  throw new BraidError(`cannot index ${a.t}`, line);
}

export function field(v: Val, name: string, line: number): Val {
  if (v.t !== "pack") throw new BraidError("fields are on packs", line);
  switch (name) {
    case "method":
      return str(v.method);
    case "raw":
      return num(v.raw.length);
    case "size":
      return num(v.packed.length);
    case "saved":
      return num(v.raw.length - v.packed.length);
    case "ratio":
      return num(permille(v.raw.length, v.packed.length));
    default:
      throw new BraidError(`unknown pack field ${name}`, line);
  }
}

export const BIN: Record<string, (a: Val, b: Val, line: number) => Val> = {
  "+": add,
  "-": sub,
  "*": mul,
  "/": div,
  "%": mod,
  "&": band,
  "|": bor,
  "^": bxor,
  "<<": shl,
  ">>": shr,
  "==": (a, b, line) => cmp("==", a, b, line),
  "!=": (a, b, line) => cmp("!=", a, b, line),
  "<": (a, b, line) => cmp("<", a, b, line),
  ">": (a, b, line) => cmp(">", a, b, line),
  "<=": (a, b, line) => cmp("<=", a, b, line),
  ">=": (a, b, line) => cmp(">=", a, b, line),
};

export const BIN_NAME: Record<string, string> = {
  "+": "add",
  "-": "sub",
  "*": "mul",
  "/": "div",
  "%": "mod",
  "&": "band",
  "|": "bor",
  "^": "bxor",
  "<<": "shl",
  ">>": "shr",
  "==": "eq",
  "!=": "ne",
  "<": "lt",
  ">": "gt",
  "<=": "le",
  ">=": "ge",
};
