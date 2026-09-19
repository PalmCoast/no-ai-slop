import type { Config } from "@netlify/functions";
import { applyBid, minNextBidCents, parseBid, rankMarquee, centsToDollars } from "../../shared/marquee.ts";
import { slugifyQuestion } from "../../shared/ask.ts";
import { readMarquee, writeMarquee } from "../lib/store.ts";
import { demoBidsAllowed, originFrom, stripeSecret } from "../lib/env.ts";

export default async (req: Request) => {
  if (req.method === "GET") {
    const listings = await readMarquee();
    return Response.json({
      listings: rankMarquee(listings),
      minNextBidCents: minNextBidCents(listings),
      minNextBid: centsToDollars(minNextBidCents(listings)),
    });
  }

  let body: { name?: string; bid?: string | number };
  try {
    body = (await req.json()) as { name?: string; bid?: string | number };
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const name = (body.name ?? "").trim();
  if (name.length < 2) return Response.json({ error: "name_required" }, { status: 400 });
  const listings = await readMarquee();
  const parsed = parseBid(body.bid ?? "", listings);
  if ("error" in parsed) return Response.json({ error: "bid_too_low", message: parsed.error }, { status: 400 });

  const origin = originFrom(req);
  const secret = stripeSecret();
  if (!secret) {
    if (!demoBidsAllowed()) {
      return Response.json({ error: "payments_unconfigured" }, { status: 503 });
    }
    const next = applyBid(listings, { name, bidCents: parsed.cents, demo: true });
    try {
      await writeMarquee(next);
    } catch (error) {
      console.error("marquee demo write failed", error);
    }
    return Response.json({
      demo: true,
      url: `${origin}/marquee/thanks?demo=1&name=${encodeURIComponent(name)}`,
      listings: next,
    });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: parsed.cents,
          product_data: {
            name: `Marquee crown: ${name}`,
            description: `Name-your-price bid for the AskYard lights. ${centsToDollars(parsed.cents)}.`,
          },
        },
      },
    ],
    metadata: {
      kind: "marquee",
      name,
      slug: slugifyQuestion(name),
      bidCents: String(parsed.cents),
    },
    integration_identifier: `askyard_marquee_${Math.random().toString(36).slice(2, 10)}`,
    success_url: `${origin}/marquee/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/marquee?cancelled=1`,
  });
  return Response.json({ url: session.url });
};

export const config: Config = {
  path: "/api/marquee",
  method: ["GET", "POST"],
};
