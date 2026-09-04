/**
 * POST /api/checkout { plan?: "one_time" | "monthly" }
 *   → { url }                                   Stripe Checkout Session
 *   → { demo: true, licenseKey, plan: "demo" }  when Stripe is not configured
 */
import type { Config } from "@netlify/functions";
import { generateDemoKey } from "../../src/license";
import { saveLicenseRecord, stripeConfigured } from "../lib/auth";
import { error, json, readJson } from "../lib/http";
import { priceFor, siteUrl, stripe } from "../lib/stripe";

interface CheckoutBody {
  plan?: "one_time" | "monthly";
  email?: string;
}

export default async (req: Request) => {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  const body = (await readJson<CheckoutBody>(req)) ?? {};
  const plan = body.plan === "monthly" ? "monthly" : "one_time";

  if (!stripeConfigured()) {
    const licenseKey = generateDemoKey();
    await saveLicenseRecord({ key: licenseKey, plan: "demo", issuedAt: new Date().toISOString() }).catch(() => undefined);
    return json({
      demo: true,
      licenseKey,
      plan: "demo",
      message: "Stripe is not configured, so this is a demo license. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID to sell real ones.",
    });
  }

  const price = priceFor(plan);
  if (!price) {
    return error(409, "plan_unavailable", plan === "monthly" ? "Monthly billing is not enabled (STRIPE_PRICE_ID_MONTHLY is unset)." : "STRIPE_PRICE_ID is unset.");
  }

  const s = stripe()!;
  const base = siteUrl(req);
  try {
    const session = await s.checkout.sessions.create({
      mode: plan === "monthly" ? "subscription" : "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${base}/thanks.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/#pricing`,
      allow_promotion_codes: true,
      ...(body.email ? { customer_email: body.email } : {}),
      metadata: { product: "sonaris", plan },
    });
    if (!session.url) return error(502, "no_url", "Stripe did not return a Checkout URL.");
    return json({ url: session.url, id: session.id, plan });
  } catch (e) {
    return error(502, "stripe_error", (e as Error).message);
  }
};

export const config: Config = {
  path: "/api/checkout",
  method: ["POST"],
};
