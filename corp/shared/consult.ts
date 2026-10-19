export const CONSULT_STRIPE_RATES = [
  {
    slug: "half-hour",
    name: "30-minute consult",
    amount: "$75",
    note: "Paid time after the qualifier.",
    cta: "Pay →",
    href: "https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h",
  },
  {
    slug: "hour",
    name: "1-hour consult",
    amount: "$150",
    note: "One operator in the room. Not a slide deck.",
    cta: "Pay →",
    href: "https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g",
  },
  {
    slug: "pack",
    name: "10-hour pack, 50% up front",
    amount: "$625 of $1,250",
    note: "$125/hour. Deposit is $625. Remainder when the hours start.",
    cta: "Deposit →",
    href: "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i",
  },
] as const;

export const CONSULT_COST_PATH = "/consult/ai-consultant-cost";
export const CONSULT_COST_URL = "https://agenthiveinc.com/consult/ai-consultant-cost";
export const CONSULT_COST_CHECKED = "October 19, 2026";
export const CONSULT_COST_CHECKED_ISO = "2026-10-19";

/** Prices other firms publish on their own sites. Asking prices, checked on the date above. Never invent or round. */
export const PUBLISHED_RANGES = [
  {
    source: "iternal.ai",
    page: "AI consulting for small businesses",
    url: "https://iternal.ai/ai-consulting-for-small-business",
    hourly: "$100–$300 an hour (advisory)",
    monthly: "$1,500–$8,000 a month (fractional advisor)",
  },
  {
    source: "CloudMotiv",
    page: "AI consulting cost for small business in the USA",
    url: "https://cloudmotiv.ai/blog/ai-consulting-cost-for-small-business",
    hourly: "$100–$350 an hour (advice)",
    monthly: "$1,500–$8,000 a month (ongoing advisor)",
  },
  {
    source: "AIessentials",
    page: "AI consulting and team training",
    url: "https://aiessentials.us/ai-consulting-and-team-training",
    hourly: "$150–$350 an hour (their figure for market rates); $150 an hour for their own advice",
    monthly: "Not listed on that page",
  },
  {
    source: "Pareto Talent",
    page: "AI consultant for small business: cost and scope",
    url: "https://paretotalent.com/guides/ai-consultant-for-small-business/",
    hourly: "$100–$350 an hour (summary of two 2026 guides)",
    monthly: "$1,500–$8,000 a month (retainer)",
  },
] as const;

export const PUBLISHED_SOLO = [
  {
    source: "North Star AI Consultation",
    url: "https://northstarconsult.ai/pricing",
    price: "Free 30-minute intro call, then $100 an hour online",
  },
  {
    source: "Rich Nashawaty",
    url: "https://richnashawaty.com/fractional-ai-consulting.html",
    price: "Free 30-minute call; fixed-price projects from $1,500; retainer from $750 a month",
  },
] as const;
