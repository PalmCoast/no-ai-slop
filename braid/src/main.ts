import { HOT_LOOP } from "./bench.ts";
import "./desk.css";
import { STAMP_DESK_LABEL, STAMP_DESK_LINE } from "./offer.ts";
import { run, type RunResult } from "./run.ts";
import { certificate, openSeal } from "./stamp.ts";
import { weave } from "./weave.ts";
import sensor from "../examples/sensor.braid?raw";
import frameHex from "../examples/frame.hex?raw";
import frameOct from "../examples/frame.oct?raw";
import frameBin from "../examples/frame.bin?raw";

const source = document.querySelector<HTMLTextAreaElement>("#source");
const out = document.querySelector<HTMLElement>("#out");
const stats = document.querySelector<HTMLElement>("#stats");
const cert = document.querySelector<HTMLElement>("#cert");
const opened = document.querySelector<HTMLElement>("#opened");
const download = document.querySelector<HTMLButtonElement>("#download");
const price = document.querySelector<HTMLElement>("#price");
const hex = document.querySelector<HTMLTextAreaElement>("#hex");
const oct = document.querySelector<HTMLTextAreaElement>("#oct");
const bin = document.querySelector<HTMLTextAreaElement>("#bin");

if (!source || !out || !stats || !cert || !opened || !download || !price || !hex || !oct || !bin) {
  throw new Error("desk is missing a node");
}

source.value = sensor.trim() + "\n";
hex.value = frameHex.trim();
oct.value = frameOct.trim();
bin.value = frameBin.trim();
price.textContent = `Stamp Desk ${STAMP_DESK_LABEL}. ${STAMP_DESK_LINE}`;

let last: RunResult | null = null;

function show(result: RunResult, extra?: RunResult): void {
  last = result;
  out!.textContent = result.output.join("\n");
  const vm = extra ? ` Bytecode machine ${extra.runMs.toFixed(1)} ms.` : "";
  const same = extra && extra.output.join("\n") === result.output.join("\n") ? " Same output." : "";
  stats!.textContent = `JavaScript backend ${result.runMs.toFixed(1)} ms.${vm}${same} Agree checks ${result.agrees}. Image ${result.imageBytes} bytes, source ${result.sourceChars} characters.`;
  cert!.textContent = result.certificates[0] ?? "This run did not seal a buffer.";
  download!.disabled = result.seals.length === 0;
}

function fail(error: unknown): void {
  last = null;
  out!.textContent = error instanceof Error ? error.message : String(error);
  stats!.textContent = "The run stopped.";
  cert!.textContent = "No stamp.";
  download!.disabled = true;
}

document.querySelector("#run")?.addEventListener("click", () => {
  try {
    const js = run(source.value, "js");
    const vm = run(source.value, "vm");
    show(js, vm);
  } catch (error) {
    fail(error);
  }
});

document.querySelector("#bench")?.addEventListener("click", () => {
  source.value = HOT_LOOP;
  try {
    const js = run(HOT_LOOP, "js");
    const vm = run(HOT_LOOP, "vm");
    show(js, vm);
  } catch (error) {
    fail(error);
  }
});

document.querySelector("#weave")?.addEventListener("click", () => {
  try {
    source.value = weave({ hex: hex.value, oct: oct.value, bin: bin.value });
    const js = run(source.value, "js");
    const vm = run(source.value, "vm");
    show(js, vm);
  } catch (error) {
    fail(error);
  }
});

download.addEventListener("click", () => {
  const stamped = last?.seals[0];
  if (!stamped) return;
  const bytes = stamped.blob.buffer.slice(
    stamped.blob.byteOffset,
    stamped.blob.byteOffset + stamped.blob.byteLength,
  ) as ArrayBuffer;
  const blob = new Blob([bytes], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "frame.stamp";
  link.click();
  URL.revokeObjectURL(url);
});

document.querySelector<HTMLInputElement>("#open-stamp")?.addEventListener("change", async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const stamped = openSeal(bytes);
    opened.textContent = `${certificate(stamped)}\nfirst bytes: ${[...stamped.raw.slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join(" ")}`;
  } catch (error) {
    opened.textContent = error instanceof Error ? error.message : String(error);
  }
});
