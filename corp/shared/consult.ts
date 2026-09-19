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
