import Stripe from "stripe";
import { generateLicenseKey, type LicensePlan, type LicenseRecord } from "../../shared/license";
import { FOUNDER_CENTS, MONTHLY_CENTS, PAID_PLANS, type PaidPlan } from "../../shared/plans";
import { env, isProduction } from "./env";
import { bindSession, getLicenseRecord, licenseKeyForSession, saveLicenseRecord } from "./licenses";

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

/** Demo licenses (no charge) only when explicitly enabled, and never in production. */
export function demoPaymentsAllowed(): boolean {
  return !stripeConfigured() && env("ALLOW_DEMO_PAYMENTS") === "true" && !isProduction();
}

export function paymentsMode(): "stripe" | "demo" | "off" {
  if (stripeConfigured()) return "stripe";
  if (demoPaymentsAllowed()) return "demo";
  return "off";
}

export function priceIdFor(plan: PaidPlan): string | undefined {
  if (plan === "monthly") return env("STRIPE_PRICE_ID_MONTHLY");
  return env("STRIPE_PRICE_ID_FOUNDER") ?? env("STRIPE_PRICE_ID");
}

export function siteUrl(req: Request): string {
  const configured = env("SITE_URL") ?? env("URL");
  if (configured) return configured.replace(/\/$/, "");
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

export function integrationIdentifier(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let suffix = "";
  for (let i = 0; i < 8; i++) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `flick-pay-${suffix}`;
}

export function lineItemFor(plan: PaidPlan): Stripe.Checkout.SessionCreateParams.LineItem {
  const price = priceIdFor(plan);
  if (price) return { price, quantity: 1 };
  const spec = PAID_PLANS[plan];
  const cents = plan === "monthly" ? MONTHLY_CENTS : FOUNDER_CENTS;
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: cents,
      product_data: {
        name: `Flick ${spec.name}`,
        description: spec.headline,
      },
      ...(plan === "monthly" ? { recurring: { interval: "month" as const } } : {}),
    },
  };
}

export function sessionIsPaid(session: Stripe.Checkout.Session): boolean {
  return session.payment_status === "paid" || session.payment_status === "no_payment_required";
}

export function planFromSession(session: Stripe.Checkout.Session): LicensePlan {
  const meta = session.metadata?.plan;
  if (meta === "monthly" || meta === "founder") return meta;
  return session.mode === "subscription" ? "monthly" : "founder";
}

function customerIdOf(session: Stripe.Checkout.Session): string | undefined {
  const c = session.customer;
  if (typeof c === "string") return c;
  if (c && typeof c === "object" && "id" in c) return c.id;
  return undefined;
}

/**
 * Mint a license for a paid Checkout Session exactly once. Session→key index
 * makes both /thanks and the webhook idempotent.
 */
export async function mintLicenseForSession(session: Stripe.Checkout.Session): Promise<LicenseRecord> {
  const existingKey = await licenseKeyForSession(session.id);
  if (existingKey) {
    const rec = await getLicenseRecord(existingKey);
    if (rec) return rec;
  }
  let key = generateLicenseKey();
  while (await getLicenseRecord(key)) key = generateLicenseKey();
  const rec: LicenseRecord = {
    key,
    plan: planFromSession(session),
    issuedAt: new Date().toISOString(),
    sessionId: session.id,
    customerId: customerIdOf(session),
    email: session.customer_details?.email ?? undefined,
  };
  await saveLicenseRecord(rec);
  await bindSession(session.id, rec.key);
  return rec;
}
