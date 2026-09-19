import { slugifyQuestion } from "./ask.ts";

export type MarqueeListing = {
  slug: string;
  name: string;
  bidCents: number;
  paidAt: string;
  demo?: boolean;
};

export const MARQUEE_FLOOR_CENTS = 2000;
export const MARQUEE_STEP_CENTS = 100;
export const MARQUEE_MAX_CENTS = 5_000_000;

export function dollarsToCents(raw: string | number): number | null {
  const n = typeof raw === "number" ? raw : Number(String(raw).replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

export function centsToDollars(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function rankMarquee(listings: MarqueeListing[]): MarqueeListing[] {
  return [...listings].sort((a, b) => b.bidCents - a.bidCents || a.name.localeCompare(b.name));
}

export function topBidCents(listings: MarqueeListing[]): number {
  return rankMarquee(listings)[0]?.bidCents ?? 0;
}

export function minNextBidCents(listings: MarqueeListing[]): number {
  const top = topBidCents(listings);
  if (top < MARQUEE_FLOOR_CENTS) return MARQUEE_FLOOR_CENTS;
  return top + MARQUEE_STEP_CENTS;
}

export function parseBid(raw: string | number, listings: MarqueeListing[]): { cents: number } | { error: string } {
  const cents = dollarsToCents(raw);
  if (cents === null) return { error: "Type a dollar amount. You name the price." };
  if (cents > MARQUEE_MAX_CENTS) return { error: `Cap is ${centsToDollars(MARQUEE_MAX_CENTS)} so a typo cannot empty a card.` };
  const min = minNextBidCents(listings);
  if (cents < min) return { error: `The crown is ${centsToDollars(topBidCents(listings))}. Next bid is ${centsToDollars(min)} or more.` };
  return { cents };
}

export function applyBid(
  listings: MarqueeListing[],
  input: { name: string; bidCents: number; demo?: boolean; paidAt?: string },
): MarqueeListing[] {
  const name = input.name.trim().slice(0, 80);
  const slug = slugifyQuestion(name);
  const row: MarqueeListing = {
    slug,
    name,
    bidCents: input.bidCents,
    paidAt: input.paidAt ?? new Date().toISOString(),
    demo: input.demo,
  };
  const rest = listings.filter((item) => item.slug !== slug);
  return rankMarquee([row, ...rest]);
}

export const SEED_MARQUEE: MarqueeListing[] = [
  { slug: "first-deploy-ai", name: "First Deploy AI", bidCents: 25000, paidAt: "2026-09-19T12:00:00.000Z" },
  { slug: "askyard", name: "AskYard", bidCents: 12000, paidAt: "2026-09-19T12:00:00.000Z" },
  { slug: "jobproof", name: "JobProof", bidCents: 8000, paidAt: "2026-09-19T12:00:00.000Z" },
  { slug: "indexme-lol", name: "IndexMe.lol", bidCents: 4999, paidAt: "2026-09-19T12:00:00.000Z" },
  { slug: "flick", name: "Flick", bidCents: 2500, paidAt: "2026-09-19T12:00:00.000Z" },
];
