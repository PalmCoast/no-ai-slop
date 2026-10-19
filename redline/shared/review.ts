import { formatUsd } from "./money";
import {
  BENCHMARKS,
  EMERGENCY_VISITS,
  FAIR_MULTIPLE,
  PANELS,
  SEVERE_MULTIPLE,
  aliasCode,
  benchmark,
} from "./rates";

export type RawLine = {
  id: string;
  description: string;
  code: string | null;
  quantity: number;
  billedCents: number;
};

export type FlagKind = "duplicate" | "unbundled" | "second_visit" | "over_reference" | "severe";

export type Flag = {
  kind: FlagKind;
  note: string;
};

export const FLAG_LABEL: Record<FlagKind, string> = {
  duplicate: "Duplicate",
  unbundled: "Inside a panel",
  second_visit: "Second visit level",
  over_reference: "Over the reference",
  severe: "Far over the reference",
};

export type ReviewedLine = RawLine & {
  referenceCents: number | null;
  referenceNote: string | null;
  askCents: number;
  savingsCents: number;
  flags: Flag[];
};

export type ParsedBill = {
  hospital: string;
  patient: string;
  account: string;
  serviceDate: string;
  payer: string;
  patientOwesCents: number | null;
  statedTotalCents: number | null;
  lines: RawLine[];
};

const CODE_RE = /\b(\d{5}|[A-Z]\d{4})\b/i;
const MONEY_RE = /\$?\s*(\d{1,3}(?:,\d{3})+|\d+)\.(\d{2})\b/g;

function field(line: string, label: RegExp): string | null {
  const match = line.match(label);
  return match?.[1]?.trim() || null;
}

function moneyToCents(dollars: string, fraction: string): number {
  return Number(dollars.replace(/,/g, "")) * 100 + Number(fraction);
}

function lastMoney(line: string): { cents: number; index: number; length: number } | null {
  MONEY_RE.lastIndex = 0;
  let found: { cents: number; index: number; length: number } | null = null;
  for (const match of line.matchAll(MONEY_RE)) {
    if (match.index == null) continue;
    found = { cents: moneyToCents(match[1], match[2]), index: match.index, length: match[0].length };
  }
  return found;
}

function peelQuantity(before: string): { quantity: number; rest: string } {
  const match = before.match(/^(.*?)(?:\s+)(\d{1,2})$/);
  if (!match) return { quantity: 1, rest: before.trim() };
  const quantity = Number(match[2]);
  if (quantity < 1 || quantity > 30) return { quantity: 1, rest: before.trim() };
  return { quantity, rest: match[1].trim() };
}

function peelCode(text: string): { code: string | null; rest: string } {
  const match = text.match(CODE_RE);
  if (!match || match.index == null) return { code: null, rest: text.trim() };
  const code = match[1].toUpperCase();
  const rest = `${text.slice(0, match.index)} ${text.slice(match.index + match[1].length)}`.replace(/\s+/g, " ").trim();
  return { code, rest: rest.replace(/^\d{3,4}\b/, "").trim() };
}

function isHeaderNoise(line: string): boolean {
  return /^(rev|cpt|hcpcs|description|qty|quantity|amount|charge|charges)\b/i.test(line) && !CODE_RE.test(line) && !lastMoney(line);
}

