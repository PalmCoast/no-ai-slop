import { BraidError } from "./error.ts";
import type { Image, Op } from "./image.ts";
import {
  BIN,
  NIL,
  bitnot,
  doCompress,
  doExpand,
  field,
  index,
  len,
  lnot,
  neg,
  truth,
  type Val,
} from "./ops.ts";

export type Host = {
  agree(vals: Val[], line: number): Val;
  print(v: Val): void;
  assert(v: Val, line: number): void;
  seal(v: Val, note: Val, line: number): void;
};

type Frame = {
  code: Op[];
  consts: Val[];
  slots: Val[];
  ip: number;
};

export function execute(image: Image, host: Host): void {
  const fns = new Map(image.fns.map((fn) => [fn.name, fn]));
  const globals = Array.from({ length: image.globals }, () => NIL);
  const stack: Val[] = [];
  const frames: Frame[] = [];
  let frame: Frame = {
    code: image.main.code,
    consts: image.main.consts,
    slots: Array.from({ length: image.main.nslots }, () => NIL),
    ip: 0,
  };

  const pop = (line: number): Val => {
    const v = stack.pop();
    if (!v) throw new BraidError("stack underflow", line);
    return v;
  };

  while (true) {
    const ins = frame.code[frame.ip++];
    if (!ins) throw new BraidError("ran off the end of the code", frame.ip);
    switch (ins.op) {
      case "const": {
        const c = frame.consts[ins.i];
        if (!c) throw new BraidError("missing constant", ins.line);
        stack.push(c);
        break;
      }
      case "load": {
        const v = ins.g ? globals[ins.i] : frame.slots[ins.i];
        if (!v) throw new BraidError("missing slot", ins.line);
        stack.push(v);
        break;
      }
      case "store": {
        const v = pop(ins.line);
        if (ins.g) globals[ins.i] = v;
        else frame.slots[ins.i] = v;
        break;
      }
      case "bin": {
        const right = pop(ins.line);
        const left = pop(ins.line);
        const op = BIN[ins.kind];
        if (!op) throw new BraidError(`unknown operator ${ins.kind}`, ins.line);
        stack.push(op(left, right, ins.line));
        break;
      }
      case "un": {
        const v = pop(ins.line);
        if (ins.kind === "neg") stack.push(neg(v, ins.line));
        else if (ins.kind === "not") stack.push(lnot(v));
        else if (ins.kind === "bitnot") stack.push(bitnot(v, ins.line));
        else if (ins.kind === "compress") stack.push(doCompress(v, ins.line));
        else stack.push(doExpand(v, ins.line));
        break;
      }
      case "jf":
        if (!truth(pop(ins.line))) frame.ip = ins.to;
        break;
      case "jt":
        if (truth(pop(ins.line))) frame.ip = ins.to;
        break;
      case "jump":
        frame.ip = ins.to;
        break;
      case "dup": {
        const top = stack[stack.length - 1];
        if (!top) throw new BraidError("stack underflow", ins.line);
        stack.push(top);
        break;
      }
      case "pop":
        pop(ins.line);
        break;
      case "list": {
        const items: Val[] = [];
        for (let n = 0; n < ins.n; n++) items.push(pop(ins.line));
        items.reverse();
        stack.push({ t: "list", v: items });
        break;
      }
      case "agree": {
        const items: Val[] = [];
        for (let n = 0; n < ins.n; n++) items.push(pop(ins.line));
        items.reverse();
        stack.push(host.agree(items, ins.line));
        break;
      }
      case "index": {
        const at = pop(ins.line);
        const obj = pop(ins.line);
        stack.push(index(obj, at, ins.line));
        break;
      }
      case "field":
        stack.push(field(pop(ins.line), ins.name, ins.line));
        break;
      case "call": {
        const args: Val[] = [];
        for (let n = 0; n < ins.argc; n++) args.push(pop(ins.line));
        args.reverse();
        if (ins.name === "len") {
          const arg = args[0];
          if (!arg) throw new BraidError("len() takes 1 argument", ins.line);
          stack.push(len(arg, ins.line));
          break;
        }
        const fn = fns.get(ins.name);
        if (!fn) throw new BraidError(`unknown function ${ins.name}`, ins.line);
        if (args.length !== fn.arity) throw new BraidError(`${ins.name} argument count`, ins.line);
        frames.push(frame);
        const slots = Array.from({ length: fn.nslots }, () => NIL);
        for (let i = 0; i < args.length; i++) slots[i] = args[i] ?? NIL;
        frame = { code: fn.code, consts: fn.consts, slots, ip: 0 };
        break;
      }
      case "ret": {
        const v = pop(ins.line);
        const prev = frames.pop();
        if (!prev) throw new BraidError("return outside function", ins.line);
        frame = prev;
        stack.push(v);
        break;
      }
      case "print":
        host.print(pop(ins.line));
        break;
      case "assert":
        host.assert(pop(ins.line), ins.line);
        break;
      case "seal": {
        const note = pop(ins.line);
        const value = pop(ins.line);
        host.seal(value, note, ins.line);
        break;
      }
      case "halt":
        return;
      default: {
        const unexpected: never = ins;
        throw new BraidError(`bad opcode ${JSON.stringify(unexpected)}`, 1);
      }
    }
  }
}
