import type { Config } from "@netlify/functions";
import { applyBid } from "../../shared/marquee.ts";
import { readMarquee, writeMarquee } from "../lib/store.ts";
import { stripeSecret } from "../lib/env.ts";

export default async (req: Request) => {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id") ?? "";
  const demo = url.searchParams.get("demo") === "1";
  if (demo) {
    const listings = await readMarquee();
    return Response.json({ ok: true, demo: true, listings });
  }
  if (!sessionId) return Response.json({ error: "session_required" }, { status: 400 });
  const secret = stripeSecret();
  if (!secret) return Response.json({ error: "payments_unconfigured" }, { status: 503 });
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid" || session.metadata?.kind !== "marquee") {
    return Response.json({ error: "unpaid" }, { status: 402 });
  }
  const name = session.metadata.name ?? "";
  const bidCents = Number(session.metadata.bidCents ?? 0);
  if (!name || !bidCents) return Response.json({ error: "bad_metadata" }, { status: 400 });
  const listings = applyBid(await readMarquee(), { name, bidCents, paidAt: new Date().toISOString() });
  try {
    await writeMarquee(listings);
  } catch (error) {
    console.error("marquee confirm write failed", error);
  }
  return Response.json({ ok: true, name, bidCents, listings });
};

export const config: Config = {
  path: "/api/marquee/confirm",
  method: "GET",
};
