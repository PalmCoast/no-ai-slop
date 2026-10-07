import type { Config } from "@netlify/functions";
import { rankSites } from "../../shared/rank.ts";
import { HIVE_SITES } from "../../shared/portfolio.ts";
import { readRank } from "../lib/store.ts";

export default async () => {
  const stored = await readRank();
  if (stored) {
    // The weekly scout snapshots catalog copy (price, description) at probe
    // time. Overlay the current catalog so copy fixes ship with the deploy
    // instead of waiting for the next weekly pass.
    const bySlug = new Map(HIVE_SITES.map((site) => [site.slug, site]));
    // Rows for products dropped from the catalog are left out, and the
    // remaining rows are renumbered so the board has no gaps.
    const sites = stored.sites
      .filter((row) => bySlug.has(row.slug))
      .sort((a, b) => a.rank - b.rank)
      .map((row, index) => {
        const site = bySlug.get(row.slug)!;
        return { ...row, rank: index + 1, price: site.price, description: site.description };
      });
    return Response.json({ ...stored, sites }, { headers: { "Cache-Control": "public, max-age=120" } });
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
