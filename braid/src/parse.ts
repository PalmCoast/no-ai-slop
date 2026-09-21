import { BraidError } from "./error.ts";
import { lex, type Token } from "./lex.ts";

export type Expr =
  | { k: "num"; v: number; line: number }
  | { k: "str"; v: string; line: number }
  | { k: "bool"; v: boolean; line: number }
  | { k: "bytes"; v: Uint8Array; line: number }
  | { k: "name"; name: string; line: number }
  | { k: "unary"; op: "neg" | "not" | "bitnot" | "compress" | "expand"; expr: Expr; line: number }
  | { k: "binary"; op: string; left: Expr; right: Expr; line: number }
  | { k: "list"; items: Expr[]; line: number }
  | { k: "index"; obj: Expr; index: Expr; line: number }
  | { k: "field"; obj: Expr; name: string; line: number }
  | { k: "call"; name: string; args: Expr[]; line: number }
  | { k: "agree"; items: Expr[]; line: number };

export type Stmt =
  | { k: "let"; name: string; expr: Expr; line: number }
  | { k: "assign"; name: string; expr: Expr; line: number }
  | { k: "fn"; name: string; params: string[]; body: Stmt[]; line: number }
  | { k: "return"; expr: Expr | null; line: number }
  | { k: "if"; cond: Expr; then: Stmt[]; else: Stmt[]; line: number }
  | { k: "while"; cond: Expr; body: Stmt[]; line: number }
  | { k: "for"; name: string; iter: Expr; body: Stmt[]; line: number }
  | { k: "print"; expr: Expr; line: number }
  | { k: "assert"; expr: Expr; line: number }
  | { k: "seal"; expr: Expr; note: Expr; line: number }
  | { k: "expr"; expr: Expr; line: number };

export type Program = Stmt[];

export function parse(src: string): Program {
  return new Parser(lex(src)).program();
}

class Parser {
  private i = 0;

  constructor(private toks: Token[]) {}

  program(): Program {
    this.skipSemis();
    const stmts: Stmt[] = [];
    while (this.cur.t !== "eof") {
      stmts.push(this.stmt());
      this.skipSemis();
    }
    return stmts;
  }

  private get cur(): Token {
    return this.toks[this.i] ?? { t: "eof", line: 1 };
  }

  private bump(): void {
    if (this.cur.t !== "eof") this.i++;
  }

  private skipSemis(): void {
    while (this.cur.t === "semi") this.bump();
  }

  private opIs(op: string): boolean {
    const tok = this.cur;
    return tok.t === "op" && tok.v === op;
  }

  private kwIs(kw: string): boolean {
    const tok = this.cur;
    return tok.t === "kw" && tok.v === kw;
  }

  private expectKw(kw: string): void {
    if (this.cur.t !== "kw" || this.cur.v !== kw) {
      throw new BraidError(`expected ${kw}`, this.cur.line);
    }
    this.bump();
  }

  private expectOp(op: string): void {
    if (this.cur.t !== "op" || this.cur.v !== op) {
      throw new BraidError(`expected '${op}'`, this.cur.line);
    }
    this.bump();
  }

  private expectId(): string {
    if (this.cur.t !== "id") throw new BraidError("expected a name", this.cur.line);
    const name = this.cur.v;
    this.bump();
    return name;
  }

  private stmt(): Stmt {
    if (this.cur.t === "kw") {
      switch (this.cur.v) {
        case "let":
          return this.letStmt();
        case "fn":
          return this.fnStmt();
        case "return":
          return this.returnStmt();
        case "if":
          return this.ifStmt();
        case "while":
          return this.whileStmt();
        case "for":
          return this.forStmt();
        case "print":
          return this.printStmt();
        case "assert":
          return this.assertStmt();
        case "seal":
          return this.sealStmt();
        default:
          break;
      }
    }
    const next = this.toks[this.i + 1];
    if (this.cur.t === "id" && next?.t === "op" && next.v === "=") {
      const line = this.cur.line;
      const name = this.expectId();
      this.expectOp("=");
      return { k: "assign", name, expr: this.expr(), line };
    }
    const expr = this.expr();
    return { k: "expr", expr, line: expr.line };
  }

  private letStmt(): Stmt {
    const line = this.cur.line;
    this.expectKw("let");
    const name = this.expectId();
    this.expectOp("=");
    return { k: "let", name, expr: this.expr(), line };
  }

  private fnStmt(): Stmt {
    const line = this.cur.line;
    this.expectKw("fn");
    const name = this.expectId();
    this.expectOp("(");
    const params: string[] = [];
    if (!this.opIs(")")) {
      params.push(this.expectId());
      while (this.opIs(",")) {
        this.bump();
        if (this.opIs(")")) break;
        params.push(this.expectId());
      }
    }
    this.expectOp(")");
    return { k: "fn", name, params, body: this.block(), line };
  }

  private returnStmt(): Stmt {
    const line = this.cur.line;
    this.expectKw("return");
    if (this.cur.t === "semi" || this.cur.t === "eof" || (this.cur.t === "op" && this.cur.v === "}")) {
      return { k: "return", expr: null, line };
    }
    return { k: "return", expr: this.expr(), line };
  }

  private ifStmt(): Stmt {
    const line = this.cur.line;
    this.expectKw("if");
    const cond = this.expr();
    const then = this.block();
    this.skipSemis();
    let els: Stmt[] = [];
    if (this.kwIs("else")) {
      this.bump();
      this.skipSemis();
      els = this.kwIs("if") ? [this.ifStmt()] : this.block();
    }
    return { k: "if", cond, then, else: els, line };
  }

  private whileStmt(): Stmt {
    const line = this.cur.line;
    this.expectKw("while");
    const cond = this.expr();
    return { k: "while", cond, body: this.block(), line };
  }

