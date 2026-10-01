import type { Config } from "@netlify/functions";
import { briefOf, slipId } from "../../shared/brief.ts";
import { screenCall } from "../../shared/calls.ts";
import { DISCLOSURE } from "../../shared/public.ts";
import { deskOpen, json } from "../lib/http.ts";
import { readDesk, writeDesk } from "../lib/store.ts";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!deskOpen(req)) return json({ error: "locked" }, 401);
  let body: { from?: string; said?: string };
  try {
    body = (await req.json()) as { from?: string; said?: string };
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const from = (body.from ?? "").trim().slice(0, 40);
  const said = (body.said ?? "").trim().slice(0, 500);
  const desk = await readDesk();
  const result = screenCall({ from, said, contacts: desk.contacts, disclosure: DISCLOSURE });
  if (result.action !== "ring") {
    desk.notes.unshift({
      id: slipId("note"),
      at: new Date().toISOString(),
      from,
      said,
      action: result.action,
      summary: result.reason,
    });
    desk.notes = desk.notes.slice(0, 100);
  }
  if (result.action === "alert") {
    desk.alerts.unshift({
      id: slipId("alert"),
      at: new Date().toISOString(),
      from,
      said,
      reason: result.reason,
    });
    desk.alerts = desk.alerts.slice(0, 50);
  }
  await writeDesk(desk);
  return json({ result, brief: briefOf(desk) });
};

export const config: Config = { path: "/api/screen", method: "POST" };
