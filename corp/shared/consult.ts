/** B2B reset 2026-11-24 price ladder. The $75 / $150 / $1,250-pack rates are retired from the pitch. */
export const CONSULT_STRIPE_RATES = [
  {
    slug: "sprint",
    name: "Agent Audit & Stabilization Sprint",
    amount: "$2,500",
    note: "Fixed price, delivered in 5 business days.",
    cta: "Start the sprint →",
    href: "/go/sprint",
  },
  {
    slug: "retainer",
    name: "Fractional AI Ops Retainer",
    amount: "$3,500/mo",
    note: "Monitoring, 1-business-day response, monthly report.",
    cta: "Start the retainer →",
    href: "/go/retainer",
  },
] as const;

export const CONSULT_COST_PATH = "/consult/ai-consultant-cost";
export const CONSULT_COST_URL = "https://agenthiveinc.com/consult/ai-consultant-cost";
export const CONSULT_COST_CHECKED = "October 19, 2026";
export const CONSULT_COST_CHECKED_ISO = "2026-10-19";