  private forStmt(): Stmt {
    const line = this.cur.line;
    this.expectKw("for");
    const name = this.expectId();
    this.expectKw("in");
    const iter = this.expr();
    return { k: "for", name, iter, body: this.block(), line };
  }

  private printStmt(): Stmt {
    const line = this.cur.line;
    this.expectKw("print");
    return { k: "print", expr: this.expr(), line };
  }

  private assertStmt(): Stmt {
    const line = this.cur.line;
    this.expectKw("assert");
    return { k: "assert", expr: this.expr(), line };
  }

  private sealStmt(): Stmt {
    const line = this.cur.line;
    this.expectKw("seal");
    const expr = this.expr();
    let note: Expr = { k: "str", v: "", line };
    if (this.cur.t === "op" && this.cur.v === ",") {
      this.bump();
      note = this.expr();
    }
    return { k: "seal", expr, note, line };
  }

  private block(): Stmt[] {
    this.expectOp("{");
    this.skipSemis();
    const stmts: Stmt[] = [];
    while (!(this.cur.t === "op" && this.cur.v === "}") && this.cur.t !== "eof") {
      stmts.push(this.stmt());
      this.skipSemis();
    }
    this.expectOp("}");
    return stmts;
  }

  private expr(): Expr {
    return this.bin(["||"], () => this.bin(["&&"], () => this.equality()));
  }

  private equality(): Expr {
    return this.bin(["==", "!="], () => this.bin(["<", ">", "<=", ">="], () => this.bitwise()));
  }

  private bitwise(): Expr {
    return this.bin(["|"], () => this.bin(["^"], () => this.bin(["&"], () => this.bin(["<<", ">>"], () => this.term()))));
  }

  private term(): Expr {
    return this.bin(["+", "-"], () => this.bin(["*", "/", "%"], () => this.unary()));
  }

  private bin(ops: string[], next: () => Expr): Expr {
    let left = next();
    while (this.cur.t === "op" && ops.includes(this.cur.v)) {
      const op = this.cur.v;
      const line = this.cur.line;
      this.bump();
      const right = next();
      left = { k: "binary", op, left, right, line };
    }
    return left;
  }

  private unary(): Expr {
    if (this.cur.t === "op" && (this.cur.v === "-" || this.cur.v === "!" || this.cur.v === "~")) {
      const line = this.cur.line;
      const op = this.cur.v === "-" ? "neg" : this.cur.v === "!" ? "not" : "bitnot";
      this.bump();
      return { k: "unary", op, expr: this.unary(), line };
    }
    if (this.cur.t === "kw" && (this.cur.v === "compress" || this.cur.v === "expand")) {
      const line = this.cur.line;
      const op = this.cur.v;
      this.bump();
      return { k: "unary", op, expr: this.unary(), line };
    }
    return this.postfix();
  }

  private postfix(): Expr {
    let expr = this.primary();
    while (true) {
      if (this.cur.t === "op" && this.cur.v === "(") {
        if (expr.k !== "name") throw new BraidError("only a name can be called", this.cur.line);
        const line = this.cur.line;
        this.bump();
        const args: Expr[] = [];
        if (!this.opIs(")")) {
          args.push(this.expr());
          while (this.opIs(",")) {
            this.bump();
            if (this.opIs(")")) break;
            args.push(this.expr());
          }
        }
        this.expectOp(")");
        expr = { k: "call", name: expr.name, args, line };
        continue;
      }
      if (this.cur.t === "op" && this.cur.v === "[") {
        const line = this.cur.line;
        this.bump();
        const index = this.expr();
        this.expectOp("]");
        expr = { k: "index", obj: expr, index, line };
        continue;
      }
      if (this.cur.t === "op" && this.cur.v === ".") {
        const line = this.cur.line;
        this.bump();
        const name = this.expectId();
        expr = { k: "field", obj: expr, name, line };
        continue;
      }
      return expr;
    }
  }

  private primary(): Expr {
    const tok = this.cur;
    if (tok.t === "num") {
      this.bump();
      return { k: "num", v: tok.v, line: tok.line };
    }
    if (tok.t === "str") {
      this.bump();
      return { k: "str", v: tok.v, line: tok.line };
    }
    if (tok.t === "bytes") {
      this.bump();
      return { k: "bytes", v: tok.v, line: tok.line };
    }
    if (tok.t === "id") {
      this.bump();
      return { k: "name", name: tok.v, line: tok.line };
    }
    if (tok.t === "kw" && (tok.v === "true" || tok.v === "false")) {
      this.bump();
      return { k: "bool", v: tok.v === "true", line: tok.line };
    }
    if (tok.t === "kw" && tok.v === "agree") {
      const line = tok.line;
      this.bump();
      this.expectOp("[");
      const items: Expr[] = [];
      if (!this.opIs("]")) {
        items.push(this.expr());
        while (this.opIs(",")) {
          this.bump();
          if (this.opIs("]")) break;
          items.push(this.expr());
        }
      }
      this.expectOp("]");
      if (items.length < 2) throw new BraidError("agree needs two or more values", line);
      return { k: "agree", items, line };
    }
    if (tok.t === "op" && tok.v === "(") {
      this.bump();
      const inner = this.expr();
      this.expectOp(")");
      return inner;
    }
    if (tok.t === "op" && tok.v === "[") {
      const line = tok.line;
      this.bump();
      const items: Expr[] = [];
      if (!this.opIs("]")) {
        items.push(this.expr());
        while (this.opIs(",")) {
          this.bump();
          if (this.opIs("]")) break;
          items.push(this.expr());
        }
      }
      this.expectOp("]");
      return { k: "list", items, line };
    }
    throw new BraidError("expected an expression", tok.line);
  }
}
