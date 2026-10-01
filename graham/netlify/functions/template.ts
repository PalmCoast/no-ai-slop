import type { Config } from "@netlify/functions";
import { danielTemplate, templateLeaks } from "../../shared/template.ts";
import { OPERATOR_CONTACTS, OPERATOR_SECRET } from "../../shared/private.ts";
import { json } from "../lib/http.ts";

export default async (req: Request) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const template = danielTemplate();
  const leaks = templateLeaks(template, OPERATOR_CONTACTS, [OPERATOR_SECRET]);
  if (leaks.length > 0) return json({ error: "template_leaks", leaks }, 500);
  return json({ template });
};

export const config: Config = { path: "/api/template", method: "GET" };
