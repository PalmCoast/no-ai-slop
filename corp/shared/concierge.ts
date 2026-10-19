import { BRAND_URL } from "./brand.ts";

/** Live Stripe Payment Link for the $2,000/mo AI Concierge subscription. */
export const CONCIERGE_STRIPE_URL = "https://buy.stripe.com/6oUeVd7YM3qH0Ylbuq2ZO1u";
export const CONCIERGE_NAME = "AI Concierge";
export const CONCIERGE_PATH = "/concierge";
export const CONCIERGE_URL = `${BRAND_URL}${CONCIERGE_PATH}`;
export const CONCIERGE_PRICE = "$2,000/mo";
export const CONCIERGE_PRICE_AMOUNT = "2000.00";
export const CONCIERGE_BOOK_LABEL = "Book a free 15–30 min call";

export const CONCIERGE_COMPARE_CHECKED = "October 19, 2026";

/**
 * Fractional AI advisor prices other firms publish on their own pages, checked on the date above.
 * Asking prices only. Never invent or round. Sources are plain text: no links to competitor or source domains.
 */
export const CONCIERGE_PUBLISHED = [
  {
    source: "Holistic Consulting",
    page: "Fractional AI Officer",
    price: "$3,500/mo (about 10 hrs), $6,500/mo (about 25 hrs), $9,500/mo (40+ hrs)",
    terms: "Three tiers, month to month",
  },
  {
    source: "SmallBizStrategy.ai",
    page: "Fractional AI Advisor",
    price: "$3,000–$6,000/mo",
    terms: "2–4 strategy calls a month; 3-month minimum recommended",
  },
  {
    source: "iternal.ai",
    page: "AI consulting for small businesses",
    price: "$1,500–$8,000/mo",
    terms: "Range its guide gives for a fractional AI advisor, not one offer",
  },
] as const;
