export type RankProbe = {
  slug: string;
  url: string;
  ok: boolean;
  status: number;
  ms: number;
  finalUrl?: string;
  error?: string;
};

export type RankedSite = RankProbe & {
  name: string;
  description: string;
  host: string;
  category: string;
  price?: string;
  featured?: boolean;
  score: number;
  rank: number;
  statusLabel: "live" | "slow" | "down" | "lab";
};

const LIVE_STATUSES = new Set([200, 203, 204, 301, 302, 304, 307, 308]);

export function scoreProbe(input: {
  ok: boolean;
  status: number;
  ms: number;
  host: string;
  featured?: boolean;
  statusHint: "live" | "lab";
  hasPrice?: boolean;
}): { score: number; statusLabel: RankedSite["statusLabel"] } {
  if (input.statusHint === "lab") {
    return { score: 12, statusLabel: "lab" };
  }
  const live = input.ok && LIVE_STATUSES.has(input.status);
  if (!live) {
    return { score: Math.max(0, 8 - Math.min(8, Math.floor(input.ms / 1000))), statusLabel: "down" };
  }
  const speed = Math.max(0, 25 - input.ms / 200);
  const custom = input.host === "custom" ? 10 : input.host === "netlify" ? 8 : 4;
  const featured = input.featured ? 8 : 0;
  const commercial = input.hasPrice ? 6 : 0;
  const score = Math.round(50 + speed + custom + featured + commercial);
  const statusLabel: RankedSite["statusLabel"] = input.ms > 1500 ? "slow" : "live";
  return { score: Math.min(100, score), statusLabel };
}

export function rankSites(
  catalog: Array<{
    slug: string;
    name: string;
    url: string;
    description: string;
    host: string;
    category: string;
    price?: string;
    featured?: boolean;
    statusHint: "live" | "lab";
  }>,
  probes: RankProbe[],
): RankedSite[] {
  const bySlug = new Map(probes.map((p) => [p.slug, p]));
  const rows: RankedSite[] = catalog.map((site) => {
    const probe = bySlug.get(site.slug);
    const ok = probe?.ok ?? site.statusHint === "lab";
    const status = probe?.status ?? (site.statusHint === "lab" ? 0 : 0);
    const ms = probe?.ms ?? 0;
    const { score, statusLabel } = scoreProbe({
      ok,
      status,
      ms,
      host: site.host,
      featured: site.featured,
      statusHint: site.statusHint,
      hasPrice: Boolean(site.price),
    });
    return {
      slug: site.slug,
      url: site.url,
      ok,
      status,
      ms,
      finalUrl: probe?.finalUrl,
      error: probe?.error,
      name: site.name,
      description: site.description,
      host: site.host,
      category: site.category,
      price: site.price,
      featured: site.featured,
      score,
      rank: 0,
      statusLabel,
    };
  });
  rows.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  rows.forEach((row, i) => {
    row.rank = i + 1;
  });
  return rows;
}
