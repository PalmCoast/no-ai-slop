import { spawnSync } from "node:child_process";
import { HOT_LOOP, PYTHON_HOT_LOOP } from "./bench.ts";
import { compress } from "./compress.ts";
import { run } from "./run.ts";
import { openSeal, seal } from "./stamp.ts";

export type Proof = {
  checksum: string;
  jsRunMs: number;
  vmRunMs: number;
  pythonRunMs: number | null;
  pythonMatch: boolean | null;
  repetitiveRaw: number;
  repetitivePacked: number;
  repetitiveMethod: string;
  hexTextChars: number;
  stampBytes: number;
  stampSha: string;
  agrees: number;
};

function median(samples: number[]): number {
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

export function prove(): Proof {
  const jsSamples: number[] = [];
  const vmSamples: number[] = [];
  let checksum = "";
  for (let i = 0; i < 3; i++) {
    const js = run(HOT_LOOP, "js");
    const vm = run(HOT_LOOP, "vm");
    if (js.output[0] !== vm.output[0]) {
      throw new Error(`backend mismatch ${js.output[0]} vs ${vm.output[0]}`);
    }
    checksum = js.output[0] ?? "";
    jsSamples.push(js.runMs);
    vmSamples.push(vm.runMs);
  }

  let pythonRunMs: number | null = null;
  let pythonMatch: boolean | null = null;
  const py = spawnSync("python3", ["-c", "print(0)"], { encoding: "utf8" });
  if (py.status === 0) {
    const startup = median(
      [0, 1, 2].map(() => {
        const t = performance.now();
        spawnSync("python3", ["-c", "print(0)"], { encoding: "utf8" });
        return performance.now() - t;
      }),
    );
    const full = median(
      [0, 1, 2].map(() => {
        const t = performance.now();
        const again = spawnSync("python3", ["-c", PYTHON_HOT_LOOP], { encoding: "utf8" });
        pythonMatch = (again.stdout.trim() || "") === checksum;
        return performance.now() - t;
      }),
    );
    pythonRunMs = Math.max(0, full - startup);
  }

  const raw = new Uint8Array(4096);
  for (let i = 0; i < raw.length; i++) raw[i] = i % 4;
  const packed = compress(raw);
  const hexTextChars = raw.length * 2 + Math.max(0, raw.length - 1);
  const stamped = seal(raw, "repetitive bench");
  const opened = openSeal(stamped.blob);
  if (opened.sha256 !== stamped.sha256 || opened.raw.length !== raw.length) {
    throw new Error("stamp roundtrip failed");
  }

  const sensor = run(SENSOR_SNIP, "vm");
  return {
    checksum,
    jsRunMs: round(median(jsSamples)),
    vmRunMs: round(median(vmSamples)),
    pythonRunMs: pythonRunMs === null ? null : round(pythonRunMs),
    pythonMatch,
    repetitiveRaw: raw.length,
    repetitivePacked: packed.packed.length,
    repetitiveMethod: packed.method,
    hexTextChars,
    stampBytes: stamped.blob.length,
    stampSha: stamped.sha256,
    agrees: sensor.agrees,
  };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

const SENSOR_SNIP = `let magic = agree[0xA55A, 0b1010010101011010, 0o122532, 42330]
print magic
`;

export function formatProof(proof: Proof): string {
  const py =
    proof.pythonRunMs === null
      ? "python3 was not available"
      : `CPython ${proof.pythonRunMs} ms after startup, same checksum: ${proof.pythonMatch}`;
  return [
    `hot loop checksum ${proof.checksum}`,
    `js backend ${proof.jsRunMs} ms`,
    `bytecode vm ${proof.vmRunMs} ms`,
    py,
    `4096-byte repeating buffer packed with ${proof.repetitiveMethod}: ${proof.repetitivePacked} bytes (raw ${proof.repetitiveRaw})`,
    `hex text of that buffer is ${proof.hexTextChars} characters; the stamp file is ${proof.stampBytes} bytes`,
    `stamp sha256 ${proof.stampSha}`,
    `cross-radix agree checks in the sensor snippet: ${proof.agrees}`,
  ].join("\n");
}
