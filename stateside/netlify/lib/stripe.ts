import Stripe from "stripe";
import { JOB_POST_PRICE_CENTS_DEFAULT } from "../../shared/rules";
import { env, envInt, isProduction } from "./env";

let client: Stripe | null = null;

export function stripeConfigured(): boolean {
  return !!env("STRIPE_SECRET_KEY");
}

export function stripe(): Stripe | null {
  const key = env("STRIPE_SECRET_KEY");
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}

/** Demo payments (no charge) are only allowed when explicitly enabled and never in production. */
export function demoPaymentsAllowed(): boolean {
  return !stripeConfigured() && env("ALLOW_DEMO_PAYMENTS") === "true" && !isProduction();
}

export function jobPostPriceCents(): number {
  return envInt("JOB_POST_PRICE_CENTS", JOB_POST_PRICE_CENTS_DEFAULT);
}

export function siteUrl(req: Request): string {
  const configured = env("SITE_URL") ?? env("URL");
  if (configured) return configured.replace(/\/$/, "");
  return new URL(req.url).origin;
}
