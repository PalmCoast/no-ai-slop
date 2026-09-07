/**
 * GET    /api/memory?key=…                 → { entries, summary, storage }
 * GET    /api/memory?key=…&format=md       → MEMORY-<key>.md (text/markdown)
 * GET    /api/memory?key=…&format=jsonl    → journal (application/x-ndjson)
 * POST   /api/memory { role, text, personaId, ts, interrupted?, licenseKey }
 * DELETE /api/memory?key=…                 → wipes the journal and summary
 *
 * Storage: Netlify Blobs store `memory` in production; real files under
 * sonaris/memory/ during local development (see netlify/lib/store.ts).
 */
import type { Config } from "@netlify/functions";
import { requireLicense } from "../lib/auth";
import { error, json, licenseFromRequest, readJson } from "../lib/http";
import { appendMemory, clearMemory, normalizeEntry, readJournal, renderSummary, summaryKey } from "../lib/memory";
import { openStore } from "../lib/store";

export default async (req: Request) => {
  const url = new URL(req.url);
  const store = openStore("memory");

  if (req.method === "GET") {
    const license = await requireLicense(licenseFromRequest(req));
    if (license instanceof Response) return license;
    const entries = await readJournal(store, license.key);
    const format = url.searchParams.get("format");
    if (format === "md") {
      const md = (await store.get(summaryKey(license.key))) ?? renderSummary(entries, license.key);
      return new Response(md, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="MEMORY-${license.key}.md"`,
          "Cache-Control": "no-store",
        },
      });
    }
    if (format === "jsonl") {
      const body = entries.map((e) => JSON.stringify(e)).join("\n") + (entries.length ? "\n" : "");
      return new Response(body, {
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Content-Disposition": `attachment; filename="journal-${license.key}.jsonl"`,
          "Cache-Control": "no-store",
        },
      });
    }
    return json({
      entries,
      count: entries.length,
      storage: store.kind,
      summary: renderSummary(entries, license.key),
    });
  }

  if (req.method === "DELETE") {
    const license = await requireLicense(licenseFromRequest(req));
    if (license instanceof Response) return license;
    await clearMemory(store, license.key);
    return json({ ok: true, count: 0 });
  }

  if (req.method !== "POST") return error(405, "method_not_allowed", "Use GET, POST, or DELETE.");
  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return error(400, "bad_json", "Body must be JSON.");
  const license = await requireLicense(licenseFromRequest(req, body as { licenseKey?: unknown }));
  if (license instanceof Response) return license;
  const entry = normalizeEntry(body);
  if (typeof entry === "string") return error(400, "invalid_entry", entry);
  const result = await appendMemory(store, license.key, entry);
  return json({ ok: true, ...result }, { status: 201 });
};

export const config: Config = {
  path: "/api/memory",
  method: ["GET", "POST", "DELETE"],
};
