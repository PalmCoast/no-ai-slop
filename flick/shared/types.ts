export const CLIP_ID_LENGTH = 10;
export const CLIP_ID_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export const CLIP_ID_RE = /^[a-z0-9]{10}$/;

export const MAX_TITLE = 120;
export const MAX_CHUNKS = 260;
export const MAX_CHUNK_BYTES = 400_000;
export const MAX_BYTES = 100 * 1024 * 1024;
export const MAX_DURATION_MS = 15 * 60 * 1000;
export const MAX_WIDTH = 1920;
export const MAX_HEIGHT = 1080;

export const ALLOWED_MIME = [
  "video/webm",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/mp4",
  "video/mp4;codecs=avc1",
] as const;

export type CaptureMode = "screen" | "camera" | "both" | "demo";

export type ClipStatus = "uploading" | "ready";

export interface ClipMeta {
  id: string;
  title: string;
  mimeType: string;
  durationMs: number;
  width: number;
  height: number;
  size: number;
  chunkCount: number;
  status: ClipStatus;
  createdAt: string;
  mode: CaptureMode;
}

export interface CreateClipInput {
  title: string;
  mimeType: string;
  durationMs: number;
  width: number;
  height: number;
  size: number;
  chunkCount: number;
  mode: CaptureMode;
}

export function isClipId(value: string): boolean {
  return CLIP_ID_RE.test(value);
}

export function makeClipId(random: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < CLIP_ID_LENGTH; i++) {
    out += CLIP_ID_ALPHABET[Math.floor(random() * CLIP_ID_ALPHABET.length)];
  }
  return out;
}

export function normalizeTitle(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  return (raw || "Untitled Flick").slice(0, MAX_TITLE);
}

export function mimeFamily(mimeType: string): string {
  const base = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  return base;
}

export function isAllowedMime(mimeType: string): boolean {
  const family = mimeFamily(mimeType);
  return family === "video/webm" || family === "video/mp4";
}
