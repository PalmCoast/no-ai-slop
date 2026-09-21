import type { Val } from "./ops.ts";

export type Op =
  | { op: "const"; i: number; line: number }
  | { op: "load"; g: boolean; i: number; line: number }
  | { op: "store"; g: boolean; i: number; line: number }
  | { op: "bin"; kind: string; line: number }
  | { op: "un"; kind: "neg" | "not" | "bitnot" | "compress" | "expand"; line: number }
  | { op: "jf"; to: number; line: number }
  | { op: "jt"; to: number; line: number }
  | { op: "jump"; to: number; line: number }
  | { op: "call"; name: string; argc: number; line: number }
  | { op: "ret"; line: number }
  | { op: "list"; n: number; line: number }
  | { op: "index"; line: number }
  | { op: "field"; name: string; line: number }
  | { op: "agree"; n: number; line: number }
  | { op: "print"; line: number }
  | { op: "assert"; line: number }
  | { op: "seal"; line: number }
  | { op: "pop"; line: number }
  | { op: "dup"; line: number }
  | { op: "halt"; line: number };

export type FnImg = {
  name: string;
  arity: number;
  nslots: number;
  code: Op[];
  consts: Val[];
};

export type Image = {
  main: FnImg;
  fns: FnImg[];
  bytes: Uint8Array;
  globals: number;
};

const BIN_ID = ["+", "-", "*", "/", "%", "&", "|", "^", "<<", ">>", "==", "!=", "<", ">", "<=", ">="];
const UN_ID = ["neg", "not", "bitnot", "compress", "expand"] as const;

class W {
  private b: number[] = [];
  u8(n: number): void {
    this.b.push(n & 255);
  }
  u16(n: number): void {
    this.u8(n);
    this.u8(n >> 8);
  }
  u32(n: number): void {
    this.u16(n & 0xffff);
    this.u16((n >>> 16) & 0xffff);
  }
  f64(n: number): void {
    const buf = new Uint8Array(8);
    new DataView(buf.buffer).setFloat64(0, n, true);
    for (const byte of buf) this.b.push(byte);
  }
  raw(data: Uint8Array): void {
    for (const byte of data) this.b.push(byte);
  }
  name(s: string): void {
    const bytes = new TextEncoder().encode(s);
    if (bytes.length > 255) throw new Error("name too long");
    this.u8(bytes.length);
    this.raw(bytes);
  }
  toBytes(): Uint8Array {
    return Uint8Array.from(this.b);
  }
}

class R {
  private i = 0;
  constructor(private b: Uint8Array) {}
  u8(): number {
    const n = this.b[this.i++];
    if (n === undefined) throw new Error("truncated image");
    return n;
  }
  u16(): number {
    return this.u8() | (this.u8() << 8);
  }
  u32(): number {
    return this.u16() + this.u16() * 0x10000;
  }
  f64(): number {
    const buf = this.b.slice(this.i, this.i + 8);
    if (buf.length < 8) throw new Error("truncated image");
    this.i += 8;
    return new DataView(buf.buffer, buf.byteOffset, 8).getFloat64(0, true);
  }
  raw(n: number): Uint8Array {
    const out = this.b.slice(this.i, this.i + n);
    if (out.length < n) throw new Error("truncated image");
    this.i += n;
    return out;
  }
  name(): string {
    return new TextDecoder().decode(this.raw(this.u8()));
  }
  get done(): boolean {
    return this.i >= this.b.length;
  }
}

function writeConst(w: W, c: Val): void {
  if (c.t === "nil") w.u8(0);
  else if (c.t === "bool") {
    w.u8(1);
    w.u8(c.v ? 1 : 0);
  } else if (c.t === "num") {
    w.u8(2);
    w.f64(c.v);
  } else if (c.t === "str") {
    w.u8(3);
    const bytes = new TextEncoder().encode(c.v);
    w.u32(bytes.length);
    w.raw(bytes);
  } else if (c.t === "bytes") {
    w.u8(4);
    w.u32(c.v.length);
    w.raw(c.v);
  } else {
    throw new Error("pack is not a constant");
  }
}

function readConst(r: R): Val {
  const tag = r.u8();
  if (tag === 0) return { t: "nil" };
  if (tag === 1) return { t: "bool", v: r.u8() === 1 };
  if (tag === 2) return { t: "num", v: r.f64() };
  if (tag === 3) return { t: "str", v: new TextDecoder().decode(r.raw(r.u32())) };
  if (tag === 4) return { t: "bytes", v: r.raw(r.u32()) };
  throw new Error("bad const");
}

