import { BRAND_URL, CALENDLY_URL } from "./brand.ts";

/** Live Stripe Payment Link for the $2,000/mo AI Concierge subscription. */
export const CONCIERGE_STRIPE_URL = "https://buy.stripe.com/6oUeVd7YM3qH0Ylbuq2ZO1u";
export const CONCIERGE_NAME = "AI Concierge";
export const CONCIERGE_PATH = "/concierge";
export const CONCIERGE_URL = `${BRAND_URL}${CONCIERGE_PATH}`;
export const CONCIERGE_PRICE = "$2,000/mo";
export const CONCIERGE_PRICE_AMOUNT = "2000.00";
export const CONCIERGE_BOOK_LABEL = "Book a 30-min call";
export const CONCIERGE_APPROVAL_LINE = "Nothing goes out without your approval.";

/* ---------- Chief of Staff pilot (3 seats) ---------- */
export const PILOT_NAME = "Chief of Staff pilot";
export const PILOT_SEATS = 3;
export const PILOT_PRICE = "$1,500 setup + $299/mo";
export const PILOT_SETUP_AMOUNT = "1500.00";
export const PILOT_MONTHLY_AMOUNT = "299.00";

/**
 * TODO(stripe-pilot-link): the Chief of Staff pilot Payment Link ($1,500 one-time + $299/mo)
 * does not exist yet. Daniel has to approve creating it in Stripe. When it exists, paste the
 * https://buy.stripe.com/... URL here (and add a /go/ entry if wanted). While this is empty the
 * pilot button books the 30-min call instead.
 */
export const PILOT_STRIPE_URL = "";

/** Where the pilot buy button points: the Stripe link once it exists, the 30-min call until then. */
export const PILOT_BUY_URL = PILOT_STRIPE_URL || CALENDLY_URL;
export const PILOT_BUY_LABEL = PILOT_STRIPE_URL ? `Claim a pilot seat — ${PILOT_PRICE}` : "Claim a pilot seat — book a 30-min call";
