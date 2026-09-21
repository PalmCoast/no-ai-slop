import { BraidError } from "./error.ts";
import type { Expr, Program, Stmt } from "./parse.ts";

export type FnInfo = { params: string[]; locals: string[] };

export type Analysis = {
  functions: Map<string, FnInfo>;
  globals: string[];
  sigs: Map<string, number>;
};

export function analyze(prog: Program): Analysis {
  const functions = new Map<string, FnInfo>();
  const globals: string[] = [];
  const globalSet = new Set<string>();

  const addGlobal = (name: string, line: number) => {
    if (globalSet.has(name) || functions.has(name)) throw new BraidError(`duplicate name ${name}`, line);
    globalSet.add(name);
    globals.push(name);
  };

  for (const stmt of prog) {
    if (stmt.k === "fn") {
      if (functions.has(stmt.name) || globalSet.has(stmt.name) || stmt.name === "len") {
        throw new BraidError(`duplicate name ${stmt.name}`, stmt.line);
      }
      const params = new Set<string>();
      for (const p of stmt.params) {
        if (params.has(p)) throw new BraidError(`duplicate parameter ${p}`, stmt.line);
        params.add(p);
      }
      const locals: string[] = [];
      const localSet = new Set<string>(params);
      collectLocals(stmt.body, localSet, locals);
      functions.set(stmt.name, { params: stmt.params, locals });
    }
  }

  for (const stmt of prog) {
    if (stmt.k === "let") addGlobal(stmt.name, stmt.line);
    if (stmt.k === "for") addGlobal(stmt.name, stmt.line);
    if (stmt.k === "fn") walkReturns(stmt.body, true);
    else walkShape(stmt, false);
  }

  const sigs = new Map<string, number>([["len", 1]]);
  for (const [name, info] of functions) sigs.set(name, info.params.length);

  const check = (stmts: Stmt[], locals: Set<string>) => {
    for (const stmt of stmts) checkStmt(stmt, locals, globalSet, sigs, check);
  };
  for (const stmt of prog) {
    if (stmt.k === "fn") {
      const info = functions.get(stmt.name);
      if (!info) continue;
      check(stmt.body, new Set([...info.params, ...info.locals]));
    }
  }
  check(
    prog.filter((s) => s.k !== "fn"),
    globalSet,
  );

  return { functions, globals, sigs };
}

function collectLocals(stmts: Stmt[], have: Set<string>, locals: string[]): void {
  for (const stmt of stmts) {
    if (stmt.k === "let" || stmt.k === "for") {
      if (have.has(stmt.name)) throw new BraidError(`duplicate name ${stmt.name}`, stmt.line);
      have.add(stmt.name);
      locals.push(stmt.name);
    }
    if (stmt.k === "fn") throw new BraidError("functions stay at the top level", stmt.line);
    if (stmt.k === "if") {
      collectLocals(stmt.then, have, locals);
      collectLocals(stmt.else, have, locals);
    }
    if (stmt.k === "while") collectLocals(stmt.body, have, locals);
    if (stmt.k === "for") collectLocals(stmt.body, have, locals);
  }
}

function walkShape(stmt: Stmt, inFn: boolean): void {
  if (stmt.k === "return" && !inFn) throw new BraidError("return is inside a function", stmt.line);
  if (stmt.k === "fn") throw new BraidError("functions stay at the top level", stmt.line);
  if (stmt.k === "if") {
    for (const s of stmt.then) walkShape(s, inFn);
    for (const s of stmt.else) walkShape(s, inFn);
  }
  if (stmt.k === "while" || stmt.k === "for") {
    for (const s of stmt.body) walkShape(s, inFn);
  }
}

function walkReturns(stmts: Stmt[], inFn: boolean): void {
  for (const stmt of stmts) walkShape(stmt, inFn);
}

function checkStmt(
  stmt: Stmt,
  locals: Set<string>,
  globals: Set<string>,
  sigs: Map<string, number>,
  walk: (stmts: Stmt[], locals: Set<string>) => void,
): void {
  const names = new Set([...locals, ...globals]);
  const use = (expr: Expr) => checkExpr(expr, names, sigs);
  switch (stmt.k) {
    case "let":
    case "assign":
      if (!names.has(stmt.name)) throw new BraidError(`unknown name ${stmt.name}`, stmt.line);
      use(stmt.expr);
      break;
    case "return":
      if (stmt.expr) use(stmt.expr);
      break;
    case "if":
      use(stmt.cond);
      walk(stmt.then, locals);
      walk(stmt.else, locals);
      break;
    case "while":
      use(stmt.cond);
      walk(stmt.body, locals);
      break;
    case "for":
      use(stmt.iter);
      walk(stmt.body, locals);
      break;
    case "print":
    case "assert":
      use(stmt.expr);
      break;
    case "seal":
      use(stmt.expr);
      use(stmt.note);
      break;
    case "expr":
      use(stmt.expr);
      break;
    case "fn":
      break;
  }
}

function checkExpr(expr: Expr, names: Set<string>, sigs: Map<string, number>): void {
  switch (expr.k) {
    case "name":
      if (!names.has(expr.name)) throw new BraidError(`unknown name ${expr.name}`, expr.line);
      break;
    case "unary":
      checkExpr(expr.expr, names, sigs);
      break;
    case "binary":
      checkExpr(expr.left, names, sigs);
      checkExpr(expr.right, names, sigs);
      break;
    case "list":
    case "agree":
      for (const item of expr.items) checkExpr(item, names, sigs);
      break;
    case "index":
      checkExpr(expr.obj, names, sigs);
      checkExpr(expr.index, names, sigs);
      break;
    case "field":
      checkExpr(expr.obj, names, sigs);
      break;
    case "call": {
      const arity = sigs.get(expr.name);
      if (arity === undefined) throw new BraidError(`unknown function ${expr.name}`, expr.line);
      if (arity !== expr.args.length) {
        throw new BraidError(`${expr.name} takes ${arity} argument${arity === 1 ? "" : "s"}`, expr.line);
      }
      for (const arg of expr.args) checkExpr(arg, names, sigs);
      break;
    }
    default:
      break;
  }
}
