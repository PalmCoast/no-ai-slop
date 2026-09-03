/**
 * Thin client for the Netlify functions. Every call takes the license key
 * explicitly so the paywall logic stays in one place (app.ts).
 */
import type { CustomPersonaInput, Persona } from "./personas";

export interface LicenseStatus {
  valid: boolean;
  plan: string | null;
  issuedAt: string | null;
  demo: boolean;
  reason: string | null;
}

export interface CheckoutResult {
  url?: string;
  demo?: boolean;
  licenseKey?: string;
  plan?: string;
  message?: string;
  error?: string;
}

export interface MemoryEntry {
  role: "user" | "assistant";
  text: string;
  personaId: string;
  ts: string;
  interrupted?: boolean;
}

export interface MemoryResponse {
  entries: MemoryEntry[];
  count: number;
  storage: "blobs" | "file";
  summary: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function parseError(r: Response): Promise<ApiError> {
  let code = "http_error";
  let message = `${r.status} ${r.statusText}`;
  try {
    const j = (await r.json()) as { error?: string; message?: string };
    code = j.error ?? code;
    message = j.message ?? message;
  } catch {
    // keep defaults
  }
  return new ApiError(r.status, code, message);
}

function withKey(path: string, key: string): string {
  const u = new URL(path, location.origin);
  if (key) u.searchParams.set("key", key);
  return u.pathname + u.search;
}

export const api = {
  async license(key: string): Promise<LicenseStatus> {
    const r = await fetch(withKey("/api/license", key), { cache: "no-store" });
    if (!r.ok) throw await parseError(r);
    return (await r.json()) as LicenseStatus;
  },

  async licenseFromSession(sessionId: string): Promise<{ paid: boolean; licenseKey?: string; plan?: string }> {
    const r = await fetch(`/api/license?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
    if (!r.ok && r.status !== 402) throw await parseError(r);
    return (await r.json()) as { paid: boolean; licenseKey?: string; plan?: string };
  },

  async checkout(plan: "one_time" | "monthly" = "one_time"): Promise<CheckoutResult> {
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (!r.ok) throw await parseError(r);
    return (await r.json()) as CheckoutResult;
  },

  async personas(key: string): Promise<Persona[]> {
    const r = await fetch(withKey("/api/personas", key), { cache: "no-store" });
    if (!r.ok) throw await parseError(r);
    return ((await r.json()) as { personas: Persona[] }).personas;
  },

  async addPersona(key: string, input: CustomPersonaInput): Promise<Persona> {
    const r = await fetch("/api/personas", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Sonaris-License": key },
      body: JSON.stringify(input),
    });
    if (!r.ok) throw await parseError(r);
    return ((await r.json()) as { persona: Persona }).persona;
  },

  async clonePersona(key: string, form: FormData): Promise<Persona> {
    form.set("action", "clone");
    const r = await fetch("/api/personas", { method: "POST", headers: { "X-Sonaris-License": key }, body: form });
    if (!r.ok) throw await parseError(r);
    return ((await r.json()) as { persona: Persona }).persona;
  },

  async deletePersona(key: string, id: string): Promise<void> {
    const u = new URL(withKey("/api/personas", key), location.origin);
    u.searchParams.set("id", id);
    const r = await fetch(u.pathname + u.search, { method: "DELETE" });
    if (!r.ok) throw await parseError(r);
  },

  async memory(key: string): Promise<MemoryResponse> {
    const r = await fetch(withKey("/api/memory", key), { cache: "no-store" });
    if (!r.ok) throw await parseError(r);
    return (await r.json()) as MemoryResponse;
  },

  async appendMemory(key: string, entry: Omit<MemoryEntry, "ts"> & { ts?: string }): Promise<void> {
    const r = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Sonaris-License": key },
      body: JSON.stringify({ ...entry, ts: entry.ts ?? new Date().toISOString() }),
    });
    if (!r.ok) throw await parseError(r);
  },

  async clearMemory(key: string): Promise<void> {
    const r = await fetch(withKey("/api/memory", key), { method: "DELETE" });
    if (!r.ok) throw await parseError(r);
  },

  memoryDownloadUrl(key: string, format: "md" | "jsonl"): string {
    const u = new URL(withKey("/api/memory", key), location.origin);
    u.searchParams.set("format", format);
    return u.pathname + u.search;
  },

  /**
   * Streams the reply. `onChunk` receives raw text pieces as they arrive.
   * Resolves with the full text and the provider header.
   */
  async chat(
    key: string,
    personaId: string,
    messages: ChatMessage[],
    onChunk: (piece: string) => void,
    signal?: AbortSignal,
  ): Promise<{ text: string; provider: string }> {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Sonaris-License": key },
      body: JSON.stringify({ messages, personaId, licenseKey: key }),
      signal,
    });
    if (!r.ok) throw await parseError(r);
    const provider = r.headers.get("X-Sonaris-Provider") ?? "unknown";
    if (!r.body) {
      const text = await r.text();
      onChunk(text);
      return { text, provider };
    }
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      const piece = decoder.decode(value, { stream: true });
      if (piece) {
        text += piece;
        onChunk(piece);
      }
    }
    const tail = decoder.decode();
    if (tail) {
      text += tail;
      onChunk(tail);
    }
    return { text, provider };
  },

  /** Returns an audio Blob, or null when the server wants the browser to speak. */
  async tts(key: string, personaId: string, text: string, signal?: AbortSignal): Promise<Blob | null> {
    const r = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Sonaris-License": key },
      body: JSON.stringify({ text, personaId, licenseKey: key }),
      signal,
    });
    if (r.status === 204) return null;
    if (!r.ok) throw await parseError(r);
    return r.blob();
  },

  async transcribe(key: string, audio: Blob): Promise<string> {
    const form = new FormData();
    form.append("audio", audio, "speech.webm");
    form.append("licenseKey", key);
    const r = await fetch("/api/transcribe", { method: "POST", body: form });
    if (!r.ok) throw await parseError(r);
    return ((await r.json()) as { text: string }).text;
  },
};
