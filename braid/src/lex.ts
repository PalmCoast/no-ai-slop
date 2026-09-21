import { parseBinDump, parseHexDump, parseOctDump } from "./dumps.ts";
import { BraidError } from "./error.ts";

export type Token =
  | { t: "num"; v: number; line: number }
  | { t: "str"; v: string; line: number }
  | { t: "bytes"; v: Uint8Array; line: number }
  | { t: "id"; v: string; line: number }
  | { t: "kw"; v: string; line: number }
  | { t: "op"; v: string; line: number }
  | { t: "semi"; line: number }
  | { t: "eof"; line: number };

const KEYWORDS = new Set([
  "let",
  "fn",
  "return",
  "if",
  "else",
  "while",
  "for",
  "in",
  "print",
  "assert",
  "seal",
  "agree",
  "compress",
  "expand",
  "true",
  "false",
]);

const DUMP_WORDS = new Set(["hex", "bin", "oct"]);

export function lex(src: string): Token[] {
  const lx = new Lexer(src);
  const out: Token[] = [];
  while (true) {
    const tok = lx.next();
    if (tok.t === "semi" && out.length > 0 && out[out.length - 1]?.t === "semi") continue;
    out.push(tok);
    if (tok.t === "eof") break;
  }
  return out;
}

class Lexer {
  private i = 0;
  private line = 1;
  private depth = 0;

  constructor(private src: string) {}

  next(): Token {
    while (this.i < this.src.length) {
      const c = this.src[this.i] ?? "";
      if (c === " " || c === "\t" || c === "\r") {
        this.i++;
        continue;
      }
      if (c === "#") {
        while (this.i < this.src.length && this.src[this.i] !== "\n") this.i++;
        continue;
      }
      if (c === "\n") {
        this.i++;
        this.line++;
        if (this.depth === 0) return { t: "semi", line: this.line };
        continue;
      }
      if (c === '"') return this.string();
      if (isDigit(c)) return this.number();
      if (isIdentStart(c)) return this.word();
      return this.operator();
    }
    return { t: "eof", line: this.line };
  }

  private string(): Token {
    const line = this.line;
    this.i++;
    let out = "";
    while (this.i < this.src.length) {
      const c = this.src[this.i] ?? "";
      if (c === '"') {
        this.i++;
        return { t: "str", v: out, line };
      }
      if (c === "\n") throw new BraidError("unterminated string", line);
      if (c === "\\") {
        const n = this.src[this.i + 1] ?? "";
        const map: Record<string, string> = { n: "\n", t: "\t", r: "\r", '"': '"', "\\": "\\" };
        const ch = map[n];
        if (ch === undefined) throw new BraidError(`bad escape \\${n}`, line);
        out += ch;
        this.i += 2;
        continue;
      }
      out += c;
      this.i++;
    }
    throw new BraidError("unterminated string", line);
  }

  private number(): Token {
    const line = this.line;
    const start = this.i;
    if (this.src[this.i] === "0" && (this.src[this.i + 1] === "x" || this.src[this.i + 1] === "X")) {
      this.i += 2;
      const raw = this.takeDigits(/[0-9a-fA-F_]/);
      if (!raw || raw.includes("_") && raw.replaceAll("_", "") === "") throw new BraidError("bad hex number", line);
      const digits = raw.replaceAll("_", "");
      if (!/^[0-9a-fA-F]+$/.test(digits)) throw new BraidError("bad hex number", line);
      return { t: "num", v: Number.parseInt(digits, 16), line };
    }
    if (this.src[this.i] === "0" && (this.src[this.i + 1] === "b" || this.src[this.i + 1] === "B")) {
      this.i += 2;
      const raw = this.takeDigits(/[01_]/);
      const digits = raw.replaceAll("_", "");
      if (!/^[01]+$/.test(digits)) throw new BraidError("bad binary number", line);
      return { t: "num", v: Number.parseInt(digits, 2), line };
    }
    if (this.src[this.i] === "0" && (this.src[this.i + 1] === "o" || this.src[this.i + 1] === "O")) {
      this.i += 2;
      const raw = this.takeDigits(/[0-7_]/);
      const digits = raw.replaceAll("_", "");
      if (!/^[0-7]+$/.test(digits)) throw new BraidError("bad octal number", line);
      return { t: "num", v: Number.parseInt(digits, 8), line };
    }
    const raw = this.takeDigits(/[0-9_]/);
    const digits = raw.replaceAll("_", "");
    if (!/^[0-9]+$/.test(digits)) throw new BraidError(`bad number at ${start + 1}`, line);
    return { t: "num", v: Number.parseInt(digits, 10), line };
  }

