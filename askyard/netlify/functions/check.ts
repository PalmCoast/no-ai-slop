import type { Config } from "@netlify/functions";
import { buildReport, emptyEvidence, parseCheckQuery } from "../../shared/check.ts";
import { scrapePublicSite } from "../lib/scrape-site.ts";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let body: { query?: string };
  try {
    body = (await req.json()) as { query?: string };
  } catch {
    return Response.json({ error: "Paste a shop name and city, or a page URL." }, { status: 400 });
  }
  const parsed = parseCheckQuery(body.query ?? "");
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
  if (parsed.value.sourceKind === "google" || parsed.value.sourceKind === "facebook") {
    return Response.json({ report: buildReport(parsed.value, emptyEvidence({ blocked: true })) });
  }
  if (parsed.value.sourceKind === "name" || !parsed.value.url) {
    return Response.json({ report: buildReport(parsed.value, null) });
  }
  const evidence = await scrapePublicSite(parsed.value.url);
  if (evidence.blocked) return Response.json({ error: "That URL is not a public shop page." }, { status: 400 });
  return Response.json({ report: buildReport(parsed.value, evidence) });
};

export const config: Config = {
  path: "/api/check",
  method: "POST",
};
