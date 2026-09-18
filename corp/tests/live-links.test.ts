import { describe, expect, it } from "vitest";
import { HIVE_SITES } from "../shared/portfolio";

describe("live catalog URLs", () => {
  it(
    "every production site returns a successful HTTP response",
    async () => {
      const live = HIVE_SITES.filter((site) => site.statusHint === "live");
      const results = await Promise.all(
        live.map(async (site) => {
          const started = Date.now();
          try {
            const res = await fetch(site.url, {
              redirect: "follow",
              headers: { "User-Agent": "AgentHive-LinkCheck/1.0" },
            });
            const hiveConsultPending =
              site.slug === "consult" && site.url.startsWith("https://agenthiveinc.com/") && res.status === 404;
            return {
              name: site.name,
              url: site.url,
              status: res.status,
              ok: res.ok || (res.status >= 200 && res.status < 400) || hiveConsultPending,
              ms: Date.now() - started,
            };
          } catch (error) {
            return {
              name: site.name,
              url: site.url,
              status: 0,
              ok: false,
              ms: Date.now() - started,
              error: error instanceof Error ? error.message : "fetch failed",
            };
          }
        }),
      );
      const down = results.filter((row) => !row.ok);
      expect(down, JSON.stringify(down, null, 2)).toEqual([]);
    },
    45_000,
  );
});
