/**
 * GET /api/order?session_id=
 * Confirms a paid Aisle publish for the thanks page.
 */
import type { Config } from "@netlify/functions";
import { error, json } from "../lib/http.ts";
import { sessionIsPaid, stripe } from "../lib/stripe.ts";

export default async (req: Request) => {
  if (req.method !== "GET") return error(405, "method_not_allowed", "Use GET.");
  const id = new URL(req.url).searchParams.get("session_id")?.trim();
  if (!id) return error(400, "missing_session", "session_id is required.");
  const client = stripe();
  if (!client) return json({ paid: false, demo: true, message: "Stripe is not configured on this site." });
  try {
    const session = await client.checkout.sessions.retrieve(id);
    return json({
      paid: sessionIsPaid(session),
      shopName: session.metadata?.shopName ?? null,
      query: session.metadata?.query ?? null,
      email: session.customer_details?.email ?? null,
      amountTotal: session.amount_total,
      currency: session.currency,
    });
  } catch (err) {
    return error(404, "session_not_found", (err as Error).message);
  }
};

export const config: Config = {
  path: "/api/order",
  method: ["GET"],
};
