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

/** Live Stripe Payment Link for the Chief of Staff pilot ($1,500 one-time + $299/mo). After payment it redirects to /concierge?paid=1. */
export const PILOT_STRIPE_URL = "https://buy.stripe.com/9B600jbaYe5ldL7cyu2ZO1B";

/** Where the pilot buy button points (falls back to the 30-min call if the Stripe link is ever blanked). */
export const PILOT_BUY_URL = PILOT_STRIPE_URL || CALENDLY_URL;
export const PILOT_BUY_LABEL = PILOT_STRIPE_URL ? `Claim a pilot seat — ${PILOT_PRICE}` : "Claim a pilot seat — book a 30-min call";
export const PILOT_PAID_MESSAGE = "Thanks, your pilot seat is reserved. I’ll reach out to schedule your setup. Questions: 320-335-6186.";
