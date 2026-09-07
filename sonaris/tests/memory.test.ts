import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  appendLine,
  appendMemory,
  clearMemory,
  memoryForPrompt,
  normalizeEntry,
  parseJournal,
  readJournal,
  renderSummary,
  type MemoryEntry,
} from "../netlify/lib/memory";
import { FileStore } from "../netlify/lib/store";

const e = (role: MemoryEntry["role"], text: string, ts: string, extra: Partial<MemoryEntry> = {}): MemoryEntry => ({
  role,
  text,
  personaId: "aria",
  ts,
  ...extra,
});

describe("journal pure functions", () => {
  it("appends one JSON line per entry and always ends with a newline", () => {
    const a = appendLine(null, e("user", "hello", "2026-09-03T10:00:00.000Z"));
    expect(a.endsWith("\n")).toBe(true);
    expect(a.split("\n").filter(Boolean)).toHaveLength(1);
    const b = appendLine(a.trimEnd(), e("assistant", "hi", "2026-09-03T10:00:02.000Z"));
    expect(b.split("\n").filter(Boolean)).toHaveLength(2);
  });

  it("parses JSONL and skips corrupt lines", () => {
    const text = '{"role":"user","text":"a","personaId":"atlas","ts":"2026-09-03T10:00:00.000Z"}\nnot json\n{"role":"assistant","text":"b","personaId":"atlas","ts":"2026-09-03T10:00:01.000Z","interrupted":true}\n';
    const parsed = parseJournal(text);
    expect(parsed).toHaveLength(2);
    expect(parsed[1]).toMatchObject({ role: "assistant", interrupted: true });
    expect(parseJournal(null)).toEqual([]);
  });

  it("normalizes incoming entries and rejects bad ones", () => {
    const now = new Date("2026-09-03T12:00:00.000Z");
    expect(normalizeEntry({ role: "user", text: "  hi  " }, now)).toMatchObject({ role: "user", text: "hi", personaId: "atlas", ts: now.toISOString() });
    expect(normalizeEntry({ role: "assistant", text: "x", interrupted: true, ts: "2026-09-03T11:00:00Z" }, now)).toMatchObject({
      interrupted: true,
      ts: "2026-09-03T11:00:00.000Z",
    });
    expect(typeof normalizeEntry({ role: "bot", text: "x" })).toBe("string");
    expect(typeof normalizeEntry({ role: "user", text: "   " })).toBe("string");
    expect(typeof normalizeEntry("nope")).toBe("string");
  });

  it("renders a rolling summary of the last 50 turns grouped by day", () => {
    const entries: MemoryEntry[] = [];
    for (let i = 0; i < 60; i++) {
      const day = i < 30 ? "2026-09-01" : "2026-09-02";
      entries.push(e(i % 2 ? "assistant" : "user", `turn ${i}`, `${day}T10:${String(i % 60).padStart(2, "0")}:00.000Z`));
    }
    const md = renderSummary(entries, "SONARIS-DEMO-TEST");
    expect(md).toContain("# Sonaris memory");
    expect(md).toContain("Turns in journal: 60");
    expect(md).toContain("Showing: last 50");
    expect(md).not.toContain("turn 9\n");
    expect(md).toContain("turn 10");
    expect(md).toContain("turn 59");
    expect(md).toContain("## 2026-09-01");
    expect(md).toContain("## 2026-09-02");
    expect(md).toContain("Sonaris (aria)");
  });

  it("marks interrupted replies in the summary and prompt memory", () => {
    const entries = [e("assistant", "Let me explain the tides", "2026-09-03T10:00:00.000Z", { interrupted: true })];
    expect(renderSummary(entries, "K")).toContain("[interrupted]");
    expect(memoryForPrompt(entries)).toContain("(cut off)");
  });

  it("caps the prompt memory by turns and characters", () => {
    const entries = Array.from({ length: 40 }, (_, i) => e("user", "x".repeat(500), `2026-09-03T10:${String(i).padStart(2, "0")}:00.000Z`));
    const out = memoryForPrompt(entries, 12, 2400);
    expect(out.length).toBeLessThanOrEqual(2400);
  });
});

describe("appendMemory with the file adapter", () => {
  let dir: string;
  let store: FileStore;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "sonaris-mem-"));
    store = new FileStore(dir, (k) => k.replace(/^journal\//, ""));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("writes <key>.jsonl and MEMORY-<key>.md as real files and reads them back", async () => {
    const key = "SONARIS-DEMO-FILE";
    const r1 = await appendMemory(store, key, e("user", "Hello Sonaris, what can you do?", "2026-09-03T10:00:00.000Z"));
    expect(r1.count).toBe(1);
    expect(r1.storage).toBe("file");
    const r2 = await appendMemory(store, key, e("assistant", "I listen, wait, and answer.", "2026-09-03T10:00:03.000Z"));
    expect(r2.count).toBe(2);

    const jsonlPath = join(dir, `${key}.jsonl`);
    const mdPath = join(dir, `MEMORY-${key}.md`);
    expect(existsSync(jsonlPath)).toBe(true);
    expect(existsSync(mdPath)).toBe(true);
    expect(readFileSync(jsonlPath, "utf8").trim().split("\n")).toHaveLength(2);
    expect(readFileSync(mdPath, "utf8")).toContain("I listen, wait, and answer.");

    const back = await readJournal(store, key);
    expect(back.map((x) => x.text)).toEqual(["Hello Sonaris, what can you do?", "I listen, wait, and answer."]);
    expect(await store.list()).toEqual([`MEMORY-${key}.md`, `${key}.jsonl`]);

    await clearMemory(store, key);
    expect(existsSync(jsonlPath)).toBe(false);
    expect(await readJournal(store, key)).toEqual([]);
  });
});
