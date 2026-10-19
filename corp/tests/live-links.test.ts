import { describe, expect, it } from "vitest";
import { HIVE_SITES } from "../shared/portfolio";

describe("live catalog URLs", () => {
  it(
    "every production site returns a successful HTTP response",
    async () => {
      const live = HIVE_SITES.filter((site) => site.statusHint === "live");
      // Check every live site. A site only counts as down if it fails three attempts in a row
      // (CI runners see transient DNS/TLS errors and cold starts), and at most 6 run at once.
      const check = async (site: (typeof live)[number]) => {
        let last: { status: number; ok: boolean; ms: number; error?: string } = { status: 0, ok: false, ms: 0 };
        for (let attempt = 1; attempt <= 3; attempt++) {
          const started = Date.now();
          try {
            const res = await fetch(site.url, {
              redirect: "follow",
              headers: { "User-Agent": "AgentHive-LinkCheck/1.0" },
              signal: AbortSignal.timeout(15_000),
            });
            last = {
              status: res.status,
              ok: res.ok || (res.status >= 200 && res.status < 400),
              ms: Date.now() - started,
            };
          } catch (error) {
            last = {
              status: 0,
              ok: false,
              ms: Date.now() - started,
              error: error instanceof Error ? error.message : "fetch failed",
            };
          }
          if (last.ok) break;
          await new Promise((resolve) => setTimeout(resolve, 2_000 * attempt));
        }
        return { name: site.name, url: site.url, ...last };
      };
      const results: Awaited<ReturnType<typeof check>>[] = [];
      for (let i = 0; i < live.length; i += 6) {
        results.push(...(await Promise.all(live.slice(i, i + 6).map(check))));
      }
      const down = results.filter((row) => !row.ok);
      expect(down, JSON.stringify(down, null, 2)).toEqual([]);
    },
    240_000,
  );
});
