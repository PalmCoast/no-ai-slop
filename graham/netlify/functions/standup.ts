import type { Config } from "@netlify/functions";
import { CALENDLY_URL, PRICE_LABEL } from "../../shared/public.ts";
import { standUp } from "../../shared/standup.ts";
import { templateLeaks } from "../../shared/template.ts";
import { json } from "../lib/http.ts";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let body: { surname?: string; operator?: string; shop?: string; place?: string };
  try {
    body = (await req.json()) as { surname?: string; operator?: string; shop?: string; place?: string };
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const stood = standUp(body);
  if (!stood.ok) return json({ error: stood.error }, 400);
  const leaks = templateLeaks(stood.template, [], []);
  if (leaks.length > 0) return json({ error: "template_leaks" }, 500);
  return json({
    being: stood.being,
    price: PRICE_LABEL,
    book: CALENDLY_URL,
    hold: true,
    template: stood.template,
  });
};

export const config: Config = { path: "/api/standup", method: "POST" };
