import type { BookResult, VendorResult } from "./book.ts";
import { formatUsd } from "./money.ts";

export type Letter = {
  vendorId: string;
  title: string;
  body: string;
};

const ARITHMETIC = [
  "Idle-seat dollars are the empty seats divided by the seats on the bill, times the bill.",
  "Where two vendors do the same job, the book keeps the one with the lower cost per finished job and cancels the other.",
  "Rework of at least a quarter of a bill, and at least $100, is a rebuild. The labor dollars are the hours times the rate typed into the book.",
  "An active vendor that finished no job is capped at half next month.",
  "A bill with no active seat and no finished job is a cancel.",
  "One vendor action per vendor. A cancel or a duplicate cut already includes that vendor's idle seats, so those seats are not added again.",
].join(" ");

function sortedCuts(book: BookResult): VendorResult[] {
  return [...book.vendors].sort((a, b) => {
    const aSave = a.cut.kind === "keep" ? 1 : 0;
    const bSave = b.cut.kind === "keep" ? 1 : 0;
    return aSave - bSave;
  });
}

export function memoText(book: BookResult): string {
  const cuts = sortedCuts(book);
  const lines = cuts.map((vendor, index) => `${index + 1}. ${vendor.cut.line}`);
  const none = cuts.every((vendor) => vendor.cut.kind === "keep");
  return [
    "BURN BOOK",
    book.company,
    book.monthLabel,
    "",
    `This month's AI bill is ${formatUsd(book.burnUsd)}.`,
    `Idle seats, as a share of each vendor's bill, come to ${formatUsd(book.idleWasteUsd)}.`,
    `Rework at ${formatUsd(book.reworkRateUsd)} an hour comes to ${formatUsd(book.reworkUsd)}.`,
    `The cuts below name ${formatUsd(book.vendorSaveUsd)} of vendor spend and ${formatUsd(book.laborSaveUsd)} of rework labor.`,
    `If the vendor cuts are made, the invoice left is ${formatUsd(book.keepUsd)}.`,
    "",
    `If this same month happened twelve times, the vendor cuts would name ${formatUsd(book.vendorRunRateUsd)} and the rebuild would name ${formatUsd(book.laborRunRateUsd)}. That figure is this month times twelve. It is not a prediction.`,
    "",
    none ? "No cut cleared the thresholds." : "Cuts",
    ...lines,
    "",
    "The arithmetic",
    ARITHMETIC,
    "",
    "These dollars are the ones entered in the book. Market figures on the site are cited there and are not an input to this page.",
  ].join("\n");
}

export function lettersFor(book: BookResult): Letter[] {
  return book.vendors
    .filter((vendor) => vendor.cut.kind !== "keep")
    .map((vendor) => ({
      vendorId: vendor.id,
      title: `${vendor.cut.kind} · ${vendor.name}`,
      body: [
        book.company,
        book.monthLabel,
        "",
        `Vendor: ${vendor.name}`,
        `Action: ${vendor.cut.kind}`,
        `Dollars named: ${formatUsd(vendor.cut.saveUsd)}`,
        "",
        vendor.cut.line,
      ].join("\n"),
    }));
}

export function packetPlain(book: BookResult): string {
  const letters = lettersFor(book);
  const blocks = letters.map((letter) => `${letter.title}\n\n${letter.body}`);
  return [memoText(book), "", "LETTERS", "", ...blocks].join("\n");
}

export function packetJson(book: BookResult): string {
  return JSON.stringify(
    {
      company: book.company,
      month: book.monthLabel,
      reworkRateUsd: book.reworkRateUsd,
      burnUsd: book.burnUsd,
      idleWasteUsd: book.idleWasteUsd,
      reworkUsd: book.reworkUsd,
      vendorSaveUsd: book.vendorSaveUsd,
      laborSaveUsd: book.laborSaveUsd,
      keepUsd: book.keepUsd,
      vendorRunRateUsd: book.vendorRunRateUsd,
      laborRunRateUsd: book.laborRunRateUsd,
      vendors: book.vendors.map((vendor) => ({
        name: vendor.name,
        job: vendor.job,
        monthlyUsd: vendor.monthlyUsd,
        seats: vendor.seats,
        activeSeats: vendor.activeSeats,
        idleWasteUsd: vendor.idleWasteUsd,
        finishedJobs: vendor.finishedJobs,
        costPerJobUsd: vendor.costPerJobUsd,
        reworkUsd: vendor.reworkUsd,
        cut: vendor.cut.kind,
        line: vendor.cut.line,
        saveUsd: vendor.cut.saveUsd,
      })),
    },
    null,
    2,
  );
}

export function fileSlug(company: string): string {
  const slug = company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "burn-book";
}
