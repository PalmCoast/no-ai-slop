/**
 * POST /api/checkout { offer: OfferId, shop?: string }
 * Creates a Stripe Checkout Session, or returns a known payment-link fallback,
 * or a demo payload when Stripe is not configured.
 */
import type { Config } from "@netlify/functions";
import { isOfferId, offerById } from "../../shared/offers.ts";
import { error, json, readJson } from "../lib/http.ts";
import { priceIdFor, siteUrl, stripe, stripeConfigured } from "../lib/stripe.ts";

interface CheckoutBody {
  offer?: string;
  shop?: string;
  email?: string;
}

export default async (req: Request) => {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  const body = (await readJson<CheckoutBody>(req)) ?? {};
  const offerId = body.offer ?? "";
  if (!isOfferId(offerId)) return error(400, "unknown_offer", "Pick rack, desk, consult30, consultHour, or pack.");
  const offer = offerById(offerId)!;
  const shop = (body.shop ?? "").trim().slice(0, 80);

  const price = priceIdFor(offerId);
  if (stripeConfigured() && price) {
    const s = stripe()!;
    const base = siteUrl(req);
    try {
      const session = await s.checkout.sessions.create({
        mode: offer.mode,
        line_items: [{ price, quantity: 1 }],
        success_url: `${base}/thanks?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/buy`,
        allow_promotion_codes: true,
        ...(body.email ? { customer_email: body.email } : {}),
        metadata: { product: "netyard", offer: offerId, shop },
      });
      if (!session.url) return error(502, "no_url", "Stripe did not return a Checkout URL.");
      return json({ url: session.url, id: session.id, offer: offerId });
    } catch (e) {
      return error(502, "stripe_error", (e as Error).message);
    }
  }

  if (offer.fallbackHref) {
    return json({ url: offer.fallbackHref, offer: offerId, fallback: true });
  }

  return json({
    demo: true,
    offer: offerId,
    amountLabel: offer.amountLabel,
    message: `Stripe is not configured for ${offer.name}. Reed sets ${offer.envKey} on the NetYard Netlify site.`,
  });
};

export const config: Config = {
  path: "/api/checkout",
  method: ["POST"],
};
