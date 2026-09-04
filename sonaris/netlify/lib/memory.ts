/**
 * Persistent memory: a JSONL journal per license plus a rolling, human-readable
 * MEMORY-<key>.md summary of the last 50 turns. The pure functions are unit
 * tested; `appendMemory` wires them to a KeyValueStore.
 */
import type { KeyValueStore } from "./store";

export type MemoryRole = "user" | "assistant";

export interface MemoryEntry {
  role: MemoryRole;
  text: string;
  personaId: string;
  /** ISO 8601 timestamp. */
  ts: string;
  /** Set on assistant entries that were cut off by the user. */
  interrupted?: boolean;
}

export const SUMMARY_TURNS = 50;
export const MAX_ENTRY_CHARS = 4000;

export function journalKey(licenseKey: string): string {
  return `journal/${licenseKey}.jsonl`;
}

export function summaryKey(licenseKey: string): string {
  return `MEMORY-${licenseKey}.md`;
}

export function parseJournal(jsonl: string | null | undefined): MemoryEntry[] {
  if (!jsonl) return [];
  const out: MemoryEntry[] = [];
  for (const line of jsonl.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    try {
      const e = JSON.parse(t) as Partial<MemoryEntry>;
      if ((e.role === "user" || e.role === "assistant") && typeof e.text === "string" && typeof e.ts === "string") {
        out.push({
          role: e.role,
          text: e.text,
          personaId: typeof e.personaId === "string" ? e.personaId : "unknown",
          ts: e.ts,
          ...(e.interrupted ? { interrupted: true } : {}),
        });
      }
    } catch {
      // Skip corrupt lines rather than losing the whole journal.
    }
  }
  return out;
}

/** Validates and normalizes an incoming entry, or returns an error string. */
export function normalizeEntry(input: unknown, now: Date = new Date()): MemoryEntry | string {
  if (!input || typeof input !== "object") return "Body must be a JSON object.";
  const e = input as Record<string, unknown>;
  if (e.role !== "user" && e.role !== "assistant") return "role must be 'user' or 'assistant'.";
  if (typeof e.text !== "string" || !e.text.trim()) return "text is required.";
  const ts = typeof e.ts === "string" && !Number.isNaN(Date.parse(e.ts)) ? new Date(e.ts).toISOString() : now.toISOString();
  return {
    role: e.role,
    text: e.text.trim().slice(0, MAX_ENTRY_CHARS),
    personaId: typeof e.personaId === "string" && e.personaId ? e.personaId.slice(0, 60) : "atlas",
    ts,
    ...(e.interrupted === true ? { interrupted: true } : {}),
  };
}

export function appendLine(jsonl: string | null | undefined, entry: MemoryEntry): string {
  const base = jsonl ? (jsonl.endsWith("\n") ? jsonl : jsonl + "\n") : "";
  return base + JSON.stringify(entry) + "\n";
}

function dayOf(ts: string): string {
  return ts.slice(0, 10);
}

function timeOf(ts: string): string {
  return ts.slice(11, 16) + " UTC";
}

/**
 * Renders the rolling summary: the last `limit` turns grouped by day, oldest
 * first, so the file reads top to bottom like a transcript.
 */
export function renderSummary(entries: readonly MemoryEntry[], licenseKey: string, limit = SUMMARY_TURNS): string {
  const recent = entries.slice(-limit);
  const lines: string[] = [];
  lines.push(`# Sonaris memory`);
  lines.push("");
  lines.push(`License: ${licenseKey}`);
  lines.push(`Turns in journal: ${entries.length}`);
  lines.push(`Showing: last ${recent.length}`);
  lines.push(`Updated: ${entries.length ? entries[entries.length - 1]!.ts : "never"}`);
  lines.push("");
  lines.push("Every spoken exchange is appended to the JSONL journal. This file is regenerated from the journal after each turn.");
  let day = "";
  for (const e of recent) {
    const d = dayOf(e.ts);
    if (d !== day) {
      day = d;
      lines.push("");
      lines.push(`## ${d}`);
      lines.push("");
    }
    const who = e.role === "user" ? "You" : `Sonaris (${e.personaId})`;
    const flag = e.interrupted ? " [interrupted]" : "";
    lines.push(`- ${timeOf(e.ts)} ${who}${flag}: ${e.text.replace(/\s+/g, " ")}`);
  }
  lines.push("");
  return lines.join("\n");
}

/** Compact recent-memory block for the chat system prompt. */
export function memoryForPrompt(entries: readonly MemoryEntry[], maxTurns = 12, maxChars = 2400): string {
  const recent = entries.slice(-maxTurns);
  const lines = recent.map((e) => `${e.role === "user" ? "User" : "Assistant"}${e.interrupted ? " (cut off)" : ""}: ${e.text}`);
  let out = lines.join("\n");
  if (out.length > maxChars) out = out.slice(out.length - maxChars);
  return out;
}

export interface MemoryWriteResult {
  entry: MemoryEntry;
  count: number;
  storage: KeyValueStore["kind"];
  files: { journal: string; summary: string };
}

export async function readJournal(store: KeyValueStore, licenseKey: string): Promise<MemoryEntry[]> {
  return parseJournal(await store.get(journalKey(licenseKey)));
}

/**
 * Append one entry and refresh the summary. Read-modify-write is fine for a
 * single user's journal in v1.
 */
export async function appendMemory(store: KeyValueStore, licenseKey: string, entry: MemoryEntry): Promise<MemoryWriteResult> {
  const jk = journalKey(licenseKey);
  const existing = await store.get(jk);
  const next = appendLine(existing, entry);
  await store.set(jk, next);
  const entries = parseJournal(next);
  await store.set(summaryKey(licenseKey), renderSummary(entries, licenseKey));
  return {
    entry,
    count: entries.length,
    storage: store.kind,
    files: { journal: jk, summary: summaryKey(licenseKey) },
  };
}

export async function clearMemory(store: KeyValueStore, licenseKey: string): Promise<void> {
  await store.delete(journalKey(licenseKey));
  await store.delete(summaryKey(licenseKey));
}
