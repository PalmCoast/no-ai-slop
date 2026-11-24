import { BRAND_URL } from "./brand.ts";

/**
 * B2B reset 2026-11-24: /concierge is now the Fractional AI Ops Retainer page ($3,500/mo).
 * Constant names keep the old CONCIERGE_* prefix so existing imports and the /concierge URL stay put.
 */
/** Live Stripe Payment Link for the $3,500/mo retainer (plink_1UfPTSFJWYd4pYuxGXdMUAT3). Destination of /go/retainer. */
export const CONCIERGE_STRIPE_URL = "https://buy.stripe.com/eVq5kD3Iw4uLePbfKG2ZO1W";
/** Live CTA href. /go/retainer 302s to CONCIERGE_STRIPE_URL. */
export const CONCIERGE_GO_HREF = "/go/retainer";
export const CONCIERGE_NAME = "Fractional AI Ops Retainer";
export const CONCIERGE_PATH = "/concierge";
export const CONCIERGE_URL = `${BRAND_URL}${CONCIERGE_PATH}`;
export const CONCIERGE_PRICE = "$3,500/mo";
export const CONCIERGE_PRICE_AMOUNT = "3500.00";
export const CONCIERGE_BOOK_LABEL = "Book the free 15-minute triage";
