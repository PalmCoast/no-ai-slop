import { formatUsd } from "./money";
import type { ParsedBill, RawLine } from "./review";

export type CaseStatus = "review" | "packet" | "filed" | "waiting" | "secured" | "closed";

export type Permission = {
  patient: boolean;
  hospital: boolean;
  insurer: boolean;
  assistance: boolean;
  at: string | null;
};

export type CaseEvent = {
  at: string;
  label: string;
};

export type BillCase = {
  id: string;
  createdAt: string;
  hospital: string;
  patient: string;
  account: string;
  serviceDate: string;
  payer: string;
  billingEmail: string;
  patientOwesCents: number | null;
  statedTotalCents: number | null;
  eobAllowedCents: number | null;
  lines: RawLine[];
  sourceText: string;
  sourceLabel: string;
  status: CaseStatus;
  permission: Permission;
  household: number | null;
  incomeCents: number | null;
  securedCents: number;
  packetAt: string | null;
  events: CaseEvent[];
};

export const STATUS_LABEL: Record<CaseStatus, string> = {
  review: "Review",
  packet: "Ready",
  filed: "Sent",
  waiting: "Waiting",
  secured: "Secured",
  closed: "Closed",
};

export function makeId(): string {
  if (globalThis.crypto?.randomUUID) return `c-${globalThis.crypto.randomUUID()}`;
  return `c-${Date.now().toString(36)}`;
}

export function emptyPermission(): Permission {
  return { patient: false, hospital: false, insurer: false, assistance: false, at: null };
}

export function caseFromParsed(parsed: ParsedBill, sourceLabel: string, now: string, id: string, sourceText: string): BillCase {
  return {
    id,
    createdAt: now,
    hospital: parsed.hospital,
    patient: parsed.patient,
    account: parsed.account,
    serviceDate: parsed.serviceDate,
    payer: parsed.payer,
    billingEmail: "",
    patientOwesCents: parsed.patientOwesCents,
    statedTotalCents: parsed.statedTotalCents,
    eobAllowedCents: null,
    lines: parsed.lines,
    sourceText: sourceText.slice(0, 20000),
    sourceLabel,
    status: "review",
    permission: emptyPermission(),
    household: null,
    incomeCents: null,
    securedCents: 0,
    packetAt: null,
    events: [{ at: now, label: `Read ${parsed.lines.length} lines from ${sourceLabel}.` }],
  };
}

function stamp(bill: BillCase, now: string, label: string, patch: Partial<BillCase>): BillCase {
  return { ...bill, ...patch, events: [...bill.events, { at: now, label }] };
}

export function savePermission(
  bill: BillCase,
  permission: Omit<Permission, "at">,
  household: number | null,
  incomeCents: number | null,
  now: string,
): BillCase | null {
  if (!permission.patient) return null;
  const nextStatus = bill.status === "review" ? "packet" : bill.status;
  return stamp(bill, now, "Permission saved. Letters are ready to send.", {
    permission: { ...permission, at: now },
    household,
    incomeCents,
    status: nextStatus,
    packetAt: bill.packetAt ?? now,
  });
}

export function markFiled(bill: BillCase, now: string): BillCase {
  return stamp(bill, now, "Marked sent.", { status: "filed" });
}

export function markWaiting(bill: BillCase, now: string): BillCase {
  return stamp(bill, now, "Waiting on a reply.", { status: "waiting" });
}

export function recordSavings(bill: BillCase, securedCents: number, now: string): BillCase | null {
  if (!Number.isInteger(securedCents) || securedCents <= 0) return null;
  return stamp(bill, now, `Recorded ${formatUsd(securedCents)} off the bill.`, {
    securedCents,
    status: "secured",
  });
}

export function closeCase(bill: BillCase, now: string): BillCase {
  return stamp(bill, now, "Closed.", { status: "closed" });
}
