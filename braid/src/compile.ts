import { analyze } from "./analyze.ts";
import { BraidError } from "./error.ts";
import { decodeImage, encodeImage, type FnImg, type Image, type Op } from "./image.ts";
import { NIL, type Val } from "./ops.ts";
import type { Expr, Program, Stmt } from "./parse.ts";

export type { Image };

export function compile(prog: Program): Image {
  const analysis = analyze(prog);
  const globalIndex = new Map<string, number>();
  analysis.globals.forEach((name, i) => globalIndex.set(name, i));

  const fns: FnImg[] = [];
  for (const stmt of prog) {
    if (stmt.k !== "fn") continue;
    const info = analysis.functions.get(stmt.name);
    if (!info) throw new BraidError(`missing function ${stmt.name}`, stmt.line);
    const slots = new Map<string, number>();
    info.params.forEach((name, i) => slots.set(name, i));
    for (const name of info.locals) slots.set(name, slots.size);
    const b = new Builder(slots, globalIndex);
    for (const s of stmt.body) b.stmt(s);
    b.constVal(NIL, stmt.line);
    b.push({ op: "ret", line: stmt.line });
    fns.push({
      name: stmt.name,
      arity: info.params.length,
      nslots: slots.size,
      code: b.code,
      consts: b.consts,
    });
  }

  const mainSlots = new Map<string, number>();
  const main = new Builder(mainSlots, globalIndex);
  for (const stmt of prog) {
    if (stmt.k !== "fn") main.stmt(stmt);
  }
  main.push({ op: "halt", line: 1 });
  const mainImg: FnImg = {
    name: "<main>",
    arity: 0,
    nslots: mainSlots.size,
    code: main.code,
    consts: main.consts,
  };
  const bytes = encodeImage(mainImg, fns);
  const decoded = decodeImage(bytes);
  if (decoded.main.code.length !== mainImg.code.length || decoded.fns.length !== fns.length) {
    throw new Error("image roundtrip failed");
  }
  return { main: mainImg, fns, bytes, globals: analysis.globals.length };
}

class Builder {
  code: Op[] = [];
  consts: Val[] = [];
  private temps = 0;

  constructor(
    private slots: Map<string, number>,
    private globals: Map<string, number>,
  ) {}

  push(op: Op): void {
    this.code.push(op);
  }

  constVal(v: Val, line: number): void {
    const i = this.consts.length;
    this.consts.push(v);
    this.push({ op: "const", i, line });
  }

  private temp(): number {
    const name = `$${this.temps++}`;
    const i = this.slots.size;
    this.slots.set(name, i);
    return i;
  }

  private loc(name: string, line: number): { g: boolean; i: number } {
    const local = this.slots.get(name);
    if (local !== undefined) return { g: false, i: local };
    const g = this.globals.get(name);
    if (g !== undefined) return { g: true, i: g };
    throw new BraidError(`unknown name ${name}`, line);
  }