  private takeDigits(re: RegExp): string {
    const start = this.i;
    while (this.i < this.src.length && re.test(this.src[this.i] ?? "")) this.i++;
    return this.src.slice(start, this.i);
  }

  private word(): Token {
    const line = this.line;
    const start = this.i;
    this.i++;
    while (this.i < this.src.length && isIdentPart(this.src[this.i] ?? "")) this.i++;
    const word = this.src.slice(start, this.i);
    if (DUMP_WORDS.has(word)) {
      const saveI = this.i;
      const saveLine = this.line;
      const saveDepth = this.depth;
      this.skipGaps();
      if (this.src[this.i] === "[") {
        const inner = this.bracketBody(word === "hex");
        try {
          const bytes =
            word === "hex" ? parseHexDump(inner) : word === "bin" ? parseBinDump(inner) : parseOctDump(inner);
          return { t: "bytes", v: bytes, line };
        } catch (error) {
          if (error instanceof BraidError) throw new BraidError(error.message.replace(/^line \d+: /, ""), line);
          throw error;
        }
      }
      this.i = saveI;
      this.line = saveLine;
      this.depth = saveDepth;
    }
    if (KEYWORDS.has(word)) return { t: "kw", v: word, line };
    return { t: "id", v: word, line };
  }

  private skipGaps(): void {
    while (this.i < this.src.length) {
      const c = this.src[this.i] ?? "";
      if (c === " " || c === "\t" || c === "\r") {
        this.i++;
        continue;
      }
      if (c === "\n") {
        this.i++;
        this.line++;
        continue;
      }
      if (c === "#") {
        while (this.i < this.src.length && this.src[this.i] !== "\n") this.i++;
        continue;
      }
      break;
    }
  }

  private bracketBody(hexMode: boolean): string {
    if (this.src[this.i] !== "[") throw new BraidError("expected [", this.line);
    this.i++;
    const start = this.i;
    let depth = 1;
    while (this.i < this.src.length) {
      const c = this.src[this.i] ?? "";
      if (c === "\n") {
        this.line++;
        this.i++;
        continue;
      }
      if (c === "#") {
        while (this.i < this.src.length && this.src[this.i] !== "\n") this.i++;
        continue;
      }
      if (hexMode && c === "|") {
        while (this.i < this.src.length && this.src[this.i] !== "\n") this.i++;
        continue;
      }
      if (c === "[") depth++;
      if (c === "]") {
        depth--;
        if (depth === 0) {
          const inner = this.src.slice(start, this.i);
          this.i++;
          return inner;
        }
      }
      this.i++;
    }
    throw new BraidError("unclosed [", this.line);
  }

  private operator(): Token {
    const line = this.line;
    const two = this.src.slice(this.i, this.i + 2);
    const doubles = ["==", "!=", "<=", ">=", "<<", ">>", "&&", "||"];
    if (doubles.includes(two)) {
      this.i += 2;
      return { t: "op", v: two, line };
    }
    const c = this.src[this.i] ?? "";
    const singles = "(){}[],.+-*/%&|^~!=<>;";
    if (!singles.includes(c)) throw new BraidError(`unexpected '${c}'`, line);
    this.i++;
    if (c === "(" || c === "[") this.depth++;
    if (c === ")" || c === "]") this.depth = Math.max(0, this.depth - 1);
    if (c === ";") return { t: "semi", line };
    return { t: "op", v: c, line };
  }
}

function isDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}
function isIdentStart(c: string): boolean {
  return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z") || c === "_";
}
function isIdentPart(c: string): boolean {
  return isIdentStart(c) || isDigit(c);
}
