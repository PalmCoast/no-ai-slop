import { openSeal } from "../../src/stamp.ts";

const MAX_RAW = 1_000_000;
const MAX_TEXT = 1_500_000;

export function decodeStamp(text: string | undefined): { ok: true; bytes: Uint8Array } | { ok: false; message: string } {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return { ok: false, message: "Send the stamp as base64." };
  if (trimmed.length > MAX_TEXT) return { ok: false, message: "Stamp is too large." };
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(Buffer.from(trimmed, "base64"));
  } catch {
    return { ok: false, message: "Stamp is not base64." };
  }
  if (bytes.length < 48) return { ok: false, message: "Stamp is too small." };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const rawLen = view.getUint32(6, true);
  if (rawLen > MAX_RAW) return { ok: false, message: "Stamp claims more than 1000000 original bytes." };
  try {
    openSeal(bytes);
  } catch (cause) {
    return { ok: false, message: cause instanceof Error ? cause.message : "Bad stamp." };
  }
  return { ok: true, bytes };
}
