import { HIVE_SITES } from "../../shared/portfolio.ts";
import { rankSites, type RankProbe } from "../../shared/rank.ts";

const TIMEOUT_MS = 8000;

async function probeUrl(url: string): Promise<Omit<RankProbe, "slug">> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "AgentHive-Grok-Scout/1.0 (+https://agenthiveinc.com/rankings)" },
    });
    return {
      url,
      ok: res.ok || (res.status >= 200 && res.status < 400),
      status: res.status,
      ms: Date.now() - started,
      finalUrl: res.url,
    };
  } catch (error) {
    return {
      url,
      ok: false,
      status: 0,
      ms: Date.now() - started,
      error: error instanceof Error ? error.message : "probe failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function scoutPortfolio() {
  const probes: RankProbe[] = await Promise.all(
    HIVE_SITES.map(async (site) => {
      if (site.statusHint === "lab") {
        return {
          slug: site.slug,
          url: site.url,
          ok: true,
          status: 0,
          ms: 0,
        };
      }
      const result = await probeUrl(site.url);
      return { slug: site.slug, ...result };
    }),
  );
  return rankSites(HIVE_SITES, probes);
}
