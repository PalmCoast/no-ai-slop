import { blankVendor, type BookInput, type VendorInput } from "../../shared/book.ts";

const BOOK_KEY = "burnbook.v1";
const PAID_KEY = "burnbook.paidSession";

export function loadBook(): BookInput | null {
  try {
    const raw = localStorage.getItem(BOOK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookInput;
    if (!parsed || !Array.isArray(parsed.vendors)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveBook(book: BookInput): void {
  localStorage.setItem(BOOK_KEY, JSON.stringify(book));
}

export function loadPaid(): string | null {
  return localStorage.getItem(PAID_KEY);
}

export function savePaid(sessionId: string): void {
  localStorage.setItem(PAID_KEY, sessionId);
}

export function starterBook(): BookInput {
  return {
    company: "",
    monthLabel: "",
    reworkRateUsd: 95,
    vendors: [blankVendor(crypto.randomUUID())],
  };
}

export function touchVendor(vendors: VendorInput[], id: string, patch: Partial<VendorInput>): VendorInput[] {
  return vendors.map((vendor) => (vendor.id === id ? { ...vendor, ...patch } : vendor));
}
