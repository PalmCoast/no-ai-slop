import type { Config } from "@netlify/functions";
import { rankSites } from "../../shared/rank.ts";
import { HIVE_SITES } from "../../shared/portfolio.ts";
import { readRank } from "../lib/store.ts";

export default async () => {
  const stored = await readRank();
  if (stored) {
    return Response.json(stored, { headers: { "Cache-Control": "public, max-age=120" } });
  }
  const fallback = rankSites(
    HIVE_SITES,
    HIVE_SITES.map((site) => ({
      slug: site.slug,
      url: site.url,
      ok: site.statusHint === "live",
      status: site.statusHint === "live" ? 200 : 0,
      ms: 0,
    })),
  );
  return Response.json(
    { generatedAt: null, sites: fallback, note: "Grok scout has not stored a live pass yet. Showing catalog ranks." },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
};

export const config: Config = {
  path: "/api/rank",
  method: "GET",
};
