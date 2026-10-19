import type { Config } from "@netlify/functions";
import { briefOf, slipId } from "../../shared/brief.ts";
import { CALENDLY_URL } from "../../shared/public.ts";
import { nextSlots } from "../../shared/slots.ts";
import { deskOpen, json } from "../lib/http.ts";
import { readDesk, writeDesk } from "../lib/store.ts";

export default async (req: Request) => {
  if (!deskOpen(req)) return json({ error: "locked" }, 401);
  if (req.method === "GET") {
    const desk = await readDesk();
    return json({ slots: nextSlots(new Date(), 4), bookings: desk.bookings, book: CALENDLY_URL, brief: briefOf(desk) });
  }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let body: { name?: string; topic?: string; slot?: string };
  try {
    body = (await req.json()) as { name?: string; topic?: string; slot?: string };
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const name = (body.name ?? "").trim().slice(0, 80);
  const topic = (body.topic ?? "").trim().slice(0, 200);
  if (name.length < 2) return json({ error: "name_required" }, 400);
  const slots = nextSlots(new Date(), 8);
  const slot = slots.find((row) => row.iso === body.slot) ?? slots[0];
  if (!slot) return json({ error: "no_slot" }, 409);
  const desk = await readDesk();
  const hold = { id: slipId("hold"), at: new Date().toISOString(), name, topic: topic || "30 minutes", slot };
  desk.bookings.unshift(hold);
  desk.bookings = desk.bookings.slice(0, 50);
  await writeDesk(desk);
  return json({ hold, bookings: desk.bookings, book: CALENDLY_URL, brief: briefOf(desk) });
};

export const config: Config = { path: "/api/book", method: ["GET", "POST"] };
