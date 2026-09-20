export type OfferId = "rack" | "desk" | "consult30" | "consultHour" | "pack";
export type CheckoutMode = "payment" | "subscription";

export type Offer = {
  id: OfferId;
  name: string;
  amountLabel: string;
  cents: number;
  interval: "one_time" | "month";
  mode: CheckoutMode;
  envKey: string;
  defaultPriceId: string;
  fallbackHref?: string;
  blurb: string;
  cta: string;
};

export const OFFERS: Offer[] = [
  {
    id: "rack",
    name: "Rack this network",
    amountLabel: "$1,500 setup",
    cents: 150_000,
    interval: "one_time",
    mode: "payment",
    envKey: "STRIPE_PRICE_ID_RACK",
    defaultPriceId: "price_1UHpioFJWYd4pYuxawfgIoHJ",
    fallbackHref: "https://buy.stripe.com/dRm6oH6UI9P5ePb0PM2ZO1n",
    blurb: "We stand up the LAN from your NetYard plan this week. Live this week or you do not pay the setup.",
    cta: "Pay setup",
  },
  {
    id: "desk",
    name: "NetYard desk",
    amountLabel: "$250/mo",
    cents: 25_000,
    interval: "month",
    mode: "subscription",
    envKey: "STRIPE_PRICE_ID_MONTHLY",
    defaultPriceId: "price_1UHpipFJWYd4pYuxCrWZNXmY",
    fallbackHref: "https://buy.stripe.com/8x2aEXcf2e5lfTf41Y2ZO1o",
    blurb: "After-hours coverage and a named operator on the shop network after the rack.",
    cta: "Start monthly",
  },
  {
    id: "consult30",
    name: "30-minute consult",
    amountLabel: "$75",
    cents: 7_500,
    interval: "one_time",
    mode: "payment",
    envKey: "STRIPE_PRICE_ID_CONSULT_30",
    defaultPriceId: "price_1UEsXoFJWYd4pYuxvYOkG9Wf",
    fallbackHref: "https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h",
    blurb: "Paid time after the free 30-minute qualifier.",
    cta: "Pay 30 minutes",
  },
  {
    id: "consultHour",
    name: "1-hour consult",
    amountLabel: "$150",
    cents: 15_000,
    interval: "one_time",
    mode: "payment",
    envKey: "STRIPE_PRICE_ID_CONSULT_HOUR",
    defaultPriceId: "price_1UEsXpFJWYd4pYuxhhAVBevZ",
    fallbackHref: "https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g",
    blurb: "One operator in the room. Not a slide deck.",
    cta: "Pay one hour",
  },
  {
    id: "pack",
    name: "10-hour pack, 50% up front",
    amountLabel: "$625 of $1,250",
    cents: 62_500,
    interval: "one_time",
    mode: "payment",
    envKey: "STRIPE_PRICE_ID_PACK",
    defaultPriceId: "price_1UEsXpFJWYd4pYuxDO35XzUU",
    fallbackHref: "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i",
    blurb: "$125/hour. Deposit is $625. Remainder when the hours start.",
    cta: "Pay the deposit",
  },
];

export function offerById(id: string): Offer | undefined {
  return OFFERS.find((offer) => offer.id === id);
}

export function isOfferId(id: string): id is OfferId {
  return OFFERS.some((offer) => offer.id === id);
}