  stmt(stmt: Stmt): void {
    switch (stmt.k) {
      case "let":
      case "assign": {
        this.expr(stmt.expr);
        const at = this.place(stmt.name, stmt.line);
        this.push({ op: "store", ...at, line: stmt.line });
        break;
      }
      case "print":
        this.expr(stmt.expr);
        this.push({ op: "print", line: stmt.line });
        break;
      case "assert":
        this.expr(stmt.expr);
        this.push({ op: "assert", line: stmt.line });
        break;
      case "seal":
        this.expr(stmt.expr);
        this.expr(stmt.note);
        this.push({ op: "seal", line: stmt.line });
        break;
      case "expr":
        this.expr(stmt.expr);
        this.push({ op: "pop", line: stmt.line });
        break;
      case "return":
        if (stmt.expr) this.expr(stmt.expr);
        else this.constVal(NIL, stmt.line);
        this.push({ op: "ret", line: stmt.line });
        break;
      case "if": {
        this.expr(stmt.cond);
        const jf = { op: "jf" as const, to: 0, line: stmt.line };
        this.push(jf);
        for (const s of stmt.then) this.stmt(s);
        const jump = { op: "jump" as const, to: 0, line: stmt.line };
        this.push(jump);
        jf.to = this.code.length;
        for (const s of stmt.else) this.stmt(s);
        jump.to = this.code.length;
        break;
      }
      case "while": {
        const loop = this.code.length;
        this.expr(stmt.cond);
        const jf = { op: "jf" as const, to: 0, line: stmt.line };
        this.push(jf);
        for (const s of stmt.body) this.stmt(s);
        this.push({ op: "jump", to: loop, line: stmt.line });
        jf.to = this.code.length;
        break;
      }
      case "for": {
        const src = this.temp();
        const idx = this.temp();
        const n = this.temp();
        this.expr(stmt.iter);
        this.push({ op: "store", g: false, i: src, line: stmt.line });
        this.constVal({ t: "num", v: 0 }, stmt.line);
        this.push({ op: "store", g: false, i: idx, line: stmt.line });
        this.push({ op: "load", g: false, i: src, line: stmt.line });
        this.push({ op: "call", name: "len", argc: 1, line: stmt.line });
        this.push({ op: "store", g: false, i: n, line: stmt.line });
        const loop = this.code.length;
        this.push({ op: "load", g: false, i: idx, line: stmt.line });
        this.push({ op: "load", g: false, i: n, line: stmt.line });
        this.push({ op: "bin", kind: "<", line: stmt.line });
        const jf = { op: "jf" as const, to: 0, line: stmt.line };
        this.push(jf);
        this.push({ op: "load", g: false, i: src, line: stmt.line });
        this.push({ op: "load", g: false, i: idx, line: stmt.line });
        this.push({ op: "index", line: stmt.line });
        const user = this.place(stmt.name, stmt.line);
        this.push({ op: "store", ...user, line: stmt.line });
        for (const s of stmt.body) this.stmt(s);
        this.push({ op: "load", g: false, i: idx, line: stmt.line });
        this.constVal({ t: "num", v: 1 }, stmt.line);
        this.push({ op: "bin", kind: "+", line: stmt.line });
        this.push({ op: "store", g: false, i: idx, line: stmt.line });
        this.push({ op: "jump", to: loop, line: stmt.line });
        jf.to = this.code.length;
        break;
      }
      case "fn":
        break;
    }
  }

  private place(name: string, line: number): { g: boolean; i: number } {
    return this.loc(name, line);
  }

  expr(expr: Expr): void {
    switch (expr.k) {
      case "num":
        this.constVal({ t: "num", v: expr.v }, expr.line);
        break;
      case "str":
        this.constVal({ t: "str", v: expr.v }, expr.line);
        break;
      case "bool":
        this.constVal({ t: "bool", v: expr.v }, expr.line);
        break;
      case "bytes":
        this.constVal({ t: "bytes", v: expr.v }, expr.line);
        break;
      case "name": {
        const at = this.loc(expr.name, expr.line);
        this.push({ op: "load", ...at, line: expr.line });
        break;
      }
      case "unary":
        this.expr(expr.expr);
        this.push({ op: "un", kind: expr.op, line: expr.line });
        break;
      case "binary":
        if (expr.op === "||" || expr.op === "&&") {
          this.logic(expr.op, expr.left, expr.right, expr.line);
          break;
        }
        this.expr(expr.left);
        this.expr(expr.right);
        this.push({ op: "bin", kind: expr.op, line: expr.line });
        break;
      case "list":
        for (const item of expr.items) this.expr(item);
        this.push({ op: "list", n: expr.items.length, line: expr.line });
        break;
      case "agree":
        for (const item of expr.items) this.expr(item);
        this.push({ op: "agree", n: expr.items.length, line: expr.line });
        break;
      case "index":
        this.expr(expr.obj);
        this.expr(expr.index);
        this.push({ op: "index", line: expr.line });
        break;
      case "field":
        this.expr(expr.obj);
        this.push({ op: "field", name: expr.name, line: expr.line });
        break;
      case "call":
        for (const arg of expr.args) this.expr(arg);
        this.push({ op: "call", name: expr.name, argc: expr.args.length, line: expr.line });
        break;
    }
  }

  private logic(op: "||" | "&&", left: Expr, right: Expr, line: number): void {
    this.expr(left);
    this.push({ op: "dup", line });
    const jump = { op: op === "||" ? ("jt" as const) : ("jf" as const), to: 0, line };
    this.push(jump);
    this.push({ op: "pop", line });
    this.expr(right);
    jump.to = this.code.length;
  }
}
