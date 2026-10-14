import type { RawLine } from "./review";

const CODE_RE = /^(?:\d{5}|[A-Z]\d{4})$/i;

function one(row: unknown, index: number): RawLine | null {
  if (typeof row !== "object" || row === null) return null;
  const record = row as Record<string, unknown>;
  const billed = record.billedCents;
  if (typeof billed !== "number" || !Number.isInteger(billed) || billed < 0 || billed > 1_000_000_000) return null;
  const quantityRaw = record.quantity;
  const quantity = typeof quantityRaw === "number" && Number.isInteger(quantityRaw) ? Math.min(30, Math.max(1, quantityRaw)) : 1;
  const codeRaw = typeof record.code === "string" ? record.code.trim().toUpperCase() : "";
  const code = CODE_RE.test(codeRaw) ? codeRaw : null;
  const description = typeof record.description === "string" ? record.description.replace(/\s+/g, " ").trim().slice(0, 140) : "";
  if (!description && !code) return null;
  return {
    id: `M${index + 1}`,
    description: description || code || "Charge",
    code,
    quantity,
    billedCents: billed,
  };
}

/** Turns a model JSON payload into line items. Null means the payload was not a line list. */
export function modelLines(value: unknown): RawLine[] | null {
  if (typeof value !== "object" || value === null) return null;
  const lines = (value as { lines?: unknown }).lines;
  if (!Array.isArray(lines)) return null;
  const out: RawLine[] = [];
  for (const row of lines.slice(0, 80)) {
    const parsed = one(row, out.length);
    if (parsed) out.push(parsed);
  }
  return out;
}
