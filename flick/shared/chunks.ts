import { MAX_CHUNK_BYTES, MAX_CHUNKS } from "./types";

export function chunkCountForSize(size: number, chunkSize = MAX_CHUNK_BYTES): number {
  if (size <= 0) return 0;
  return Math.ceil(size / chunkSize);
}

export function splitBytes(data: Uint8Array, chunkSize = MAX_CHUNK_BYTES): Uint8Array[] {
  if (chunkSize <= 0) throw new Error("chunk size must be positive");
  if (data.byteLength === 0) return [data];
  const chunks: Uint8Array[] = [];
  for (let offset = 0; offset < data.byteLength; offset += chunkSize) {
    chunks.push(data.subarray(offset, offset + chunkSize));
  }
  return chunks;
}

export function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, chunk) => n + chunk.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

export function assertChunkPlan(size: number, chunkCount: number): string | null {
  if (!Number.isInteger(chunkCount) || chunkCount < 1) return "Need at least one chunk.";
  if (chunkCount > MAX_CHUNKS) return `Too many chunks (max ${MAX_CHUNKS}).`;
  if (chunkCountForSize(size) !== chunkCount) return "chunkCount does not match size.";
  return null;
}

export function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  const chunk = 8192;
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(value, "base64"));
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}
