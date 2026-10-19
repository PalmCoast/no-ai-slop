import type { Config } from "@netlify/functions";
import { briefOf } from "../../shared/brief.ts";
import { phoneKey } from "../../shared/phone.ts";
import { CALENDLY_URL, DISCLOSURE, FORWARD_RULE, PILLARS, PRICE_LABEL, ROUTINES } from "../../shared/public.ts";
import { deskOpen, json } from "../lib/http.ts";
import { publicContacts, readDesk, writeDesk } from "../lib/store.ts";

export default async (req: Request) => {
  if (!deskOpen(req)) return json({ error: "locked" }, 401);
  const desk = await readDesk();
  if (req.method === "GET") {
    return json({
      disclosure: DISCLOSURE,
      forward: FORWARD_RULE,
      price: PRICE_LABEL,
      book: CALENDLY_URL,
      pillars: PILLARS,
      routines: ROUTINES,
      contacts: publicContacts(desk.contacts),
      notes: desk.notes,
      alerts: desk.alerts,
      bookings: desk.bookings,
      brief: briefOf(desk),
    });
  }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let body: { action?: string; name?: string; phone?: string };
  try {
    body = (await req.json()) as { action?: string; name?: string; phone?: string };
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  if (body.action !== "contact") return json({ error: "unknown_action" }, 400);
  const name = (body.name ?? "").trim().slice(0, 80);
  const phone = (body.phone ?? "").trim().slice(0, 40);
  if (name.length < 2 || phoneKey(phone).length < 7) return json({ error: "contact_invalid" }, 400);
  const existing = desk.contacts.find((row) => row.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    if (!existing.phones.some((row) => phoneKey(row) === phoneKey(phone))) existing.phones.push(phone);
  } else {
    desk.contacts.push({ name, phones: [phone], emails: [] });
  }
  await writeDesk(desk);
  return json({ ok: true, name, contacts: publicContacts(desk.contacts) });
};

export const config: Config = { path: "/api/desk", method: ["GET", "POST"] };
