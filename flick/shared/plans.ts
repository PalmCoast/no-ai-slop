/** Street (free) vs paid seats. Watch is always free. */

export const FREE_CLIP_LIMIT = 1;
export const FREE_MAX_DURATION_MS = 2 * 60 * 1000;
export const FREE_MAX_BYTES = 25 * 1024 * 1024;

export const MONTHLY_CENTS = 1900;
export const FOUNDER_CENTS = 9900;

export type PaidPlan = "monthly" | "founder";
export type SeatPlan = "street" | "monthly" | "founder" | "demo";

export const PAID_PLANS: Record<
  PaidPlan,
  { id: PaidPlan; name: string; headline: string; cents: number; cadence: string; mode: "subscription" | "payment" }
> = {
  monthly: {
    id: "monthly",
    name: "Lights",
    headline: "The house lights. Unlimited publish.",
    cents: MONTHLY_CENTS,
    cadence: "/mo",
    mode: "subscription",
  },
  founder: {
    id: "founder",
    name: "Marquee",
    headline: "Founder lifetime. Your name on the board.",
    cents: FOUNDER_CENTS,
    cadence: " once",
    mode: "payment",
  },
};

export function formatUsd(cents: number): string {
  return `$${Math.floor(cents / 100)}`;
}
