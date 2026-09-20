/**
 * POST /api/stripe-webhook
 * Records paid NetYard checkout sessions. Does not mint a license; the product is the rack/consult.
 */
import type { Config } from "@netlify/functions";
import type Stripe from "stripe";
import { env } from "../lib/env.ts";
import { error, json } from "../lib/http.ts";
import { sessionIsPaid, stripe } from "../lib/stripe.ts";

export default async (req: Request) => {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  const s = stripe();
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!s || !secret) return error(409, "webhook_not_configured", "Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.");

  const signature = req.headers.get("stripe-signature");
  if (!signature) return error(400, "missing_signature", "Missing stripe-signature header.");
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = await s.webhooks.constructEventAsync(payload, signature, secret);
  } catch (e) {
    return error(400, "bad_signature", (e as Error).message);
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (sessionIsPaid(session)) {
      console.log(
        `netyard paid ${session.id} offer=${session.metadata?.offer ?? "?"} shop=${session.metadata?.shop ?? ""}`,
      );
    }
  }
  return json({ received: true });
};

export const config: Config = {
  path: "/api/stripe-webhook",
  method: ["POST"],
};
