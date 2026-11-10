import Stripe from "stripe";
import { PAYMENT_LINK, PRICE_ID } from "../../shared/brand.ts";
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

export function packetPriceId(): string {
  return env("STRIPE_PRICE_ID_PACKET") ?? PRICE_ID;
}

export function paymentLink(): string {
  return env("STRIPE_PAYMENT_LINK") ?? PAYMENT_LINK;
}

export function siteUrl(req: Request): string {
  const configured = env("SITE_URL");
  if (configured) return configured.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export function sessionIsPaid(session: Stripe.Checkout.Session): boolean {
  return session.payment_status === "paid" || session.payment_status === "no_payment_required";
}

export function sessionIsPacket(session: Stripe.Checkout.Session, priceId: string): boolean {
  if (!sessionIsPaid(session)) return false;
  const lineHit = session.line_items?.data?.some((item) => item.price?.id === priceId) ?? false;
  if (lineHit) return true;
  const meta = session.metadata ?? {};
  return meta.product === "burnbook" && meta.offer === "packet";
}
