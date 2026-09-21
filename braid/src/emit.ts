import { analyze } from "./analyze.ts";
import { BraidError } from "./error.ts";
import { BIN_NAME } from "./ops.ts";
import type { Expr, Program, Stmt } from "./parse.ts";

export function emitJs(prog: Program): string {
  const analysis = analyze(prog);
  const lines: string[] = [];
  const write = (depth: number, text: string) => {
    lines.push(`${"  ".repeat(depth)}${text}`);
  };
  for (const name of analysis.globals) write(0, `let v_${name} = h.nil();`);
  for (const stmt of prog) {
    if (stmt.k === "fn") emitFn(stmt, write);
  }
  for (const stmt of prog) {
    if (stmt.k !== "fn") emitStmt(stmt, 0, write);
  }
  return lines.join("\n");
}

function emitFn(
  stmt: Extract<Stmt, { k: "fn" }>,
  write: (depth: number, text: string) => void,
): void {
  const params = stmt.params.map((name) => `v_${name}`).join(", ");
  write(0, `function fn_${stmt.name}(${params}) {`);
  const infoLocals = new Set(stmt.params);
  const declared: string[] = [];
  collect(stmt.body, infoLocals, declared);
  for (const name of declared) {
    if (!stmt.params.includes(name)) write(1, `let v_${name} = h.nil();`);
  }
  for (const s of stmt.body) emitStmt(s, 1, write);
  write(1, "return h.nil();");
  write(0, "}");
}

function collect(stmts: Stmt[], have: Set<string>, declared: string[]): void {
  for (const stmt of stmts) {
    if ((stmt.k === "let" || stmt.k === "for") && !have.has(stmt.name)) {
      have.add(stmt.name);
      declared.push(stmt.name);
    }
    if (stmt.k === "if") {
      collect(stmt.then, have, declared);
      collect(stmt.else, have, declared);
    }
    if (stmt.k === "while" || stmt.k === "for") collect(stmt.body, have, declared);
  }
}

function emitStmt(stmt: Stmt, depth: number, write: (depth: number, text: string) => void): void {
  switch (stmt.k) {
    case "let":
    case "assign":
      write(depth, `v_${stmt.name} = ${emitExpr(stmt.expr)};`);
      break;
    case "print":
      write(depth, `h.print(${emitExpr(stmt.expr)});`);
      break;
    case "assert":
      write(depth, `h.assert(${emitExpr(stmt.expr)}, ${stmt.line});`);
      break;
    case "seal":
      write(depth, `h.seal(${emitExpr(stmt.expr)}, ${emitExpr(stmt.note)}, ${stmt.line});`);
      break;
    case "expr":
      write(depth, `${emitExpr(stmt.expr)};`);
      break;
    case "return":
      write(depth, `return ${stmt.expr ? emitExpr(stmt.expr) : "h.nil()"};`);
      break;
    case "if":
      write(depth, `if (h.truth(${emitExpr(stmt.cond)})) {`);
      for (const s of stmt.then) emitStmt(s, depth + 1, write);
      write(depth, "} else {");
      for (const s of stmt.else) emitStmt(s, depth + 1, write);
      write(depth, "}");
      break;
    case "while":
      write(depth, `while (h.truth(${emitExpr(stmt.cond)})) {`);
      for (const s of stmt.body) emitStmt(s, depth + 1, write);
      write(depth, "}");
      break;
    case "for": {
      const id = stmt.line;
      write(depth, "{");
      write(depth + 1, `const t_src_${id} = ${emitExpr(stmt.iter)};`);
      write(depth + 1, `const t_n_${id} = h.len(t_src_${id}, ${stmt.line});`);
      write(depth + 1, `let t_i_${id} = h.num(0);`);
      write(depth + 1, `while (h.truth(h.lt(t_i_${id}, t_n_${id}, ${stmt.line}))) {`);
      write(depth + 2, `v_${stmt.name} = h.index(t_src_${id}, t_i_${id}, ${stmt.line});`);
      for (const s of stmt.body) emitStmt(s, depth + 2, write);
      write(depth + 2, `t_i_${id} = h.add(t_i_${id}, h.num(1), ${stmt.line});`);
      write(depth + 1, "}");
      write(depth, "}");
      break;
    }
    case "fn":
      break;
  }
}

function emitExpr(expr: Expr): string {
  switch (expr.k) {
    case "num":
      return `h.num(${expr.v})`;
    case "str":
      return `h.str(${JSON.stringify(expr.v)})`;
    case "bool":
      return `h.bool(${expr.v})`;
    case "bytes":
      return `h.bytes([${[...expr.v].join(",")}])`;
    case "name":
      return `v_${expr.name}`;
    case "unary":
      if (expr.op === "neg") return `h.neg(${emitExpr(expr.expr)}, ${expr.line})`;
      if (expr.op === "not") return `h.lnot(${emitExpr(expr.expr)})`;
      if (expr.op === "bitnot") return `h.bitnot(${emitExpr(expr.expr)}, ${expr.line})`;
      if (expr.op === "compress") return `h.compress(${emitExpr(expr.expr)}, ${expr.line})`;
      return `h.expand(${emitExpr(expr.expr)}, ${expr.line})`;
    case "binary":
      if (expr.op === "||" || expr.op === "&&") {
        const left = emitExpr(expr.left);
        const right = emitExpr(expr.right);
        if (expr.op === "||") return `(() => { const _l = ${left}; return h.truth(_l) ? _l : ${right}; })()`;
        return `(() => { const _l = ${left}; return h.truth(_l) ? ${right} : _l; })()`;
      }
      {
        const name = BIN_NAME[expr.op];
        if (!name) throw new BraidError(`unknown operator ${expr.op}`, expr.line);
        return `h.${name}(${emitExpr(expr.left)}, ${emitExpr(expr.right)}, ${expr.line})`;
      }
    case "list":
      return `h.list([${expr.items.map(emitExpr).join(", ")}])`;
    case "agree":
      return `h.agree([${expr.items.map(emitExpr).join(", ")}], ${expr.line})`;
    case "index":
      return `h.index(${emitExpr(expr.obj)}, ${emitExpr(expr.index)}, ${expr.line})`;
    case "field":
      return `h.field(${emitExpr(expr.obj)}, ${JSON.stringify(expr.name)}, ${expr.line})`;
    case "call":
      if (expr.name === "len") return `h.len(${emitExpr(expr.args[0]!)}, ${expr.line})`;
      return `fn_${expr.name}(${expr.args.map(emitExpr).join(", ")})`;
  }
}
