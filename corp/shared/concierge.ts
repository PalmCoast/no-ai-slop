import { BRAND_URL } from "./brand.ts";

/** Live Stripe Payment Link for the $2,000/mo AI Concierge subscription. Destination of /go/concierge. */
export const CONCIERGE_STRIPE_URL = "https://buy.stripe.com/6oUeVd7YM3qH0Ylbuq2ZO1u";
/** Live CTA href. /go/concierge already 302s to CONCIERGE_STRIPE_URL. */
export const CONCIERGE_GO_HREF = "/go/concierge";
export const CONCIERGE_NAME = "AI Concierge";
export const CONCIERGE_PATH = "/concierge";
export const CONCIERGE_URL = `${BRAND_URL}${CONCIERGE_PATH}`;
export const CONCIERGE_PRICE = "$2,000/mo";
export const CONCIERGE_PRICE_AMOUNT = "2000.00";
export const CONCIERGE_BOOK_LABEL = "Book a free 15–30 min call";
