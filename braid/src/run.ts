import { compile } from "./compile.ts";
import { emitJs } from "./emit.ts";
import { BraidError } from "./error.ts";
import {
  add,
  agree,
  band,
  bitnot,
  bool,
  bor,
  bxor,
  cmp,
  div,
  doCompress,
  doExpand,
  field,
  format,
  index,
  len,
  lnot,
  mod,
  mul,
  neg,
  NIL,
  num,
  shl,
  shr,
  str,
  sub,
  truth,
  type Val,
} from "./ops.ts";
import { parse } from "./parse.ts";
import { certificate, sealValue, type Stamp } from "./stamp.ts";
import { execute, type Host } from "./vm.ts";

export type Backend = "js" | "vm";

export type RunResult = {
  output: string[];
  agrees: number;
  seals: Stamp[];
  certificates: string[];
  compileMs: number;
  runMs: number;
  backend: Backend;
  sourceChars: number;
  imageBytes: number;
};

type Runtime = { output: string[]; agrees: number; seals: Stamp[] };

export type Helpers = Host & {
  nil: () => Val;
  num: (n: number) => Val;
  bool: (b: boolean) => Val;
  str: (s: string) => Val;
  bytes: (xs: number[]) => Val;
  list: (xs: Val[]) => Val;
  truth: (v: Val) => boolean;
  add: (a: Val, b: Val, line: number) => Val;
  sub: (a: Val, b: Val, line: number) => Val;
  mul: (a: Val, b: Val, line: number) => Val;
  div: (a: Val, b: Val, line: number) => Val;
  mod: (a: Val, b: Val, line: number) => Val;
  band: (a: Val, b: Val, line: number) => Val;
  bor: (a: Val, b: Val, line: number) => Val;
  bxor: (a: Val, b: Val, line: number) => Val;
  shl: (a: Val, b: Val, line: number) => Val;
  shr: (a: Val, b: Val, line: number) => Val;
  eq: (a: Val, b: Val, line: number) => Val;
  ne: (a: Val, b: Val, line: number) => Val;
  lt: (a: Val, b: Val, line: number) => Val;
  gt: (a: Val, b: Val, line: number) => Val;
  le: (a: Val, b: Val, line: number) => Val;
  ge: (a: Val, b: Val, line: number) => Val;
  neg: (a: Val, line: number) => Val;
  lnot: (a: Val) => Val;
  bitnot: (a: Val, line: number) => Val;
  compress: (a: Val, line: number) => Val;
  expand: (a: Val, line: number) => Val;
  len: (a: Val, line: number) => Val;
  index: (a: Val, i: Val, line: number) => Val;
  field: (a: Val, name: string, line: number) => Val;
};

export function makeHelpers(rt: Runtime): Helpers {
  const cmpOp = (op: string) => (a: Val, b: Val, line: number) => cmp(op, a, b, line);
  return {
    nil: () => NIL,
    num,
    bool,
    str,
    bytes: (xs) => ({ t: "bytes", v: Uint8Array.from(xs) }),
    list: (xs) => ({ t: "list", v: xs }),
    truth,
    add,
    sub,
    mul,
    div,
    mod,
    band,
    bor,
    bxor,
    shl,
    shr,
    eq: cmpOp("=="),
    ne: cmpOp("!="),
    lt: cmpOp("<"),
    gt: cmpOp(">"),
    le: cmpOp("<="),
    ge: cmpOp(">="),
    neg,
    lnot,
    bitnot,
    compress: doCompress,
    expand: doExpand,
    len,
    index,
    field,
    agree: (vals, line) => {
      const v = agree(vals, line);
      rt.agrees += 1;
      return v;
    },
    print: (v) => {
      rt.output.push(format(v));
    },
    assert: (v, line) => {
      if (!truth(v)) throw new BraidError("assert failed", line);
    },
    seal: (v, note, line) => {
      if (note.t !== "str") throw new BraidError("seal note must be a string", line);
      rt.seals.push(sealValue(v, note.v, line));
    },
  };
}

export function run(source: string, backend: Backend = "js"): RunResult {
  const t0 = performance.now();
  const prog = parse(source);
  const image = compile(prog);
  const js = backend === "js" ? emitJs(prog) : "";
  const compileMs = performance.now() - t0;
  const rt: Runtime = { output: [], agrees: 0, seals: [] };
  const helpers = makeHelpers(rt);
  const t1 = performance.now();
  if (backend === "vm") execute(image, helpers);
  else {
    const fn = new Function("h", js) as (h: Helpers) => void;
    fn(helpers);
  }
  const runMs = performance.now() - t1;
  return {
    output: rt.output,
    agrees: rt.agrees,
    seals: rt.seals,
    certificates: rt.seals.map(certificate),
    compileMs,
    runMs,
    backend,
    sourceChars: source.length,
    imageBytes: image.bytes.length,
  };
}
