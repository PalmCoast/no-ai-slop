import { bytesToBase64, chunkCountForSize, splitBytes } from "../shared/chunks";
import { PAID_PLANS, type PaidPlan, type SeatPlan } from "../shared/plans";
import { MAX_CHUNK_BYTES, type ClipMeta, type CreateClipInput } from "../shared/types";
import { deviceId } from "./lib/device";
import { getLicense } from "./lib/license";

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

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { "X-Flick-Device": deviceId(), ...extra };
  const license = getLicense();
  if (license) headers["X-Flick-License"] = license;
  return headers;
}

export async function health(): Promise<{ ok: boolean; service: string; payments?: string }> {
  return parse(await fetch("/api/health"));
}

export interface Me {
  plan: SeatPlan;
  canPublish: boolean;
  freeRemaining: number;
  payments: "stripe" | "demo" | "off";
  email?: string;
  limits: {
    street: { clips: number; durationMs: number; bytes: number };
    paid: { durationMs: number; bytes: number };
  };
  products: typeof PAID_PLANS;
}

export async function fetchMe(): Promise<Me> {
  return parse(await fetch("/api/me", { headers: authHeaders() }));
}

export async function startCheckout(
  plan: PaidPlan,
  email?: string,
): Promise<{ url?: string; id?: string; plan: string; demo?: boolean; licenseKey?: string; message?: string }> {
  return parse(
    await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ plan, email }),
    }),
  );
}

export async function claimCheckout(sessionId: string): Promise<{ licenseKey: string; plan: string; email?: string }> {
  return parse(
    await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }),
  );
}

export async function startPortal(): Promise<{ url: string }> {
  return parse(
    await fetch("/api/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ licenseKey: getLicense() }),
    }),
  );
}

export async function createClip(input: CreateClipInput): Promise<ClipMeta> {
  return parse(
    await fetch("/api/clips", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
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

export async function uploadChunk(id: string, index: number, chunk: Uint8Array): Promise<void> {
  await parse(
    await fetch(`/api/clips/${id}/chunks/${index}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: bytesToBase64(chunk) }),
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
    await uploadChunk(meta.id, i, part);
    onProgress?.((i + 1) / parts.length);
  }
  return completeClip(meta.id);
}
