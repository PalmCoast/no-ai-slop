/**
 * POST /api/stripe-webhook
 * Acknowledges a paid Burn Book checkout. The packet unlock is the verified session
 * on GET /api/order, not a license minted here.
 */
import type { Config } from "@netlify/functions";
import type Stripe from "stripe";
import { env } from "../lib/env.ts";
import { error, json } from "../lib/http.ts";
import { packetPriceId, sessionIsPacket, sessionIsPaid, stripe } from "../lib/stripe.ts";

export default async (req: Request) => {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  const client = stripe();
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!client || !secret) return error(409, "webhook_not_configured", "Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.");

  const signature = req.headers.get("stripe-signature");
  if (!signature) return error(400, "missing_signature", "Missing stripe-signature header.");
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = await client.webhooks.constructEventAsync(payload, signature, secret);
  } catch (err) {
    return error(400, "bad_signature", (err as Error).message);
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (sessionIsPaid(session)) {
      const full = await client.checkout.sessions.retrieve(session.id, { expand: ["line_items"] });
      if (sessionIsPacket(full, packetPriceId())) {
        console.log(`burnbook paid ${session.id} amount=${session.amount_total ?? "?"}`);
      }
    }
  }
  return json({ received: true });
};

export const config: Config = {
  path: "/api/stripe-webhook",
  method: ["POST"],
};
