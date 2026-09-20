import Stripe from "stripe";
import { OFFERS, type OfferId } from "../../shared/offers.ts";
import { env } from "./env.ts";

let client: Stripe | null = null;

export function stripe(): Stripe | null {
  const key = env("STRIPE_SECRET_KEY");
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}

export function stripeConfigured(): boolean {
  return Boolean(env("STRIPE_SECRET_KEY"));
}

export function priceIdFor(offerId: OfferId): string | undefined {
  const offer = OFFERS.find((item) => item.id === offerId);
  if (!offer) return undefined;
  return env(offer.envKey) ?? offer.defaultPriceId;
}

export function siteUrl(req: Request): string {
  const configured = env("SITE_URL");
  if (configured) return configured.replace(/\/$/, "");
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

export function sessionIsPaid(session: Stripe.Checkout.Session): boolean {
  return session.payment_status === "paid" || session.payment_status === "no_payment_required";
}
