import { assertChunkPlan, base64ToBytes } from "../../shared/chunks";
import {
  type CaptureMode,
  type ClipMeta,
  type CreateClipInput,
  isAllowedMime,
  isClipId,
  makeClipId,
  MAX_BYTES,
  MAX_CHUNK_BYTES,
  MAX_DURATION_MS,
  MAX_HEIGHT,
  MAX_WIDTH,
  mimeFamily,
  normalizeTitle,
} from "../../shared/types";
import { HttpError } from "./http";
import { openStore, type BinaryStore } from "./store";

const MODES: CaptureMode[] = ["screen", "camera", "both", "demo"];

function metaKey(id: string): string {
  return `${id}/meta`;
}

function chunkKey(id: string, index: number): string {
  return `${id}/${index}`;
}

export function validateCreate(input: Partial<CreateClipInput>): CreateClipInput {
  const title = normalizeTitle(input.title);
  const mimeType = typeof input.mimeType === "string" ? input.mimeType : "";
  if (!isAllowedMime(mimeType)) throw new HttpError(400, "bad_mime", "Use webm or mp4.");
  const durationMs = Number(input.durationMs);
  const width = Number(input.width);
  const height = Number(input.height);
  const size = Number(input.size);
  const chunkCount = Number(input.chunkCount);
  const mode = input.mode;
  if (!Number.isFinite(durationMs) || durationMs < 400) throw new HttpError(400, "too_short", "Recording is too short.");
  if (durationMs > MAX_DURATION_MS) throw new HttpError(400, "too_long", "Recordings are capped at 15 minutes.");
  if (!Number.isFinite(width) || width < 16 || width > MAX_WIDTH) throw new HttpError(400, "bad_size", "Width is out of range.");
  if (!Number.isFinite(height) || height < 16 || height > MAX_HEIGHT) throw new HttpError(400, "bad_size", "Height is out of range.");
  if (!Number.isFinite(size) || size < 64 || size > MAX_BYTES) throw new HttpError(400, "bad_size", "File is too large (100 MB max).");
  const planError = assertChunkPlan(size, chunkCount);
  if (planError) throw new HttpError(400, "bad_chunks", planError);
  if (!mode || !MODES.includes(mode)) throw new HttpError(400, "bad_mode", "Unknown capture mode.");
  return { title, mimeType, durationMs, width, height, size, chunkCount, mode };
}

export async function createClip(input: CreateClipInput, store: BinaryStore = openStore()): Promise<ClipMeta> {
  let id = makeClipId();
  for (let i = 0; i < 8; i++) {
    const existing = await store.getJSON<ClipMeta>(metaKey(id));
    if (!existing) break;
    id = makeClipId();
  }
  const meta: ClipMeta = {
    id,
    title: input.title,
    mimeType: input.mimeType,
    durationMs: input.durationMs,
    width: input.width,
    height: input.height,
    size: input.size,
    chunkCount: input.chunkCount,
    status: "uploading",
    createdAt: new Date().toISOString(),
    mode: input.mode,
  };
  await store.setJSON(metaKey(id), meta);
  return meta;
}

export async function getClip(id: string, store: BinaryStore = openStore()): Promise<ClipMeta | null> {
  if (!isClipId(id)) return null;
  return store.getJSON<ClipMeta>(metaKey(id));
}

export async function putChunk(
  id: string,
  index: number,
  data: Uint8Array,
  store: BinaryStore = openStore(),
): Promise<void> {
  const meta = await getClip(id, store);
  if (!meta) throw new HttpError(404, "not_found", "No such clip.");
  if (meta.status !== "uploading") throw new HttpError(409, "locked", "This clip is already finished.");
  if (!Number.isInteger(index) || index < 0 || index >= meta.chunkCount) {
    throw new HttpError(400, "bad_chunk", "Chunk index is out of range.");
  }
  if (data.byteLength === 0) throw new HttpError(400, "empty_chunk", "Chunk is empty.");
  if (data.byteLength > MAX_CHUNK_BYTES) throw new HttpError(413, "chunk_too_large", "Chunk is too large.");
  const last = index === meta.chunkCount - 1;
  const expected = last ? meta.size - MAX_CHUNK_BYTES * (meta.chunkCount - 1) : MAX_CHUNK_BYTES;
  if (data.byteLength !== expected) {
    throw new HttpError(400, "bad_chunk_size", `Chunk size does not match the plan (got ${data.byteLength}, expected ${expected}).`);
  }
  await store.setBytes(chunkKey(id, index), data, mimeFamily(meta.mimeType));
}

export async function bytesFromChunkRequest(req: Request): Promise<Uint8Array> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || typeof (body as { data?: unknown }).data !== "string") {
      throw new HttpError(400, "bad_json", "Chunk JSON must be { data: base64 }.");
    }
    return base64ToBytes((body as { data: string }).data);
  }
  return new Uint8Array(await req.arrayBuffer());
}

export async function completeClip(id: string, store: BinaryStore = openStore()): Promise<ClipMeta> {
  const meta = await getClip(id, store);
  if (!meta) throw new HttpError(404, "not_found", "No such clip.");
  if (meta.status === "ready") return meta;
  for (let i = 0; i < meta.chunkCount; i++) {
    const chunk = await store.getBytes(chunkKey(id, i));
    if (!chunk) throw new HttpError(409, "incomplete", `Missing chunk ${i}.`);
  }
  const ready: ClipMeta = { ...meta, status: "ready" };
  await store.setJSON(metaKey(id), ready);
  return ready;
}

export async function readClipBytes(id: string, store: BinaryStore = openStore()): Promise<{ meta: ClipMeta; body: ReadableStream<Uint8Array> }> {
  const meta = await getClip(id, store);
  if (!meta || meta.status !== "ready") throw new HttpError(404, "not_found", "No such clip.");
  let index = 0;
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (index >= meta.chunkCount) {
        controller.close();
        return;
      }
      const chunk = await store.getBytes(chunkKey(id, index));
      if (!chunk) {
        controller.error(new Error(`missing chunk ${index}`));
        return;
      }
      index += 1;
      controller.enqueue(chunk);
    },
  });
  return { meta, body };
}
