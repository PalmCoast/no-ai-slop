/**
 * POST /api/checkout
 * Opens Stripe Checkout for the $750 board packet, paid in full.
 * With no secret on the site, returns the live payment link for the same price.
 */
import type { Config } from "@netlify/functions";
import { error, json } from "../lib/http.ts";
import { packetPriceId, paymentLink, siteUrl, stripe, stripeConfigured } from "../lib/stripe.ts";

export default async (req: Request) => {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");

  const price = packetPriceId();
  const fallback = paymentLink();
  if (stripeConfigured()) {
    const client = stripe()!;
    const base = siteUrl(req);
    try {
      const session = await client.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price, quantity: 1 }],
        success_url: `${base}/thanks?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/book?canceled=1`,
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        metadata: { product: "burnbook", offer: "packet" },
        payment_intent_data: {
          description: "Burn Book board packet",
          metadata: { product: "burnbook", offer: "packet" },
        },
      });
      if (!session.url) return error(502, "no_url", "Stripe did not return a Checkout URL.");
      return json({ url: session.url, id: session.id, offer: "packet", cents: 75_000 });
    } catch (err) {
      return error(502, "stripe_error", (err as Error).message);
    }
  }

  return json({
    url: fallback,
    offer: "packet",
    cents: 75_000,
    fallback: true,
  });
};

export const config: Config = {
  path: "/api/checkout",
  method: ["POST"],
};
