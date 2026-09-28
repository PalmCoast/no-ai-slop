import { dimsClose, parseSpec, rolesCompatible, type Dimension, type Spec } from "./spec.ts";
import { listingsFor, type Listing } from "./shelf.ts";

export type VerdictStatus = "match" | "near" | "drop";

export type Verdict = {
  listing: Listing;
  status: VerdictStatus;
  reasons: string[];
};

export type ShelfResult = {
  spec: Spec;
  matches: Verdict[];
  near: Verdict[];
  dropped: Verdict[];
};

const COUSINS: Record<string, string[]> = {
  tube: ["pipe", "rod", "flange"],
  pipe: ["tube"],
  rod: ["tube"],
  flange: ["tube"],
  sweater: ["cardigan"],
  cardigan: ["sweater"],
};

export function filterShelf(spec: Spec, listings: Listing[]): ShelfResult {
  const judged = listings.map((listing) => judge(spec, listing));
  const byPrice = (a: Verdict, b: Verdict) => a.listing.priceCents - b.listing.priceCents;
  return {
    spec,
    matches: judged.filter((item) => item.status === "match").sort(byPrice),
    near: judged.filter((item) => item.status === "near").sort(byPrice),
    dropped: judged.filter((item) => item.status === "drop"),
  };
}

export function filterQuery(raw: string, extra: Listing[] = []): ShelfResult {
  const spec = parseSpec(raw);
  return filterShelf(spec, listingsFor(spec.product, extra));
}

function judge(query: Spec, listing: Listing): Verdict {
  const item = parseSpec(`${listing.title}. ${listing.detail}`, "listing");
  const reasons: string[] = [];
  let productFail = false;
  let cousin = false;

  if (query.product) {
    if (item.product !== query.product) {
      productFail = true;
      cousin = Boolean(item.product && COUSINS[query.product]?.includes(item.product));
      reasons.push(item.product ? `${item.product}, not ${query.product}` : `no ${query.product} in the description`);
    }
  }

  for (const material of query.materials) {
    if (item.materials.includes(material)) continue;
    if (material === "wool" && item.materials.includes("blend")) reasons.push("wool blend, not wool");
    else if (item.materials.length) reasons.push(`${item.materials.join(" ")}, not ${material}`);
    else reasons.push(`no ${material} in the description`);
  }

  for (const color of query.colors) {
    if (item.colors.includes(color)) continue;
    if (item.colors.length) reasons.push(`${item.colors.join(" ")}, not ${color}`);
    else reasons.push(`no ${color} in the description`);
  }

  for (const feature of query.features) {
    if (!item.features.includes(feature)) reasons.push(`no ${feature}`);
  }

  for (const dim of query.dimensions) {
    const hit = item.dimensions.find((candidate) => rolesCompatible(dim.role, candidate.role) && dimsClose(dim, candidate));
    if (!hit) reasons.push(dimensionReason(dim, item.dimensions));
  }

  const otherFails = reasons.length - (productFail ? 1 : 0);
  let status: VerdictStatus = "drop";
  if (!productFail && otherFails === 0 && reasons.length === 0) status = "match";
  else if (!productFail && otherFails === 1) status = "near";
  else if (productFail && cousin && otherFails === 0) status = "near";

  if (!query.product && query.materials.length === 0 && query.colors.length === 0 && query.features.length === 0 && query.dimensions.length === 0) {
    return { listing, status: "drop", reasons: ["type a spec"] };
  }

  return { listing, status, reasons };
}

function dimensionReason(wanted: Dimension, found: Dimension[]): string {
  const wantedLabel = wanted.label;
  if (!found.length) return `no ${wantedLabel} in the description`;
  const closest = [...found].sort(
    (a, b) => Math.abs(a.inches - wanted.inches) - Math.abs(b.inches - wanted.inches),
  )[0];
  return `${closest.label}, not ${wantedLabel}`;
}

export function money(cents: number): string {
  const dollars = cents / 100;
  return dollars.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function merchantsOf(verdicts: Verdict[]): string[] {
  const names: string[] = [];
  for (const verdict of verdicts) {
    if (!names.includes(verdict.listing.merchant)) names.push(verdict.listing.merchant);
  }
  return names;
}

export function toCsv(result: ShelfResult): string {
  const rows = [
    ["status", "merchant", "title", "price", "reason", "url"],
    ...[...result.matches, ...result.near, ...result.dropped].map((verdict) => [
      verdict.status,
      verdict.listing.merchant,
      verdict.listing.title,
      money(verdict.listing.priceCents),
      verdict.reasons.join("; "),
      verdict.listing.href,
    ]),
  ];
  return rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n";
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function toBrief(shopName: string, result: ShelfResult): string {
  const prices = result.matches.map((item) => item.listing.priceCents);
  const low = prices.length ? money(Math.min(...prices)) : "n/a";
  const high = prices.length ? money(Math.max(...prices)) : "n/a";
  const lines = [
    `# ${shopName}`,
    "",
    `Spec: ${result.spec.raw}`,
    `Matches: ${result.matches.length}`,
    `Near misses: ${result.near.length}`,
    `Left off the shelf: ${result.dropped.length}`,
    `Price span on matches: ${low} to ${high}`,
    "",
    "## On the shelf",
    ...result.matches.map((item) => `- ${item.listing.merchant}: ${item.listing.title} (${money(item.listing.priceCents)})`),
    "",
    "## Near misses",
    ...result.near.map((item) => `- ${item.listing.merchant}: ${item.listing.title} (${item.reasons.join("; ")})`),
    "",
  ];
  return lines.join("\n");
}
