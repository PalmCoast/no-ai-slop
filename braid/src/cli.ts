import { readFileSync, writeFileSync } from "node:fs";
import { formatProof, prove } from "./prove.ts";
import { run } from "./run.ts";
import { certificate } from "./stamp.ts";
import { weave } from "./weave.ts";

const [cmd, ...rest] = process.argv.slice(2);

function usage(): void {
  console.log(`braid run <file>
braid prove
braid stamp <file>
braid weave --hex <file> [--oct <file>] [--bin <file>] [--out <file>]`);
}

function flag(name: string): string | undefined {
  const i = rest.indexOf(name);
  if (i === -1) return undefined;
  return rest[i + 1];
}

if (cmd === "run") {
  const file = rest[0];
  if (!file) {
    usage();
    process.exit(1);
  }
  const result = run(readFileSync(file, "utf8"), "js");
  for (const line of result.output) console.log(line);
  for (const text of result.certificates) console.log(`\n${text}`);
} else if (cmd === "prove") {
  console.log(formatProof(prove()));
} else if (cmd === "stamp") {
  const file = rest[0];
  if (!file) {
    usage();
    process.exit(1);
  }
  const result = run(readFileSync(file, "utf8"), "js");
  for (const line of result.output) console.log(line);
  result.seals.forEach((stamped, index) => {
    const path = file.replace(/\.braid$/, "") + (result.seals.length > 1 ? `-${index + 1}` : "") + ".stamp";
    writeFileSync(path, stamped.blob);
    console.log(`\n${certificate(stamped)}`);
    console.log(`wrote ${path}`);
  });
  if (result.seals.length === 0) console.log("no seal statement in that file");
} else if (cmd === "weave") {
  const hex = flag("--hex");
  const oct = flag("--oct");
  const bin = flag("--bin");
  const out = flag("--out");
  const source = weave({
    hex: hex ? readFileSync(hex, "utf8") : undefined,
    oct: oct ? readFileSync(oct, "utf8") : undefined,
    bin: bin ? readFileSync(bin, "utf8") : undefined,
  });
  if (out) writeFileSync(out, source);
  else console.log(source);
} else {
  usage();
  if (cmd) process.exit(1);
}
