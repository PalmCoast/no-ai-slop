/**
 * GET /hosted?session_id=cs_...
 * Success page. Verifies the $29 payment, stores the stamp, and shows the public URL.
 */
import type { Config } from "@netlify/functions";
import { hostedErrorHtml } from "../../src/host.ts";
import { env } from "../lib/env.ts";
import { fulfillSession } from "../lib/fulfill.ts";
import { html } from "../lib/http.ts";

export default async (req: Request) => {
  const sessionId = new URL(req.url).searchParams.get("session_id") ?? "";
  if (!sessionId.startsWith("cs_")) {
    return html(400, hostedErrorHtml("Open this page from Stripe Checkout after paying for Stamp Desk."));
  }
  const secret = env("STRIPE_SECRET_KEY");
  if (!secret) {
    return html(503, hostedErrorHtml("Set STRIPE_SECRET_KEY on the braid Netlify site."));
  }
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const result = await fulfillSession(session);
    if (!result.ok) return html(result.status, hostedErrorHtml(result.message));
    return html(200, result.html);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Checkout could not be confirmed.";
    return html(502, hostedErrorHtml(message));
  }
};

export const config: Config = {
  path: "/hosted",
};