function writeOp(w: W, op: Op): void {
  const codes: Record<Op["op"], number> = {
    const: 1,
    load: 2,
    store: 3,
    bin: 4,
    un: 5,
    jf: 6,
    jt: 7,
    jump: 8,
    call: 9,
    ret: 10,
    list: 11,
    index: 12,
    field: 13,
    agree: 14,
    print: 15,
    assert: 16,
    seal: 17,
    pop: 18,
    dup: 19,
    halt: 20,
  };
  w.u8(codes[op.op]);
  w.u16(op.line);
  switch (op.op) {
    case "const":
    case "list":
    case "agree":
      w.u16(op.op === "const" ? op.i : op.n);
      break;
    case "load":
    case "store":
      w.u8(op.g ? 1 : 0);
      w.u16(op.i);
      break;
    case "bin":
      w.u8(BIN_ID.indexOf(op.kind));
      break;
    case "un":
      w.u8(UN_ID.indexOf(op.kind));
      break;
    case "jf":
    case "jt":
    case "jump":
      w.u32(op.to);
      break;
    case "call":
      w.name(op.name);
      w.u8(op.argc);
      break;
    case "field":
      w.name(op.name);
      break;
    default:
      break;
  }
}

function readOp(r: R): Op {
  const code = r.u8();
  const line = r.u16();
  switch (code) {
    case 1:
      return { op: "const", i: r.u16(), line };
    case 2:
      return { op: "load", g: r.u8() === 1, i: r.u16(), line };
    case 3:
      return { op: "store", g: r.u8() === 1, i: r.u16(), line };
    case 4:
      return { op: "bin", kind: BIN_ID[r.u8()] ?? "+", line };
    case 5: {
      const kind = UN_ID[r.u8()] ?? "neg";
      return { op: "un", kind, line };
    }
    case 6:
      return { op: "jf", to: r.u32(), line };
    case 7:
      return { op: "jt", to: r.u32(), line };
    case 8:
      return { op: "jump", to: r.u32(), line };
    case 9:
      return { op: "call", name: r.name(), argc: r.u8(), line };
    case 10:
      return { op: "ret", line };
    case 11:
      return { op: "list", n: r.u16(), line };
    case 12:
      return { op: "index", line };
    case 13:
      return { op: "field", name: r.name(), line };
    case 14:
      return { op: "agree", n: r.u16(), line };
    case 15:
      return { op: "print", line };
    case 16:
      return { op: "assert", line };
    case 17:
      return { op: "seal", line };
    case 18:
      return { op: "pop", line };
    case 19:
      return { op: "dup", line };
    case 20:
      return { op: "halt", line };
    default:
      throw new Error("bad opcode");
  }
}

function writeFn(w: W, fn: FnImg): void {
  w.name(fn.name);
  w.u16(fn.arity);
  w.u16(fn.nslots);
  w.u16(fn.consts.length);
  for (const c of fn.consts) writeConst(w, c);
  w.u32(fn.code.length);
  for (const op of fn.code) writeOp(w, op);
}

function readFn(r: R): FnImg {
  const name = r.name();
  const arity = r.u16();
  const nslots = r.u16();
  const nconst = r.u16();
  const consts: Val[] = [];
  for (let i = 0; i < nconst; i++) consts.push(readConst(r));
  const ncode = r.u32();
  const code: Op[] = [];
  for (let i = 0; i < ncode; i++) code.push(readOp(r));
  return { name, arity, nslots, code, consts };
}

export function encodeImage(main: FnImg, fns: FnImg[]): Uint8Array {
  const w = new W();
  w.u8(66);
  w.u8(82);
  w.u8(68);
  w.u8(48);
  w.u16(1 + fns.length);
  writeFn(w, main);
  for (const fn of fns) writeFn(w, fn);
  return w.toBytes();
}

export function decodeImage(bytes: Uint8Array): { main: FnImg; fns: FnImg[] } {
  const r = new R(bytes);
  if (r.u8() !== 66 || r.u8() !== 82 || r.u8() !== 68 || r.u8() !== 48) throw new Error("not a braid image");
  const count = r.u16();
  const main = readFn(r);
  const fns: FnImg[] = [];
  for (let i = 1; i < count; i++) fns.push(readFn(r));
  if (!r.done) throw new Error("trailing image bytes");
  return { main, fns };
}
