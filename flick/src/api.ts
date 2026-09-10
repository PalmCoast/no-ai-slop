import { chunkCountForSize, splitBytes } from "../shared/chunks";
import { MAX_CHUNK_BYTES, type ClipMeta, type CreateClipInput } from "../shared/types";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function parse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!res.ok) throw new ApiError(res.status, data.error ?? "error", data.message ?? res.statusText);
  return data as T;
}

export async function health(): Promise<{ ok: boolean; service: string }> {
  return parse(await fetch("/api/health"));
}

export async function createClip(input: CreateClipInput): Promise<ClipMeta> {
  return parse(
    await fetch("/api/clips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function fetchClip(id: string): Promise<ClipMeta> {
  return parse(await fetch(`/api/clips/${id}`));
}

export function videoUrl(id: string): string {
  return `/api/clips/${id}/video`;
}

export async function uploadChunk(id: string, index: number, chunk: Blob): Promise<void> {
  await parse(
    await fetch(`/api/clips/${id}/chunks/${index}`, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: chunk,
    }),
  );
}

export async function completeClip(id: string): Promise<ClipMeta> {
  return parse(await fetch(`/api/clips/${id}/complete`, { method: "POST" }));
}

export async function publishRecording(
  blob: Blob,
  input: Omit<CreateClipInput, "size" | "chunkCount">,
  onProgress?: (ratio: number) => void,
): Promise<ClipMeta> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const parts = splitBytes(bytes, MAX_CHUNK_BYTES);
  const meta = await createClip({
    ...input,
    size: bytes.byteLength,
    chunkCount: chunkCountForSize(bytes.byteLength),
  });
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    const copy = new Uint8Array(part.byteLength);
    copy.set(part);
    await uploadChunk(meta.id, i, new Blob([copy.buffer], { type: "application/octet-stream" }));
    onProgress?.((i + 1) / parts.length);
  }
  return completeClip(meta.id);
}
