/**
 * GET /api/order?session_id=
 * Confirms the Checkout Session paid for the Burn Book packet price.
 */
import type { Config } from "@netlify/functions";
import { PACKET_CENTS } from "../../shared/brand.ts";
import { error, json } from "../lib/http.ts";
import { packetPriceId, sessionIsPacket, stripe } from "../lib/stripe.ts";

export default async (req: Request) => {
  if (req.method !== "GET") return error(405, "method_not_allowed", "Use GET.");
  const id = new URL(req.url).searchParams.get("session_id")?.trim();
  if (!id) return error(400, "missing_session", "session_id is required.");
  const client = stripe();
  if (!client) {
    return json({
      paid: false,
      configured: false,
      message: "Stripe is not configured on this site yet. The payment link still charges $750.",
    });
  }
  try {
    const session = await client.checkout.sessions.retrieve(id, { expand: ["line_items"] });
    const paid = sessionIsPacket(session, packetPriceId());
    return json({
      paid,
      configured: true,
      offer: paid ? "packet" : null,
      email: session.customer_details?.email ?? null,
      amountTotal: session.amount_total,
      currency: session.currency,
      cents: PACKET_CENTS,
    });
  } catch (err) {
    return error(404, "session_not_found", (err as Error).message);
  }
};

export const config: Config = {
  path: "/api/order",
  method: ["GET"],
};