export function parseBill(text: string): ParsedBill {
  const parsed: ParsedBill = {
    hospital: "",
    patient: "",
    account: "",
    serviceDate: "",
    payer: "",
    patientOwesCents: null,
    statedTotalCents: null,
    lines: [],
  };
  const rows = text.replace(/\r/g, "").split("\n");
  let n = 0;
  for (const raw of rows) {
    const line = raw.trim().replace(/\s+/g, " ");
    if (!line) continue;
    const patient = field(line, /^patient\s*[:\-]\s*(.+)$/i);
    if (patient && !/balance|responsibility|owes/i.test(line)) {
      parsed.patient = patient;
      continue;
    }
    const account = field(line, /^account(?:\s*(?:number|#))?\s*[:\-]\s*(.+)$/i);
    if (account) {
      parsed.account = account;
      continue;
    }
    const serviceDate = field(line, /^(?:date of service|service date|dos)\s*[:\-]\s*(.+)$/i);
    if (serviceDate) {
      parsed.serviceDate = serviceDate;
      continue;
    }
    const payer = field(line, /^(?:payer|insurance|plan)\s*[:\-]\s*(.+)$/i);
    if (payer) {
      parsed.payer = payer;
      continue;
    }
    if (/patient (balance|responsibility|owes)|amount due|balance due/i.test(line)) {
      const money = lastMoney(line);
      if (money) parsed.patientOwesCents = money.cents;
      continue;
    }
    if (/^total\b/i.test(line)) {
      const money = lastMoney(line);
      if (money) parsed.statedTotalCents = money.cents;
      continue;
    }
    if (isHeaderNoise(line)) continue;
    const money = lastMoney(line);
    if (!money) {
      if (!parsed.hospital && /[A-Za-z]/.test(line) && line.length < 80) parsed.hospital = line;
      continue;
    }
    const before = line.slice(0, money.index).trim();
    const { quantity, rest } = peelQuantity(before);
    const peeled = peelCode(rest);
    const cleaned = peeled.rest.replace(/^\d{3,4}\b/, "").trim();
    const code = peeled.code ?? aliasCode(cleaned);
    const description = (cleaned || BENCHMARKS.find((row) => row.code === code)?.label || "Charge").slice(0, 140);
    n += 1;
    parsed.lines.push({
      id: `L${n}`,
      description,
      code,
      quantity,
      billedCents: money.cents,
    });
  }
  return parsed;
}

function norm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function duplicateKey(line: RawLine): string | null {
  if (line.billedCents <= 0) return null;
  if (line.code) return `c:${line.code}:${line.billedCents}:${line.quantity}`;
  const name = norm(line.description);
  if (!name) return null;
  return `d:${name}:${line.billedCents}:${line.quantity}`;
}

export function reviewLines(lines: readonly RawLine[]): ReviewedLine[] {
  const reviewed: ReviewedLine[] = lines.map((line) => {
    const code = line.code ? line.code.toUpperCase() : aliasCode(line.description);
    const ref = benchmark(code);
    const quantity = Math.min(30, Math.max(1, Math.round(line.quantity) || 1));
    return {
      ...line,
      code,
      quantity,
      billedCents: Math.max(0, Math.round(line.billedCents)),
      referenceCents: ref?.cents ?? null,
      referenceNote: ref?.source ?? null,
      askCents: Math.max(0, Math.round(line.billedCents)),
      savingsCents: 0,
      flags: [],
    };
  });

  const seen = new Set<string>();
  for (const line of reviewed) {
    const key = duplicateKey(line);
    if (!key) continue;
    if (seen.has(key)) {
      line.askCents = 0;
      line.flags.push({
        kind: "duplicate",
        note: `A matching ${line.code ?? "line"} for ${formatUsd(line.billedCents)} is already on this bill. The ask for this copy is $0.00.`,
      });
    } else {
      seen.add(key);
    }
  }

  const codes = new Set(reviewed.map((line) => line.code).filter((code): code is string => Boolean(code)));
  for (const line of reviewed) {
    if (line.askCents === 0 || !line.code) continue;
    for (const panel of PANELS) {
      if (panel.parts.includes(line.code) && codes.has(panel.parent)) {
        line.askCents = 0;
        line.flags.push({
          kind: "unbundled",
          note: `${line.code} is already part of ${panel.parent} on this bill. The ask for this line is $0.00.`,
        });
        break;
      }
    }
  }

  const visits = reviewed.filter((line) => line.code && EMERGENCY_VISITS.has(line.code) && line.askCents > 0);
  if (visits.length > 1) {
    const keeper = visits.reduce((best, line) => (line.billedCents > best.billedCents ? line : best));
    for (const line of visits) {
      if (line === keeper) continue;
      line.askCents = 0;
      line.flags.push({
        kind: "second_visit",
        note: "One emergency-visit level belongs on this encounter. This is the extra level.",
      });
    }
  }

  for (const line of reviewed) {
    if (line.askCents === 0 || line.referenceCents == null) continue;
    const basis = line.referenceCents * line.quantity;
    if (basis <= 0) continue;
    const fair = Math.round(basis * FAIR_MULTIPLE);
    const multiple = line.billedCents / basis;
    if (line.billedCents > fair) {
      line.askCents = fair;
      if (multiple > SEVERE_MULTIPLE) {
        line.flags.push({
          kind: "severe",
          note: `Billed ${formatUsd(line.billedCents)} against a reference of ${formatUsd(line.referenceCents)} per unit. That is more than 6 times the reference. The ask is ${formatUsd(line.askCents)}, 1.5 times the reference.`,
        });
      } else {
        line.flags.push({
          kind: "over_reference",
          note: `Billed ${formatUsd(line.billedCents)} against a reference of ${formatUsd(line.referenceCents)} per unit. The ask is ${formatUsd(line.askCents)}, 1.5 times the reference.`,
        });
      }
    }
  }

  for (const line of reviewed) line.savingsCents = Math.max(0, line.billedCents - line.askCents);
  return reviewed;
}

export function sumCents(lines: readonly ReviewedLine[], pick: (line: ReviewedLine) => number): number {
  return lines.reduce((total, line) => total + pick(line), 0);
}

export function totalGap(statedCents: number | null, lines: readonly RawLine[]): number | null {
  if (statedCents == null) return null;
  const sum = lines.reduce((total, line) => total + line.billedCents, 0);
  const gap = statedCents - sum;
  return Math.abs(gap) <= 100 ? null : gap;
}
