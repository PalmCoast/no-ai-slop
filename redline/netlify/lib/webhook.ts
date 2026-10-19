import { shouldIssuePass } from "../../shared/fulfill";
import { env } from "./env";
import { error, json } from "./http";

type PaidSession = {
  id?: string;
  payment_status?: string | null;
  metadata?: { product?: string } | null;
};

/**
 * Stripe is the ledger. A paid Checkout Session is the pass.
 * The handler verifies the signature, then records nothing locally:
 * confirm and restore read the same session back from Stripe.
 * Register this endpoint before launch. Fulfillment for a customer who
 * never returns is the restore call with the checkout email.
 */
export async function handleWebhook(req: Request): Promise<Response> {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  const webhookSecret = env("STRIPE_WEBHOOK_SECRET");
  const apiSecret = env("STRIPE_SECRET_KEY");
  if (!webhookSecret || !apiSecret) {
    return error(500, "webhook_unconfigured", "Set STRIPE_WEBHOOK_SECRET and STRIPE_SECRET_KEY before launch.");
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return error(400, "bad_signature", "Missing Stripe signature.");
  const payload = await req.text();
  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(apiSecret);
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    if (
      event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded" &&
      event.type !== "checkout.session.async_payment_failed"
    ) {
      return json({ received: true, issued: false });
    }
    const session = event.data.object as PaidSession;
    if (session.metadata?.product !== "redline") return json({ received: true, issued: false });
    const issued = shouldIssuePass(event.type, session.payment_status);
    return json({ received: true, issued, sessionId: session.id ?? null });
  } catch {
    return error(400, "bad_signature", "Stripe signature did not verify.");
  }
}
