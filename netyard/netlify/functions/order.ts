/**
 * GET /api/order?session_id=
 * Confirms a paid Checkout Session for the thanks page.
 */
import type { Config } from "@netlify/functions";
import { error, json } from "../lib/http.ts";
import { sessionIsPaid, stripe } from "../lib/stripe.ts";

export default async (req: Request) => {
  if (req.method !== "GET") return error(405, "method_not_allowed", "Use GET.");
  const id = new URL(req.url).searchParams.get("session_id")?.trim();
  if (!id) return error(400, "missing_session", "session_id is required.");
  const s = stripe();
  if (!s) return json({ paid: false, demo: true, message: "Stripe is not configured on this site." });
  try {
    const session = await s.checkout.sessions.retrieve(id);
    return json({
      paid: sessionIsPaid(session),
      offer: session.metadata?.offer ?? null,
      shop: session.metadata?.shop ?? null,
      email: session.customer_details?.email ?? null,
      amountTotal: session.amount_total,
      currency: session.currency,
    });
  } catch (e) {
    return error(404, "session_not_found", (e as Error).message);
  }
};

export const config: Config = {
  path: "/api/order",
  method: ["GET"],
};
