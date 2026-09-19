import type { Config } from "@netlify/functions";
import { readBoard } from "../lib/store.ts";
import { buildReport, parseRepQuery, type RepHit } from "../../shared/rep.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type HnHit = { title?: string; url?: string; objectID?: string };

export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const url = new URL(req.url);
  const query = parseRepQuery(url.searchParams.get("q") ?? "");
  if (query.length < 2) {
    return Response.json({ error: "query_too_short" }, { status: 400, headers: cors });
  }
  const { questions } = await readBoard();
  const publicHits = await fetchPublicHits(query);
  const report = buildReport({ query, board: questions, publicHits });
  return Response.json(report, { headers: { ...cors, "Cache-Control": "public, max-age=30" } });
};

async function fetchPublicHits(query: string): Promise<RepHit[]> {
  try {
    const endpoint = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=8`;
    const res = await fetch(endpoint, { headers: { "User-Agent": "AskYard-Rep/1.0 (+https://askyard.firstdeploy.ai)" } });
    if (!res.ok) return [];
    const json = (await res.json()) as { hits?: HnHit[] };
    return (json.hits ?? [])
      .filter((hit) => (hit.title ?? "").toLowerCase().includes(query.split(" ")[0] ?? ""))
      .slice(0, 5)
      .map((hit) => ({
        title: hit.title ?? "Untitled",
        url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID ?? ""}`,
        source: "hn" as const,
        tone: /\b(scam|fraud|lawsuit|sued|complaint)\b/i.test(hit.title ?? "") ? "watch" : "neutral",
      }));
  } catch {
    return [];
  }
}

export const config: Config = {
  path: "/api/rep",
  method: ["GET", "OPTIONS"],
};
