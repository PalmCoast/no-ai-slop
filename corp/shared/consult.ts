export const CONSULT_STRIPE_RATES = [
  {
    slug: "half-hour",
    name: "30-minute consult",
    amount: "$75",
    note: "Paid time after the qualifier.",
    cta: "Pay →",
    href: "/go/consult-30",
  },
  {
    slug: "hour",
    name: "1-hour consult",
    amount: "$150",
    note: "One operator in the room. Not a slide deck.",
    cta: "Pay →",
    href: "/go/ads-sprint",
  },
  {
    slug: "pack",
    name: "10-hour pack, 50% up front",
    amount: "$625 of $1,250",
    note: "$125/hour. Deposit is $625. Remainder when the hours start.",
    cta: "Deposit →",
    href: "/go/deposit",
  },
] as const;

export const CONSULT_COST_PATH = "/consult/ai-consultant-cost";
export const CONSULT_COST_URL = "https://agenthiveinc.com/consult/ai-consultant-cost";
export const CONSULT_COST_CHECKED = "October 19, 2026";
export const CONSULT_COST_CHECKED_ISO = "2026-10-19";
